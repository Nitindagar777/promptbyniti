/**
 * node-integration-example.js
 *
 * Drop-in example for your existing Express backend. Shows the full flow:
 *   1. User uploads reference image to your Node API (as they already do)
 *   2. Node forwards the image to the Python analysis service (fast, ~10-300ms)
 *   3. Node sends the ORIGINAL IMAGE + the structured JSON together to Gemini
 *   4. Gemini's response is now anchored to real facial data, not guesswork
 *
 * This does NOT replace your Gemini call -- it makes the Gemini call smarter
 * by feeding it pre-extracted, structured ground truth alongside the pixels.
 */

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:8001";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post("/generate-agent", upload.single("referenceImage"), async (req, res) => {
  try {
    const { description, mode } = req.body; // mode: "prompt" | "agent"
    const imageBuffer = req.file ? req.file.buffer : null;

    let faceAnalysis = null;

    // Step 1: run fast Python pre-analysis IF an image was uploaded
    if (imageBuffer) {
      const form = new FormData();
      form.append("file", imageBuffer, { filename: "reference.jpg" });

      const analysisResponse = await axios.post(
        `${FACE_SERVICE_URL}/analyze-face`,
        form,
        { headers: form.getHeaders(), timeout: 3000 } // 3s ceiling -- this call should be near-instant
      );
      faceAnalysis = analysisResponse.data;
    }

    // Step 2: build the Gemini prompt, injecting structured data as hard context
    const systemContext = buildGeminiContext(description, faceAnalysis);

    // Step 3: call Gemini with BOTH the image and the structured JSON as context
    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: systemContext },
            ...(imageBuffer
              ? [{ inline_data: { mime_type: "image/jpeg", data: imageBuffer.toString("base64") } }]
              : []),
          ],
        },
      ],
    };

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      geminiPayload
    );

    const generatedText = geminiResponse.data.candidates[0].content.parts[0].text;

    // Step 4: branch output format based on whether an image was provided
    // (this is the .md vs .docx decision point discussed earlier)
    const outputFormat = imageBuffer ? "docx" : "md";

    res.json({
      success: true,
      output_format: outputFormat,
      generated_content: generatedText,
      face_analysis_used: faceAnalysis, // useful for debugging / showing the user "what we detected"
    });
  } catch (err) {
    console.error("Agent generation failed:", err.message);
    res.status(500).json({ success: false, error: "Generation failed. Please try again." });
  }
});

/**
 * Turns the structured face-analysis JSON into a compact context block
 * that Gemini can use as ground truth, instead of re-deriving these
 * details from pixels alone (which is where consistency errors creep in).
 */
function buildGeminiContext(description, faceAnalysis) {
  let context = `User's request: ${description}\n\n`;

  if (faceAnalysis && faceAnalysis.face_detected) {
    context += `VERIFIED CHARACTER REFERENCE DATA (extracted via facial landmark analysis -- treat as ground truth, do not contradict):
- Face shape: ${faceAnalysis.face_shape}
- Eye spacing: ${faceAnalysis.eye_spacing}
- Skin tone (hex): ${faceAnalysis.skin_tone_hex}
- Eye color (hex): ${faceAnalysis.left_eye_color_hex}
- Notable expression features: ${JSON.stringify(faceAnalysis.expression_notes)}

Use this data to ensure any generated prompt or agent instructions preserve these EXACT
characteristics across every output, rather than approximating from the image alone.\n\n`;
  } else if (faceAnalysis && !faceAnalysis.face_detected) {
    context += `Note: No face was detected in the reference image -- treat it as a scene, object, or style reference only.\n\n`;
  }

  return context;
}

module.exports = router;
