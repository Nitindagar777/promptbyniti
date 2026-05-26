const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const SystemSettings = require('../models/SystemSettings');

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

/* ================================================================
   CACHED MODEL INSTANCE
   - systemInstruction (platform rules) is set ONCE at init time
   - Only user data (description, image, promptType) goes per-request
   - Rules never repeat in the messages field → huge token savings
   ================================================================ */
let cachedModel = null;
let cachedRulesHash = null;   // detect when admin edits rules
let cachedApiKey = null;
const SYSTEM_PROMPT_VERSION = 'v20-five-variable-diversity-extreme'; // bump this when system prompt changes

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
    .map((r, i) => {
      const cleanText = r.text.replace(/^\d+[\s.)-]+\s*/, '');
      return `${i + 1}. ${cleanText}${r.example ? ` (Example: ${r.example})` : ''}`;
    })
    .join('\n');

  const currentHash = `${SYSTEM_PROMPT_VERSION}::${settings.geminiApiKey}::${settings.paidGeminiApiKey || ''}::${settings.geminiModel}::${rulesStr}`;

  // Return cached model if nothing changed
  if (cachedModel && cachedRulesHash === currentHash) {
    return cachedModel;
  }

  const genAIFree = new GoogleGenerativeAI(settings.geminiApiKey);
  const genAIPaid = settings.paidGeminiApiKey ? new GoogleGenerativeAI(settings.paidGeminiApiKey) : null;

  // Store both genAI instances and rulesStr
  cachedModel = { genAIFree, genAIPaid, rulesStr };

  cachedRulesHash = currentHash;
  cachedApiKey = settings.geminiApiKey;

  console.log(`✅ Gemini initialized. Model chain: ${MODEL_CHAIN.join(' → ')}. Paid key configured: ${!!genAIPaid}`);
  return cachedModel;
}

/**
 * Build a dynamic system instruction based on rules and aiPower tier.
 */
function buildSystemInstruction(rulesStr, aiPower) {
  const power = aiPower || 'normal';
  
  let tierGuidelines = '';
  if (power === 'super') {
    tierGuidelines = `
PROMPT DETAIL LEVEL — SUPER TIER (3 CREDITS):
- You MUST generate a highly detailed, long, and rich prompt text.
- MORE FIXED DESCRIPTIVE TEXT REQUIRED: Ensure the prompt template is packed with high-quality, fixed descriptive text (e.g. complex scene framing, specific visual elements, lighting terms) that remains unchangeable. There should be a lot of descriptive fixed words and only 1 to 5 bracketed variables.
- Include advanced visual descriptions: specific textures, camera lens details (e.g. 85mm f/1.4), depth of field, complex color gradations, and rich atmospheric lighting (e.g., volumetric dust motes, soft diffusion, golden hour rim lighting).
- Add highly specific design/artistic styles and medium descriptors.
- Ensure the prompt is descriptive enough to paint a vivid, multi-layered visual scene.`;
  } else if (power === 'power') {
    tierGuidelines = `
PROMPT DETAIL LEVEL — POWER TIER (5 CREDITS - MAXIMUM DETAIL & DENSITY):
- You MUST generate an exceptionally detailed, very long, and highly immersive prompt.
- MAXIMUM FIXED DESCRIPTIVE TEXT REQUIRED: Ensure the prompt template has the absolute maximum density of fixed, professional prompt-engineering words (such as intricate camera setups, lighting rigs, master-level rendering engines, environmental sensory words, artistic styling direction). The vast majority of the template MUST be solid, high-value, unchangeable text, while still strictly limiting bracketed variables to between 1 and 5. This makes the prompt incredibly valuable and complex.
- Incorporate professional cinematic and photographic vocabulary: specific focal lengths, precise aperture values, complex framing (e.g., low-angle extreme close-up, rule of thirds, dynamic background depth).
- Describe intricate sensory and environmental details: volumetric fog, specific humidity/weather, raytraced light reflections, subtle chromatic aberration, realistic fabric weave, and precise skin/surface textures.
- Use advanced artistic direction keywords: epic scale, highly atmospheric, award-winning cinematography, photorealistic render, breathtaking detailed composition.
- Leave no detail to chance; build a masterpiece of descriptive prompt engineering.`;
  } else {
    tierGuidelines = `
PROMPT DETAIL LEVEL — NORMAL TIER (1 CREDIT):
- Generate a professional, clean, and direct prompt.
- Keep the prompt concise, clear, and focused on the key visual details, style, and lighting.
- Focus on producing a clean, solid, and high-quality baseline prompt with standard fixed text and 1 to 5 variables.`;
  }

  return `You are an expert AI Prompt Engineer for a premium prompt marketplace called "Prompt by Niti".

PLATFORM RULES (ALWAYS ENFORCE):
${rulesStr}

YOUR ROLE:
- Generate professional, high-quality AI prompts based on user descriptions.
- Optimize prompts for the specific format the user selects (image, video, or text).
- For IMAGE prompts: focus on vivid visual details, composition, lighting, style keywords.
- For VIDEO prompts: include camera movements, motion dynamics, temporal flow, scene transitions.
- For TEXT prompts: focus on tone, structure, context, audience, formatting guidance.
${tierGuidelines}

CRITICAL — REFERENCE IMAGE HANDLING:
When a reference image is provided, you MUST:
1. FIRST, deeply analyze every visual detail in the image: the exact subject (person, animal, bird, vehicle, logo, product, character, etc.), their appearance (colors, shape, texture, features, text/logos), pose, environment, style, color scheme, and composition.
2. The mainPrompt MUST describe the EXACT subject/character/object seen in the reference image (e.g., if the image is a blue and yellow bird, the mainPrompt must describe that blue and yellow bird. If it is a black dog, it must describe that black dog. If it is a fairy with purple wings, it must describe that fairy with purple wings).
3. IDENTIFY ALL 5 CRITICAL VISUAL VARIABLES: You MUST break down the reference image into exactly 5 bracketed variables:
   - [subject] (e.g. fairy, girl, angel, warrior, explorer, demon, robot)
   - [pose/action] (e.g. kneeling, reaching, sitting, flying, battle stance, dancing)
   - [core feature] (e.g. butterfly wings, feathered wings, mechanical wings, dragon wings)
   - [color palette] (e.g. gold and teal, pastel pink and mint, silver and gold, obsidian and crimson)
   - [background scenery] (e.g. circular fern arch, cosmic nebula, industrial skyline, volcanic abyss)
4. DO NOT HARDCODE ANY OF THESE 5 COMPONENT DETAILS IN THE TEMPLATE: In the promptTemplate, you MUST NOT hardcode these specific details (e.g. "fairy", "kneeling", "butterfly wings", "pastel pink", "circular fern arch") as fixed text. You MUST replace all 5 of these components with generalized bracketed variables so the template is 100% reusable. Leaving any of these 5 specific visual components as fixed text in the promptTemplate is a critical failure.
5. THE 3 SAMPLE VARIATIONS MUST USE COMPLETELY DIFFERENT CATEGORIES FOR ALL 5 VARIABLES (MAXIMUM DIVERSITY): In each of the 3 samples, you MUST replace ALL 5 variables with completely different, creative concepts. DO NOT repeat the reference subject's wings, pose, color, or background in the samples! E.g. for a fairy with butterfly wings:
   - Sample A: Features a celestial girl with feathered wings in pastel pink/mint kneeling inside a circular leaf arch. (Matches reference image style)
   - Sample B: Features a steampunk explorer with mechanical wings in copper/gold flying over a smoky industrial skyline. (100% different subject, pose, wings, colors, and background!)
   - Sample C: Features an angelic warrior with glowing energy wings in silver/gold standing in a battle stance inside a cosmic nebula. (100% different subject, pose, wings, colors, and background!)
   - This prevents the samples from repeating the same features, demonstrating the supreme flexibility of the prompt template!
6. Include specific visual descriptors from the reference image in the mainPrompt so it accurately recreates the image.
7. The mainPrompt should be detailed enough that someone who has never seen the reference image could recreate something visually very similar.

OUTPUT FORMAT:
You must return a VALID JSON object with these fields:
{
  "title": "A catchy 3-5 word title for the prompt",
  "description": "A professional 1-2 sentence description of what this prompt achieves",
  "imageAnalysis": "If a reference image was provided, describe what you see in detail. If no image, set to empty string.",
  "mainPrompt": "A COMPLETE, READY-TO-USE SAMPLE PROMPT with ALL bracketed variables replaced by real, creative values. This MUST NOT contain any [BRACKETS]. End with --ar 1:1",
  "negativePrompt": "A comprehensive negative prompt (things to avoid/exclude)",
  "promptTemplate": "The skeleton version of the prompt using [BRACKETED] variables for changeable parts. THIS IS THE ONLY FIELD THAT SHOULD HAVE BRACKETS.",
  "samples": [
    "Sample A: unique variation...",
    "Sample B: unique variation...",
    "Sample C: unique variation..."
  ],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "instructions": "Step-by-step instructions on how to use this prompt effectively."
}

HOW TO BUILD SAMPLES (FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must be a perfect, real-world example of the prompt being used (NO brackets). Make it long, detailed, and rich with fixed descriptive text.
2. Create promptTemplate: take the mainPrompt and replace ONLY the most important changeable parts with [BRACKET] variables. 
3. STRICT VARIABLE LIMIT — MINIMUM 1, MAXIMUM 5 VARIABLES: The promptTemplate MUST contain a minimum of 1 bracketed variable and a maximum of 5 bracketed variables total. You must NEVER exceed 5 variables (e.g., [subject], [color], [style], [lighting], [location] is 5). Any prompt template with 6 or more variables is REJECTED. Keep all the remaining text of the prompt as rich, high-quality, fixed descriptive text.
4. GENERAL RULE & PERFECT TEMPLATE EXAMPLE:
   Here is a perfect example of a general, high-value prompt template that has EXACTLY 4 variables (within the 1-5 limit) and 80% fixed descriptive text:
   - mainPrompt: "Double exposure photography of a wolf silhouette against a deep pine forest, vibrant night sky filled with aurora borealis, double exposure visual effect, ethereal lighting, sharp details, cinematic rendering --ar 1:1"
   - promptTemplate: "Double exposure photography of a [subject] silhouette against a [background scenery], vibrant night sky filled with [atmospheric effect], double exposure visual effect, [lighting style] lighting, sharp details, cinematic rendering --ar 1:1"
   - In this example, ONLY the key items ([subject], [background scenery], [atmospheric effect], [lighting style]) are variables (4 total). All other words like "Double exposure photography", "silhouette against a", "vibrant night sky filled with", "double exposure visual effect", "lighting, sharp details, cinematic rendering" are FIXED descriptive text. This ensures the prompt is highly professional, unique, and valuable!
5. For each sample (A, B, C, etc.), take the promptTemplate and replace every single [BRACKET] with a COMPLETELY DIFFERENT real value.
6. ZERO TOLERANCE FOR REPETITION: Every variable MUST be 100% unique across all samples.
7. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
8. SAMPLE COUNT: Generate exactly 3 samples for standard generations. Generate exactly 5 samples ONLY when "Example Generator" mode is requested.

- Every prompt and sample MUST end with --ar 1:1

Return ONLY the JSON object. No markdown fences, no explanation.`;
}

// POST /api/generate
router.post('/', async (req, res) => {
  try {
    const { description, characterImage, promptType, model, mode, modelLabel, aiPower } = req.body;
    // Use human-readable model name if available, otherwise fall back to model id
    const targetModel = modelLabel || model || 'Midjourney';

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description or Template is required.' });
    }

    // 1. Get cached model (keys and database rules)
    const cached = await getOrCreateModel();

    // Build the system instruction dynamically based on the requested aiPower level
    const systemInstruction = buildSystemInstruction(cached.rulesStr, aiPower);

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
   - The mainPrompt must describe the SAME subject you see in the image, not something different.
   - If the image shows a cat logo with text "SPICY", then the mainPrompt must describe a cat logo with text "SPICY".
   - If the image shows a blue and yellow bird, then the mainPrompt must describe a blue and yellow bird.
   - DO NOT make up a different subject for the mainPrompt.

3. MAKE THE MAIN SUBJECT & ALL 5 KEY COMPONENTS VARIABLES IN THE TEMPLATE:
   - Break down the reference image into exactly 5 components and replace them with bracketed variables in promptTemplate:
     1. [subject] (e.g., replace "fairy" with [subject])
     2. [pose/action] (e.g., replace "kneeling" with [pose/action])
     3. [wing/feature type] (e.g., replace "butterfly wings" with [wing/feature type])
     4. [color palette] (e.g., replace "pastel pink" with [color palette])
     5. [background scenery] (e.g., replace "circular fern arch" with [background scenery])
   - You MUST NOT keep any of these 5 specific components from the reference image as fixed text in promptTemplate.

4. THE 3 SAMPLES MUST USE COMPLETELY DIFFERENT CONCEPTS FOR ALL 5 VARIABLES:
   - In each of the 3 samples, you MUST replace ALL 5 variables with completely different, creative variations (e.g. do NOT repeat "butterfly wings", "fairy", "kneeling", or "circular leaves" in all samples!).
   - E.g., Sample A features a celestial girl with feathered wings in pastel pink/mint kneeling inside a circular leaf arch.
   - E.g., Sample B features a steampunk explorer with mechanical wings in copper/gold flying over an industrial city.
   - E.g., Sample C features an angelic warrior with glowing energy wings in silver/gold standing in a battle stance inside a cosmic nebula.
   - You MUST show maximum variation for all 5 variables in all 3 samples!

Target AI Model: ${targetModel} — optimize for this model.

User's additional instructions: "${description.trim()}"

Fill in "imageAnalysis" with your detailed description of what you see in the image.`
      });
    } else {
      // No reference image — simple text-only generation
      userParts.push({
        text: `Generate a ${promptType || 'image'} prompt for the following scene:

"${description.trim()}"

Prompt Type: ${(promptType || 'image').toUpperCase()}
Target AI Model: ${targetModel} — optimize the prompt syntax and keywords for this specific model.

CRITICAL REQUIREMENT FOR VARIABLES:
The promptTemplate MUST contain a minimum of 1 and a maximum of 5 bracketed variables total (e.g., [subject], [color], [style]). 
DO NOT exceed 5 bracketed variables under any circumstances. Keep the majority of the prompt template as fixed, high-quality descriptive words.`
      });
    }

    console.log(`📤 Sending to Gemini: ${userParts.length} parts, hasImage: ${hasRefImage}`);

    // 3. Try each model in the chain until one works. Try free key first, then paid.
    let text = null;
    let lastError = null;

    for (const modelName of MODEL_CHAIN) {
      const keysToTry = [{ name: 'FREE', instance: cached.genAIFree }];
      if (cached.genAIPaid) {
        keysToTry.push({ name: 'PAID', instance: cached.genAIPaid });
      }

      let modelSuccess = false;

      for (const { name: keyName, instance: genAIInstance } of keysToTry) {
        try {
          console.log(`🔄 Trying model: ${modelName} with ${keyName} key...`);
          const gemModel = genAIInstance.getGenerativeModel({
            model: modelName,
            systemInstruction: {
              role: 'system',
              parts: [{ text: systemInstruction }]
            }
          });

          const result = await gemModel.generateContent({
            contents: [{ role: 'user', parts: userParts }]
          });

          const response = await result.response;
          text = response.text();
          console.log(`✅ Success with model: ${modelName} using ${keyName} key`);
          modelSuccess = true;
          break; // success with this key — stop trying other keys
        } catch (modelErr) {
          console.warn(`⚠️ ${modelName} with ${keyName} key failed: ${modelErr.message}`);
          lastError = modelErr;

          // If 429 (Too Many Requests/Quota) and we have a paid key, we definitely want to try the next key
          if (modelErr.message?.includes('429') || modelErr.message?.includes('quota') || modelErr.message?.includes('exhausted')) {
            console.log(`  → ${keyName} key quota exceeded, falling back if another key exists...`);
            continue; // try the next key in keysToTry
          }
          
          // If 503 (overloaded), wait 2s, but still try the next key if this is the free one
          if (modelErr.message?.includes('503') || modelErr.message?.includes('Service Unavailable')) {
            console.log('  → Model overloaded, trying next key or model...');
            if (keyName === 'FREE' && cached.genAIPaid) {
               continue; // try paid key immediately without wait
            } else {
               await new Promise(r => setTimeout(r, 2000));
               break; // break out of keys loop, go to next model
            }
          }

          // If 404 (not found), skip immediately to next model
          if (modelErr.message?.includes('404') || modelErr.message?.includes('not found')) {
            break; // break out of keys loop, go to next model
          }
          
          // For other errors, if we have a paid key and free failed, try paid.
          if (keyName === 'FREE' && cached.genAIPaid) {
             console.log(`  → Free key had error, trying paid key...`);
             continue;
          }
          
          // Other errors and no other keys to try — throw immediately to try next model
          break; 
        }
      }

      if (modelSuccess) {
        break; // success with this model — stop trying other models
      }
    }

    if (!text) {
      throw lastError || new Error('All models failed. Please try again later.');
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

