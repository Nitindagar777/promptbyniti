"""
main.py
FastAPI microservice: accepts an uploaded reference image, returns structured
facial/character data extracted by MediaPipe. Your Node backend calls this
BEFORE calling Gemini, then sends the image + this JSON together to Gemini
so it has concrete anchors instead of guessing from pixels alone.

Run:
    uvicorn main:app --host 0.0.0.0 --port 8001 --workers 2

Why --workers 2+ matters for speed: MediaPipe inference is CPU-bound and
blocks the event loop briefly. Multiple workers let concurrent uploads
(e.g. several users generating at once) not queue behind each other.
"""

import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import time
import base64
from typing import Optional
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from face_analyzer import analyze_face, get_landmarker

app = FastAPI(title="Character Reference Analysis Service")

# Allow your Node backend (adjust origin for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8MB cap -- keeps requests fast


@app.on_event("startup")
def startup_warmup():
    """Pre-warm the MediaPipe landmarker on server startup for 0ms cold-start latency."""
    try:
        t0 = time.time()
        get_landmarker()
        print(f"[OK] [MediaPipe] Face Landmarker loaded and warmed up in {round((time.time() - t0) * 1000, 1)}ms")
    except Exception as e:
        print(f"[WARN] [MediaPipe] Warmup warning: {e}")


@app.get("/health")
def health():
    """Quick liveness check."""
    return {"status": "ok", "service": "face-analysis-service"}


class AnalyzeRequest(BaseModel):
    image_base64: Optional[str] = None
    image: Optional[str] = None


@app.post("/analyze-face")
async def analyze_face_endpoint(
    request: Request,
    file: Optional[UploadFile] = File(None),
):
    t0 = time.time()
    raw = None

    # 1. Handle multipart file upload if present
    if file is not None:
        raw = await file.read()
    else:
        # 2. Check JSON payload (e.g. from Node.js with base64 data URI)
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                body = await request.json()
                b64_str = body.get("image_base64") or body.get("image") or ""
                if b64_str:
                    if "," in b64_str:
                        b64_str = b64_str.split(",", 1)[1]
                    raw = base64.b64decode(b64_str)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid JSON/base64 payload: {str(e)}")

    if not raw:
        raise HTTPException(status_code=400, detail="No image provided. Send a multipart file or JSON { image_base64 }.")

    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 8MB).")

    np_arr = np.frombuffer(raw, np.uint8)
    image_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image_bgr is None:
        raise HTTPException(status_code=400, detail="Could not decode image -- check file format.")

    # Downscale very large images before analysis -- landmarks don't need
    # full resolution, and this is the single biggest speed lever for
    # large phone-camera uploads (e.g. 4000x3000 -> ~1024px wide)
    h, w = image_bgr.shape[:2]
    max_dim = 1024
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        image_bgr = cv2.resize(image_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    result = analyze_face(image_bgr)
    result["total_request_ms"] = round((time.time() - t0) * 1000, 1)
    return result
