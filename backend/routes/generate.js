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
      color, quality, rendering, negativePrompt, modelParams 
    } = req.body;

    // 1. Fetch Admin Settings (API Key and Rules)
    const settings = await SystemSettings.findOne();
    if (!settings || !settings.geminiApiKey) {
      return res.status(500).json({ message: 'Gemini API Key not configured by Admin.' });
    }

    const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Prepare Rules string
    const rulesStr = settings.promptCreationRules
      .map((r, i) => `${i + 1}. ${r.text}${r.example ? ` (Example: ${r.example})` : ''}`)
      .join('\n');

    // 3. Construct System Prompt
    const systemPrompt = `You are an expert AI Prompt Engineer. Your task is to generate a professional, high-quality AI image generation prompt based on user preferences.

STRICT RULES YOU MUST FOLLOW:
${rulesStr}

USER PREFERENCES:
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
  "examplePrompts": ["Example 1 (Main)", "Example 2 (Variation)", "Example 3 (Variation)"],
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
      res.json(promptData);
    } catch (parseError) {
      console.error('JSON Parse Error:', text);
      res.status(500).json({ message: 'Failed to parse AI response.', raw: text });
    }

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ message: 'Error generating prompt with Gemini.' });
  }
});

module.exports = router;
