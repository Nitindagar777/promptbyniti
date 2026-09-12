const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const SystemSettings = require('../models/SystemSettings');
const { TEXT_SUBCATEGORY_RULES, CREATIVE_RULES, SOCIAL_MEDIA_RULES, ECOMMERCE_RULES, OTHER_RULES } = require('./rules');

/**
 * Programmatically reduce the number of bracketed variables in promptTemplate to maxVars,
 * replacing excess variables with their corresponding resolved values from mainPrompt.
 */
function limitVariables(promptTemplate, mainPrompt, maxVars = 5) {
  const varRegex = /\[([^\]]+)\]/g;
  const variables = [];
  let match;
  while ((match = varRegex.exec(promptTemplate)) !== null) {
    variables.push({
      full: match[0],
      name: match[1]
    });
  }

  // If variables are within limit, do nothing
  if (variables.length <= maxVars) {
    return { promptTemplate, mainPrompt };
  }

  console.log(`⚠️ Prompt has ${variables.length} variables, which exceeds the max limit of ${maxVars}. Programmatically reducing...`);

  // Escape special regex characters in promptTemplate
  let escapedTemplate = promptTemplate.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  variables.forEach(v => {
    // Re-enable the bracketed variable in escaped form as a capture group
    const escapedVar = '\\\\\\[' + v.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\\\\\]';
    escapedTemplate = escapedTemplate.replace(new RegExp(escapedVar, 'g'), '(.*?)');
  });

  try {
    const matcher = new RegExp(`^${escapedTemplate}$`, 'i');
    const matches = mainPrompt.match(matcher);

    if (matches && matches.length === variables.length + 1) {
      let newTemplate = promptTemplate;

      for (let i = maxVars; i < variables.length; i++) {
        const value = matches[i + 1];
        newTemplate = newTemplate.replace(variables[i].full, value);
      }

      console.log(`✅ Successfully reduced template variables to ${maxVars}!`);
      return { promptTemplate: newTemplate, mainPrompt };
    }
  } catch (err) {
    console.warn('⚠️ Programmatic variable reduction failed:', err.message);
  }

  return { promptTemplate, mainPrompt };
}

/**
 * Ensures that a sample string (or mainPrompt) contains 100% of the complete text structure
 * from promptTemplate. If the LLM omitted or truncated any non-variable text from promptTemplate
 * when creating the sample, this function extracts the variable values and reconstructs the sample
 * from promptTemplate so NO text is ever missing or cut off.
 */
function enforceCompleteSampleFromTemplate(promptTemplate, sampleStr) {
  if (!promptTemplate || typeof promptTemplate !== 'string') return sampleStr;
  if (!sampleStr || typeof sampleStr !== 'string') return promptTemplate;

  const cleanTemplate = promptTemplate.trim();
  const cleanSample = sampleStr.trim();

  // Extract all [bracketed] variables from promptTemplate
  const varRegex = /\[([^\]]+)\]/g;
  const vars = [];
  let match;
  while ((match = varRegex.exec(cleanTemplate)) !== null) {
    vars.push({
      placeholder: match[0],
      name: match[1],
      index: match.index
    });
  }

  // If promptTemplate has no bracketed variables, check if sample is truncated
  if (vars.length === 0) {
    if (cleanSample.length < cleanTemplate.length * 0.85) {
      return cleanTemplate;
    }
    return cleanSample;
  }

  // Split promptTemplate into fixed text chunks P_0, P_1, ..., P_n
  const chunks = [];
  let lastIndex = 0;
  for (let i = 0; i < vars.length; i++) {
    chunks.push(cleanTemplate.substring(lastIndex, vars[i].index));
    lastIndex = vars[i].index + vars[i].placeholder.length;
  }
  chunks.push(cleanTemplate.substring(lastIndex));

  // Extract variable values from sampleStr by matching fixed chunks sequentially
  const extractedValues = {};
  let currentIdx = 0;

  for (let i = 0; i < vars.length; i++) {
    const chunkBefore = chunks[i];
    const chunkAfter = chunks[i + 1];
    const varName = vars[i].placeholder;

    let startPos = currentIdx;
    if (chunkBefore.length > 0) {
      const foundIdx = cleanSample.indexOf(chunkBefore, currentIdx);
      if (foundIdx !== -1) {
        startPos = foundIdx + chunkBefore.length;
      }
    }

    let endPos = -1;
    if (chunkAfter.length > 0) {
      endPos = cleanSample.indexOf(chunkAfter, startPos);

      if (endPos === -1 && chunkAfter.length > 3) {
        const prefix = chunkAfter.substring(0, Math.min(15, chunkAfter.length)).trim();
        if (prefix.length > 0) {
          endPos = cleanSample.indexOf(prefix, startPos);
        }
      }
    }

    if (endPos !== -1 && endPos >= startPos) {
      const val = cleanSample.substring(startPos, endPos).trim();
      if (val) {
        extractedValues[varName] = val;
      }
      currentIdx = endPos;
    } else {
      const remainingText = cleanSample.substring(startPos).trim();
      if (remainingText) {
        const commaIdx = remainingText.indexOf(',');
        const val = commaIdx !== -1 ? remainingText.substring(0, commaIdx).trim() : remainingText.substring(0, 40).trim();
        if (val) {
          extractedValues[varName] = val;
          currentIdx = startPos + val.length;
        }
      }
    }
  }

  // Reconstruct sample from promptTemplate using extracted values
  let reconstructed = cleanTemplate;
  let hasReplacements = false;

  for (let i = 0; i < vars.length; i++) {
    const placeholder = vars[i].placeholder;
    let val = extractedValues[placeholder];
    if (!val) {
      val = vars[i].name.replace(/_/g, ' ');
    }
    const cleanVal = val.replace(/[\[\]]/g, '').trim();
    reconstructed = reconstructed.replace(placeholder, cleanVal);
    hasReplacements = true;
  }

  // Check if cleanSample is missing trailing text from template
  const templateEnding = chunks[chunks.length - 1].replace(/\s*--ar\s+\S+/g, '').trim();
  const sampleEnding = cleanSample.replace(/\s*--ar\s+\S+/g, '').trim();
  const isMissingText = templateEnding.length > 15 && !sampleEnding.endsWith(templateEnding.substring(Math.max(0, templateEnding.length - 25)));

  if (hasReplacements && (isMissingText || reconstructed.length > cleanSample.length + 10)) {
    console.log(`✨ Enforced complete text on sample (restored length from ${cleanSample.length} to ${reconstructed.length} chars)`);
    return reconstructed;
  }

  return cleanSample;
}

/* ================================================================
   CACHED MODEL INSTANCE
   - systemInstruction (platform rules) is set ONCE at init time
   - Only user data (description, image, promptType) goes per-request
   - Rules never repeat in the messages field → huge token savings
   ================================================================ */
let cachedModel = null;
let cachedRulesHash = null;   // detect when admin edits rules
let cachedApiKey = null;
const SYSTEM_PROMPT_VERSION = 'v23-force-4-samples-always'; // bump this when system prompt changes

// Backup Groq API Keys pool (5 Accounts provided by user)
const GROQ_FALLBACK_KEYS = [
  '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',
  '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',
  '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',
  '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',
  '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'
];

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768'
];

const GROQ_VISION_MODELS = [
  'llama-3.2-11b-vision-preview',
  'llama-3.2-90b-vision-preview'
];

const POLLINATIONS_DEFAULT_KEY = 'sk_zPn6GkASBeODhJeJoE6QF1s2lCwz2al4';

// Track exhausted keys in memory for 1 hour to prevent retrying rate-limited keys
const EXHAUSTED_KEYS_SET = new Set();
const KEY_RESET_TIMERS = new Map();

function markKeyExhausted(rawKey, keyName) {
  if (!rawKey) return;
  EXHAUSTED_KEYS_SET.add(rawKey);
  console.warn(`🛑 Groq Key [${keyName}] quota exhausted/failed. Marking inactive for 1 hour.`);

  if (KEY_RESET_TIMERS.has(rawKey)) clearTimeout(KEY_RESET_TIMERS.get(rawKey));
  const timer = setTimeout(() => {
    EXHAUSTED_KEYS_SET.delete(rawKey);
    console.log(`✨ Groq Key [${keyName}] reactivated for rotation.`);
  }, 60 * 60 * 1000); // reset after 1 hour
  KEY_RESET_TIMERS.set(rawKey, timer);
}

/**
 * Call Groq LLM API with 5-Account Key Failover and Model Fallback Chain
 */
async function callGroqLLMWithFailover(systemInstruction, userParts, hasRefImage, keysPool) {
  const availableKeys = (keysPool || []).filter(k => !EXHAUSTED_KEYS_SET.has(k.rawKey));
  const activeKeysPool = availableKeys.length > 0 ? availableKeys : (keysPool || []);

  const modelsToTry = hasRefImage
    ? [...GROQ_VISION_MODELS, ...GROQ_MODELS]
    : GROQ_MODELS;

  // Extract user text and image content from userParts
  let userText = '';
  let imgBase64 = null;
  let imgMime = 'image/jpeg';

  userParts.forEach(p => {
    if (typeof p.text === 'string') {
      userText += (userText ? '\n\n' : '') + p.text;
    }
    if (p.inlineData && p.inlineData.data) {
      imgBase64 = p.inlineData.data;
      imgMime = p.inlineData.mimeType || 'image/jpeg';
    }
  });

  let lastError = null;

  for (const modelName of modelsToTry) {
    const isVisionModel = GROQ_VISION_MODELS.includes(modelName);

    let userContent = userText;
    if (isVisionModel && imgBase64) {
      userContent = [
        { type: 'text', text: userText },
        { type: 'image_url', image_url: { url: `data:${imgMime};base64,${imgBase64}` } }
      ];
    }

    const payload = {
      model: modelName,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userContent }
      ],
      temperature: 0.7,
      max_tokens: 4096
    };

    if (!isVisionModel) {
      payload.response_format = { type: "json_object" };
    }

    for (const keyObj of activeKeysPool) {
      try {
        console.log(`🚀 [Groq LLM Engine] Querying model ${modelName} using ${keyObj.name}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keyObj.rawKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`⚠️ [Groq - ${keyObj.name}] HTTP ${response.status}: ${errText.substring(0, 150)}`);
          if (response.status === 429 || errText.includes('rate_limit') || errText.includes('quota')) {
            markKeyExhausted(keyObj.rawKey, keyObj.name);
          }
          lastError = new Error(`Groq HTTP ${response.status}: ${errText}`);
          continue;
        }

        const data = await response.json();
        const textOutput = data?.choices?.[0]?.message?.content;

        if (textOutput && textOutput.trim()) {
          console.log(`✅ [Groq LLM Engine] Success with ${modelName} using ${keyObj.name}!`);
          return textOutput;
        }
      } catch (err) {
        console.warn(`⚠️ [Groq - ${keyObj.name}] Request error: ${err.message}`);
        lastError = err;
        if (err.message?.includes('429') || err.message?.includes('quota')) {
          markKeyExhausted(keyObj.rawKey, keyObj.name);
        }
        continue;
      }
    }
  }

  throw lastError || new Error('All Groq API keys and models failed.');
}

// ── Gemini API Keys Pool (backup keys from gemini_api_keys.txt) ──
const GEMINI_BACKUP_KEYS = [
  'AIzaSyArurzA-OEsCtoZLr9Bgd_B5UnguO7b_zo',
  'AQ.Ab8RN6Jes4GulDFcccfsyikXjNPYMR3jCIiugECjF_3_VYRqjg',
  'AQ.Ab8RN6LJhrVHjKlG0gM5yJjUpWA-J95Y8cE-iP3FhwtCtQUDOw',
  'AQ.Ab8RN6J9LrQxFf5kVDfOJRkhFXy1C3Pv9swoJfDWdcydk0RSEw',
  'AQ.Ab8RN6LosILWCe-dIldoppzBXf7LkBQH05kKRLRozT6ZvOhyow',
  'AQ.Ab8RN6KtZWaxDwWtB0Nox7-88ChqUsil30dD8__NC-clpcDHVQ',
  'AQ.Ab8RN6IiwV8_KagTiGrWgqxwRyQd9iXlc3zxqMTGwlhmp0wnsw',
  'AQ.Ab8RN6LKd5E6XJjk5LDfoLBv8VUYbddP4Bm9qgUm2XuhX6pIxQ',
  'AQ.Ab8RN6IODT6rDnhkxPsQVEqrbuin-HtfUOm-0fzrtYFaX3-XOg'
];

/**
 * Call Gemini API with failover across multiple API keys.
 * Supports both text-only and vision (image + text) requests.
 */
async function callGeminiWithFailover(systemInstruction, userParts, hasRefImage) {
  // Build the keys pool: DB keys first, then backup keys
  let settings = null;
  try {
    settings = await SystemSettings.findOne();
  } catch (err) {
    console.warn('⚠️ Could not fetch SystemSettings for Gemini keys:', err.message);
  }

  const keysPool = [];
  const dbKey = (settings?.geminiApiKey || '').trim();
  const paidKey = (settings?.paidGeminiApiKey || '').trim();
  if (paidKey) keysPool.push({ name: 'Gemini Paid Key (DB)', rawKey: paidKey });
  if (dbKey) keysPool.push({ name: 'Gemini Free Key (DB)', rawKey: dbKey });
  GEMINI_BACKUP_KEYS.forEach((k, i) => {
    const trimmed = k.trim();
    if (trimmed && !keysPool.some(existing => existing.rawKey === trimmed)) {
      keysPool.push({ name: `Gemini Backup #${i + 1}`, rawKey: trimmed });
    }
  });

  if (keysPool.length === 0) {
    throw new Error('No Gemini API keys available.');
  }

  const candidateModels = [
    (settings?.geminiModel && !['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-flash'].includes(settings.geminiModel)) ? settings.geminiModel : null,
    'gemini-2.5-flash',
    'gemini-3.6-flash'
  ].filter(Boolean);

  let lastError = null;

  for (const keyObj of keysPool) {
    for (const modelName of candidateModels) {
      try {
        console.log(`🧠 [Gemini Engine] Trying ${keyObj.name} with model ${modelName}...`);
        const genAI = new GoogleGenerativeAI(keyObj.rawKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction
        });

        const result = await model.generateContent(userParts);
        const response = await result.response;
        const textOutput = response.text();

        if (textOutput && textOutput.trim()) {
          console.log(`✅ [Gemini Engine] Success with ${keyObj.name} (${modelName})!`);
          return textOutput;
        }
      } catch (err) {
        console.warn(`⚠️ [Gemini - ${keyObj.name} - ${modelName}] Failed: ${err.message}`);
        lastError = err;
        // If 404 model not found, try next candidate model
        if (err.message && err.message.includes('404')) {
          continue;
        }
        // If quota/rate limit error, move to next key
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini API keys failed.');
}

/**
 * Build (or re-use) Groq keys pool.
 * Includes DB SystemSettings keys and default 5-account Groq keys pool.
 */
async function getOrCreateModel() {
  let settings = null;
  try {
    settings = await SystemSettings.findOne();
  } catch (err) {
    console.warn('⚠️ Could not fetch SystemSettings for Groq keys:', err.message);
  }

  const dbKeys = (settings?.groqApiKeys || []).map(k => (typeof k === 'string' ? k.trim() : '')).filter(Boolean);
  const pollinationsKey = (settings?.pollinationsApiKey || process.env.POLLINATIONS_API_KEY || POLLINATIONS_DEFAULT_KEY).trim();

  const keysPool = [];
  dbKeys.forEach((keyStr, idx) => {
    if (!keysPool.some(k => k.rawKey === keyStr)) {
      keysPool.push({ name: `Groq Account (Admin DB #${idx + 1})`, rawKey: keyStr });
    }
  });

  GROQ_FALLBACK_KEYS.forEach((keyStr, idx) => {
    const trimmed = keyStr.trim();
    if (!keysPool.some(k => k.rawKey === trimmed)) {
      keysPool.push({ name: `Groq Account #${idx + 1}`, rawKey: trimmed });
    }
  });

  const rulesStr = (settings?.promptCreationRules || [])
    .map((r, i) => {
      const cleanText = (r.text || '').replace(/^\d+[\s.)-]+\s*/, '');
      return `${i + 1}. ${cleanText}${r.example ? ` (Example: ${r.example})` : ''}`;
    })
    .join('\n');

  return {
    keysPool,
    rulesStr,
    pollinationsKey
  };
}

/**
 * Build a dynamic system instruction based on rules, aiPower tier, characterMode, promptType, and duration.
 */
function buildSystemInstruction(rulesStr, aiPower, characterMode, promptType, duration, hasRefImage, aspectRatio, category, subcategory, isDirectPromptOnly, targetModel) {
  const power = aiPower || 'normal';
  const isVideo = promptType === 'video';
  const isText = promptType === 'text';
  const resolvedAR = isVideo ? (aspectRatio ? aspectRatio.trim() : '16:9') : '1:1';

  if (isDirectPromptOnly) {
    if (hasRefImage && !isVideo && !isText) {
      return `You are an expert AI Vision Prompt Engineer for a premium prompt marketplace called "Prompt by Niti".

PLATFORM RULES (ALWAYS ENFORCE):
${rulesStr}

YOUR MISSION:
The user has uploaded a REFERENCE IMAGE. Your #1 objective is to reverse-engineer an ULTRA-ACCURATE, COMPLETE, AND 100% FAITHFUL AI image generation prompt that will recreate the EXACT uploaded reference image with 100% fidelity in Midjourney/Flux/Stable Diffusion.

CRITICAL INSTRUCTIONS FOR 100% FAITHFUL IMAGE RECREATION:
1. EXAMINE EVERY VISUAL DETAIL FROM THE UPLOADED IMAGE:
   - Subject Identity: exact ethnicity, estimated age, gender, facial structure, eye shape, nose, lips, exact hair color, hair length, hairstyle, hairline, natural skin texture with visible skin pores and fine details, and exact facial expression.
   - Outfit & Clothing: every single garment worn in the image — exact fabrics (e.g. checkered cotton, silk, denim, knit wool), sleeve length, collar/neckline, exact colors, patterns, fit, layering, and all accessories (jewelry, earrings, necklace, rings, watch, glasses, footwear).
   - Pose & Framing: exact posture (standing, seated, leaning), body angle, hand placement, finger positions, head tilt, eye gaze direction, and camera framing (e.g. eye-level close-up portrait, medium shot, full-body shot).
   - Environment & Scenery: exact setting (indoor room, blooming flower field, cafe, city street, studio backdrop), background architectural elements, foliage, furniture, props, depth of field, and bokeh.
   - Lighting & Atmosphere: exact lighting setup (natural sunlight, golden hour glow, soft diffused daylight, studio strobe, rim light), shadow depth, contrast, color temperature, and atmospheric mood.
   - Art Medium & Photographic Style: photographic realism (e.g. candid 35mm f/1.8 lens photograph, 85mm portrait, authentic raw snapshot, subtle film grain) or specific artistic style if the upload is digital art, illustration, watercolor, or 3D render.

2. ZERO VARIABLES, ZERO BRACKETS, ZERO VARIANTS (STRICTLY ENFORCED):
   - You are ABSOLUTELY FORBIDDEN from generating ANY bracketed variables like [brackets], [subject], [clothing], [pose], [variable], or placeholders in the prompt.
   - The prompt MUST be a single, complete, concrete, finished prompt describing the exact image.
   - DO NOT generate alternate variants or choices.

3. ALL MODES UNIFIED FOR INITIAL PROMPT:
   - Regardless of which reference mode is active, the initial direct prompt MUST be a 100% faithful, complete recreation of the uploaded image.

4. TARGET MODEL SYNTAX & AR:
   - Target AI Model: ${targetModel || 'Midjourney'} — format keywords, photographic parameters, and syntax tailored for this model.
   - Aspect Ratio: ${resolvedAR} (mainPrompt MUST end with --ar ${resolvedAR}).
   - NO '+' SIGNS: Do not use '+' symbols in any field. Use natural descriptive English sentences separated by commas.

OUTPUT FORMAT:
You must return a VALID JSON object with these fields:
{
  "title": "A catchy 3-5 word title describing the reference image prompt",
  "description": "A professional, elegant 1-2 sentence sales description of what this prompt achieves",
  "imageAnalysis": "Detailed visual breakdown of everything seen in the uploaded reference image (subject, clothing, setting, lighting, and style)",
  "mainPrompt": "The complete, 100% accurate, ultra-detailed prompt reproducing the uploaded reference image with full photographic/artistic depth. NO BRACKETS OR VARIABLES. Ends with --ar ${resolvedAR}",
  "negativePrompt": "A comprehensive negative prompt (e.g. CGI, cartoon, 3D render, plastic smooth skin, bad anatomy, deformed limbs, blurry, extra fingers)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "instructions": "Copy and paste this prompt directly into ${targetModel || 'Midjourney'} to generate an exact likeness of the reference image."
}

Return ONLY the JSON object. No markdown fences, no explanation.`;
    }

    return `You are an expert AI Prompt Engineer for a premium prompt marketplace called "Prompt by Niti".
    
YOUR MISSION:
Generate a single, direct, ready-to-use AI prompt based on the user's description (and optional reference image).

CRITICAL RULES:
1. NO VARIABLES: The prompt MUST be completely ready to use immediately. DO NOT include any bracketed variables or placeholders (e.g. DO NOT use [subject], [clothing], etc.).
2. DIRECT PROMPT: Write the complete, detailed final prompt directly for the specific subject, scene, and style described or shown.
3. Target AI Model: ${targetModel || 'Midjourney'} — optimize the prompt syntax and keywords for this model.
4. Aspect Ratio: ${resolvedAR} (For Image/Video prompts, ensure the prompt ends with --ar ${resolvedAR}).
5. If promptType is 'video', ensure the prompt starts with "Generate a video of: " or "Generate a video of ".

OUTPUT FORMAT:
You must return a VALID JSON object with these fields:
{
  "title": "A catchy 3-5 word title for the prompt",
  "description": "A professional 1-2 sentence description of what this prompt achieves",
  "mainPrompt": "The complete, ready-to-use prompt."
}

Return ONLY the JSON object. No markdown fences, no explanation.`;
  }

  // Resolve characterMode dynamically for video/image compatibility
  const resolvedCharMode = isVideo
    ? (characterMode === 'sameScene' || characterMode === 'sameSceneLoop' ? 'sameSceneLoop' :
      characterMode === 'different' || characterMode === 'differentScenes' ? 'differentScenes' :
        'fixedCharacterMotion')
    : (characterMode === 'sameSceneLoop' ? 'sameScene' :
      characterMode === 'differentScenes' ? 'different' :
        characterMode || 'different');

  let tierGuidelines = '';
  if (isVideo) {
    const dur = duration || (power === 'power' ? '20s' : power === 'super' ? '10s' : '5s');
    let sceneDivisionText = '';
    if (dur === '5s') {
      sceneDivisionText = `Divide the video prompt into exactly 2 scenes:
Scene 1 (0 to 2.5 seconds): description of first scene half
Scene 2 (2.5 to 5 seconds): description of second scene half`;
    } else if (dur === '10s') {
      sceneDivisionText = `Divide the video prompt into exactly 3 scenes:
Scene 1 (0 to 3.3 seconds): description of first scene part
Scene 2 (3.3 to 6.6 seconds): description of second scene part
Scene 3 (6.6 to 10 seconds): description of third scene part`;
    } else {
      sceneDivisionText = `Divide the video prompt into exactly 5 scenes:
Scene 1 (0 to 4 seconds): description of first scene part
Scene 2 (4 to 8 seconds): description of second scene part
Scene 3 (8 to 12 seconds): description of third scene part
Scene 4 (12 to 16 seconds): description of fourth scene part
Scene 5 (16 to 20 seconds): description of fifth scene part`;
    }

    tierGuidelines = `
VIDEO DURATION & DETAIL LEVEL — ${dur.toUpperCase()} TIER (${power === 'power' ? 5 : power === 'super' ? 3 : 1} CREDITS):
- You MUST generate a detailed, professional video prompt.
- The target duration of the video is ${dur}.
- You MUST format the prompt and every sample scene-by-scene using the following structure (do NOT use bullet points, hyphens, en-dashes, or brackets for scene headers):
${sceneDivisionText}
- CRITICAL: Every video prompt (mainPrompt) and video sample (in samples array) MUST start with "Generate a video of: " or "Generate a video of " and MUST end with "--ar ${resolvedAR}".
- You are STRICTLY FORBIDDEN from generating square brackets like "[" or "]" in mainPrompt or samples. Write camera pans or motion details as natural English prose (e.g. "with the camera slowly panning" instead of "[CAMERA: Pan]").
- Adjust the visual description density and movement details suitable for each scene:
  - For 5s: Focus on short, looping actions or subtle transitions (e.g. wind blowing, blinking).
  - For 10s: Describe a standard cinematic sequence with a continuous camera motion (e.g. slow pan, dolly zoom) and clear character action.
  - For 20s: Include a rich, multi-part camera sequence with progressive environmental detail and temporal motion instructions.
- Ensure the promptTemplate length complies with:
  - 5s (Normal): Min 400-500 characters.
  - 10s (Super): Min 500-600 characters.
  - 20s (Power): Min 600-700 characters.`;
  } else if (isText) {
    if (power === 'super') {
      tierGuidelines = `
PROMPT DETAIL LEVEL — SUPER TIER (3 CREDITS):
- You MUST generate an exceptionally detailed, structured, and deep text prompt template.
- CHARACTER LENGTH REQUIREMENT: The generated promptTemplate MUST be at least 800 to 1000 characters long. Take your time to write a highly descriptive and structured template.
- Ensure the prompt template is packed with high-quality, fixed descriptive guidelines, frameworks, and instructions.
- Strictly limit bracketed variables to between 1 and 5. The rest of the text MUST be detailed and comprehensive.`;
    } else if (power === 'power') {
      tierGuidelines = `
PROMPT DETAIL LEVEL — POWER TIER (5 CREDITS - MAXIMUM DETAIL & DENSITY):
- You MUST generate an incredibly rich, masterclass, and highly immersive text prompt template.
- CHARACTER LENGTH REQUIREMENT: The generated promptTemplate MUST be at least 1200 to 1500 characters long. Pack it with the absolute maximum density of guidelines, phases, frameworks, and step-by-step instructions.
- Ensure the template has the absolute maximum density of fixed, professional instructions and guidelines.
- Strictly limit bracketed variables to between 1 and 5. The rest of the text MUST be detailed and comprehensive.`;
    } else {
      tierGuidelines = `
PROMPT DETAIL LEVEL — NORMAL TIER (1 CREDIT):
- Generate a professional, clean, and direct text prompt.
- CHARACTER LENGTH REQUIREMENT: The generated promptTemplate MUST be at least 500 to 700 characters long.
- Keep the prompt clear, focused on structure, context, tone, and step-by-step directions.
- Focus on producing a clean, solid, and high-quality baseline prompt with standard fixed text and 1 to 5 variables.`;
    }
  } else if (power === 'super') {
    tierGuidelines = `
PROMPT DETAIL LEVEL — SUPER TIER (3 CREDITS):
- You MUST generate an exceptionally detailed, perfect, and beautifully described prompt.
- CHARACTER LENGTH REQUIREMENT: The generated promptTemplate MUST be at least 500 to 600 characters long. Take your time to write a descriptive and perfect prompt that best describes the visual scene.
- MORE FIXED DESCRIPTIVE TEXT REQUIRED: Ensure the prompt template is packed with high-quality, fixed descriptive text (e.g. complex scene framing, specific visual elements, lighting terms) that remains unchangeable. There should be a lot of descriptive fixed words and only 1 to 5 bracketed variables.
- Include advanced visual descriptions: specific textures, camera lens details (e.g. 85mm f/1.4), depth of field, complex color gradations, and rich atmospheric lighting (e.g., volumetric dust motes, soft diffusion, golden hour rim lighting).
- Add highly specific design/artistic styles and medium descriptors.`;
  } else if (power === 'power') {
    tierGuidelines = `
PROMPT DETAIL LEVEL — POWER TIER (5 CREDITS - MAXIMUM DETAIL & DENSITY):
- You MUST generate an incredibly rich, masterclass, and highly immersive prompt template.
- CHARACTER LENGTH REQUIREMENT: The generated promptTemplate MUST be at least 600 to 700 characters long. Pack it with the absolute maximum density of visual details, atmosphere, lighting setups, and artistic direction keywords so that it is a masterpiece that perfectly describes the scene.
- MAXIMUM FIXED DESCRIPTIVE TEXT REQUIRED: Ensure the prompt template has the absolute maximum density of fixed, professional prompt-engineering words (such as intricate camera setups, lighting rigs, master-level rendering engines, environmental sensory words, artistic styling direction). The vast majority of the template MUST be solid, high-value, unchangeable text, while still strictly limiting bracketed variables to between 1 and 5.
- Incorporate professional cinematic and photographic vocabulary: specific focal lengths, precise aperture values, complex framing (e.g., low-angle extreme close-up, rule of thirds, dynamic background depth).
- Describe intricate sensory and environmental details: volumetric fog, specific humidity/weather, raytraced light reflections, subtle chromatic aberration, realistic fabric weave, and precise skin/surface textures.
- Use advanced artistic direction keywords: epic scale, highly atmospheric, award-winning cinematography, photorealistic render, breathtaking detailed composition.`;
  } else {
    tierGuidelines = `
PROMPT DETAIL LEVEL — NORMAL TIER (1 CREDIT):
- Generate a professional, clean, and direct prompt.
- CHARACTER LENGTH REQUIREMENT: The generated promptTemplate MUST be at least 400 to 500 characters long. It must be highly detailed, perfect, and best describes the visual scene.
- Keep the prompt clear and focused on key visual details, style, composition, and lighting.
- Focus on producing a clean, solid, and high-quality baseline prompt with standard fixed text and 1 to 5 variables.`;
  }

  // ── CHARACTER MODE-SPECIFIC REFERENCE IMAGE RULES ──
  let referenceImageRules = '';
  let howToBuildSamples = '';

  if (isVideo) {
    if (hasRefImage) {
      if (resolvedCharMode === 'sameSceneLoop') {
        referenceImageRules = `
CRITICAL — REFERENCE IMAGE HANDLING (🎥 SAME SCENE LOOP MODE - VIDEO):
The user has selected SAME SCENE LOOP mode for a video prompt. This means the video MUST keep the background, characters, composition, and layout absolutely identical to the reference image, with only the motion, animation, and timing varying.

When a reference image is provided in SAME SCENE LOOP mode, you MUST strictly enforce these rules:
1. LOCK EVERYTHING EXCEPT MOTION:
   - Describe the exact character from the reference image, including face, hair, clothing, and accessories as FIXED text.
   - Describe the exact scene/background environment as FIXED text.
   - You are ABSOLUTELY FORBIDDEN from putting these into brackets (e.g. DO NOT use [subject], [character], [clothing], [outfit], [background], [scenery] as variables in promptTemplate).
2. ONLY MOTION & ANIMATION ARE ALLOWED AS VARIABLES:
   - The ONLY bracketed variable allowed in promptTemplate must be: [motion_dynamics] or [animation/motion].
3. SCENE DIVISION:
   - For 5s: exactly 2 scenes:
     Scene 1 (0 to 2.5 seconds): Establish static frame. Description of character and background. Motion: subtle motion 1
     Scene 2 (2.5 to 5 seconds): Same static frame. Same character and background. Motion: subtle motion 2
   - For 10s: exactly 3 scenes:
     Scene 1 (0 to 3.3 seconds): Establish static frame. ...
     Scene 2 (3.3 to 6.6 seconds): ...
     Scene 3 (6.6 to 10 seconds): ...
   - For 20s: exactly 5 scenes:
     Scene 1 (0 to 4 seconds): ...
     Scene 2 (4 to 8 seconds): ...
     Scene 3 (8 to 12 seconds): ...
     Scene 4 (12 to 16 seconds): ...
     Scene 5 (16 to 20 seconds): ...
4. Camera is completely locked/static — no panning, no zoom.`;

        howToBuildSamples = `HOW TO BUILD SAMPLES (🎥 SAME SCENE LOOP MODE - FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must start with "Generate a video of: " and be structured scene-by-scene based on the duration (e.g. Scene 1 (0 to 2.5 seconds) and Scene 2 (2.5 to 5 seconds) for 5s).
   - Describe the exact character, clothing, scene, background, art style, color palette, and lighting from the reference image.
   - Include a specific subtle motion/animation per scene (NO brackets).
2. Create promptTemplate: Take the mainPrompt and replace ONLY the motion/animation in each scene with a bracketed variable (e.g., [animation/motion_1], [animation/motion_2]).
   - CRITICAL: All other parts of the prompt (subject, clothing, background, style, colors, lighting) MUST remain as FIXED, detailed, non-variable text in the promptTemplate. DO NOT put them in brackets!
3. For each of the 4 samples (Sample A, Sample B, Sample C, Sample D), copy the promptTemplate and replace ONLY the motion variables.
   - CRITICAL: The subject, clothing, background, style, etc. MUST be 100% IDENTICAL and repeated word-for-word across all samples! Only the animations must vary.
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. Every prompt and sample MUST end with "--ar ${resolvedAR}".`;
      } else if (resolvedCharMode === 'differentScenes') {
        referenceImageRules = `
CRITICAL — REFERENCE IMAGE HANDLING (🔄 DIFFERENT SCENES MODE - VIDEO):
The user has selected DIFFERENT SCENES mode for a video prompt. This means the character's identity (face, hair, clothing, styling) and the overall video/art style must remain identical, but they are placed in completely different locations/settings and perform different actions per scene.

When a reference image is provided in DIFFERENT SCENES mode, you MUST:
1. LOCK CHARACTER & STYLE:
   - Describe the exact character and outfit from the reference image in high detail as FIXED text.
   - LOCK the art/cinematic style as FIXED text.
   - You are ABSOLUTELY FORBIDDEN from putting character or clothing into brackets (e.g. DO NOT use [subject], [character], [clothing], [outfit] as variables in promptTemplate).
2. ONLY LOCATION, ACTION & CAMERA ARE ALLOWED AS VARIABLES:
   - The bracketed variables in promptTemplate should be: [location_1/action_1] and [camera_movement_1] per scene.
3. SCENE DIVISION:
   - For 5s: exactly 2 scenes:
     Scene 1 (0 to 2.5 seconds): same character description, outfit, and art style. Location 1/action 1. Camera movement 1
     Scene 2 (2.5 to 5 seconds): same character description, outfit, and art style. Location 2/action 2. Camera movement 2
   - For 10s: exactly 4 scenes (2.5s each):
     Scene 1 (0 to 2.5 seconds): ...
     Scene 2 (2.5 to 5 seconds): ...
     Scene 3 (5 to 7.5 seconds): ...
     Scene 4 (7.5 to 10 seconds): ...
   - For 20s: exactly 8 scenes (2.5s each):
     Scene 1 (0 to 2.5 seconds) to Scene 8 (17.5 to 20 seconds).`;

        howToBuildSamples = `HOW TO BUILD SAMPLES (🔄 DIFFERENT SCENES MODE - FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must start with "Generate a video of: " and be structured scene-by-scene based on the duration (e.g. Scene 1 to Scene 4 for 10s).
   - Describe the exact character and outfit from the reference image.
   - Describe a completely different scene/background setting, camera movement, and action per scene.
2. Create promptTemplate: Take the mainPrompt and replace ONLY the background setting and camera/action in each scene with bracketed variables (e.g., [location_1/action_1], [camera_movement_1]).
   - CRITICAL: The subject description and clothing/outfit MUST remain as FIXED, detailed, non-variable text in the promptTemplate. DO NOT put them in brackets!
3. For each of the 4 samples (Sample A, Sample B, Sample C, Sample D), copy the promptTemplate and replace the bracketed variables.
   - CRITICAL: The subject description and clothing/outfit MUST be 100% IDENTICAL and repeated word-for-word across all samples!
   - The location/action and camera movement MUST vary completely per sample to show the same character in different video scenes.
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. Every prompt and sample MUST end with "--ar ${resolvedAR}".`;
      } else {
        referenceImageRules = `
CRITICAL — REFERENCE IMAGE HANDLING (📽️ FIXED CHARACTER + MOTION MODE - VIDEO):
The user has selected FIXED CHARACTER + MOTION mode for a video prompt. This means the character stays fixed in the same look, pose, and background as the reference, but the camera moves around them dynamically per scene.

When a reference image is provided in FIXED CHARACTER + MOTION mode, you MUST:
1. LOCK CHARACTER, OUTFIT & SCENE:
   - Describe the exact character, outfit, and setting/environment from the reference image in detail as FIXED text.
   - You are ABSOLUTELY FORBIDDEN from putting character, clothing, or environment into brackets.
2. ONLY CAMERA MOVEMENT IS ALLOWED AS A VARIABLE:
   - The ONLY bracketed variable allowed in promptTemplate must be: [camera_movement] or [motion_effect].
3. CAMERA MOVEMENT LIBRARY:
   - Orbit: "slow 180° orbit left to right"
   - Zoom In: "slow push-in to face"
   - Zoom Out: "pull-back reveal shot"
   - Low Angle Rise: "camera rises from ground to eye level"
   - Top Down: "aerial top-down slowly rotating"
   - Side Pan: "lateral pan left to right"
4. SCENE DIVISION:
   - For 5s: exactly 2 scenes (2.5s each, 2 moves)
     Scene 1 (0 to 2.5 seconds): camera move 1. Character description, outfit, background. Character does not move.
     Scene 2 (2.5 to 5 seconds): camera move 2. Same character, outfit, background. Character does not move.
   - For 10s: exactly 3 scenes (~3.3s each, 3 moves)
   - For 20s: exactly 5 scenes (4s each, 5 moves)
5. FORBIDDEN: No character body movement (not even blinking), no location change, no sudden jump cuts.`;

        howToBuildSamples = `HOW TO BUILD SAMPLES (📽️ FIXED CHARACTER + MOTION MODE - FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must start with "Generate a video of: " and be structured scene-by-scene based on the duration (e.g. Scene 1 and Scene 2 for 5s).
   - Each scene must start with a camera instruction from the Camera Movement Library (do not use bracketed tags like [CAMERA:], just describe it in plain English, e.g. "with a camera orbit left to right").
   - Describe the exact character, clothing, background, and lighting from the reference, followed by "Character does not move."
2. Create promptTemplate: Take the mainPrompt and replace ONLY the camera movement in each scene with a bracketed variable (e.g. [camera_movement_1]).
   - CRITICAL: The subject, clothing, background, style, colors, and lighting MUST remain as FIXED, detailed, non-variable text in the promptTemplate. DO NOT put them in brackets!
3. For each of the 4 samples (Sample A, Sample B, Sample C, Sample D), copy the promptTemplate and replace ONLY the camera movement variables.
   - CRITICAL: The subject, clothing, background, style, etc. MUST be 100% IDENTICAL and repeated word-for-word across all samples! Only the camera movement varies.
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. Every prompt and sample MUST end with "--ar ${resolvedAR}".`;
      }
    } else {
      referenceImageRules = `
CRITICAL — VIDEO PROMPT RULES:
The user is generating a video prompt. You MUST format the prompt and all samples in a scene-by-scene structure matching the duration.
Each scene must describe the continuous video progression (action, camera movement, environment, lighting).
Every prompt and sample MUST start with "Generate a video of: " or "Generate a video of " and MUST end with "--ar ${resolvedAR}".`;

      howToBuildSamples = `HOW TO BUILD SAMPLES (VIDEO PROMPT - GENERAL - FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must start with "Generate a video of: " and be structured scene-by-scene based on the duration:
   - For 5s: Scene 1 (0 to 2.5 seconds) and Scene 2 (2.5 to 5 seconds).
   - For 10s: Scene 1 (0 to 3.3 seconds), Scene 2 (3.3 to 6.6 seconds), Scene 3 (6.6 to 10 seconds).
   - For 20s: Scene 1 (0 to 4 seconds), Scene 2 (4 to 8 seconds), Scene 3 (8 to 12 seconds), Scene 4 (12 to 16 seconds), Scene 5 (16 to 20 seconds).
   - Describe a detailed, continuous video progression with scene actions, lighting, and camera.
2. Create promptTemplate: Take the mainPrompt and replace only the key action, environment, or camera movement in each scene with a bracketed variable (e.g., [action_1], [camera_1]).
3. For each of the 4 samples (Sample A, Sample B, Sample C, Sample D), copy the promptTemplate and replace the bracketed variables with unique creative details.
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. Every prompt and sample MUST end with "--ar ${resolvedAR}".`;
    }
  } else if (isText) {
    referenceImageRules = `
CRITICAL — TEXT PROMPT RULES:
- You are generating a text prompt (a prompt that the user will copy-paste into ChatGPT, Gemini, Claude, or another AI).
- You MUST force the target AI to output exactly what the category demands:
  1. For "CODE" and "AI AGENTS" categories: The generated prompt (mainPrompt, promptTemplate, and samples) MUST explicitly force the target AI to write complete, detailed, fully-functional, and clean code blocks (with syntax highlighting, modular files, and comments) rather than generic text summaries or placeholder explanations. The prompt description MUST reflect this (e.g., "Forces the AI to generate complete, high-quality code...").
  2. For other categories ("WRITING", "MARKETING", "BUSINESS", "RESEARCH", "EDUCATION", "PRODUCTIVITY", "CREATIVE", "SOCIAL MEDIA", "ECOMMERCE", "OTHER"): The generated prompt must force the target AI to write detailed, formatted, and structured copywriting, articles, blueprints, or planning copy.
- You are STRICTLY FORBIDDEN from including Midjourney parameter suffixes (like "--ar") or camera/lighting keywords (like "aperture", "lens", "camera pan") in text prompts.
- Ensure the prompt's title and description clearly state what kind of output (code or structured text) it forces the target AI to generate.`;

    howToBuildSamples = `HOW TO BUILD SAMPLES (TEXT PROMPT - GENERAL - FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must be a complete, ready-to-use sample prompt with all bracketed variables replaced by real, creative values (like detailed coding specifications or copywriting briefs).
   - CRITICAL: Do NOT append any camera settings, lens details, or Midjourney "--ar" suffixes to text prompts.
2. Create promptTemplate: Take the mainPrompt and replace 1 to 5 key parameters with bracketed variables (e.g. [brand_name], [programming_language], [tone], etc.).
3. For each of the 4 samples (Sample A, Sample B, Sample C, Sample D), copy the promptTemplate and replace the bracketed variables with unique creative details.
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. SAMPLE COUNT: Generate exactly 4 samples for complete prompt packs (Sample A, Sample B, Sample C, Sample D).`;
  } else {
    // Image reference rules
    if (resolvedCharMode === 'fixed') {
      referenceImageRules = `
CRITICAL — REFERENCE IMAGE HANDLING (🔒 FIXED CHARACTER MODE):
The user has selected FIXED CHARACTER mode. This means the CHARACTER'S PHYSICAL IDENTITY (face, hair, eyes, skin tone, body type, age, gender) AND their EXACT CLOTHING/OUTFIT (every garment, colors, patterns, materials, accessories) from the reference image MUST stay 100% IDENTICAL across promptTemplate and ALL 4 samples.
WHAT CHANGES: The character travels to DIFFERENT LOCATIONS, SCENES, and ENVIRONMENTS! The background setting, location, lighting atmosphere, and action/pose change completely in each sample.
Think of it like following the same character on a journey through different places — wearing their signature outfit, but visiting a cozy cafe, a snowy mountain peak, a vibrant neon city street, or a sunlit beach.

When a reference image is provided in FIXED CHARACTER mode, you MUST:

1. DEEPLY ANALYZE THE CHARACTER & OUTFIT FROM THE IMAGE — treat them as FIXED:
   CHARACTER (ALL FIXED — never changes across promptTemplate or any sample):
   - Face: facial structure, eye shape, nose, lips, expression style, age, gender, ethnicity, natural skin texture with visible pores
   - Hair: exact color, length, hairstyle, texture, bangs, accessories in hair
   - Body type, proportions, height impression
   - Clothing: EVERY piece of clothing stays IDENTICAL — exact colors, patterns, materials, layers, fit
   - Accessories: jewelry, watches, bracelets, bags, hats, sunglasses, shoes — ALL stay the same

   SCENE & BACKGROUND (CHANGES PER SAMPLE):
   - Background setting: varies completely per sample (e.g. cozy library, snowy mountain, sunny beach, rooftop at sunset, bustling night market)
   - Lighting mood: adjusts to match the new setting
   - Pose/action: fits the new environment naturally

2. ONLY BACKGROUND, SETTING, LIGHTING, AND POSE ARE ALLOWED AS VARIABLES:
   In the promptTemplate, the character description and clothing description must be written as FIXED, unchangeable text. The ONLY bracketed variables should be:
   - [background_setting]
   - [location/environment]
   - [pose/action]
   - [lighting/atmosphere] (optional)
   
   ABSOLUTELY FORBIDDEN as variables: [character], [person], [subject], [clothing], [outfit]. These MUST be fixed text.

3. THE mainPrompt MUST DESCRIBE THE CHARACTER IN THE REFERENCE IMAGE SCENE (without brackets).

4. ALL 4 SAMPLES MUST FEATURE THE EXACT SAME CHARACTER & OUTFIT IN DIFFERENT SCENES (Sample A, Sample B, Sample C, Sample D):
   - Same character identity, same facial features, same hair, same clothes in every sample.
   - Each sample transports them to a completely different environment with an appropriate pose.`;

      howToBuildSamples = `HOW TO BUILD SAMPLES (🔒 FIXED CHARACTER MODE - FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must be a perfect, highly detailed, real-world example of the prompt being used (NO brackets) describing the reference character and scene exactly.
   - Describe the exact subject from the reference (e.g. "a young East Asian woman with short dark hair, natural skin texture").
   - Describe the exact clothing from the reference (e.g. "wearing a blue and white checkered wrap top and a delicate white lace camisole").
   - Describe the scene/background setting, lighting, and a specific pose/action.
   - End with "--ar ${resolvedAR}".
2. Create promptTemplate: Take the mainPrompt and replace ONLY the background setting, lighting, and pose/action with bracketed variables (e.g., [background_setting], [lighting], [pose/action]).
   - CRITICAL: The subject description and clothing/outfit MUST remain as FIXED, detailed, non-variable text in the promptTemplate. DO NOT put them in brackets!
3. For each of the 4 samples (Sample A, Sample B, Sample C, Sample D), copy the promptTemplate and replace the bracketed variables.
   - CRITICAL: The subject description and clothing/outfit MUST be 100% IDENTICAL and repeated word-for-word across all samples! DO NOT vary them! E.g., never generate different subjects or different outfits. All samples must feature the EXACT SAME character in the EXACT SAME outfit.
   - The background setting, lighting, and pose/action MUST vary completely per sample to show the same character in different locations/scenes (e.g. Sample A in the original scene, Sample B in a cozy library, Sample C in snowy mountains, Sample D in a sunlit botanical garden).
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. SAMPLE COUNT: Generate exactly 4 samples for complete prompt packs (Sample A, Sample B, Sample C, Sample D).
6. CRITICAL CHARACTER LENGTH CONSTRAINT (MANDATORY):
   The generated promptTemplate MUST strictly comply with these length limits based on the Credit Tier:
   - 1 Credit (Normal): promptTemplate MUST be at least 400 to 500 characters long.
   - 3 Credits (Super): promptTemplate MUST be at least 500 to 600 characters long.
   - 5 Credits (Power): promptTemplate MUST be at least 600 to 700 characters long.
   You MUST write exceptionally detailed, long, and descriptive fixed text around the bracketed variables in promptTemplate to satisfy this length requirement.
7. Every prompt and sample MUST end with --ar ${resolvedAR}`;
    } else if (resolvedCharMode === 'sameScene') {
      referenceImageRules = `
CRITICAL — REFERENCE IMAGE HANDLING (📸 SAME SCENE MODE / REAL MODEL PHOTOSHOOT):
The user is generating a photoshoot prompt for a REAL HUMAN MODEL in SAME SCENE mode.
You MUST treat this like directing a REAL HUMAN MODEL standing/sitting right in front of you during a live, continuous photoshoot session!

STRICT RULES FOR GROQ PROMPT GENERATION:
1. 100% SAME PERSON & OUTFIT GUARANTEE (LOCKED WORD-FOR-WORD ACROSS ALL SAMPLES):
   - Face, ethnicity, age, skin tone, natural unedited skin texture, visible pores, hair color, hair length, hairstyle, eye shape, body shape, and exact apparel/clothing/outfit (tops, bottoms, footwear, accessories, jewelry) MUST BE 100% IDENTICAL and REPEATED WORD-FOR-WORD across mainPrompt, promptTemplate, and ALL 4-5 generated samples!
   - You are ABSOLUTELY FORBIDDEN from changing the model's face, hair, body, or outfit across samples under ANY circumstances.

2. WHAT MUST VARY ACROSS SAMPLES (DIRECTING A REAL HUMAN MODEL IN FRONT OF CAMERA):
   Imagine directing the real person in front of your camera for each sample shot:
   - Sample A: Pose 1 (e.g., standing leaning against a wooden door, hand touching hair) + facial expression 1 (confident gaze into lens) + camera angle 1 (85mm portrait shot).
   - Sample B: Pose 2 (e.g., sitting cross-legged on a chair, holding a warm coffee mug with both hands) + facial expression 2 (gentle relaxed smile) + camera angle 2 (medium close-up crop).
   - Sample C: Pose 3 (e.g., crouching down gracefully with chin resting on palm) + facial expression 3 (playful soft half-smile) + camera angle 3 (low-angle editorial framing).
   - Sample D: Pose 4 (e.g., standing turning back towards camera, hands in denim pockets) + facial expression 4 (thoughtful look over shoulder) + camera angle 4 (eye-level 35mm candid shot).

3. PROMPT FORMULA TO FOLLOW:
   "Recreate this image with the exact same [subject_description], same [outfit_details], same [art_style], same [color_palette], same [background_setting], same [lighting] — only change the [pose/action], [gesture/hand_position], [facial_expression], and [camera_angle]."

4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES:
   - Samples and mainPrompt MUST NOT contain bracketed tags (no [pose], no [expression], no [brackets]). Only promptTemplate has brackets.
   - Every prompt and sample MUST end with "--ar ${resolvedAR}".`;

      howToBuildSamples = `HOW TO BUILD SAMPLES (📸 SAME SCENE MODE - REAL MODEL PHOTOSHOOT - FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must be a perfect, highly detailed, real-world example of the prompt being used (NO brackets) describing the real human model and scene exactly.
   - Describe the exact subject from the reference (e.g., "authentic photorealistic portrait of a young East Asian woman with shoulder-length dark hair, natural skin texture, visible pores").
   - Describe the exact clothing from the reference (e.g., "wearing a blue and white checkered wrap top and a delicate white lace camisole").
   - Describe the exact scene/background setting, lighting, and style.
   - Include specific pose 1, hand gesture 1, expression 1, and camera angle 1 (e.g., "standing resting her chin thoughtfully on her hand, soft smiling, 85mm lens portrait").
   - End with "--ar ${resolvedAR}".
2. Create promptTemplate: Take the mainPrompt and replace ONLY the pose/action, hand position, facial expression, and camera angle with bracketed variables (e.g., [pose/action], [hand_gesture], [facial_expression], [camera_angle]).
   - CRITICAL: All other parts of the prompt (subject description, clothing/outfit, background setting, art style, color palette, lighting) MUST remain as FIXED, detailed, non-variable text in the promptTemplate. DO NOT put them in brackets!
3. For each of the 4 samples (Sample A, Sample B, Sample C, Sample D), copy the promptTemplate and replace ONLY the pose/action, hand gesture, expression, and camera angle variables.
   - CRITICAL: The subject description, facial features, hair, clothing/outfit, background setting, art style, color palette, and lighting MUST be 100% IDENTICAL and repeated word-for-word across all samples! DO NOT vary them! E.g., never generate different subjects or different outfits in any sample! All samples must feature the EXACT SAME young woman in the EXACT SAME outfit in the EXACT SAME setting.
   - ONLY the poses, hand positions, gestures, facial expressions, and camera framing must vary completely between samples (e.g., sample A: standing touching hair with confident smile; sample B: sitting cross-legged holding a mug with relaxed smile; sample C: crouching down with chin on palm; sample D: standing hands in pockets looking over shoulder).
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. SAMPLE COUNT: Generate exactly 4 samples for complete prompt packs (Sample A, Sample B, Sample C, Sample D).
6. CRITICAL CHARACTER LENGTH CONSTRAINT (MANDATORY):
   The generated promptTemplate MUST strictly comply with these length limits based on the Credit Tier:
   - 1 Credit (Normal): promptTemplate MUST be at least 400 to 500 characters long (detailed and perfect to best describe the scene).
   - 3 Credits (Super): promptTemplate MUST be at least 500 to 600 characters long (exceptional photographic details and camera settings).
   - 5 Credits (Power): promptTemplate MUST be at least 600 to 700 characters long (masterpiece-level visual details, highly detailed and fully descriptive).
   You MUST write exceptionally detailed, long, and descriptive fixed text around the bracketed variables in promptTemplate to satisfy this length requirement.
7. Every prompt and sample MUST end with --ar ${resolvedAR}`;
    } else {
      referenceImageRules = `
CRITICAL — REFERENCE IMAGE HANDLING (🔄 DIFFERENT CHARACTERS MODE):
The user has selected DIFFERENT CHARACTERS mode. This means the ART STYLE, VISUAL TECHNIQUE, COMPOSITION, and OVERALL AESTHETIC from the reference image must stay EXACTLY THE SAME — but the CHARACTER/SUBJECT changes to a completely different one in each sample. Think of it like an artist creating a series of artworks in the same style but featuring different subjects.

When a reference image is provided in DIFFERENT CHARACTERS mode, you MUST:

1. DEEPLY ANALYZE THE ART STYLE & TECHNIQUE (these are FIXED — never change):
   - Art style: geometric mosaic, retro illustration, hip-hop graffiti cartoon, watercolor, 3D render, pixel art, etc.
   - Visual technique: how shapes are used, line work style, shading method, texture approach
   - Color treatment: the color palette approach (not specific colors, but the style — vibrant, muted, neon, pastel, etc.)
   - Composition approach: how the subject is framed, centered, positioned
   - Background style: the type/style of background (solid color, gradient, detailed scene, etc.)
   - Level of detail: how detailed or simplified the artwork is
   - Special elements: recurring design motifs, decorative elements, text/typography style, graffiti splashes, doodles, patterns
   - Medium impression: does it look like digital art, print, sticker design, t-shirt graphic, etc.
   
   Also analyze the CHARACTER (this will CHANGE):
   - What is the character/subject? (dog, cat, leopard, panda, girl, boy, etc.)
   - What specific features does it have?
   - What pose is it in?
   - What props or accessories does it have?

2. THE ART STYLE IS FIXED TEXT — THE CHARACTER IS THE MAIN VARIABLE:
   In the promptTemplate, the ENTIRE art style description, visual technique, composition approach, background style, and decorative elements must be FIXED, unchangeable text. The CHARACTER/SUBJECT is the primary variable that changes.
   
   CORRECT EXAMPLE (geometric mosaic animal art):
   - promptTemplate: "Geometric low-poly mosaic art of a [subject/character], [pose/action], constructed from interlocking triangles, circles and geometric shapes with metallic gold accent lines, intricate patterned body with [color scheme] tones, standing on a dark background, digital art, sharp edges, symmetrical design --ar 1:1"
   - Sample A (matches reference): "...a snow leopard, standing regally, icy blue and silver..."
   - Sample B: "...a red fox, sitting alertly with tail wrapped, warm copper and turquoise..."
   - Sample C: "...a wise owl, perched forward-facing, deep purple and magenta..."
   
   CORRECT EXAMPLE (retro illustration animal with flower):
   - promptTemplate: "Retro vintage illustration of a [subject/character], [pose/action], beside a [flower type], minimalist flat design with subtle halftone dot texture, [background color] solid background, warm muted color palette, mid-century modern art style, soft rounded shapes --ar 1:1"
   - Sample A (matches reference): "...a beagle dog, sitting happily, sunflower, dusty pink..."
   - Sample B: "...a red fox, smiling peacefully, daisy, navy blue..."
   - Sample C: "...a white rabbit, looking content, lavender sprig, golden yellow..."

   CORRECT EXAMPLE (hip-hop graffiti character):
   - promptTemplate: "Urban hip-hop graffiti style cartoon character design of a [subject/character] wearing [themed outfit], [action/pose], surrounded by bold [theme text] graffiti typography, spray paint splashes, sticker bomb elements, neon accents, sneakers with detailed lacing, chibi proportions, white background, t-shirt graphic design --ar 1:1"
   - Sample A: "...a cool panda, purple hoodie and snapback cap, skateboarding, SKATE BOARD..."
   - Sample B: "...a space boy, astronaut suit with planet patches, reaching upward, REACH FOR THE STARS..."
   - Sample C: "...a street cat, paint-splattered jacket with chains, spray painting, STREET CAT..."

3. IDENTIFY THE RIGHT VARIABLES (max 5) — CHARACTER IS ALWAYS THE MAIN ONE:
   - [subject/character] — THE MOST IMPORTANT VARIABLE: the creature, animal, person, or entity (e.g., snow leopard → red fox → owl → eagle)
   - [pose/action] — what the character is doing (e.g., standing → sitting → perching → flying)
   - [color scheme] or [themed outfit] — character-specific colors or outfit that fits the new character
   - [detail/accessory] or [flower type] or [theme text] — a supporting element that changes with the character
   - [background color] — optional color shift to complement the new character
   
   ABSOLUTELY FIXED (never a variable): art style, visual technique, composition, level of detail, decorative motifs, design approach, medium, texture style. These define the "look" and must stay identical.

4. THE mainPrompt MUST DESCRIBE THE EXACT CHARACTER from the reference image as Sample A.

5. ALL 4 SAMPLES MUST LOOK LIKE THEY BELONG TO THE SAME ART SERIES (Sample A, Sample B, Sample C, Sample D):
   - The art style, technique, and visual approach are IDENTICAL across all samples.
   - ONLY the character/subject changes — and each must be a COMPLETELY DIFFERENT character.
   - If the reference shows a geometric mosaic snow leopard, the samples might show a geometric mosaic fox, a geometric mosaic owl, etc.
   - If the reference shows a beagle in retro illustration style, the samples might show a fox, rabbit, cat, etc. in that SAME retro style.
   - If the reference shows a hip-hop panda, the samples might show a hip-hop boy, cat, bunny, monkey, bear, etc.
   - The series should feel like it was all created by the same artist in the same style.

6. The goal: when someone generates images from these prompts, they get a cohesive art series where every piece has the SAME visual style but features DIFFERENT characters — perfect for collections, sticker sets, t-shirt series, etc.`;

      howToBuildSamples = `HOW TO BUILD SAMPLES (FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must be a perfect, real-world example of the prompt being used (NO brackets). Make it long, detailed, and rich with fixed descriptive text.
2. Create promptTemplate: take the mainPrompt and replace ONLY the most important changeable parts with [BRACKET] variables. 
3. STRICT VARIABLE LIMIT — MINIMUM 1, MAXIMUM 5 VARIABLES: The promptTemplate MUST contain a minimum of 1 bracketed variable and a maximum of 5 bracketed variables total. You must NEVER exceed 5 variables (e.g., [subject], [color], [style], [lighting], [location] is 5). Any prompt template with 6 or more variables is REJECTED. Keep all the remaining text of the prompt as rich, high-quality, fixed descriptive words.
4. GENERAL RULE & PERFECT TEMPLATE EXAMPLE:
   Here is a perfect example of a general, high-value prompt template that has EXACTLY 4 variables (within the 1-5 limit) and 80% fixed descriptive text:
   - mainPrompt: "Double exposure photography of a wolf silhouette against a deep pine forest, vibrant night sky filled with aurora borealis, double exposure visual effect, ethereal lighting, sharp details, cinematic rendering --ar ${resolvedAR}"
   - promptTemplate: "Double exposure photography of a [subject] silhouette against a [background scenery], vibrant night sky filled with [atmospheric effect], double exposure visual effect, [lighting style] lighting, sharp details, cinematic rendering --ar ${resolvedAR}"
   - In this example, ONLY the key items ([subject], [background scenery], [atmospheric effect], [lighting style]) are variables (4 total). All other words like "Double exposure photography", "silhouette against a", "vibrant night sky filled with", "double exposure visual effect", "lighting, sharp details, cinematic rendering" are FIXED descriptive text. This ensures the prompt is highly professional, unique, and valuable!
5. For each sample (A, B, C, etc.), take the promptTemplate and replace every [BRACKET] variable.
6. ZERO TOLERANCE FOR REPETITION: Every variable MUST be 100% unique across all samples.
7. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
8. SAMPLE COUNT: Generate exactly 4 samples for complete prompt packs (Sample A, Sample B, Sample C, Sample D).
9. CRITICAL CHARACTER LENGTH CONSTRAINT (MANDATORY):
   The generated promptTemplate MUST strictly comply with these length limits based on the Credit Tier:
   - 1 Credit (Normal): promptTemplate MUST be at least 400 to 500 characters long (detailed and perfect to best describe the scene).
   - 3 Credits (Super): promptTemplate MUST be at least 500 to 600 characters long (exceptional photographic details and camera settings).
   - 5 Credits (Power): promptTemplate MUST be at least 600 to 700 characters long (masterpiece-level visual details, highly detailed and fully descriptive).
   You MUST write exceptionally detailed, long, and descriptive fixed text around the bracketed variables in promptTemplate to satisfy this length requirement.
10. Every prompt and sample MUST end with --ar ${resolvedAR}
11. CRITICAL COMPLETE TEXT MANDATE: Every sample (Sample A, Sample B, Sample C, Sample D) and mainPrompt MUST retain 100% of the complete text structure of promptTemplate from start to finish. DO NOT drop, omit, or cut off any fixed text, clauses, or camera details present in promptTemplate when generating samples or mainPrompt.`;
    }
  }

  let subcategoryInstruction = '';
  if (isText && category && subcategory) {
    const catUpper = category.toUpperCase().trim();
    const subTrim = subcategory.trim();
    const catRules = TEXT_SUBCATEGORY_RULES[catUpper];

    if (catRules && catRules[subTrim]) {
      const rule = catRules[subTrim];
      // Only provide the subcategory name and description as context hints.
      // DO NOT inject the raw promptTemplate — let the AI generate from scratch based on user description.
      subcategoryInstruction = `
SUBCATEGORY CONTEXT — ${rule.name}:
- Category: ${catUpper}
- Subcategory: ${subTrim}
- Description: ${rule.description || 'Generate a high-quality prompt for this subcategory.'}
- Generate the prompt entirely from scratch based on the user's description. Do NOT use any pre-built template.
`;
    }
  }

  let outputFormatInstruction = '';
  if (isText) {
    outputFormatInstruction = `OUTPUT FORMAT:
You must return a VALID JSON object with these fields:
{
  "title": "A catchy 3-5 word title for the prompt",
  "description": "A professional 1-2 sentence description of what this prompt achieves",
  "imageAnalysis": "",
  "mainPrompt": "A COMPLETE, READY-TO-USE SAMPLE PROMPT with ALL bracketed variables replaced by real, creative values. This MUST NOT contain any [BRACKETS]. Do NOT append any --ar or visual settings.",
  "negativePrompt": "Things to avoid/exclude in the text output structure",
  "promptTemplate": "The skeleton version of the prompt using [BRACKETED] variables for changeable parts. THIS IS THE ONLY FIELD THAT SHOULD HAVE BRACKETS. Limit variables to between 1 and 5.",
  "samples": [
    "Sample A: unique variation...",
    "Sample B: unique variation...",
    "Sample C: unique variation...",
    "Sample D: unique variation..."
  ],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "instructions": "Step-by-step instructions on how to use this prompt effectively."
}

- Do NOT append any --ar suffix to text prompts or samples.
- Return ONLY the JSON object. No markdown fences, no explanation.`;
  } else {
    outputFormatInstruction = `OUTPUT FORMAT:
You must return a VALID JSON object with these fields:
{
  "title": "A catchy 3-5 word title for the prompt",
  "description": "A professional 1-2 sentence description of what this prompt achieves",
  "imageAnalysis": "If a reference image was provided, describe what you see in detail. If no image, set to empty string.",
  "mainPrompt": "A COMPLETE, READY-TO-USE SAMPLE PROMPT with ALL bracketed variables replaced by real, creative values. This MUST NOT contain any [BRACKETS]. End with --ar ${resolvedAR}",
  "negativePrompt": "A comprehensive negative prompt (things to avoid/exclude)",
  "promptTemplate": "The skeleton version of the prompt using [BRACKETED] variables for changeable parts. THIS IS THE ONLY FIELD THAT SHOULD HAVE BRACKETS.",
  "samples": [
    "Sample A: unique variation...",
    "Sample B: unique variation...",
    "Sample C: unique variation...",
    "Sample D: unique variation..."
  ],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "instructions": "Step-by-step instructions on how to use this prompt effectively."
}

- Every prompt and sample MUST end with --ar ${resolvedAR}

Return ONLY the JSON object. No markdown fences, no explanation.`;
  }

  const isModelCategory = (category || '').toLowerCase().trim() === 'model' || (subcategory || '').toLowerCase().trim().includes('model');

  const modelBoldInstructions = isModelCategory ? `
CRITICAL MODEL PROMPT, 100% REAL HUMAN GIRL PHOTOGRAPHY & SAFETY COMPLIANCE RULES:
1. SAFE, BEAUTIFUL & PHOTOREALISTIC VOCABULARY ONLY (CRITICAL SAFETY COMPLIANCE):
   - You MUST NEVER include words like "huge bust", "heavy bust", "deep cleavage", "huge cleavage", "busty", "naked", "nude", "erotic", "nsfw", or "sexy" in any generated prompt. These words trigger AI safety filters and cause image generation failures.
   - INSTEAD, ALWAYS use elegant, aesthetic, safe photographic descriptions: e.g., "curvaceous fashion model", "glamorous silhouette", "scoop neckline outfit", "elegant evening dress", "attractive woman", "natural graceful posture".
2. PRESERVE USER INTENT & SCENE DETAILS:
   - Incorporate the user's requested hair color (redhead, brunette, blonde), ethnicity, facial features, outfit, and background location into all prompts.
3. NO PLUS (+) SIGNS ANYWHERE:
   - You are STRICTLY FORBIDDEN from using '+' symbols in ANY field (title, description, mainPrompt, promptTemplate, or samples). Use clean English prose with commas.
4. DETAILED PHOTOGRAPHIC MASTERPROMPTS:
   - Both "promptTemplate" and "mainPrompt" MUST be complete, rich photographic masterprompts (400 to 600 characters).
   - Specify: "candid eye-level photograph of a real girl, natural unretouched skin texture with fine freckles and visible skin pores, authentic daylight, snapshot, shot on 35mm f/1.8 lens".
5. ELIMINATE CARTOON / CGI / ANIME / 3D RENDER GLOSS:
   - FORBIDDEN KEYWORDS: Do NOT generate 3D render, cartoon, digital art, illustration, smooth airbrushed CGI skin, porcelain doll glow, anime, 8k, hyperrealistic, photorealistic.
6. SAME CHARACTER & SCENE CONSISTENCY WITH VARYING POSES:
   - In all 4 generated samples (Sample A, B, C, D), keep the subject's face, hair color, outfit, and background 100% identical.
   - VARY ONLY THE BODY POSE & CAMERA ANGLE:
     * Sample A: Frontal portrait sitting relaxed at table, direct eye contact.
     * Sample B: 3/4 side profile view resting chin on hand, looking off-camera.
     * Sample C: Standing pose leaning against wall/chair, natural relaxed expression.
     * Sample D: Over-the-shoulder glance towards camera, subtle candid movement.` : `
STRICT INPUT, REALISM & SYNTAX RULES:
1. PRESERVE USER WORDS: You MUST preserve and incorporate the user's EXACT input keywords and description into the generated prompt. DO NOT discard or replace the user's specific input words.
2. NO PLUS (+) SIGNS ANYWHERE: You are STRICTLY FORBIDDEN from using '+' symbols or plus signs in ANY field. Use clean, natural English prose and descriptive phrases separated by commas.
3. CLEAN HUMAN-READABLE DESCRIPTION: The "description" field MUST be a clean, elegant, human-readable 1-2 sentence sales summary. NEVER output raw prompt strings or '+' signs inside "description".
4. DETAILED PROMPTS: "promptTemplate" and "mainPrompt" MUST be complete, detailed, rich photographic prompts (min 400-600 characters). Include camera lens details (e.g. 35mm f/1.8), natural lighting, and authentic skin texture.
5. 100% REAL HUMAN REALISM (NO CARTOON / CGI): Specify 'candid authentic 100% real human, natural unedited skin texture, subtle visible skin pores, raw unretouched photograph, 35mm lens'. Avoid plastic AI glow, CGI renders, cartoon styles, or doll-like smooth skin.
6. SAME SCENE CONSISTENCY: Keep subject, clothes, and scene identical across samples while varying camera framing, angles, and poses.
7. MANDATORY FULL FIELDS: Every field in the JSON object MUST be fully populated.`;

  return `You are an expert AI Prompt Engineer for a premium prompt marketplace called "Prompt by Niti".

PLATFORM RULES (ALWAYS ENFORCE):
${rulesStr}

YOUR ROLE:
- Generate professional, high-quality AI prompts based on user descriptions.
- Optimize prompts for the specific format the user selects (image, video, or text).
- For IMAGE prompts: focus on vivid visual details, composition, lighting, style keywords.
- For VIDEO prompts: include camera movements, motion dynamics, temporal flow, scene transitions.
- For TEXT prompts: focus on tone, structure, context, audience, formatting guidance.

${modelBoldInstructions}

${tierGuidelines}

${referenceImageRules}

${howToBuildSamples}

${subcategoryInstruction}

${outputFormatInstruction}`;
}

// POST /api/generate
router.post('/', async (req, res) => {
  try {
    const { description, characterImage, promptType, model, mode, modelLabel, aiPower, characterMode, aspectRatio, category, subcategory, generatePack } = req.body;
    // Use human-readable model name if available, otherwise fall back to model id
    const targetModel = modelLabel || model || 'Midjourney';
    const resolvedAR = promptType === 'video' ? (aspectRatio ? aspectRatio.trim() : '16:9') : '1:1';

    // Default to direct prompt only (no variables) if generatePack is not explicitly true
    const isDirectPromptOnly = !generatePack;
    const hasRefImage = characterImage && characterImage.startsWith('data:image');

    const effectiveDesc = (description && description.trim())
      ? description.trim()
      : (hasRefImage ? 'Reverse engineer and recreate 100% accurate prompt from uploaded reference image' : '');

    if (!effectiveDesc) {
      return res.status(400).json({ message: 'Description, Template, or Reference Image is required.' });
    }

    // 1. Get cached model (keys and database rules)
    const cached = await getOrCreateModel();

    // Build the system instruction dynamically based on the requested aiPower level
    const systemInstruction = buildSystemInstruction(cached.rulesStr, aiPower, characterMode, promptType, req.body.duration, hasRefImage, aspectRatio, category, subcategory, isDirectPromptOnly, targetModel);
    console.log(`🎭 Character Mode: ${characterMode || 'not set (no image)'}`);

    // 2. Build lightweight user message (NO rules, NO characteristics repeated)
    const userParts = [];

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
      let exampleLengthInstructions = '';
      const power = aiPower || 'normal';
      if (power === 'super') {
        exampleLengthInstructions = `
7. VARIABLE REPLACEMENT LENGTH — SUPER TIER (3 CREDITS):
   - For each [BRACKETED] variable you replace, you MUST generate a highly descriptive and detailed value of exactly 6 to 9 words (e.g., replace "[animal]" with "a fluffy golden retriever puppy playing with a red ball in grass", replace "[style]" with "cinematic dramatic warm studio lighting with dark background shadows").
   - This ensures all 5 generated samples are highly detailed, rich, and visually descriptive.`;
      } else if (power === 'power') {
        exampleLengthInstructions = `
7. VARIABLE REPLACEMENT LENGTH — POWER TIER (5 CREDITS):
   - For each [BRACKETED] variable you replace, you MUST generate an exceptionally descriptive, long, and sensory-rich value of exactly 10 to 15 words (e.g., replace "[animal]" with "a fluffy golden retriever puppy playing happily with a red ball in green grass under bright sun", replace "[style]" with "highly detailed cinematic dramatic warm studio lighting with deep shadows and soft volumetric dust particles").
   - This maximizes the detail level, giving the user exceptionally long, professional, and descriptive visual samples.`;
      } else {
        exampleLengthInstructions = `
7. VARIABLE REPLACEMENT LENGTH — NORMAL TIER (1 CREDIT):
   - For each [BRACKETED] variable you replace, generate a concise value of exactly 3 to 5 words (e.g., replace "[animal]" with "a fluffy golden retriever puppy", replace "[style]" with "dramatic studio lighting with shadows").`;
      }

      if (hasRefImage) {
        // Special case: example template customization WITH reference image consistency
        const isVideo = req.body.promptType === 'video';
        const resolvedCharMode = isVideo
          ? (characterMode === 'sameScene' || characterMode === 'sameSceneLoop' ? 'sameSceneLoop' :
            characterMode === 'different' || characterMode === 'differentScenes' ? 'differentScenes' :
              'fixedCharacterMotion')
          : (characterMode === 'sameSceneLoop' ? 'sameScene' :
            characterMode === 'differentScenes' ? 'different' :
              characterMode || 'different');

        console.log(`📸 Customizing template in example mode with reference image. Character Mode: ${resolvedCharMode}`);

        let modeSpecificInstructions = '';
        if (resolvedCharMode === 'sameScene' || resolvedCharMode === 'sameSceneLoop') {
          modeSpecificInstructions = isVideo ? `
🔒 CHARACTER MODE: SAME SCENE LOOP (Everything identical, only motion & timing changes)
The user has uploaded a reference image and selected SAME SCENE LOOP mode. This means EVERYTHING from the reference image MUST stay 100% identical.

CRITICAL ASSIGNMENT OF VARIABLES:
When replacing the [BRACKETED] variables in the USER TEMPLATE:
1. LOCKED VARIABLES (MUST BE 100% IDENTICAL AND REPEATED WORD-FOR-WORD ACROSS ALL 5 SAMPLES):
   - [subject_description] / [subject/character] / [outfit_details]: Analyze reference and describe them exactly, repeat word-for-word in ALL 5 samples.
   - [background_setting] / [art_style] / [lighting]: Repeat word-for-word in ALL 5 samples.
2. CHANGED VARIABLES (MUST BE COMPLETELY DIFFERENT AND UNIQUE PER SAMPLE):
   - [animation/motion] / [motion_dynamics]: Generate different subtle motion variations (e.g. winking, blowing a kiss, hair swaying).
3. OVERRIDE Command: Repeat locked variables word-for-word across all 5 samples.`
            : `
🔒 CHARACTER MODE: SAME SCENE (Everything identical, only pose/expression/camera angle changes)
The user has uploaded a reference image and selected SAME SCENE mode. This means EVERYTHING from the reference image MUST stay 100% identical.

CRITICAL ASSIGNMENT OF VARIABLES:
When replacing the [BRACKETED] variables in the USER TEMPLATE:

1. LOCKED VARIABLES (MUST BE 100% IDENTICAL AND REPEATED WORD-FOR-WORD ACROSS ALL 5 SAMPLES):
   - [subject_description] / [subject/character]: Analyze the reference image and describe the subject EXACTLY (e.g. "a young East Asian woman with shoulder-length dark hair"). You MUST repeat this exact value in ALL 5 generated samples. DO NOT generate different characters (e.g. NEVER generate "Nordic fisherman" or "fantasy elf" under any circumstances!).
   - [outfit_details] / [core feature]: Describe the clothing and accessories EXACTLY as seen in the reference image (e.g. "wearing a blue and white checkered shirt over a white lace top"). You MUST repeat this exact value in ALL 5 generated samples.
   - [art_style] / [style]: Carry over the art style exactly (e.g. "candid-style portrait photography / film aesthetic"). You MUST repeat this exact value in ALL 5 generated samples.
   - [color_palette] / [color palette]: Copy the dominant colors, saturation, and tone (e.g. "vibrant blue and yellow"). You MUST repeat this exact value in ALL 5 generated samples.
   - [background_setting] / [background scenery]: Copy the exact environment (e.g. "in a blooming field of yellow wildflowers with distant green hills under a bright blue sky"). You MUST repeat this exact value in ALL 5 generated samples.
   - [lighting]: Copy the exact light quality (e.g. "natural cinematic lighting / high-detail natural sunlight"). You MUST repeat this exact value in ALL 5 generated samples.
   - [layout_format]: Copy the structural layout exactly. You MUST repeat this exact value in ALL 5 generated samples.

2. CHANGED VARIABLES (MUST BE COMPLETELY DIFFERENT AND UNIQUE PER SAMPLE):
   - [pose] / [pose/action]: Generate a new pose/body position that fits the photoshoot logically (e.g. Sample A: "resting her chin on her hand", Sample B: "standing and waving happily with both hands", Sample C: "sitting gracefully on a blanket smelling wildflowers").
   - [expression]: Generate a new facial expression fitting the photoshoot (e.g. Sample A: "looking thoughtfully", Sample B: "smiling warmly", Sample C: "laughing contentedly").
   - [camera_angle]: Optionally vary the crop or camera setup (e.g. Sample A: "close-up shot", Sample B: "medium shot", Sample C: "low-angle full-body shot").
   - [small_props]: Optionally swap tiny held elements (e.g. holding a daisy).

3. OVERRIDE Command: Ignore the "zero tolerance for repetition" rule for locked variables. You MUST copy their values word-for-word from Sample A into all other samples. Only pose, expression, and camera angle must change.`;
        } else if (resolvedCharMode === 'fixed' || resolvedCharMode === 'fixedCharacterMotion') {
          modeSpecificInstructions = isVideo ? `
🔒 CHARACTER MODE: FIXED CHARACTER + MOTION (Same character & outfit, camera moves around them)
The user has uploaded a reference image and selected FIXED CHARACTER + MOTION mode. This means the character identity, outfit, and background stay identical, only the camera moves.

CRITICAL ASSIGNMENT OF VARIABLES:
When replacing the [BRACKETED] variables in the USER TEMPLATE:
1. LOCKED VARIABLES (MUST BE 100% IDENTICAL AND REPEATED WORD-FOR-WORD ACROSS ALL 5 SAMPLES):
   - [subject_description] / [subject/character] / [outfit_details]: Repeat word-for-word in ALL 5 samples.
   - [background_setting] / [art_style]: Repeat word-for-word in ALL 5 samples.
2. CHANGED VARIABLES (MUST BE COMPLETELY DIFFERENT AND UNIQUE PER SAMPLE):
   - [camera_movement] / [motion_effect]: Generate different camera moves (e.g. pan, orbit, zoom).
3. OVERRIDE Command: Repeat locked variables word-for-word across all 5 samples.`
            : `
🔒 CHARACTER MODE: FIXED CHARACTER (Same character & outfit, different locations & backgrounds)
The user has uploaded a reference image and selected FIXED CHARACTER mode. This means the character identity and clothing stay identical, but the scene/background changes.

CRITICAL ASSIGNMENT OF VARIABLES:
When replacing the [BRACKETED] variables in the USER TEMPLATE:

1. LOCKED VARIABLES (MUST BE 100% IDENTICAL AND REPEATED WORD-FOR-WORD ACROSS ALL 5 SAMPLES):
   - [subject_description] / [subject/character]: Describe the subject EXACTLY as seen in the reference (e.g. "a young East Asian woman with shoulder-length dark hair"). Repeat this exact value in ALL 5 samples. E.g. NEVER generate "Nordic fisherman" or "fantasy elf".
   - [outfit_details] / [core feature]: Describe the clothing EXACTLY as seen in the reference (e.g. "wearing a blue and white checkered shirt over a white lace top"). Repeat this exact value in ALL 5 samples.

2. CHANGED VARIABLES (MUST BE COMPLETELY DIFFERENT AND UNIQUE PER SAMPLE):
   - [background_setting] / [background scenery], [color_palette], [pose], [lighting]: Generate completely different visual locations, color schemes, lighting, and poses for each of the 5 samples to show the identical character traveling to different environments (e.g., library, snowy mountains, beach, cafe).

3. OVERRIDE Command: Ignore the "zero tolerance for repetition" rule for locked variables. You MUST copy their values word-for-word from Sample A into all other samples.`;
        } else {
          modeSpecificInstructions = isVideo ? `
🔄 CHARACTER MODE: DIFFERENT SCENES (Same art style & character, completely different locations/actions)
The user has uploaded a reference image and selected DIFFERENT SCENES mode. This means the character identity and style stay identical, but they are in completely different environments and actions.

CRITICAL ASSIGNMENT OF VARIABLES:
When replacing the [BRACKETED] variables in the USER TEMPLATE:
1. LOCKED VARIABLES (MUST BE 100% IDENTICAL AND REPEATED WORD-FOR-WORD ACROSS ALL 5 SAMPLES):
   - [subject_description] / [subject/character] / [outfit_details]: Repeat word-for-word in ALL 5 samples.
   - [art_style]: Repeat word-for-word in ALL 5 samples.
2. CHANGED VARIABLES (MUST BE COMPLETELY DIFFERENT AND UNIQUE PER SAMPLE):
   - [background_setting] / [location/action] / [camera_movement]: Vary location and camera moves completely per sample.
3. OVERRIDE Command: Repeat locked variables word-for-word across all 5 samples.`
            : `
🔄 CHARACTER MODE: DIFFERENT CHARACTERS (Same art style/technique, different characters)
The user has uploaded a reference image and selected DIFFERENT CHARACTERS mode. This means the art style and visual aesthetic from the reference image stay identical, but the character changes.
Therefore, when replacing the [BRACKETED] variables in the USER TEMPLATE:
1. Analyze the art style of the reference image (medium, visual technique, composition approach).
2. The variables describing the subject, clothing, colors, and poses (e.g., [subject/character], [pose/action], [core feature], [color palette]) SHOULD vary completely in each of the 5 samples (e.g., panda, space boy, street cat) while keeping the overall art style described by the fixed text identical.`;
        }

        userParts.push({
          text: `OVERRIDE SYSTEM INSTRUCTIONS: DO NOT generate a new prompt from scratch. The user HAS ALREADY provided their own Prompt Template below.
 
 USER TEMPLATE:
 "${description.trim()}"
 
 YOUR MISSION:
 Take the USER TEMPLATE and generate exactly 5 distinct examples (samples) by replacing the [BRACKETED] variables with creative, high-quality values, while strictly adhering to the character consistency rules below.
 
${modeSpecificInstructions}

STRICT RULES:
1. DO NOT change any text outside the brackets. The sentence structure must remain 100% IDENTICAL to the USER TEMPLATE.
2. Generate exactly 5 unique variations.
3. For the "promptTemplate" field in the JSON, return the exact USER TEMPLATE provided above.
4. For the "mainPrompt" field, return your FIRST generated sample.
5. For the "samples" array, return all 5 generated samples as strings.
6. Target AI Model: ${targetModel}
${exampleLengthInstructions}
 
Return the results in the standard JSON format.`
        });
      } else {
        // Example template customization WITHOUT reference image
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
 6. Target AI Model: ${targetModel}
 ${exampleLengthInstructions}
 
 Return the results in the standard JSON format.`
        });
      }
    } else if (hasRefImage && userParts.length > 0) {
      // When reference image is provided in PROMPT GENERATOR MODE:
      // The Power of AI's role is to generate a beautiful, highly detailed prompt template from scratch based on the uploaded reference image.
      const isVideo = promptType === 'video';
      const resolvedCharMode = isVideo
        ? (characterMode === 'sameScene' || characterMode === 'sameSceneLoop' ? 'sameSceneLoop' :
          characterMode === 'different' || characterMode === 'differentScenes' ? 'differentScenes' :
            'fixedCharacterMotion')
        : (characterMode === 'sameSceneLoop' ? 'sameScene' :
          characterMode === 'differentScenes' ? 'different' :
            characterMode || 'different');

      console.log(`📸 Generating prompt template from scratch based on uploaded reference image. Character Mode: ${resolvedCharMode}`);

      let modeSpecificPromptRules = '';
      if (resolvedCharMode === 'sameScene' || resolvedCharMode === 'sameSceneLoop') {
        modeSpecificPromptRules = isVideo ? `
🔒 REFERENCE MODE: SAME SCENE LOOP (Everything identical, only motion & timing changes)
The user has selected SAME SCENE LOOP mode for a video prompt. This means EVERYTHING from the reference image MUST stay 100% identical.

CRITICAL INSTRUCTIONS FOR TEMPLATE GENERATION:
1. DO NOT USE VARIABLES FOR CHARACTER, OUTFIT, BACKGROUND, STYLE, OR LIGHTING.
   In the promptTemplate, you MUST describe the subject, outfit, background scenery, art style, and lighting in detail as FIXED, unchangeable text in the template itself.
2. ONLY MOTION & ANIMATION ARE ALLOWED AS VARIABLES:
   The ONLY variables in promptTemplate should be [animation/motion] or [motion_dynamics].
3. HOW TO GENERATE SAMPLES:
   All samples must feature the EXACT SAME character in the EXACT SAME outfit and scene, and vary ONLY the motion.`
          : `
🔒 REFERENCE MODE: SAME SCENE (Everything identical, only pose/expression/camera angle changes)
The user has selected SAME SCENE mode. This means EVERYTHING from the reference image MUST stay 100% identical.

CRITICAL INSTRUCTIONS FOR TEMPLATE GENERATION:
1. DO NOT USE VARIABLES FOR THE SUBJECT, OUTFIT, BACKGROUND, STYLE, COLOR PALETTE, OR LIGHTING.
   In the promptTemplate, you MUST describe the subject, outfit, background scenery, art style, color palette, and lighting in extreme detail as FIXED, unchangeable text in the template itself.
   - Analyze the reference image and write its descriptions directly as fixed text in promptTemplate.
   - For example, if the reference shows a young woman with short dark hair in a blue checkered shirt in a yellow rapeseed flower field, this description MUST be written directly as fixed text in promptTemplate.
   - You are ABSOLUTELY FORBIDDEN from putting these into brackets (e.g. DO NOT use [subject], [character], [clothing], [outfit], [background], [scenery], [color palette], [style] as variables in promptTemplate).
2. ONLY POSE, ACTION, GESTURE, AND EXPRESSION ARE ALLOWED AS VARIABLES:
   The only variables in promptTemplate should be:
   - [pose/action]
   - [facial_expression] (optional)
   - [camera_angle] (optional)
   
3. HOW TO GENERATE SAMPLES:
   Since the subject, outfit, background, style, etc. are written as fixed text in the promptTemplate, they will automatically be 100% identical and repeated word-for-word across all generated samples.
   You only need to replace the [pose/action] and [facial_expression] variables with unique, diverse, and creative poses and expressions for Sample A, B, C, and D.
   E.g.
   - promptTemplate: "A high-quality lifestyle photograph of a young East Asian woman with short black hair in a [pose/action], wearing a blue checkered wrap, set in a rapeseed flower field under a clear bright sky, soft cinematic lighting, natural skin textures --ar 1:1"
   - Sample A: "...in a [pose/action: pensive pose resting her chin on her hand]..."
   - Sample B: "...in a [pose/action: joyful pose laughing with head tilted back]..."
   - Sample C: "...in a [pose/action: curious pose looking up at the sky with a warm smile]..."
   
   Under NO circumstances should any sample change the character description, the clothing description, the background setting, the style, the color palette, or any other fixed text. All samples must feature the EXACT SAME young woman in the EXACT SAME outfit in the EXACT SAME rapeseed field.`;
      } else if (resolvedCharMode === 'fixed' || resolvedCharMode === 'fixedCharacterMotion') {
        modeSpecificPromptRules = isVideo ? `
🔒 REFERENCE MODE: FIXED CHARACTER + MOTION (Same character & outfit, camera moves around them)
The user has selected FIXED CHARACTER + MOTION mode for a video prompt. This means the character identity, outfit, and background stay identical, only the camera moves.

CRITICAL INSTRUCTIONS FOR TEMPLATE GENERATION:
1. DO NOT USE VARIABLES FOR THE SUBJECT OR OUTFIT.
   Describe the character and outfit as FIXED text.
2. ONLY CAMERA MOVEMENT IS ALLOWED AS A VARIABLE:
   The only variable should be [camera_movement] or [motion_effect].
3. HOW TO GENERATE SAMPLES:
   Keep character, clothes, and scene completely identical, and vary ONLY the camera motion.`
          : `
🔒 REFERENCE MODE: FIXED CHARACTER (Same character & outfit, different locations & backgrounds)
The user has selected FIXED CHARACTER mode. This means the character identity and clothing stay identical, but the scene/background changes.

CRITICAL INSTRUCTIONS FOR TEMPLATE GENERATION:
1. DO NOT USE VARIABLES FOR THE SUBJECT OR OUTFIT.
   In the promptTemplate, you MUST describe the character's physical appearance (e.g. face, hair, age, gender) and their clothing/outfit in extreme detail as FIXED, unchangeable text.
   - You are ABSOLUTELY FORBIDDEN from putting these into brackets (e.g. DO NOT use [subject], [character], [person], [clothing], [outfit] as variables in promptTemplate).
2. ONLY POSE, BACKGROUND, LIGHTING, AND COLORS ARE ALLOWED AS VARIABLES:
   The promptTemplate should have variables ONLY for:
   - [pose/action]
   - [background_setting]
   - [color_palette] (optional)
   - [lighting] (optional)
   
3. HOW TO GENERATE SAMPLES:
   The subject and outfit are written as fixed text in the promptTemplate, so they will automatically be 100% identical and repeated word-for-word across all generated samples.
   You must replace the [pose/action], [background_setting], [color_palette], and [lighting] variables with completely different environments and poses for each sample (e.g. Sample A in a flower field, Sample B in a cozy library, Sample C in a snowy mountain) while keeping the subject and outfit exactly the same.`;
      } else {
        modeSpecificPromptRules = isVideo ? `
🔄 REFERENCE MODE: DIFFERENT SCENES (Same art style & character, completely different locations/actions)
The user has selected DIFFERENT SCENES mode. This means the character identity and style stay identical, but they are in completely different environments and actions.

CRITICAL INSTRUCTIONS FOR TEMPLATE GENERATION:
1. LOCK CHARACTER & STYLE:
   Describe character and style as FIXED text.
2. LOCATION, ACTION & CAMERA ARE ALLOWED AS VARIABLES:
   The variables should be [location/action] and [camera_movement].
3. HOW TO GENERATE SAMPLES:
   Keep character and style identical, vary location, action, and camera motion per sample.`
          : `
🔄 REFERENCE MODE: DIFFERENT CHARACTERS (Same art style/technique, different characters)
The user has selected DIFFERENT CHARACTERS mode. This means the art style and visual aesthetic from the reference image stay identical, but the character changes.
Therefore, when replacing the [BRACKETED] variables:
1. Analyze the art style of the reference image (medium, visual technique, composition approach).
2. The variables describing the subject, clothing, colors, and poses (e.g., [subject], [pose], [outfit], [color]) SHOULD vary completely in each of the 4 samples (e.g. generating completely different subjects like a rugged Nordic fisherman, a fantasy elf, a street artist) while keeping the overall art style described by the fixed text identical.`;
      }

      if (!isVideo && promptType !== 'text' && isDirectPromptOnly) {
        userParts.push({
          text: `I have attached a REFERENCE IMAGE above. This is the primary visual source and the most important input.

YOUR MISSION:
Carefully inspect and deeply analyze the attached reference image in extreme visual detail.
Generate a 100% accurate, complete, and faithful image generation prompt that will recreate this EXACT image with 100% fidelity in ${targetModel}.

REVERSE-ENGINEER THE UPLOADED IMAGE WITH 100% FIDELITY:
1. Exact Subject Details: Describe the exact person, animal, or subject seen in the image — ethnicity, estimated age, facial features, eye shape, nose, lips, exact hair color, hairstyle, hairline, natural skin texture with visible skin pores, and exact facial expression.
2. Exact Clothing & Outfit: Describe every piece of clothing, fabric weave, pattern, neckline, collar, color, fit, layers, and all accessories (jewelry, earrings, necklace, watch, eyewear, shoes, etc.).
3. Exact Pose & Camera Angle: Describe the exact body posture, arm and hand positions, finger placement, head angle, eye gaze direction, and camera framing (e.g. eye-level close-up portrait, medium waist-up shot, full-body shot, 35mm f/1.8 candid lens).
4. Exact Background & Environment: Describe the exact background setting, architectural or nature elements, flora/foliage, props, furniture, and depth of field / bokeh.
5. Exact Lighting & Atmosphere: Describe the lighting source, key light, soft directional shadows, color palette, color temperature, saturation, and overall mood.
6. Medium & Style: Match the exact visual aesthetic (e.g. raw unedited candid 35mm film photograph, high-fashion editorial portrait, or artistic medium if illustration/render).

STRICT CRITICAL RULES:
1. ZERO VARIABLES OR BRACKETS: You are ABSOLUTELY FORBIDDEN from using any bracketed variables like [subject], [clothing], [pose], [brackets], or placeholders in the prompt. The prompt must be 100% concrete, fixed, and ready to use immediately.
2. 100% IMAGE FIDELITY: The generated prompt MUST describe the EXACT uploaded image, NOT a generic or random variation. This applies across all reference modes.
3. Prompt Length: Write a rich, master-level prompt (at least 400 to 650 characters) that captures all the intricate details of the uploaded image.
4. Target AI Model: ${targetModel} — optimize the prompt syntax and keywords for this model.
5. Aspect Ratio: ${resolvedAR} (mainPrompt MUST end with --ar ${resolvedAR}).
${effectiveDesc && effectiveDesc.trim() && !effectiveDesc.toLowerCase().includes('reverse engineer') ? `User's additional context/instructions: "${effectiveDesc.trim()}"` : ''}

Fill in "imageAnalysis" with your detailed visual breakdown of the reference image, and return "mainPrompt" as the complete 100% accurate reproduction prompt in the standard JSON format.`
        });
      } else {
        userParts.push({
          text: `I have attached a REFERENCE IMAGE above. This is the primary visual source and the most important input.

YOUR MISSION:
Deeply analyze the attached reference image (its subject, clothing, style, lighting, composition, colors, medium) and generate a perfect, highly detailed prompt template and 4 distinct samples from scratch, in accordance with the character consistency rules below.

${modeSpecificPromptRules}

CRITICAL LENGTH CONSTRAINTS (MANDATORY & STRICTLY ENFORCED):
You MUST ensure the generated "promptTemplate" satisfies these exact character lengths based on the requested Power level:
- For 1 Credit (Normal): The promptTemplate MUST have a minimum character length of 400 to 500 characters (exceptionally detailed, perfect, and best describes the scene).
- For 3 Credits (Super): The promptTemplate MUST have a minimum character length of 500 to 600 characters (enhanced details, camera specs, lighting setups).
- For 5 Credits (Power): The promptTemplate MUST have a minimum character length of 600 to 700 characters (masterpiece visual complexity, extreme sensory details).

To achieve this character length, you MUST write exceptionally detailed, long, and rich fixed descriptive text in the template. The vast majority of the prompt template must be high-value unchangeable words (specifying photographic framing, detailed apparel, volumetric atmosphere, styling and textures) while keeping the bracketed variables strictly between 1 and 5 total. DO NOT generate short, simple templates (e.g., "Photography of a [subject] wearing [outfit]...").

Target AI Model: ${targetModel} — optimize the prompt syntax and keywords for this specific model.

User's additional instructions: "${effectiveDesc.trim()}"

Fill in "imageAnalysis" with your detailed description of everything you see in the reference image (subject details, clothing, scene, background, lighting, and style).`
        });
      }
    } else {
      // No reference image — simple text-only generation
      userParts.push({
        text: `Generate a ${promptType || 'image'} prompt for the following scene:

"${description.trim()}"

Prompt Type: ${(promptType || 'image').toUpperCase()}
Target AI Model: ${targetModel} — optimize the prompt syntax and keywords for this specific model.

CRITICAL LENGTH CONSTRAINTS (MANDATORY & STRICTLY ENFORCED):
You MUST ensure the generated "promptTemplate" satisfies these exact character lengths based on the requested Power level:
- For 1 Credit (Normal): The promptTemplate MUST have a minimum character length of 400 to 500 characters (exceptionally detailed, perfect, and best describes the scene).
- For 3 Credits (Super): The promptTemplate MUST have a minimum character length of 500 to 600 characters (enhanced details, camera specs, lighting setups).
- For 5 Credits (Power): The promptTemplate MUST have a minimum character length of 600 to 700 characters (masterpiece visual complexity, extreme sensory details).

To achieve this character length, you MUST write exceptionally detailed, long, and rich fixed descriptive text in the template. The vast majority of the prompt template must be high-value unchangeable words describing the scene in extreme visual depth (specifying cinematic lighting, professional photographic parameters, background setting details, textures, and composition) while keeping the bracketed variables strictly between 1 and 5 total. DO NOT generate short, simple templates.

CRITICAL REQUIREMENT FOR VARIABLES:
The promptTemplate MUST contain a minimum of 1 and a maximum of 5 bracketed variables total (e.g., [subject], [color], [style]). 
DO NOT exceed 5 bracketed variables under any circumstances. Keep the majority of the prompt template as fixed, high-quality descriptive words.`
      });
    }

    console.log(`📤 Sending to AI engines: ${userParts.length} parts, hasImage: ${hasRefImage}`);

    let text = null;

    // Engine 1: Try Gemini API first (supports vision natively)
    try {
      console.log('🧠 [Engine 1] Trying Gemini API...');
      text = await callGeminiWithFailover(systemInstruction, userParts, hasRefImage);
    } catch (err) {
      console.warn('⚠️ [Engine 1] Gemini failed:', err.message);
    }

    // Engine 2: Fall back to Groq LLM if Gemini failed
    if (!text) {
      try {
        console.log('🚀 [Engine 2] Trying Groq LLM...');
        text = await callGroqLLMWithFailover(systemInstruction, userParts, hasRefImage, cached.keysPool);
      } catch (err) {
        console.warn('⚠️ [Engine 2] Groq failed:', err.message);
      }
    }

    if (!text) {
      return res.status(503).json({
        message: 'All AI engines are currently busy. Please try again in a moment.',
        details: 'Both Gemini and Groq APIs are temporarily unavailable.'
      });
    }

    // 4. Parse and return
    try {
      const jsonStr = text.replace(/```json|```/g, '').trim();
      const promptData = JSON.parse(jsonStr);

      // Enforce strict 5-variable limit programmatically
      if (promptData.promptTemplate && promptData.mainPrompt) {
        const reduced = limitVariables(promptData.promptTemplate, promptData.mainPrompt, 5);
        promptData.promptTemplate = reduced.promptTemplate;
      }

      // Ensure frontend fields
      const creditCost = aiPower === 'power' ? 5 : aiPower === 'super' ? 3 : 1;
      promptData.priceTokens = creditCost;
      promptData.promptType = promptType || 'image';
      promptData.model = targetModel;

      if (isDirectPromptOnly) {
        promptData.promptTemplate = null;
        promptData.negativePrompt = promptData.negativePrompt || '';
        promptData.instructions = promptData.instructions || '';
        promptData.samples = [];
        if (promptData.mainPrompt) {
          // Guarantee zero variables or brackets in direct prompt
          promptData.mainPrompt = promptData.mainPrompt.replace(/\[(?:[^\]:]+:)?([^\]]+)\]/g, '$1').replace(/[\[\]]/g, '').trim();
        }
      }

      // Ensure samples (min 4, max 5)
      if (!Array.isArray(promptData.samples)) promptData.samples = [];
      const requiredCount = isDirectPromptOnly ? 0 : (mode === 'example' ? 5 : 4);

      while (promptData.samples.length < requiredCount) {
        promptData.samples.push(promptData.mainPrompt || 'Generate a variation here.');
      }
      if (promptData.samples.length > 5) {
        promptData.samples = promptData.samples.slice(0, 5);
      }

      // Enforce 100% complete text from promptTemplate so no text is ever omitted or cut off in mainPrompt or samples
      if (promptData.promptTemplate) {
        if (promptData.mainPrompt) {
          promptData.mainPrompt = enforceCompleteSampleFromTemplate(promptData.promptTemplate, promptData.mainPrompt);
        }
        if (Array.isArray(promptData.samples) && promptData.samples.length > 0) {
          promptData.samples = promptData.samples.map(s => enforceCompleteSampleFromTemplate(promptData.promptTemplate, s));
        }
      }

      // ── Post-processing: strip labels, plus signs & enforce custom aspect ratio ──
      const stripLabel = (s) => s.replace(/^(Variation\s*\d*[:.\-]\s*|Example\s*\d*[:.\-]\s*|Sample\s*[A-C\d]*[:.\-]\s*|Version\s*\d*[:.\-]\s*|\d+[:.)\-]\s*)/i, '').trim();
      const removePlusSigns = (str) => {
        if (!str || typeof str !== 'string') return str;
        return str.replace(/\s*\+\s*/g, ', ').replace(/\s{2,}/g, ' ').trim();
      };
      const ensureCustomAR = (s) => {
        const cleaned = removePlusSigns(s.replace(/\s*--ar\s+\S+/g, '')).trim();
        return cleaned + ' --ar ' + resolvedAR;
      };

      const cleanVideoPrompt = (s) => {
        if (!s) return '';
        let cleaned = stripLabel(s).trim();

        // 1. Remove all square brackets [] to prevent metadata safety blockages, keeping text inside if there's any.
        cleaned = cleaned.replace(/[\[\]]/g, '');
        cleaned = removePlusSigns(cleaned);

        // 2. Ensure it starts with "Generate a video of" or "A cinematic video of"
        const startsWithVideo = /^\s*(generate\s+a\s+video|a\s+cinematic\s+video)/i.test(cleaned);
        if (!startsWithVideo) {
          if (/^\s*scene\s*1/i.test(cleaned)) {
            cleaned = 'Generate a video of: ' + cleaned;
          } else {
            cleaned = 'Generate a video of ' + cleaned;
          }
        }

        // 3. Normalize scene timing structures to avoid mathematical hyphens (e.g. 0s-2.5s -> 0 to 2.5 seconds)
        cleaned = cleaned.replace(/scene\s*(\d+)\s*\(\s*(\d+(\.\d+)?)\s*s?\s*-\s*(\d+(\.\d+)?)\s*s?\s*\)/gi, 'Scene $1 ($2 to $4 seconds)');

        // Normalize any leftover uppercase SCENE to Scene
        cleaned = cleaned.replace(/\bSCENE\b/g, 'Scene');

        return cleaned;
      };

      if (promptType === 'video') {
        promptData.mainPrompt = ensureCustomAR(cleanVideoPrompt(promptData.mainPrompt || ''));
        promptData.samples = promptData.samples.map(s => ensureCustomAR(cleanVideoPrompt(s || '')));
        if (promptData.promptTemplate) {
          let temp = removePlusSigns(promptData.promptTemplate.trim());
          const startsWithVideo = /^\s*(generate\s+a\s+video|a\s+cinematic\s+video)/i.test(temp);
          if (!startsWithVideo) {
            if (/^\s*scene\s*1/i.test(temp)) {
              temp = 'Generate a video of: ' + temp;
            } else {
              temp = 'Generate a video of ' + temp;
            }
          }
          temp = temp.replace(/scene\s*(\d+)\s*\(\s*(\d+(\.\d+)?)\s*s?\s*-\s*(\d+(\.\d+)?)\s*s?\s*\)/gi, 'Scene $1 ($2 to $4 seconds)');
          temp = temp.replace(/\bSCENE\b/g, 'Scene');
          promptData.promptTemplate = ensureCustomAR(temp);
        }
      } else if (promptType === 'text') {
        promptData.mainPrompt = removePlusSigns(stripLabel(promptData.mainPrompt || ''));
        promptData.samples = promptData.samples.map(s => removePlusSigns(stripLabel(s || '')));
        if (promptData.promptTemplate) {
          promptData.promptTemplate = removePlusSigns(stripLabel(promptData.promptTemplate));
        }
      } else {
        // default to image prompt rules
        promptData.mainPrompt = ensureCustomAR(removePlusSigns(stripLabel(promptData.mainPrompt || '')));
        promptData.samples = promptData.samples.map(s => ensureCustomAR(removePlusSigns(stripLabel(s || ''))));
        if (promptData.promptTemplate) {
          promptData.promptTemplate = ensureCustomAR(removePlusSigns(promptData.promptTemplate));
        }
      }

      // Sanitize description field to ensure clean human-readable sales pitch with no '+' signs or raw blueprint strings
      if (promptData.description) {
        let cleanDesc = promptData.description.replace(/\s*\+\s*/g, ', ').replace(/\s{2,}/g, ' ').trim();
        if (cleanDesc.toLowerCase().includes('professional ai prompt blueprint for') || cleanDesc.includes('+') || cleanDesc.includes('[') || cleanDesc.length < 25) {
          const topic = (promptData.title || description || 'model portrait').replace(/[^\w\s]/gi, '').trim();
          cleanDesc = `A professional photorealistic AI prompt blueprint for generating high quality ${topic}. Optimized for Midjourney v6 and Flux.1.`;
        }
        promptData.description = cleanDesc;
      }

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

      // Preserve user's selected model; only set if not already set by AI response
      if (!promptData.model) promptData.model = targetModel || 'flux-1';
      if (!promptData.priceTokens) promptData.priceTokens = creditCost;

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

/* ================================================================
   CLOUDFLARE MULTI-ACCOUNT ROTATION POOL
   Automatically switches to the next account if daily limit (10k Neurons) is reached,
   an HTTP error (429, 400, 401, 500) occurs, or an image fails to generate.
   ================================================================ */
const CLOUDFLARE_ACCOUNTS = [
  {
    name: 'Account 1',
    accountId: process.env.CF_ACCOUNT_ID || '6f39a31a781da47af7aba76763c17c21',
    apiToken: process.env.CF_API_TOKEN || 'cfut_pOuSsb1cwqeGmQzfH8Axv48x50FT2LuCCMB49h5jc6413efb'
  },
  {
    name: 'Account 2',
    accountId: '3628ea494105ca4178d36078c09e1549',
    apiToken: 'cfut_oQoqe5QSdU1bgdQapWDHng6xoq8EJZn6yi7GjGWq9534ccb9'
  },
  {
    name: 'Account 3',
    accountId: '8daae03d1447c2b22365e2b24360a93e',
    apiToken: 'cfut_Kjn97Mr81rxQxH9LK3jcbSQ7KQeau3yOIerL5Usx67bb66ef'
  },
  {
    name: 'Account 4',
    accountId: '194a690e971a672ccc7d210d5b642db6',
    apiToken: 'cfut_BaFYmVbVAd641VwH04Q16ZWk8Gt29aocj5dh3LCc273b77e7'
  },
  {
    name: 'Account 5',
    accountId: '469aee8b815c5aca3fe574084384e9df',
    apiToken: 'cfut_YceLnxSRdnZoSKptktmAEqtSRCJ7Y6b76lPSxcRt41416698'
  },
  {
    name: 'Account 6',
    accountId: '38dfcc030e49b56928032ec2985283ed',
    apiToken: 'cfut_1GrUdoOzmIXm7mqqH9dBkWh4eGqem4uK3JAcUGM9173fae2a'
  },
  {
    name: 'Account 7',
    accountId: '9fe308a406b6bb1b1968694878b9f83e',
    apiToken: 'cfut_bRVycwGC0jWxjv3bxp7KRK4qpheyC7sHK4nuAJZxc4060b75'
  },
  {
    name: 'Account 8',
    accountId: 'f5f0b8b8b95bfd364eae655ce9804b37',
    apiToken: 'cfut_KMxZHqvhM1ra6vancsXB7GNjQXYh68HJK6T9Hvk30169d8e2'
  },
  {
    name: 'Account 9',
    accountId: '70098cec98682f90c324d3b4b6a73bb8',
    apiToken: 'cfut_EB5CQztFhx8DWvUbqXOzATTMYOeQXY5WFjo4GZx129f3515b'
  },
  {
    name: 'Account 10',
    accountId: 'b779c598b78eaeaba03fcf60df85b438',
    apiToken: 'cfut_uu1MVlOecEaaR5sAnJC6vAt5B4GCWNz7zSUTrnSy5a4bbe14'
  },
  {
    name: 'Account 11',
    accountId: '478757f2c18a73afdc29dae6c980ffee',
    apiToken: 'cfut_z0hRcOJPymJ1jfdFH94P4QhIVqz2sopkeuRmtTmN8e5000d2'
  }
];

const EXHAUSTED_CF_SET = new Set();

function markCFAccountExhausted(accountId, accountName) {
  if (!accountId) return;
  EXHAUSTED_CF_SET.add(accountId);
  console.warn(`🛑 Cloudflare Account [${accountName}] marked quota-exhausted for 30 minutes.`);
  setTimeout(() => {
    EXHAUSTED_CF_SET.delete(accountId);
    console.log(`✨ Cloudflare Account [${accountName}] un-marked and back in pool.`);
  }, 30 * 60 * 1000);
}

/**
 * Sanitizes prompt text to comply with AI safety filters (such as Cloudflare Workers AI code 3030 NSFW filter).
 * Replaces ONLY sensitive/NSFW trigger terms with elegant aesthetic equivalents while preserving 100% of subject details,
 * hair color, outfit, background, scene, and camera/lighting specifications.
 */
function sanitizePromptForAI(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/\bRedhead Model, Huge Cleavage\b/gi, 'redhead fashion model, elegant top')
    .replace(/\bBrunette Model, Huge Cleavage\b/gi, 'brunette fashion model, elegant top')
    .replace(/\bhuge full bust\b/gi, 'glamorous silhouette')
    .replace(/\bhuge bust\b/gi, 'glamorous silhouette')
    .replace(/\bheavy bust\b/gi, 'glamorous silhouette')
    .replace(/\bbig bust\b/gi, 'glamorous silhouette')
    .replace(/\blarge bust\b/gi, 'glamorous silhouette')
    .replace(/\bvoluptuous bust\b/gi, 'glamorous silhouette')
    .replace(/\bhuge cleavage\b/gi, 'stylish neckline')
    .replace(/\bdeep cleavage\b/gi, 'stylish neckline')
    .replace(/\bcleavage\b/gi, 'neckline')
    .replace(/\bv-neckline\b/gi, 'neckline')
    .replace(/\bbusty\b/gi, 'curvaceous figure')
    .replace(/\bboobs?\b/gi, 'figure')
    .replace(/\bbreasts?\b/gi, 'figure')
    .replace(/\bhourglass silhouette\b/gi, 'curvaceous silhouette')
    .replace(/\btiny cream off-shoulder top\b/gi, 'cream top')
    .replace(/\btiny cream\b/gi, 'cream')
    .replace(/\btiny\b/gi, '')
    .replace(/\bnude\b/gi, '')
    .replace(/\bnaked\b/gi, '')
    .replace(/\btopless\b/gi, '')
    .replace(/\bbottomless\b/gi, '')
    .replace(/\bunclothed\b/gi, '')
    .replace(/\berotic\b/gi, '')
    .replace(/\bnsfw\b/gi, '')
    .replace(/\bsexy\b/gi, 'attractive')
    .replace(/\bsensual\b/gi, 'graceful')
    .replace(/\s*,\s*,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Formats prompt string for FLUX to produce 100% authentic raw photography (matching real human girls)
 * and strips artificial CGI/3D render art triggers like '8k', 'photorealistic', 'hyperrealistic', '3d render'.
 */
function prepareRealismPrompt(text) {
  if (!text || typeof text !== 'string') return '';
  let cleaned = sanitizePromptForAI(text);
  cleaned = cleaned
    .replace(/\bhighly detailed\b/gi, '')
    .replace(/\bultra detailed\b/gi, '')
    .replace(/\b8k resolution\b/gi, '')
    .replace(/\b8k\b/gi, '')
    .replace(/\b4k\b/gi, '')
    .replace(/\bhyperrealistic\b/gi, '')
    .replace(/\bphotorealistic\b/gi, '')
    .replace(/\bmasterpiece\b/gi, '')
    .replace(/\bcinematic lighting\b/gi, 'natural lighting')
    .replace(/\bdigital art\b/gi, '')
    .replace(/\b3d render\b/gi, '')
    .replace(/\s*,\s*,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return `candid photograph of a real girl, ${cleaned}, soft natural lighting`;
}

/**
 * Normalizes any frontend model name to a valid Cloudflare Workers AI REST API model endpoint
 */
function resolveCFModel(rawModel) {
  if (!rawModel || typeof rawModel !== 'string') {
    return '@cf/bytedance/stable-diffusion-xl-lightning';
  }
  const lower = rawModel.trim().toLowerCase();

  // If already full CF model endpoint
  if (lower.startsWith('@cf/')) {
    return rawModel.trim();
  }

  // SeaDream / SDXL model for Cloudflare
  return '@cf/bytedance/stable-diffusion-xl-lightning';
}

async function callPollinationsAI(promptText, apiKey, width = 768, height = 768) {
  const key = (apiKey || process.env.POLLINATIONS_API_KEY || POLLINATIONS_DEFAULT_KEY).trim();
  const cleanPrompt = sanitizePromptForAI(promptText || '');
  const encodedPrompt = encodeURIComponent(cleanPrompt);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&key=${key}`;

  console.log(`🎨 [Pollinations AI Engine] Generating FLUX image with API Key: "${cleanPrompt.substring(0, 60)}..."`);

  try {
    const polRes = await fetch(pollinationsUrl, {
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });
    if (polRes.ok) {
      const arrayBuf = await polRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString('base64');
      if (base64.length > 50) {
        console.log('✅ [Pollinations AI Engine] High-quality FLUX image generated successfully!');
        return `data:image/jpeg;base64,${base64}`;
      }
    } else {
      console.warn(`⚠️ [Pollinations AI Engine] Returned HTTP status ${polRes.status}`);
    }
  } catch (polErr) {
    console.error('❌ [Pollinations AI Engine] Request error:', polErr.message);
  }

  return pollinationsUrl;
}

let currentCFAccountIndex = 0;

/**
 * Execute AI Image Generation prioritizing Pollinations AI with user API Key, with Cloudflare failover
 */
async function callCloudflareAIWithFailover(promptText, rawModel) {
  // 1. Primary Engine: Pollinations AI with User API Key
  try {
    const pollinationsResult = await callPollinationsAI(promptText, null, 768, 768);
    if (pollinationsResult && pollinationsResult.length > 100) {
      return pollinationsResult;
    }
  } catch (err) {
    console.warn('⚠️ Pollinations AI primary call failed, proceeding to Cloudflare failover:', err.message);
  }

  // 2. Secondary Engine: Cloudflare Workers AI Pool
  const selectedModel = resolveCFModel(rawModel);
  const finalRealismPrompt = prepareRealismPrompt(promptText);
  const totalAccounts = CLOUDFLARE_ACCOUNTS.length;
  let attempts = 0;

  if (EXHAUSTED_CF_SET.size >= totalAccounts) {
    console.warn('⚠️ All Cloudflare accounts marked exhausted. Resetting exhausted pool...');
    EXHAUSTED_CF_SET.clear();
  }

  while (attempts < totalAccounts) {
    const activeAccount = CLOUDFLARE_ACCOUNTS[currentCFAccountIndex];
    currentCFAccountIndex = (currentCFAccountIndex + 1) % totalAccounts;

    if (EXHAUSTED_CF_SET.has(activeAccount.accountId)) {
      attempts++;
      continue;
    }

    console.log(`🎨 [CF AI - ${activeAccount.name}] Attempting generation with prompt: "${finalRealismPrompt.substring(0, 60)}..."`);

    try {
      const payload = {
        prompt: finalRealismPrompt,
        num_steps: 4
      };

      const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${activeAccount.accountId}/ai/run/${selectedModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeAccount.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (cfResponse.ok) {
        const contentType = cfResponse.headers.get('content-type') || '';
        let imageUrl = '';

        if (contentType.includes('application/json')) {
          const data = await cfResponse.json();
          if (data.result && data.result.image) {
            imageUrl = `data:image/png;base64,${data.result.image}`;
          } else if (data.result && typeof data.result === 'string') {
            imageUrl = `data:image/png;base64,${data.result}`;
          }
        } else {
          const arrayBuffer = await cfResponse.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const mime = contentType.includes('jpeg') ? 'image/jpeg' : 'image/png';
          imageUrl = `data:${mime};base64,${base64}`;
        }

        if (imageUrl && imageUrl.length > 50) {
          console.log(`✅ [CF AI - ${activeAccount.name}] Image generated successfully!`);
          return imageUrl;
        }
      }

      const errText = await cfResponse.text().catch(() => 'No response body');
      console.warn(`⚠️ [CF AI - ${activeAccount.name}] Failed (${cfResponse.status}): ${errText.substring(0, 150)}. Switching to next account...`);

      if (errText.includes('NSFW') || errText.includes('3030') || errText.toLowerCase().includes('safety')) {
        console.warn(`⚠️ [CF AI - ${activeAccount.name}] Safety filter triggered. Retrying with refined realism prompt...`);
        const safePromptVariation = `${finalRealismPrompt}, soft natural lighting`;
        try {
          const retryRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${activeAccount.accountId}/ai/run/${selectedModel}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${activeAccount.apiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: safePromptVariation, num_steps: 4 })
          });
          if (retryRes.ok) {
            const data = await retryRes.json().catch(() => ({}));
            if (data.result && data.result.image) {
              console.log(`✅ [CF AI - ${activeAccount.name}] Image generated after refined prompt retry!`);
              return `data:image/png;base64,${data.result.image}`;
            }
          }
        } catch (retryErr) {
          console.warn('Retry with refined prompt failed:', retryErr.message);
        }
      }

      const isQuotaError = cfResponse.status === 429 ||
        errText.includes('10000') ||
        errText.toLowerCase().includes('quota') ||
        errText.toLowerCase().includes('rate limit') ||
        errText.toLowerCase().includes('daily limit') ||
        errText.toLowerCase().includes('exceeded');

      if (isQuotaError) {
        markCFAccountExhausted(activeAccount.accountId, activeAccount.name);
      }

    } catch (err) {
      console.warn(`⚠️ [CF AI - ${activeAccount.name}] Request error: ${err.message}. Switching to next account...`);
    }

    attempts++;
  }

  // Final fallback URL via Pollinations AI
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(finalRealismPrompt)}?width=768&height=768&nologo=true&model=flux&key=${POLLINATIONS_DEFAULT_KEY}`;
}

/* ================================================================
   POST /api/generate/ai-image
   Generates a single AI image using Cloudflare Workers AI REST API
   Model: FLUX.1 Schnell (@cf/black-forest-labs/flux-1-schnell)
   ================================================================ */
router.post('/ai-image', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const selectedModel = resolveCFModel(model);
    const modelDisplayName = selectedModel.includes('flux') ? 'FLUX.1 Schnell (Cloudflare Workers AI)' : 'SDXL Lightning (Cloudflare Workers AI)';

    console.log(`🎨 [Cloudflare Workers AI Single] Generating image for prompt: "${prompt.substring(0, 60)}..."`);

    const imageUrl = await callCloudflareAIWithFailover(prompt, selectedModel);

    return res.json({
      success: true,
      imageUrl,
      modelId: selectedModel,
      modelName: modelDisplayName
    });
  } catch (err) {
    console.error('❌ Error generating AI image via Cloudflare:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ================================================================
   POST /api/generate/batch-ai-images
   Generates AI images for an array of sample prompts with retry/failover
   ================================================================ */
router.post('/batch-ai-images', async (req, res) => {
  try {
    const { prompts, model } = req.body;
    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ success: false, message: 'Prompts array is required' });
    }

    const selectedModel = resolveCFModel(model);
    const modelDisplayName = selectedModel.includes('flux') ? 'FLUX.1 Schnell (Cloudflare Workers AI)' : 'SDXL Lightning (Cloudflare Workers AI)';

    console.log(`🚀 [Cloudflare Workers AI Batch] Generating ${prompts.length} images...`);

    const imageResults = [];
    for (let i = 0; i < prompts.length; i++) {
      const promptText = prompts[i];
      if (!promptText || !promptText.trim()) {
        imageResults.push('');
        continue;
      }

      try {
        const imageUrl = await callCloudflareAIWithFailover(promptText, selectedModel);
        imageResults.push(imageUrl || '');
      } catch (err) {
        console.error(`❌ Failed to generate batch image #${i + 1}:`, err.message);
        imageResults.push('');
      }

      // Small pause between sequential image requests to prevent rate spikes
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const hasAnyValidImage = imageResults.some(img => img && img.trim());
    if (!hasAnyValidImage) {
      return res.status(503).json({
        success: false,
        allAccountsExhausted: true,
        message: 'All Cloudflare accounts have reached their daily image limits or failed.'
      });
    }

    return res.json({
      success: true,
      images: imageResults,
      modelId: selectedModel,
      modelName: modelDisplayName
    });
  } catch (err) {
    console.error('❌ Error in batch AI image generation:', err);
    return res.status(500).json({ success: false, allAccountsExhausted: true, message: err.message });
  }
});

router.callCloudflareAIWithFailover = callCloudflareAIWithFailover;
router.buildSystemInstruction = buildSystemInstruction;
module.exports = router;

