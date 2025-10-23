from __future__ import annotations

import os
from typing import Any, Dict

from fastapi import FastAPI, HTTPException

from phased_incubate import IncubatorOrchestrator

app = FastAPI(title="Phased Incubator", version="1.0")

# Initialize orchestrator once per process
SPEC_PATH = os.environ.get("INCUBATOR_SPEC", "incubator_spec.yaml")
orchestrator = IncubatorOrchestrator(spec_path=SPEC_PATH)


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True}


@app.post("/phase/1/run")
def run_phase_one() -> Dict[str, Any]:
    try:
        status = orchestrator.run_phase(1)
        return {"status": status.__dict__}
    except FileNotFoundError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:  # noqa: BLE001 top-level error mapping
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
def get_status() -> Dict[str, Any]:
    st = orchestrator.get_last_status()
    if st is None:
        return {"status": None}
    return {"status": st}
