# Character Reference Analysis Service

Fast Python microservice that pre-analyzes a user's uploaded reference image
(MediaPipe face landmarks + color sampling) and returns structured JSON.
Your Node backend sends this JSON **alongside** the original image to
Gemini/Grok, giving the AI hard data to anchor to instead of guessing purely
from pixels — this is what improves character consistency across repeated
generations.

**This does not replace Gemini/Grok.** It's a cheap, fast pre-processing step
that runs before the AI call, not instead of it.

---

## 1. Setup (one-time, ~2 minutes)

```bash
cd face-analysis-service
pip install -r requirements.txt --break-system-packages

# Download the MediaPipe face landmark model (~3.7MB, one-time)
curl -L -o face_landmarker.task \
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
```

> If `storage.googleapis.com` is blocked on your network/host, a mirror is
> available: `https://github.com/sanderdesnaijer/mediapipe-model-mirrors/releases/download/v1/face_landmarker.task`
> (verified working, Apache 2.0 licensed, same file — 3,758,596 bytes).

## 2. Run the service

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 2
```

`--workers 2` lets it handle concurrent uploads (multiple users generating at
once) without queuing behind each other. Scale workers to your CPU core count.

## 3. Test it

```bash
curl -X POST http://localhost:8001/analyze-face \
  -F "file=@/path/to/reference.jpg"
```

Expected response for a photo with a detected face:

```json
{
  "face_detected": true,
  "face_shape": "oval",
  "eye_spacing": "average-set",
  "skin_tone_hex": "#c8996b",
  "left_eye_color_hex": "#4a3626",
  "right_eye_color_hex": "#4a3325",
  "expression_notes": [{"feature": "mouthSmileLeft", "intensity": 0.42}],
  "face_bounding_box": {"x_min": 210, "y_min": 88, "x_max": 490, "y_max": 410},
  "landmark_count": 478,
  "image_dimensions": {"width": 768, "height": 1024},
  "processing_ms": 4.0,
  "total_request_ms": 19.2
}
```

## 4. Connect it to your Node backend

See `node-integration-example.js` — a ready-to-adapt Express route that:
1. Receives the user's upload
2. Forwards it to this service
3. Sends the image + returned JSON together to Gemini
4. Returns `.md` or `.docx` depending on whether an image was provided

---

## Performance notes (measured on this build)

- **Model load**: happens ONCE at service startup (lazy singleton in
  `face_analyzer.py`) — not per-request. This is the single biggest lever
  for speed; loading MediaPipe's model fresh on every call would add
  hundreds of ms per request.
- **Warm-request speed**: 4-30ms per image once the model is loaded (tested
  during build). This is effectively free next to the ~1-3 second Gemini
  API call that follows it.
- **Large image handling**: `main.py` downsizes any image wider than 1024px
  before analysis — landmark accuracy doesn't need full resolution, and this
  keeps phone-camera-sized uploads (4000px+) from slowing things down.
- **8MB upload cap** — keeps requests fast and prevents abuse; adjust
  `MAX_UPLOAD_BYTES` in `main.py` if you need larger uploads.

## Deploying alongside your Node app

Simplest options:
- Run as a **separate process** on the same server (`pm2 start "uvicorn main:app --port 8001" --name face-service`)
- Or **Docker**: containerize this folder separately from your Node app,
  expose port 8001 internally, point `FACE_SERVICE_URL` at the container name
- Keep it **internal-only** (not publicly exposed) — only your Node backend
  should call it directly

## Files in this service

- `face_analyzer.py` — core analysis logic (landmarks, color sampling, face shape)
- `main.py` — FastAPI HTTP wrapper
- `node-integration-example.js` — how your existing Express backend calls this + Gemini
- `requirements.txt` — Python dependencies
- `face_landmarker.task` — MediaPipe model file (you download this, see step 1)
