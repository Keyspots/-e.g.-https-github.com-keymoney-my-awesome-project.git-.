from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Tuple

import yaml

try:
    import ollama  # type: ignore
except Exception:  # pragma: no cover - import guard for environments without ollama
    ollama = None  # pyright: ignore[reportAssignmentType]


@dataclass
class DatasetSpec:
    path: str
    id_field: str
    text_field: str
    min_chars: int
    max_chars: int
    guardrails: Dict[str, Any]


_HTML_TAG_RE = re.compile(r"<[^>]+>")
_SSN_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
_CREDITCARD_RE = re.compile(r"\b(?:\d[ -]*?){13,16}\b")
_URL_RE = re.compile(r"https?://\S+", re.I)

# Small, minimal profanity list as a placeholder; projects should replace with robust filters
_PROFANE = {"damn", "shit", "fuck"}


def _load_spec(spec_path: str) -> Dict[str, Any]:
    with open(spec_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def _ensure_artifacts_dir(dir_path: str) -> None:
    os.makedirs(dir_path, exist_ok=True)


def _iter_jsonl(path: str) -> Iterable[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            yield json.loads(line)


def _is_impure(text: str, guardrails: Dict[str, Any]) -> Tuple[bool, str | None]:
    text_stripped = text.strip()

    if not text_stripped:
        return True, "empty"

    # Length checks
    min_chars = int(guardrails.get("min_chars", 0)) if "min_chars" in guardrails else None
    max_chars = int(guardrails.get("max_chars", 10_000_000)) if "max_chars" in guardrails else None

    if min_chars is not None and len(text_stripped) < min_chars:
        return True, f"too_short({len(text_stripped)})"
    if max_chars is not None and len(text_stripped) > max_chars:
        return True, f"too_long({len(text_stripped)})"

    # HTML/script tags
    if _HTML_TAG_RE.search(text_stripped):
        return True, "html_tags"

    # Non-alpha ratio
    letters = sum(ch.isalpha() for ch in text_stripped)
    non_letters = max(0, len(text_stripped) - letters)
    if len(text_stripped) > 0:
        ratio = non_letters / len(text_stripped)
        if ratio > float(guardrails.get("max_non_alpha_ratio", 0.35)):
            return True, f"non_alpha_ratio({ratio:.2f})"

    # Average word length
    words = [w for w in re.split(r"\s+", text_stripped) if w]
    if words:
        avg = sum(len(w) for w in words) / max(1, len(words))
        if avg < float(guardrails.get("min_avg_word_length", 2.5)):
            return True, f"avg_word_length({avg:.2f})"

    # Optional profanity
    if guardrails.get("profanity_filter", False):
        lowered = text_stripped.lower()
        if any(p in lowered for p in _PROFANE):
            return True, "profanity"

    # Optional basic PII patterns
    if guardrails.get("pii_basic_checks", False):
        if _SSN_RE.search(text_stripped) or _CREDITCARD_RE.search(text_stripped):
            return True, "pii"

    return False, None


def _prepare_guardrails(dataset_spec: DatasetSpec) -> Dict[str, Any]:
    # Merge dataset-level numeric bounds into guardrails for validator function
    gr = dict(dataset_spec.guardrails or {})
    gr.setdefault("min_chars", dataset_spec.min_chars)
    gr.setdefault("max_chars", dataset_spec.max_chars)
    return gr


def _embed_all(texts: List[str], model: str, base_url: str | None) -> List[List[float]]:
    if ollama is None:
        raise RuntimeError("Ollama Python package not available. Please ensure 'ollama' is installed.")

    if base_url:
        # ollama library also reads OLLAMA_HOST; set temporarily for this process
        os.environ.setdefault("OLLAMA_HOST", base_url)

    embeddings: List[List[float]] = []

    # Using per-text calls for compatibility
    client = getattr(ollama, "Client", None)
    if client is not None and base_url:
        client = client(host=base_url)
    else:
        client = None

    for text in texts:
        if client is not None:
            resp = client.embeddings(model=model, input=text)
        else:
            resp = ollama.embeddings(model=model, input=text)  # type: ignore[attr-defined]
        vec = resp.get("embedding")
        if not isinstance(vec, list):
            raise RuntimeError("Ollama returned unexpected embeddings format")
        embeddings.append(vec)
    return embeddings


def seed_and_embed(spec_path: str = "incubator_spec.yaml") -> Dict[str, Any]:
    spec = _load_spec(spec_path)

    outputs = spec.get("outputs", {})
    artifact_dir = outputs.get("artifact_dir", "artifacts")
    embeddings_file = outputs.get("phase1_embeddings_file", os.path.join(artifact_dir, "phase1_embeddings.jsonl"))
    _ensure_artifacts_dir(artifact_dir)

    # Reaction log for traceability
    behaviors = spec.get("behaviors", {})
    reactions = behaviors.get("reactions", {})
    breath = reactions.get("breath_cue", "[BREATH]")
    on_breath = reactions.get("on_breath", {})
    blush_val = on_breath.get("blush", 0)
    # Persist a small log line for visibility
    with open(os.path.join(artifact_dir, "run.log"), "a", encoding="utf-8") as logf:
        logf.write(f"{breath} blush:{blush_val} starting Phase 1\n")

    phase1 = next((p for p in spec.get("phases", []) if p.get("id") == 1), None)
    if not phase1:
        raise RuntimeError("Phase 1 spec not found")

    dataset_cfg = phase1.get("dataset", {})
    dataset_spec = DatasetSpec(
        path=dataset_cfg.get("path", "data/grok_summaries.jsonl"),
        id_field=dataset_cfg.get("id_field", "id"),
        text_field=dataset_cfg.get("text_field", "summary"),
        min_chars=int(dataset_cfg.get("min_chars", 80)),
        max_chars=int(dataset_cfg.get("max_chars", 20000)),
        guardrails=dataset_cfg.get("guardrails", {}),
    )

    if not os.path.exists(dataset_spec.path):
        raise FileNotFoundError(
            f"Dataset not found at '{dataset_spec.path}'. Provide Grok summaries JSONL with one object per line."
        )

    # Load records
    records: List[Dict[str, Any]] = []
    for row in _iter_jsonl(dataset_spec.path):
        if dataset_spec.text_field not in row:
            raise ValueError(f"Missing text_field '{dataset_spec.text_field}' in a record")
        records.append(row)

    num_records = len(records)
    if num_records == 0:
        raise ValueError("Dataset is empty")

    # Guardrail: Abort impure data (fail fast)
    guardrails = _prepare_guardrails(dataset_spec)
    for idx, r in enumerate(records):
        text = str(r.get(dataset_spec.text_field, ""))
        impure, reason = _is_impure(text, guardrails)
        if impure and bool(dataset_spec.guardrails.get("abort_on_impure", True)):
            raise ValueError(f"Aborting: impure data at index {idx}: {reason}")

    # Prepare embeddings
    emb_cfg = phase1.get("embeddings", {})
    if emb_cfg.get("provider") != "ollama":
        raise ValueError("This seed supports only 'ollama' embeddings provider")
    model = emb_cfg.get("model", "mxbai-embed-large")
    base_url_env = emb_cfg.get("base_url_env", "OLLAMA_BASE_URL")
    base_url = os.environ.get(base_url_env) or os.environ.get("OLLAMA_HOST") or "http://host.docker.internal:11434"

    texts = [str(r.get(dataset_spec.text_field, "")) for r in records]
    vectors = _embed_all(texts, model=model, base_url=base_url)

    # Persist embeddings as JSONL with id, text, and vector
    with open(embeddings_file, "w", encoding="utf-8") as out:
        for r, vec in zip(records, vectors):
            rid = r.get(dataset_spec.id_field) or None
            text = r.get(dataset_spec.text_field)
            out.write(json.dumps({"id": rid, "text": text, "embedding": vec}, ensure_ascii=False) + "\n")

    return {
        "num_records": num_records,
        "num_embeddings": len(vectors),
        "output_file": embeddings_file,
    }
