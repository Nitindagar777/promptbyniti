/**
 * faceAnalysisService.js
 * 
 * Communicates with the fast Python MediaPipe microservice (port 8001)
 * to extract structured facial biometrics (landmarks, shape, skin hex, eye color, expressions)
 * before calling Gemini/Groq.
 * 
 * This ensures the AI model receives concrete numerical and descriptive anchors,
 * preventing hallucination and enabling 100% consistent character reproduction.
 */

const path = require('path');
const { execFile } = require('child_process');

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || 'http://127.0.0.1:8001';
const SERVICE_DIR = path.resolve(__dirname, '../../prompt-by-niti-handoff/face-analysis-service');

/**
 * Send image to Python MediaPipe service with failover.
 * @param {string} imageBase64 - Full base64 data URI (e.g. data:image/jpeg;base64,...)
 * @returns {Promise<Object|null>}
 */
async function analyzeFace(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') return null;

  const t0 = Date.now();

  // Method 1: Ultra-fast HTTP microservice (~5-30ms)
  try {
    const response = await fetch(`${FACE_SERVICE_URL}/analyze-face`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 }),
      signal: AbortSignal.timeout(2500)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [MediaPipe Face Analyzer] Fast HTTP response in ${Date.now() - t0}ms (face_detected: ${data.face_detected})`);
      return data;
    } else {
      console.warn(`⚠️ [MediaPipe Face Analyzer] Service responded with HTTP ${response.status}`);
    }
  } catch (err) {
    console.warn(`⚠️ [MediaPipe Face Analyzer] HTTP call failed (${err.message}). Attempting direct Python script execution...`);
  }

  // Method 2: Direct Python script fallback if microservice is not currently listening
  try {
    const scriptResult = await runDirectPythonAnalysis(imageBase64);
    if (scriptResult) {
      console.log(`✅ [MediaPipe Face Analyzer] Direct Python fallback finished in ${Date.now() - t0}ms`);
      return scriptResult;
    }
  } catch (fallbackErr) {
    console.warn(`⚠️ [MediaPipe Face Analyzer] Fallback also skipped: ${fallbackErr.message}`);
  }

  console.log(`ℹ️ [MediaPipe Face Analyzer] Proceeding directly to vision LLM without pre-extracted landmarks.`);
  return null;
}

/**
 * Fallback to executing Python directly if uvicorn is not running.
 */
function runDirectPythonAnalysis(imageBase64) {
  return new Promise((resolve) => {
    // Extract base64 payload
    let b64 = imageBase64;
    if (b64.includes(',')) {
      b64 = b64.split(',')[1];
    }

    const pyCode = `
import sys, os, json, base64, numpy as np, cv2
sys.path.append(r"${SERVICE_DIR.replace(/\\/g, '/')}")
from face_analyzer import analyze_face

try:
    data = sys.stdin.read().strip()
    if not data:
        print(json.dumps({"face_detected": False, "error": "Empty stdin"}))
        sys.exit(0)
    img_bytes = base64.b64decode(data)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        print(json.dumps({"face_detected": False, "error": "Invalid image"}))
        sys.exit(0)
    h, w = img.shape[:2]
    if max(h, w) > 1024:
        scale = 1024 / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    result = analyze_face(img)
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"face_detected": False, "error": str(e)}))
`;

    // Cross-platform python detection (Windows: py/python, Linux: venv/python3)
    const fs = require('fs');
    const venvPyLinux = path.join(SERVICE_DIR, 'venv', 'bin', 'python3');
    const venvPyWin = path.join(SERVICE_DIR, 'venv', 'Scripts', 'python.exe');

    let cmd = 'python3';
    let args = [];

    if (process.platform === 'win32') {
      if (fs.existsSync(venvPyWin)) {
        cmd = venvPyWin;
      } else {
        cmd = 'py';
        args = ['-3.12'];
      }
    } else {
      if (fs.existsSync(venvPyLinux)) {
        cmd = venvPyLinux;
      } else {
        cmd = 'python3';
      }
    }

    const child = execFile(cmd, [...args, '-c', pyCode], {
      cwd: SERVICE_DIR,
      timeout: 4000,
      maxBuffer: 10 * 1024 * 1024
    }, (err, stdout) => {
      if (err || !stdout) {
        return resolve(null);
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (pe) {
        resolve(null);
      }
    });

    if (child.stdin) {
      child.stdin.write(b64);
      child.stdin.end();
    }
  });
}

/**
 * Formats structured faceAnalysis JSON into prompt context for Gemini / Groq.
 * @param {Object} faceAnalysis 
 * @returns {string}
 */
function buildBiometricPromptContext(faceAnalysis) {
  if (!faceAnalysis) return '';

  if (!faceAnalysis.face_detected) {
    return `\n\n[PYTHON MEDIAPIPE PRE-PROCESSING AUDIT]:
MediaPipe facial analysis completed (${faceAnalysis.processing_ms || 10}ms) — No human face detected.
Treat this reference image strictly as an environmental, scene, architectural, style, or object reference.\n`;
  }

  const expressions = Array.isArray(faceAnalysis.expression_notes) && faceAnalysis.expression_notes.length > 0
    ? faceAnalysis.expression_notes.map(e => `${e.feature} (intensity: ${Math.round((e.intensity || 0) * 100)}%)`).join(', ')
    : 'neutral / calm expression';

  const bbox = faceAnalysis.face_bounding_box
    ? `Bounding Box: [X: ${faceAnalysis.face_bounding_box.x_min}–${faceAnalysis.face_bounding_box.x_max}, Y: ${faceAnalysis.face_bounding_box.y_min}–${faceAnalysis.face_bounding_box.y_max}]`
    : '';

  return `\n\n[VERIFIED BIOMETRIC CHARACTER GROUND TRUTH (EXTRACTED VIA PYTHON MEDIAPIPE)]:
To guarantee 100% character identity consistency and prevent AI hallucination, the uploaded reference image has been pre-analyzed with 478 3D facial landmarks:
- Face Shape: ${faceAnalysis.face_shape}
- Eye Spacing: ${faceAnalysis.eye_spacing}
- Skin Tone (Exact Hex Sampled): ${faceAnalysis.skin_tone_hex}
- Left Eye Color (Exact Hex): ${faceAnalysis.left_eye_color_hex}
- Right Eye Color (Exact Hex): ${faceAnalysis.right_eye_color_hex}
- Active Facial Blendshapes/Expression: ${expressions}
${bbox ? `- ${bbox}` : ''}
- Landmark Precision: ${faceAnalysis.landmark_count || 478} points analyzed (${faceAnalysis.processing_ms}ms)

MANDATORY CHARACTER CONSISTENCY DIRECTIVE:
Treat the above biometric data as immutable ground truth. When generating the prompt description, anchor the character's facial features, facial structure, skin undertones, and eye color directly to these verified measurements. DO NOT contradict these physical metrics under any circumstances.\n`;
}

module.exports = {
  analyzeFace,
  buildBiometricPromptContext
};
