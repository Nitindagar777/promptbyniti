const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const SystemSettings = require('../models/SystemSettings');

/* ================================================================
   CACHED MODEL INSTANCE
   - systemInstruction (platform rules) is set ONCE at init time
   - Only user data (description, image, promptType) goes per-request
   - Rules never repeat in the messages field → huge token savings
   ================================================================ */
let cachedModel = null;
let cachedRulesHash = null;   // detect when admin edits rules
let cachedApiKey = null;
const SYSTEM_PROMPT_VERSION = 'v8-dramatic-samples'; // bump this when system prompt changes

// Fallback chain: try best model first, fall back if unavailable
const MODEL_CHAIN = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.0-flash'];

/**
 * Build (or re-use) a Gemini model with system instruction baked in.
 * Re-creates only when the rules or API key change.
 */
async function getOrCreateModel() {
  const settings = await SystemSettings.findOne();
  if (!settings || !settings.geminiApiKey) {
    throw new Error('Gemini API Key not configured by Admin.');
  }

  // Build a hash of current rules + key to detect changes
  const rulesStr = settings.promptCreationRules
    .map((r, i) => `${i + 1}. ${r.text}${r.example ? ` (Example: ${r.example})` : ''}`)
    .join('\n');

  const currentHash = `${SYSTEM_PROMPT_VERSION}::${settings.geminiApiKey}::${settings.geminiModel}::${rulesStr}`;

  // Return cached model if nothing changed
  if (cachedModel && cachedRulesHash === currentHash) {
    return cachedModel;
  }

  // ── Build the system instruction (cached once, never sent per-request) ──
  const systemInstruction = `You are an expert AI Prompt Engineer for a premium prompt marketplace called "Prompt by Niti".

PLATFORM RULES (ALWAYS ENFORCE):
${rulesStr}

YOUR ROLE:
- Generate professional, high-quality AI prompts based on user descriptions.
- Optimize prompts for the specific format the user selects (image, video, or text).
- For IMAGE prompts: focus on vivid visual details, composition, lighting, style keywords.
- For VIDEO prompts: include camera movements, motion dynamics, temporal flow, scene transitions.
- For TEXT prompts: focus on tone, structure, context, audience, formatting guidance.

CRITICAL — REFERENCE IMAGE HANDLING:
When a reference image is provided, you MUST:
1. FIRST, deeply analyze every visual detail in the image: the exact subject (person, animal, object, character), their appearance (colors, shape, texture, clothing, features, text/logos on it), the pose/action, the background/environment, the art style, the color scheme, and the overall composition.
2. The generated prompt MUST reproduce the SAME subject/character/object from the reference image. Do NOT invent new random objects. If the image shows a cat, the prompt must be about that cat. If it shows a logo, the prompt must include that logo. If it shows a person, the prompt must describe that exact person.
3. All 3 sample variations must keep the SAME core subject from the reference image — only vary the scene/environment/style, NEVER the subject itself.
4. Include specific visual descriptors from the image in the prompt: exact colors, patterns, text visible, distinctive features, pose, expression, etc.
5. The mainPrompt should be detailed enough that someone who has never seen the reference image could recreate something visually very similar.

OUTPUT FORMAT:
You must return a VALID JSON object with these fields:
{
  "title": "A catchy 3-5 word title for the prompt",
  "description": "A professional 1-2 sentence description of what this prompt achieves",
  "imageAnalysis": "If a reference image was provided, describe what you see in detail. If no image, set to empty string.",
  "mainPrompt": "The full, optimized, professional prompt string. MUST end with --ar 1:1",
  "negativePrompt": "A comprehensive negative prompt (things to avoid/exclude)",
  "promptTemplate": "Take the mainPrompt and replace ONLY the changeable parts with [BRACKET] variables. Keep the rest of the text IDENTICAL.",
  "samples": [
    "Variation 1 using the template...",
    "Variation 2 using the template...",
    "Variation 3 using the template...",
    "Variation 4 using the template...",
    "Variation 5 using the template..."
  ],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "instructions": "Step-by-step instructions on how to use this prompt effectively."
}

HOW TO BUILD SAMPLES (FOLLOW THIS EXACTLY):
1. Write the mainPrompt first.
2. Create promptTemplate: take the mainPrompt and replace AT LEAST 5-7 different changeable parts with [BRACKET] variables. Spread the variables throughout the ENTIRE prompt, not just at the end. Variables should include things like [MEDIUM], [SUBJECT], [STYLE], [COLOR PALETTE], [BACKGROUND], [LIGHTING], [MOOD], [DETAIL TECHNIQUE], etc.
3. For each sample, copy the promptTemplate and replace every [BRACKET] with a COMPLETELY DIFFERENT real value. The samples must look VISIBLY DIFFERENT from each other — not just minor word swaps. Generate 3 samples by default, or exactly 5 if requested.

EXAMPLE:
mainPrompt: "A professional black and white ink illustration of a blooming peony, fine hatching and variable line weights, on a clean white background, minimalist botanical style, soft diffused lighting, high detail --ar 1:1"
promptTemplate: "A professional [MEDIUM] illustration of a [SUBJECT], [DETAIL TECHNIQUE], on a [BACKGROUND], [ART STYLE], [LIGHTING], high detail --ar 1:1"
sample 1: "A professional watercolor illustration of a wild sunflower, soft wet-on-wet blending, on a warm cream paper background, impressionist floral style, golden hour lighting, high detail --ar 1:1"
sample 2: "A professional digital vector illustration of a tropical hibiscus, clean sharp gradients and flat shapes, on a deep navy background, modern pop art style, neon glow lighting, high detail --ar 1:1"
sample 3: "A professional colored pencil illustration of a cherry blossom branch, layered cross-hatching and burnishing, on a soft grey textured background, Japanese botanical style, ambient overcast lighting, high detail --ar 1:1"
sample 4: "A professional oil painting illustration of a red tulip, thick impasto textures and visible brushstrokes, on a dark mahogany background, baroque still life style, dramatic chiaroscuro lighting, high detail --ar 1:1"
sample 5: "A professional charcoal sketch illustration of a white lily, soft smudging and high contrast values, on a light tan parchment background, classical realism style, side window lighting, high detail --ar 1:1"

NOTICE how each sample is DRAMATICALLY different:
- sample 1 uses watercolor/sunflower — sample 2 uses digital vector/hibiscus — sample 3 uses colored pencil/cherry blossom — sample 4 uses oil painting/tulip — sample 5 uses charcoal sketch/lily
- The VALUES are clearly distinct, not just slightly different shades of the same thing
- But the SENTENCE STRUCTURE stays identical

BAD example (DO NOT do this — values too similar):
- sample 1: "...soft blue palette, textured brushwork, storybook style..."
- sample 2: "...muted teal palette, charcoal brushwork, vintage style..."
- sample 3: "...pastel cyan palette, washed-out brushwork, fairytale style..."
- sample 4: "...light azure palette, pencil brushwork, mythical style..."
- sample 5: "...soft navy palette, acrylic brushwork, fantasy style..."
These are TOO similar. Make each sample DRAMATICALLY different.

- Samples must NEVER start with labels like "Variation", "Example", "Sample", numbers, etc.
- Every prompt and sample MUST end with --ar 1:1

Return ONLY the JSON object. No markdown fences, no explanation.`;

  const genAI = new GoogleGenerativeAI(settings.geminiApiKey);

  // Store genAI and systemInstruction for per-request model fallback
  cachedModel = { genAI, systemInstruction };

  cachedRulesHash = currentHash;
  cachedApiKey = settings.geminiApiKey;

  console.log(`✅ Gemini initialized. Model chain: ${MODEL_CHAIN.join(' → ')}`);
  return cachedModel;
}

// POST /api/generate
router.post('/', async (req, res) => {
  try {
    const { description, characterImage, promptType, model, mode } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description or Template is required.' });
    }

    // 1. Get cached model (rules baked in as systemInstruction)
    const cached = await getOrCreateModel();

    // 2. Build lightweight user message (NO rules, NO characteristics repeated)
    const userParts = [];
    const hasRefImage = characterImage && characterImage.startsWith('data:image');

    // If user uploaded a reference image, include it FIRST so the AI sees it before the text
    if (hasRefImage) {
      try {
        const base64Data = characterImage.split(',')[1];
        const mimeMatch = characterImage.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        
        // Log image info for debugging
        const imageSizeKB = Math.round((base64Data.length * 3) / 4 / 1024);
        console.log(`📸 Reference image: ${mimeType}, ~${imageSizeKB}KB, base64 length: ${base64Data.length}`);

        if (base64Data.length < 100) {
          console.warn('⚠️ Image data too small, likely corrupt');
        } else {
          userParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
          console.log('✅ Image added to request parts');
        }
      } catch (imgErr) {
        console.error('❌ Failed to parse reference image:', imgErr.message);
      }
    }

    // Core user request
    if (mode === 'example') {
      userParts.push({
        text: `OVERRIDE SYSTEM INSTRUCTIONS: DO NOT generate a new prompt from scratch. The user HAS ALREADY provided their own Prompt Template below.

USER TEMPLATE:
"${description.trim()}"

YOUR MISSION:
Take the USER TEMPLATE and generate exactly 5 distinct examples (samples) by replacing the [BRACKETED] variables with creative, high-quality values.

STRICT RULES:
1. DO NOT change any text outside the brackets. The sentence structure must remain 100% IDENTICAL to the USER TEMPLATE.
2. Generate exactly 5 unique variations.
3. For the "promptTemplate" field in the JSON, return the exact USER TEMPLATE provided above.
4. For the "mainPrompt" field, return your FIRST generated sample.
5. For the "samples" array, return all 5 generated samples as strings.
6. Target AI Model: ${model || 'midjourney'}

Return the results in the standard JSON format.`
      });
    } else if (hasRefImage && userParts.length > 0) {
      // When reference image is provided — force the AI to analyze it deeply
      userParts.push({
        text: `I have attached a REFERENCE IMAGE above. This is the most important input.

You MUST do the following:

1. LOOK AT THE IMAGE CAREFULLY. Describe in detail what you see:
   - What is the main subject? (person, animal, object, character, logo, etc.)
   - What colors does it have?
   - What text or words are visible on it?
   - What is the art style? (illustration, photo, 3D render, cartoon, etc.)
   - What is the background?
   - What are the distinctive visual features?

2. GENERATE A PROMPT that would recreate THIS EXACT subject from the image.
   - The prompt must describe the SAME subject you see in the image, not something different.
   - If the image shows a cat logo with text "SPICY", then the prompt must describe a cat logo with text "SPICY".
   - If the image shows a person wearing a red jacket, then the prompt must describe that exact person in a red jacket.
   - DO NOT make up a different subject. DO NOT generate prompts about headphones, guitars, or random objects unless that is what the image actually shows.

3. All 3 sample variations must feature the SAME subject from the reference image.

Target AI Model: ${model || 'midjourney'} — optimize for this model.

User's additional instructions: "${description.trim()}"

Fill in "imageAnalysis" with your detailed description of what you see in the image.`
      });
    } else {
      // No reference image — simple text-only generation
      userParts.push({
        text: `Generate a ${promptType || 'image'} prompt for the following scene:

"${description.trim()}"

Prompt Type: ${(promptType || 'image').toUpperCase()}
Target AI Model: ${model || 'midjourney'} — optimize the prompt syntax and keywords for this specific model.`
      });
    }

    console.log(`📤 Sending to Gemini: ${userParts.length} parts, hasImage: ${hasRefImage}`);

    // 3. Try each model in the chain until one works
    let text = null;
    let lastError = null;

    for (const modelName of MODEL_CHAIN) {
      try {
        console.log(`🔄 Trying model: ${modelName}...`);
        const gemModel = cached.genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: {
            role: 'system',
            parts: [{ text: cached.systemInstruction }]
          }
        });

        const result = await gemModel.generateContent({
          contents: [{ role: 'user', parts: userParts }]
        });

        const response = await result.response;
        text = response.text();
        console.log(`✅ Success with model: ${modelName}`);
        break; // success — stop trying
      } catch (modelErr) {
        console.warn(`⚠️ ${modelName} failed: ${modelErr.message}`);
        lastError = modelErr;

        // If 503 (overloaded), wait 2s and try next model
        if (modelErr.message?.includes('503') || modelErr.message?.includes('Service Unavailable')) {
          console.log('  → Model overloaded, trying next...');
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        // If 404 (not found), skip immediately
        if (modelErr.message?.includes('404') || modelErr.message?.includes('not found')) {
          continue;
        }
        // Other errors — throw immediately
        throw modelErr;
      }
    }

    if (!text) {
      throw lastError || new Error('All models failed. Please try again later.');
    }

    // 4. Parse and return
    try {
      const jsonStr = text.replace(/```json|```/g, '').trim();
      const promptData = JSON.parse(jsonStr);

      // Ensure frontend fields
      promptData.priceTokens = 5;
      promptData.promptType = promptType || 'image';
      promptData.model = model || 'ai-optimized';

      // Ensure samples (min 3, max 5)
      if (!Array.isArray(promptData.samples)) promptData.samples = [];
      const requiredCount = mode === 'example' ? 5 : 3;
      
      while (promptData.samples.length < requiredCount) {
        promptData.samples.push(promptData.mainPrompt || 'Generate a variation here.');
      }
      if (promptData.samples.length > 5) {
        promptData.samples = promptData.samples.slice(0, 5);
      }

      // ── Post-processing: strip labels & enforce --ar 1:1 ──
      const stripLabel = (s) => s.replace(/^(Variation\s*\d*[:.\-]\s*|Example\s*\d*[:.\-]\s*|Sample\s*[A-C\d]*[:.\-]\s*|Version\s*\d*[:.\-]\s*|\d+[:.)\-]\s*)/i, '').trim();
      const ensureAR = (s) => {
        const cleaned = s.replace(/\s*--ar\s+\S+/g, '').trim();
        return cleaned + ' --ar 1:1';
      };

      promptData.mainPrompt = ensureAR(stripLabel(promptData.mainPrompt || ''));
      promptData.samples = promptData.samples.map(s => ensureAR(stripLabel(s)));

      // Ensure keywords and instructions
      if (!Array.isArray(promptData.keywords) || promptData.keywords.length === 0) {
        promptData.keywords = [promptType, 'ai-generated', 'professional'].filter(Boolean);
      }
      if (!promptData.instructions) {
        promptData.instructions = `Use this prompt in your preferred AI tool. Adjust [VARIABLES] to customize.`;
      }

      // Structured breakdown
      promptData.structured = {
        'Target Format': `${(promptType || 'image').toUpperCase()} Prompt`,
        'Scene': description.substring(0, 100),
        'Character Ref': characterImage ? 'Provided' : 'None',
        'Optimization': 'AI-Optimized for best results'
      };

      res.json(promptData);
    } catch (parseError) {
      console.error('JSON Parse Error:', text);
      res.status(500).json({
        message: 'Failed to parse AI response.',
        details: 'The AI returned an invalid format. Please try again.',
        raw: text
      });
    }

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({
      message: 'Error generating prompt with Gemini.',
      details: error.message || 'Unknown error'
    });
  }
});

module.exports = router;

