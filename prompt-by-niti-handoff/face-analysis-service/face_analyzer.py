"""
face_analyzer.py
Extracts structured, reusable facial + character data from a reference image
using MediaPipe. This data is sent ALONGSIDE the image to Gemini/Grok so the
AI has hard numeric/descriptive anchors instead of only visual guessing --
this is what makes repeated generations stay consistent.

Design goals:
- FAST: single-image inference should be ~100-300ms on CPU (no GPU needed)
- Model loaded ONCE at service startup, reused for every request (this is the
  biggest speed win -- loading mediapipe's model per-request is the #1 cause
  of slow "AI image tools")
- Output is a compact JSON block, not a huge dump -- built to be pasted
  straight into a Gemini prompt as structured context
"""

import os
import time
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

# ---------------------------------------------------------------------------
# Model setup -- loaded once, reused across every request (fast + cheap)
# ---------------------------------------------------------------------------
_BASE_OPTIONS = mp_python.BaseOptions
_MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
_FACE_LANDMARKER_MODEL = os.path.join(_MODEL_DIR, "face_landmarker.task")

_landmarker = None  # lazy singleton, initialized in get_landmarker()


def get_landmarker():
    global _landmarker
    if _landmarker is None:
        options = vision.FaceLandmarkerOptions(
            base_options=_BASE_OPTIONS(model_asset_path=_FACE_LANDMARKER_MODEL),
            output_face_blendshapes=True,      # expression / feature intensities
            output_facial_transformation_matrixes=False,
            num_faces=1,                        # we only care about the main subject
            running_mode=vision.RunningMode.IMAGE,
        )
        _landmarker = vision.FaceLandmarker.create_from_options(options)
    return _landmarker


# ---------------------------------------------------------------------------
# Helper: sample average color in a region (fast numpy, no extra model needed)
# ---------------------------------------------------------------------------
def _region_avg_color(img_rgb: np.ndarray, points: list[tuple[int, int]]) -> str:
    """Average RGB color across a small set of pixel coords -> hex string."""
    h, w, _ = img_rgb.shape
    samples = []
    for x, y in points:
        x, y = int(np.clip(x, 0, w - 1)), int(np.clip(y, 0, h - 1))
        samples.append(img_rgb[y, x])
    avg = np.mean(samples, axis=0).astype(int)
    return "#{:02x}{:02x}{:02x}".format(*avg)


# Key landmark indices (MediaPipe FaceMesh topology, 478-point model)
LEFT_IRIS = [468, 469, 470, 471, 472]
RIGHT_IRIS = [473, 474, 475, 476, 477]
FOREHEAD_SKIN = [10]          # top of forehead, clean skin patch
CHEEK_SKIN_L = [50]
CHEEK_SKIN_R = [280]
JAW_LEFT = 234
JAW_RIGHT = 454
CHIN = 152
FOREHEAD_TOP = 10
NOSE_TIP = 1
LEFT_EYE_OUTER = 33
RIGHT_EYE_OUTER = 263


def _face_shape_estimate(lm, w, h) -> str:
    """Rough geometric face-shape classification from landmark ratios."""
    def pt(i):
        return np.array([lm[i].x * w, lm[i].y * h])

    jaw_width = np.linalg.norm(pt(JAW_LEFT) - pt(JAW_RIGHT))
    face_height = np.linalg.norm(pt(FOREHEAD_TOP) - pt(CHIN))
    ratio = face_height / jaw_width if jaw_width else 0

    if ratio > 1.5:
        return "oval / elongated"
    elif ratio > 1.3:
        return "oval"
    elif ratio > 1.1:
        return "round-to-oval"
    else:
        return "round / wide"


def analyze_face(image_bgr: np.ndarray) -> dict:
    """
    Main entry point. Takes an OpenCV BGR image, returns structured JSON-ready
    dict describing the face for character-consistency purposes.
    """
    t0 = time.time()
    img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    h, w, _ = img_rgb.shape

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
    result = get_landmarker().detect(mp_image)

    if not result.face_landmarks:
        return {
            "face_detected": False,
            "note": "No face detected -- treat image as a scene/background/object reference only.",
            "processing_ms": round((time.time() - t0) * 1000, 1),
        }

    lm = result.face_landmarks[0]

    # --- geometry-based descriptive features -------------------------------
    face_shape = _face_shape_estimate(lm, w, h)

    def pt(i):
        return (lm[i].x * w, lm[i].y * h)

    eye_dist = np.linalg.norm(np.array(pt(LEFT_EYE_OUTER)) - np.array(pt(RIGHT_EYE_OUTER)))
    face_height = np.linalg.norm(np.array(pt(FOREHEAD_TOP)) - np.array(pt(CHIN)))
    eye_spacing = "wide-set" if eye_dist / face_height > 0.62 else (
        "close-set" if eye_dist / face_height < 0.5 else "average-set"
    )

    # --- color sampling (skin tone, eye color) ------------------------------
    skin_tone_hex = _region_avg_color(img_rgb, [pt(FOREHEAD_SKIN[0]), pt(CHEEK_SKIN_L[0]), pt(CHEEK_SKIN_R[0])])
    left_iris_hex = _region_avg_color(img_rgb, [pt(i) for i in LEFT_IRIS])
    right_iris_hex = _region_avg_color(img_rgb, [pt(i) for i in RIGHT_IRIS])

    # --- expression / blendshape summary (top active features) -------------
    top_expressions = []
    if result.face_blendshapes:
        shapes = sorted(result.face_blendshapes[0], key=lambda s: s.score, reverse=True)
        top_expressions = [
            {"feature": s.category_name, "intensity": round(s.score, 2)}
            for s in shapes[:5] if s.score > 0.15
        ]

    # --- bounding box (useful for crop-consistency in follow-up gens) ------
    xs = [p.x * w for p in lm]
    ys = [p.y * h for p in lm]
    bbox = {
        "x_min": round(min(xs)), "y_min": round(min(ys)),
        "x_max": round(max(xs)), "y_max": round(max(ys)),
    }

    return {
        "face_detected": True,
        "face_shape": face_shape,
        "eye_spacing": eye_spacing,
        "skin_tone_hex": skin_tone_hex,
        "left_eye_color_hex": left_iris_hex,
        "right_eye_color_hex": right_iris_hex,
        "expression_notes": top_expressions,
        "face_bounding_box": bbox,
        "landmark_count": len(lm),
        "image_dimensions": {"width": w, "height": h},
        "processing_ms": round((time.time() - t0) * 1000, 1),
    }
