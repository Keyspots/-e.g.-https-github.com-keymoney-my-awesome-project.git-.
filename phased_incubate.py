from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict

import yaml


@dataclass
class IncubatorStatus:
    phase: int
    state: str  # queued | running | completed | failed | aborted
    message: str
    num_records: int = 0
    num_embeddings: int = 0
    output_file: str | None = None
    started_at: str | None = None
    completed_at: str | None = None
    duration_ms: int | None = None


class IncubatorOrchestrator:
    def __init__(self, spec_path: str = "incubator_spec.yaml") -> None:
        self.spec_path = spec_path
        with open(spec_path, "r", encoding="utf-8") as f:
            self.spec: Dict[str, Any] = yaml.safe_load(f)
        self.outputs = self.spec.get("outputs", {})
        self.artifact_dir = self.outputs.get("artifact_dir", "artifacts")
        os.makedirs(self.artifact_dir, exist_ok=True)
        self.last_status_file = self.outputs.get("last_status_file", os.path.join(self.artifact_dir, "last_status.json"))

    def _save_status(self, status: IncubatorStatus) -> None:
        with open(self.last_status_file, "w", encoding="utf-8") as f:
            json.dump(asdict(status), f, indent=2, ensure_ascii=False)

    def _now_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def run_phase(self, phase_id: int) -> IncubatorStatus:
        if phase_id != 1:
            raise ValueError("Only Phase 1 is implemented in this seed.")

        phase_spec = next((p for p in self.spec.get("phases", []) if p.get("id") == 1), None)
        if not phase_spec:
            raise RuntimeError("Phase 1 spec not found in incubator_spec.yaml")

        status = IncubatorStatus(
            phase=1,
            state="running",
            message="Starting Phase 1: Seed Grok",
            started_at=self._now_iso(),
        )
        self._save_status(status)

        t0 = time.perf_counter()
        try:
            # Import lazily to avoid circular deps at module import time
            from seed_grok import seed_and_embed

            result = seed_and_embed(self.spec_path)
            status.num_records = result.get("num_records", 0)
            status.num_embeddings = result.get("num_embeddings", 0)
            status.output_file = result.get("output_file")

            status.state = "completed"
            status.message = "Phase 1 completed successfully"
        except Exception as exc:  # noqa: BLE001 broad for top-level task runner
            status.state = "failed"
            status.message = f"Phase 1 failed: {exc}"[:1000]
        finally:
            status.completed_at = self._now_iso()
            status.duration_ms = int((time.perf_counter() - t0) * 1000)
            self._save_status(status)

        return status

    def get_last_status(self) -> Dict[str, Any] | None:
        if not os.path.exists(self.last_status_file):
            return None
        try:
            with open(self.last_status_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
