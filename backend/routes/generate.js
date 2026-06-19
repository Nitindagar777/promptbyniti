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

/* ================================================================
   CACHED MODEL INSTANCE
   - systemInstruction (platform rules) is set ONCE at init time
   - Only user data (description, image, promptType) goes per-request
   - Rules never repeat in the messages field → huge token savings
   ================================================================ */
let cachedModel = null;
let cachedRulesHash = null;   // detect when admin edits rules
let cachedApiKey = null;
const SYSTEM_PROMPT_VERSION = 'v21-character-mode-fixed-different'; // bump this when system prompt changes

// Fallback chain: try best model first, fall back if unavailable
const MODEL_CHAIN = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

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

  const currentHash = `${SYSTEM_PROMPT_VERSION}::${settings.geminiApiKey}::${settings.paidGeminiApiKey || ''}::${settings.geminiModel}::${rulesStr}::characterMode`;

  // Return cached model if nothing changed
  if (cachedModel && cachedRulesHash === currentHash) {
    return cachedModel;
  }

  const genAIFree = new GoogleGenerativeAI(settings.geminiApiKey);
  const genAIPaid = settings.paidGeminiApiKey ? new GoogleGenerativeAI(settings.paidGeminiApiKey) : null;

  // Store both genAI instances, rulesStr, and the configured model
  cachedModel = { genAIFree, genAIPaid, rulesStr, geminiModel: settings.geminiModel || 'gemini-1.5-flash' };

  cachedRulesHash = currentHash;
  cachedApiKey = settings.geminiApiKey;

  return cachedModel;
}

/**
 * Build a dynamic system instruction based on rules, aiPower tier, characterMode, promptType, and duration.
 */
function buildSystemInstruction(rulesStr, aiPower, characterMode, promptType, duration, hasRefImage, aspectRatio, category, subcategory) {
  const power = aiPower || 'normal';
  const isVideo = promptType === 'video';
  const isText = promptType === 'text';
  const resolvedAR = aspectRatio ? aspectRatio.trim() : (isVideo ? '16:9' : '1:1');
  
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
3. For each of the samples (Sample A, Sample B, Sample C), copy the promptTemplate and replace ONLY the motion variables.
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
3. For each of the samples (Sample A, Sample B, Sample C), copy the promptTemplate and replace the bracketed variables.
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
3. For each of the samples (Sample A, Sample B, Sample C), copy the promptTemplate and replace ONLY the camera movement variables.
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
3. For each of the samples (Sample A, Sample B, Sample C), copy the promptTemplate and replace the bracketed variables with unique creative details.
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
3. For each of the samples (Sample A, Sample B, Sample C), copy the promptTemplate and replace the bracketed variables with unique creative details.
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. SAMPLE COUNT: Generate exactly 3 samples for standard generations. Generate exactly 5 samples ONLY when "Example Generator" mode is requested.`;
  } else {
    // Image reference rules
    if (resolvedCharMode === 'fixed') {
      referenceImageRules = `
CRITICAL — REFERENCE IMAGE HANDLING (🔒 FIXED CHARACTER MODE):
The user has selected FIXED CHARACTER mode. This means EVERYTHING from the reference image stays the SAME — the same character, same clothing, same scene, same environment, same style, same color palette, same overall vibe. The ONLY things that change are the POSE, ACTION, GESTURE, and BODY POSITION of the character. Think of it like taking multiple photos of the same model during the same photoshoot — same outfit, same location, just different poses.

When a reference image is provided in FIXED CHARACTER mode, you MUST:

1. DEEPLY ANALYZE EVERYTHING IN THE IMAGE — treat every detail as FIXED:
   CHARACTER (ALL FIXED — never changes):
   - Face: structure, features, expression style, age, gender, ethnicity, makeup
   - Hair: exact color, length, style, texture, bangs, accessories in hair
   - Body type, proportions, height impression
   - Clothing: EVERY piece of clothing stays IDENTICAL — exact colors, patterns, materials, layers, fit
   - Accessories: jewelry, watches, bracelets, bags, hats, sunglasses, shoes — ALL stay the same
   - Skin tone, distinguishing marks, tattoos
   - For animals: exact breed/species, fur color & pattern, size, markings — ALL stay the same
   - For objects: exact shape, colors, text, design elements — ALL stay the same

   SCENE & ENVIRONMENT (ALL FIXED — never changes):
   - Background setting: the SAME location/environment type
   - Art style: the SAME photographic/artistic style
   - Color palette: the SAME overall color scheme and mood
   - Props and surrounding objects: the SAME props stay in scene
   - Lighting mood: the SAME general lighting atmosphere
   - Composition style: the SAME framing approach

2. EVERYTHING IS FIXED TEXT EXCEPT POSE/ACTION — THESE ARE THE ONLY VARIABLES:
   In the promptTemplate, ALMOST EVERYTHING must be written as FIXED, unchangeable text — the character description, their clothes, the scene, the style, the lighting mood, the color palette. The ONLY things in [brackets] should be the character's POSE, ACTION, GESTURE, or BODY POSITION.
   
   CORRECT EXAMPLE (girl in a flower field photoshoot):
   - promptTemplate: "Creative forced perspective lifestyle photography of a young woman with long wavy brown hair wearing a blue floral crop top, white denim shorts, and canvas sneakers, [pose/action], in a bright sunny daisy and sunflower meadow, playful hand-drawn doodle overlays, vibrant summer colors, whimsical editorial style, natural daylight, full body shot --ar 1:1"
   - Sample A: "...standing with arms spread wide next to a giant sunflower..."
   - Sample B: "...jumping joyfully with one arm reaching toward the sky..."  
   - Sample C: "...crouching down smelling flowers with hands cupping a daisy..."
   
   WRONG EXAMPLE: "Photography of a [character] wearing [outfit] in a [location]..." ← FORBIDDEN! Character, outfit, and location must NOT be variables!

3. STRICT VARIABLE RULES — ONLY 1 TO 3 VARIABLES ALLOWED:
   The promptTemplate should have VERY FEW variables (ideally 1-3, max 5) because almost everything is fixed. The allowed variable types are ONLY:
   - [pose/action] — the character's body position or physical action (e.g., "arms outstretched making a heart shape", "twirling with one leg up", "sitting cross-legged looking at camera", "hands on hips leaning forward")
   - [gesture/expression] — hand gesture, facial expression, or small body movement (e.g., "making a peace sign and winking", "blowing a kiss", "laughing with head tilted back")
   - [creative element] — a small creative prop or visual trick that varies between shots (e.g., "forced perspective with a giant sunflower", "soap bubble overlay", "drawn angel wings doodle")
   
   ABSOLUTELY FORBIDDEN as variables: [character], [person], [subject], [clothing], [outfit], [background], [setting], [location], [scene], [style], [color palette], [environment]. These MUST be fixed text.

4. THE mainPrompt MUST RECREATE THE EXACT SAME SCENE from the reference image with one specific pose.

5. ALL 3 SAMPLES MUST LOOK LIKE THEY ARE FROM THE SAME PHOTOSHOOT:
   - Same character, same clothes, same location, same style — ONLY the pose/action/gesture changes.
   - If the reference shows two girls in colorful outfits at a theme park, ALL samples show those SAME two girls in those SAME outfits at that SAME theme park — just in different poses (arms spread, making heart shapes, jumping, etc.)
   - If the reference shows a girl in a flower field with doodle overlays, ALL samples show that SAME girl in that SAME field with those SAME doodle overlays — just doing different actions.
   - The samples should feel like a photographer telling the model "OK now try this pose... now try this one..."

6. The goal: when someone generates images from these prompts, ALL the output images look like they belong to the SAME photoshoot session — same person, same outfit, same place, just different poses and moments captured.`;

      howToBuildSamples = `HOW TO BUILD SAMPLES (🔒 FIXED CHARACTER MODE - FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must be a perfect, highly detailed, real-world example of the prompt being used (NO brackets) describing the reference image exactly.
   - Describe the exact subject from the reference (e.g. "a young East Asian woman with short dark hair").
   - Describe the exact clothing from the reference (e.g. "wearing a blue and white checkered wrap and a delicate white lace-strap top").
   - Describe the scene/background setting, art style, color palette, lighting, and a specific pose/action.
   - End with "--ar ${resolvedAR}".
2. Create promptTemplate: Take the mainPrompt and replace ONLY the pose/action, background setting, and lighting/colors with bracketed variables (e.g., [pose/action], [background_setting], [lighting/colors]).
   - CRITICAL: The subject description and clothing/outfit MUST remain as FIXED, detailed, non-variable text in the promptTemplate. DO NOT put them in brackets!
3. For each of the samples (Sample A, Sample B, Sample C), copy the promptTemplate and replace the bracketed variables.
   - CRITICAL: The subject description and clothing/outfit MUST be 100% IDENTICAL and repeated word-for-word across all samples! DO NOT vary them! E.g., never generate different subjects like a "Nordic fisherman" or "fantasy elf" in any sample! All samples must feature the EXACT SAME young woman in the EXACT SAME outfit.
   - The pose/action, background setting, and lighting/colors MUST vary completely per sample to show the same character in different locations/scenes (e.g. in a cozy library, in snowy mountains, on a sunny beach).
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. SAMPLE COUNT: Generate exactly 3 samples for standard generations. Generate exactly 5 samples ONLY when "Example Generator" mode is requested.
6. CRITICAL CHARACTER LENGTH CONSTRAINT (MANDATORY):
   The generated promptTemplate MUST strictly comply with these length limits based on the Credit Tier:
   - 1 Credit (Normal): promptTemplate MUST be at least 400 to 500 characters long (detailed and perfect to best describe the scene).
   - 3 Credits (Super): promptTemplate MUST be at least 500 to 600 characters long (exceptional photographic details and camera settings).
   - 5 Credits (Power): promptTemplate MUST be at least 600 to 700 characters long (masterpiece-level visual details, highly detailed and fully descriptive).
   You MUST write exceptionally detailed, long, and descriptive fixed text around the bracketed variables in promptTemplate to satisfy this length requirement.
7. Every prompt and sample MUST end with --ar ${resolvedAR}`;
    } else if (resolvedCharMode === 'sameScene') {
      referenceImageRules = `
CRITICAL — REFERENCE IMAGE HANDLING (📸 SAME SCENE MODE):
The user has selected SAME SCENE mode. This means EVERYTHING from the reference image stays EXACTLY THE SAME — the same character(s), same clothing, same scene, same environment, same style, same color palette, same overall vibe. The ONLY things that change are the POSE, ACTION, GESTURE, facial expression, and camera angle. Think of it like taking multiple photos of the same subjects during the same photoshoot at the same location — same outfits, same background, just different poses, expressions, and shot close-ups.

When a reference image is provided in SAME SCENE mode, you MUST strictly enforce these rules:

1. WHAT TO ALWAYS LOCK (FOR ANY REFERENCE IMAGE) — NEVER CHANGE OR VARY:
   - LOCK Number of subjects: Same count of people, objects, or characters as in the reference — never add or remove.
   - LOCK Identity of every subject: Same person/character/object — same face, body, skin, hair, species, shape, size.
   - LOCK Clothing, accessories, and appearance details: Every outfit, color of clothing, accessories, hairstyle, and visual detail stays identical.
   - LOCK Art style and rendering medium: Whether it's a photo, painting, cartoon, 3D render, sketch — that exact style must carry over.
   - LOCK Color palette: All dominant colors, tones, saturation level, and overall color mood stay the same.
   - LOCK Overall composition format: Grid, single panel, collage, split — the structural layout of the image stays identical.
   - LOCK Background setting / environment: Same type of environment — indoors/outdoors, same general location feel and background elements.
   - LOCK Lighting and mood: Same light direction, softness, time of day, and emotional atmosphere.

2. WHAT IS ALLOWED TO CHANGE/VARY:
   - CHANGE Poses and body positions: New stances, gestures, sitting vs standing — but within the same scene logic.
   - CHANGE Facial expressions: Different emotions per panel or variation — smiling, serious, laughing, winking, surprised, etc.
   - CHANGE Camera angle or crop per variation: Close-up, wide, low angle, portrait, medium shot — the shot can vary as long as the style is consistent.
   - CHANGE Small props or held objects: A different item being held or used — as long as it fits the same setting and style.
   - CHANGE Minor background details: Which part of the same environment is visible — exact trees, walls, or objects in the background can shift slightly.

3. PROMPT FORMULA TO FOLLOW:
   "Recreate this image with the same [subjects], same [outfits/appearance], same [art style], same [color palette], same [background type], same [lighting] — only change the [poses / expressions / camera angle]."

4. TEMPLATE AND SAMPLES CREATION:
   - In the promptTemplate, the subjects, outfits, art style, color palette, background, and lighting MUST be written as fixed, detailed text.
   - ONLY the poses, expressions, or camera angle should be bracketed variables.
   - Example template format: "Recreate this image with the same young woman with long wavy brown hair, same blue floral crop top and white denim shorts, same lifestyle photography style, same vibrant summer color palette, same bright sunny daisy and sunflower meadow, same natural daylight — only change the [pose / expression / camera angle]."
   - Sample A: "...only change the [pose to winking and showing peace signs in a medium close-up shot]."
   - Sample B: "...only change the [pose to jumping joyfully with arms wide open in a full body shot]."
   - Sample C: "...only change the [pose to sitting peacefully on a blanket smelling a daisy in a low angle shot]."

5. Goal: The output prompts must feel 100% cohesive, like consecutive frames of the same photoshoot session, ensuring the character and location remain perfectly locked.`;

      howToBuildSamples = `HOW TO BUILD SAMPLES (📸 SAME SCENE MODE - FOLLOW THIS EXACTLY):
1. Write the mainPrompt first. It must be a perfect, highly detailed, real-world example of the prompt being used (NO brackets) describing the reference image exactly.
   - Describe the exact subject from the reference (e.g. "a young East Asian woman with short dark hair").
   - Describe the exact clothing from the reference (e.g. "wearing a blue and white checkered wrap and a delicate white lace-strap top").
   - Describe the exact scene/background setting from the reference (e.g. "in a vast field of bright yellow wildflowers with rolling green hills in the distance").
   - Describe the exact art style, color palette, and lighting from the reference image.
   - Include a specific pose/action (e.g. "resting her chin thoughtfully on her hand").
   - End with "--ar ${resolvedAR}".
2. Create promptTemplate: Take the mainPrompt and replace ONLY the pose/action and facial expression with bracketed variables (e.g., [pose/action] and [facial_expression]).
   - CRITICAL: All other parts of the prompt (the subject description, clothing/outfit, background setting, art style, color palette, lighting) MUST remain as FIXED, detailed, non-variable text in the promptTemplate. DO NOT put them in brackets!
3. For each of the samples (Sample A, Sample B, Sample C), copy the promptTemplate and replace ONLY the pose/action and facial expression variables.
   - CRITICAL: The subject, clothing, background setting, art style, color palette, and lighting MUST be 100% IDENTICAL and repeated word-for-word across all samples! DO NOT vary them! E.g., never generate different subjects like a "Nordic fisherman" or "fantasy elf" in any sample! All samples must feature the EXACT SAME young woman in the EXACT SAME outfit and the EXACT SAME yellow wildflower field.
   - ONLY the poses, actions, gestures, and expressions must vary completely between the samples (e.g., winking and waving vs sitting cross-legged on a blanket vs leaning forward smiling).
4. ZERO TOLERANCE FOR BRACKETS IN SAMPLES: Samples and mainPrompt MUST NOT contain any [BRACKETS]. Only promptTemplate has brackets.
5. SAMPLE COUNT: Generate exactly 3 samples for standard generations. Generate exactly 5 samples ONLY when "Example Generator" mode is requested.
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

5. ALL 3 SAMPLES MUST LOOK LIKE THEY BELONG TO THE SAME ART SERIES:
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
8. SAMPLE COUNT: Generate exactly 3 samples for standard generations. Generate exactly 5 samples ONLY when "Example Generator" mode is requested.
9. CRITICAL CHARACTER LENGTH CONSTRAINT (MANDATORY):
   The generated promptTemplate MUST strictly comply with these length limits based on the Credit Tier:
   - 1 Credit (Normal): promptTemplate MUST be at least 400 to 500 characters long (detailed and perfect to best describe the scene).
   - 3 Credits (Super): promptTemplate MUST be at least 500 to 600 characters long (exceptional photographic details and camera settings).
   - 5 Credits (Power): promptTemplate MUST be at least 600 to 700 characters long (masterpiece-level visual details, highly detailed and fully descriptive).
   You MUST write exceptionally detailed, long, and descriptive fixed text around the bracketed variables in promptTemplate to satisfy this length requirement.
10. Every prompt and sample MUST end with --ar ${resolvedAR}`;
    }
  }

  let subcategoryInstruction = '';
  if (isText && category && subcategory) {
    const catUpper = category.toUpperCase().trim();
    const subTrim = subcategory.trim();
    const catRules = TEXT_SUBCATEGORY_RULES[catUpper];

    if (catRules && catRules[subTrim]) {
      const rule = catRules[subTrim];
      
      let subcategoryGuidelines = '';
      if (subTrim === 'Personal Development') {
        subcategoryGuidelines = `\nCustom Subcategory Guidelines:
- Student: identity formation is the work
- Early Career: skill acquisition > salary
- Mid-Career: leverage and delegation
- Parent: time boundaries are essential`;
      } else if (subTrim === 'Content Creation') {
        subcategoryGuidelines = `\nCustom Subcategory Guidelines:
- TikTok: authenticity over production
- Instagram: aesthetic consistency
- LinkedIn: professional storytelling
- YouTube: click-worthy hook`;
      } else if (subTrim === 'Product Research') {
        subcategoryGuidelines = `\nCustom Subcategory Guidelines:
- Dropshipping: shipping time is critical
- Private Label: branding and differentiation
- Wholesale: margin and volume`;
      }

      subcategoryInstruction = `
SUBCATEGORY SPECIFIC TEMPLATE & DETAILS — ${rule.name}:
- Template to follow:
${rule.promptTemplate}
${subcategoryGuidelines}
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
    "Sample C: unique variation..."
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
    "Sample C: unique variation..."
  ],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "instructions": "Step-by-step instructions on how to use this prompt effectively."
}

- Every prompt and sample MUST end with --ar ${resolvedAR}

Return ONLY the JSON object. No markdown fences, no explanation.`;
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

${referenceImageRules}

${howToBuildSamples}

${subcategoryInstruction}

${outputFormatInstruction}`;
}

// POST /api/generate
router.post('/', async (req, res) => {
  try {
    const { description, characterImage, promptType, model, mode, modelLabel, aiPower, characterMode, aspectRatio, category, subcategory } = req.body;
    // Use human-readable model name if available, otherwise fall back to model id
    const targetModel = modelLabel || model || 'Midjourney';

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description or Template is required.' });
    }

    // 1. Get cached model (keys and database rules)
    const cached = await getOrCreateModel();

    const hasRefImage = characterImage && characterImage.startsWith('data:image');

    // Build the system instruction dynamically based on the requested aiPower level
    const systemInstruction = buildSystemInstruction(cached.rulesStr, aiPower, characterMode, promptType, req.body.duration, hasRefImage, aspectRatio, category, subcategory);
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
   You only need to replace the [pose/action] and [facial_expression] variables with unique, diverse, and creative poses and expressions for Sample A, B, and C.
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
2. The variables describing the subject, clothing, colors, and poses (e.g., [subject], [pose], [outfit], [color]) SHOULD vary completely in each of the 3 samples (e.g. generating completely different subjects like a rugged Nordic fisherman, a fantasy elf, a street artist) while keeping the overall art style described by the fixed text identical.`;
      }

      userParts.push({
        text: `I have attached a REFERENCE IMAGE above. This is the primary visual source and the most important input.

YOUR MISSION:
Deeply analyze the attached reference image (its subject, clothing, style, lighting, composition, colors, medium) and generate a perfect, highly detailed prompt template and 3 distinct samples from scratch, in accordance with the character consistency rules below.

${modeSpecificPromptRules}

CRITICAL LENGTH CONSTRAINTS (MANDATORY & STRICTLY ENFORCED):
You MUST ensure the generated "promptTemplate" satisfies these exact character lengths based on the requested Power level:
- For 1 Credit (Normal): The promptTemplate MUST have a minimum character length of 400 to 500 characters (exceptionally detailed, perfect, and best describes the scene).
- For 3 Credits (Super): The promptTemplate MUST have a minimum character length of 500 to 600 characters (enhanced details, camera specs, lighting setups).
- For 5 Credits (Power): The promptTemplate MUST have a minimum character length of 600 to 700 characters (masterpiece visual complexity, extreme sensory details).

To achieve this character length, you MUST write exceptionally detailed, long, and rich fixed descriptive text in the template. The vast majority of the prompt template must be high-value unchangeable words (specifying photographic framing, detailed apparel, volumetric atmosphere, styling and textures) while keeping the bracketed variables strictly between 1 and 5 total. DO NOT generate short, simple templates (e.g., "Photography of a [subject] wearing [outfit]...").

Target AI Model: ${targetModel} — optimize the prompt syntax and keywords for this specific model.

User's additional instructions: "${description.trim()}"

Fill in "imageAnalysis" with your detailed description of everything you see in the reference image (subject details, clothing, scene, background, lighting, and style).`
      });
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

    console.log(`📤 Sending to Gemini: ${userParts.length} parts, hasImage: ${hasRefImage}`);

    // 3. Try each model in the chain until one works. Try free key first, then paid.
    let text = null;
    let lastError = null;

    const modelsToTry = [];
    if (cached.geminiModel) {
      modelsToTry.push(cached.geminiModel);
    }
    MODEL_CHAIN.forEach(m => {
      if (!modelsToTry.includes(m)) {
        modelsToTry.push(m);
      }
    });

    for (const modelName of modelsToTry) {
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

      // ── Post-processing: strip labels & enforce custom aspect ratio ──
      const stripLabel = (s) => s.replace(/^(Variation\s*\d*[:.\-]\s*|Example\s*\d*[:.\-]\s*|Sample\s*[A-C\d]*[:.\-]\s*|Version\s*\d*[:.\-]\s*|\d+[:.)\-]\s*)/i, '').trim();
      const resolvedAR = aspectRatio ? aspectRatio.trim() : (promptType === 'video' ? '16:9' : '1:1');
      const ensureCustomAR = (s) => {
        const cleaned = s.replace(/\s*--ar\s+\S+/g, '').trim();
        return cleaned + ' --ar ' + resolvedAR;
      };

      const cleanVideoPrompt = (s) => {
        if (!s) return '';
        let cleaned = stripLabel(s).trim();
        
        // 1. Remove all square brackets [] to prevent metadata safety blockages, keeping text inside if there's any.
        cleaned = cleaned.replace(/[\[\]]/g, '');

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
          // For template, we only normalize the scene timestamps and ensure video prefix and ar resolvedAR,
          // but we do NOT strip variable brackets like [animation_1].
          let temp = promptData.promptTemplate.trim();
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
        promptData.mainPrompt = stripLabel(promptData.mainPrompt || '');
        promptData.samples = promptData.samples.map(s => stripLabel(s || ''));
        if (promptData.promptTemplate) {
          promptData.promptTemplate = stripLabel(promptData.promptTemplate);
        }
      } else {
        // default to image prompt rules
        promptData.mainPrompt = ensureCustomAR(stripLabel(promptData.mainPrompt || ''));
        promptData.samples = promptData.samples.map(s => ensureCustomAR(stripLabel(s || '')));
        if (promptData.promptTemplate) {
          promptData.promptTemplate = ensureCustomAR(promptData.promptTemplate);
        }
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

router.buildSystemInstruction = buildSystemInstruction;
module.exports = router;

