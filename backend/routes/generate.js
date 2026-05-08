const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const SystemSettings = require('../models/SystemSettings');

// POST /api/generate
router.post('/', async (req, res) => {
  try {
    const { 
      category, style, mood, lighting, camera, description, model, 
      subjectDetails, action, environment, lens, composition, 
      color, quality, rendering, negativePrompt, modelParams,
      promptType // 'image', 'video', or 'text'
    } = req.body;

    // 1. Fetch Admin Settings (API Key and Rules)
    const settings = await SystemSettings.findOne();
    if (!settings || !settings.geminiApiKey) {
      return res.status(500).json({ message: 'Gemini API Key not configured by Admin.' });
    }

    const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
    const geminiModel = genAI.getGenerativeModel({ model: settings.geminiModel || "gemini-flash-latest" });

    // 2. Prepare Rules string
    const rulesStr = settings.promptCreationRules
      .map((r, i) => `${i + 1}. ${r.text}${r.example ? ` (Example: ${r.example})` : ''}`)
      .join('\n');

    // 3. Construct System Prompt
    const systemPrompt = `You are an expert AI Prompt Engineer. Your task is to generate a professional, high-quality AI image generation prompt based on user preferences.

STRICT RULES YOU MUST FOLLOW:
${rulesStr}

- Type: ${promptType} (IMPORTANT: Optimize the prompt strictly for this format. If Video, include motion/camera movement. If Text, focus on structure/tone. If Image, focus on visual detail.)
- Category: ${category}
- Style: ${style}
- Mood: ${mood}
- Lighting: ${lighting}
- Camera Angle: ${camera}
- Subject/Object: ${description}
- Subject Details: ${subjectDetails}
- Action/Pose: ${action}
- Environment: ${environment}
- Lens/Camera: ${lens}
- Composition: ${composition}
- Color Palette: ${color}
- Quality/Details: ${quality}
- Rendering Engine: ${rendering}
- Targeted AI Model: ${model}
- Model Parameters: ${modelParams}

OUTPUT FORMAT:
You must return a JSON object with the following fields:
{
  "title": "A catchy 3-5 word title for the prompt",
  "description": "A professional 1-2 sentence description of what this prompt achieves",
  "mainPrompt": "The full, optimized, professional prompt string",
  "negativePrompt": "A comprehensive negative prompt based on the user's input and best practices",
  "promptTemplate": "A version of the mainPrompt where specific variables are in [BRACKETS], e.g., 'A [SUBJECT] in [LIGHTING] style'",
  "samples": [
    "Example 1: The prompt with [VARIABLES] replaced by real values",
    "Example 2: Another variation with different values",
    "Example 3: A third unique variation"
  ],
  "keywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4"],
  "instructions": "Step-by-step instructions on how to use this prompt effectively, which variables to change, and recommended settings.",
  "structured": {
    "subject": "The core subject",
    "style": "The art style used",
    "lighting": "The lighting setup",
    "environment": "The setting",
    "quality": "Quality keywords used"
  }
}

Return ONLY the JSON object. No markdown, no extra text.`;

    // 4. Generate Content
    const result = await geminiModel.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    // 5. Parse and Return
    try {
      const jsonStr = text.replace(/```json|```/g, '').trim();
      const promptData = JSON.parse(jsonStr);
      
      // Ensure frontend fields are present and reflect user selection
      promptData.priceTokens = 5; 
      promptData.promptType = promptType || 'image';
      promptData.model = model || 'midjourney';
      
      // Ensure exactly 3 samples
      if (!Array.isArray(promptData.samples)) promptData.samples = [];
      while (promptData.samples.length < 3) {
        promptData.samples.push(promptData.mainPrompt || "Generate a variation here.");
      }
      promptData.samples = promptData.samples.slice(0, 3);

      // Ensure keywords and instructions
      if (!Array.isArray(promptData.keywords) || promptData.keywords.length === 0) {
        promptData.keywords = [category, style, mood, lighting].filter(x => x && x !== 'default');
      }
      if (!promptData.instructions) {
        promptData.instructions = `Use this prompt in ${model.toUpperCase()}. Adjust the [VARIABLES] to customize the result.`;
      }

      // Build a comprehensive structured breakdown from ACTUAL user selection
      promptData.structured = {
        "Target Format": `${promptData.promptType.toUpperCase()} Prompt`,
        "AI Model": promptData.model.toUpperCase(),
        "Category": category,
        "Base Style": style,
        "Mood/Atmosphere": mood,
        "Lighting": lighting,
        "Camera/Angle": camera,
        "Lens/Focal": lens,
        "Composition": composition,
        "Environment": environment,
        "Action/Pose": action,
        "Subject Detail": subjectDetails,
        "Color Palette": color,
        "Quality Level": quality,
        "Rendering": rendering,
        "Parameters": modelParams || 'Standard'
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
