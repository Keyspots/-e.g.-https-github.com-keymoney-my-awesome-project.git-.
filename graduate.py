from __future__ import annotations

import json
import os
from typing import Dict, Any

import yaml


def graduate_phase1(spec_path: str = "incubator_spec.yaml") -> Dict[str, Any]:
    with open(spec_path, "r", encoding="utf-8") as f:
        spec = yaml.safe_load(f)
    outputs = spec.get("outputs", {})
    embeddings_path = outputs.get("phase1_embeddings_file", "artifacts/phase1_embeddings.jsonl")

    if not os.path.exists(embeddings_path):
        raise FileNotFoundError("No embeddings produced yet. Run Phase 1 first.")

    num_lines = 0
    with open(embeddings_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                num_lines += 1
    return {"graduated": True, "embeddings": num_lines, "artifact": embeddings_path}
