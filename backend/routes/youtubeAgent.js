const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const YoutubeAgentMemory = require('../models/YoutubeAgentMemory');
const YoutubeAgentChat = require('../models/YoutubeAgentChat');
const SystemSettings = require('../models/SystemSettings');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid session' });
  }
};

// Chain of models to attempt
const MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

// Helper to initialize Gemini API Client
async function getGeminiModel() {
  const settings = await SystemSettings.findOne();
  if (!settings || !settings.geminiApiKey) {
    throw new Error('Gemini API Key is not configured by Admin.');
  }
  const apiKey = settings.paidGeminiApiKey || settings.geminiApiKey;
  const genAI = new GoogleGenerativeAI(apiKey);
  const targetModel = settings.geminiModel || 'gemini-2.5-flash';
  return { genAI, targetModel };
}

// 1. GET /memory - Retrieve long-term memory
router.get('/memory', auth, async (req, res) => {
  try {
    const memory = await YoutubeAgentMemory.findOneAndUpdate(
      { userId: req.userId },
      { $setOnInsert: { userId: req.userId } },
      { new: true, upsert: true }
    );
    res.json({ success: true, memory });
  } catch (err) {
    console.error('Fetch memory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. POST /memory - Update long-term memory manually
router.post('/memory', auth, async (req, res) => {
  try {
    const memory = await YoutubeAgentMemory.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ success: true, memory });
  } catch (err) {
    console.error('Update memory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET /chat - Fetch chat history
router.get('/chat', auth, async (req, res) => {
  try {
    const chat = await YoutubeAgentChat.findOneAndUpdate(
      { userId: req.userId },
      { $setOnInsert: { userId: req.userId, messages: [] } },
      { new: true, upsert: true }
    );
    res.json({ success: true, messages: chat.messages });
  } catch (err) {
    console.error('Fetch chat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST /chat - Process chat/workflow query
router.post('/chat', auth, async (req, res) => {
  const { prompt, workflowType } = req.body;
  if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

  try {
    // A. Load user context and memory
    const memory = await YoutubeAgentMemory.findOneAndUpdate(
      { userId: req.userId },
      { $setOnInsert: { userId: req.userId } },
      { new: true, upsert: true }
    );

    // B. Load previous chat log
    const chat = await YoutubeAgentChat.findOneAndUpdate(
      { userId: req.userId },
      { $setOnInsert: { userId: req.userId, messages: [] } },
      { new: true, upsert: true }
    );

    // Keep only last 10 messages for sliding window context
    const recentMessages = chat.messages.slice(-10);

    // C. Initialize Gemini client
    const { genAI, targetModel } = await getGeminiModel();

    // D. Construct YouTube Agent System Instructions (System Prompt)
    const contextPrompt = `
You are YouTube AI, a professional Senior YouTube Channel Manager and Video Strategist.
Your goal is to guide the user to grow their channel and automate content strategy.

CURRENT CHANNEL CONTEXT (LONG-TERM MEMORY):
- Channel Name: ${memory.channelName || 'Not Set'}
- Niche/Topic: ${memory.niche || 'Not Set'}
- Target Audience: ${memory.audience || 'Not Set'}
- Brand Identity Color: ${memory.brandColor || 'Not Set'}
- Target Country: ${memory.country || 'Not Set'}
- Subscriber Count: ${memory.subscribers || 0}
- Revenue/Sub Goals: ${memory.goal || 'Not Set'}
- Voice Tone: ${memory.tone || 'Not Set'}
- Video Editing Style: ${memory.editingStyle || 'Not Set'}
- Upload Frequency: ${memory.uploadFrequency || 'Not Set'}
- Competitor Channels: ${(memory.competitors || []).join(', ') || 'None'}
- Stored Insights: ${(memory.generalMemories || []).join('; ') || 'None'}
- Analytics Snapshot: Views: ${memory.analyticsData?.views || 0}, CTR: ${memory.analyticsData?.ctr || 0}%, Watch Time: ${memory.analyticsData?.watchTime || 0}h, Retention: ${memory.analyticsData?.retention || 0}%

RULES:
1. Always incorporate the channel context when writing answers. If a color, niche, name, or goal is defined, use it!
2. Do not ask the user for information that is already provided in the context.
3. Be structured, analytical, and highly actionable.
4. End every response with exactly 3 to 5 "Recommended Next Steps" written as a clear list.
5. If the query requires a structured workflow (e.g., Content strategy, Video outlines, Titles list, SEO tags, Launch plans) or if a workflow is requested, you MUST return a valid JSON block inside a \`\`\`json ... \`\`\` format containing appropriate keys (e.g. titles, description, calendar, checklist, next_steps, logo_prompt).
    `;

    // E. Build conversation context parts
    const conversationHistory = recentMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current user prompt
    conversationHistory.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    let textResponse = '';
    let lastError = null;

    // Try target model, fall back if necessary
    const modelsToTry = [targetModel, ...MODEL_CHAIN.filter(m => m !== targetModel)];
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: {
            role: 'system',
            parts: [{ text: contextPrompt }]
          }
        });

        const result = await model.generateContent({
          contents: conversationHistory
        });

        const response = await result.response;
        textResponse = response.text();
        if (textResponse) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} call failed:`, err.message);
      }
    }

    if (!textResponse) {
      throw lastError || new Error('Gemini generation failed');
    }

    // F. Parse response to separate JSON structure and text description
    let structuredData = null;
    let text = textResponse;
    let suggestedSteps = [];

    // Parse JSON block if present
    const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      try {
        structuredData = JSON.parse(jsonMatch[1].trim());
        // Strip the JSON block from text response
        text = textResponse.replace(/```json\s*[\s\S]*?\s*```/gi, '').trim();
      } catch (e) {
        console.warn('Failed to parse structured JSON block:', e);
      }
    }

    // Extract Recommended Next Steps (look for markdown lists or matching keywords)
    const nextStepsMatch = textResponse.match(/(?:Recommended Next Steps|Next Steps|Actions):\s*([\s\S]*)$/i);
    if (nextStepsMatch) {
      suggestedSteps = nextStepsMatch[1]
        .split('\n')
        .map(line => line.replace(/^[-*•\d.\s]+/, '').trim())
        .filter(line => line.length > 2 && line.length < 50)
        .slice(0, 5);
    }

    // Fallback suggested steps if empty
    if (suggestedSteps.length === 0) {
      suggestedSteps = [
        'Audit Channel SEO',
        'Generate 30 Video Ideas',
        'Build Content Strategy',
        'Write Video Script'
      ];
    }

    // G. Try to automatically extract new memory facts from current user prompt or response
    // E.g., if user says "My channel is Nitin Tech" we want to extract it
    const nameMatch = prompt.match(/(?:my channel is|channel name is|call my channel)\s+([^,.]+)/i);
    if (nameMatch && !memory.channelName) {
      memory.channelName = nameMatch[1].trim();
      await memory.save();
    }
    const nicheMatch = prompt.match(/(?:my niche is|niche is|topic is|focus on)\s+([^,.]+)/i);
    if (nicheMatch && !memory.niche) {
      memory.niche = nicheMatch[1].trim();
      await memory.save();
    }

    // Save user message
    chat.messages.push({
      sender: 'user',
      text: prompt,
      createdAt: new Date()
    });

    // Save agent message
    chat.messages.push({
      sender: 'agent',
      text,
      structuredData,
      suggestedSteps,
      createdAt: new Date()
    });

    await chat.save();

    res.json({
      success: true,
      text,
      structuredData,
      suggestedSteps,
      memory
    });
  } catch (err) {
    console.error('Chat routing error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. POST /upload - Process document upload and extract variables
router.post('/upload', auth, async (req, res) => {
  const { fileData, mimeType, fileName } = req.body;
  if (!fileData) return res.status(400).json({ success: false, message: 'File data is required' });

  try {
    const { genAI, targetModel } = await getGeminiModel();
    const modelName = targetModel || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const promptText = `
Analyze the attached document containing YouTube analytics, stats, or metrics.
Extract the following information:
1. Total Views
2. Average CTR (Click-Through Rate) percentage (number only)
3. Total Watch Time in hours (number only)
4. Average Audience Retention percentage (number only)

Return ONLY a JSON block containing these fields:
{
  "views": number,
  "ctr": number,
  "watchTime": number,
  "retention": number
}
Ensure views, ctr, watchTime, and retention are parsed as numbers. Do not include any formatting text, markdown or tags.
    `;

    const fileBuffer = Buffer.from(fileData, 'base64');
    const result = await model.generateContent([
      {
        inlineData: {
          data: fileData,
          mimeType: mimeType || 'application/pdf'
        }
      },
      promptText
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const parsedStats = JSON.parse(cleanJson);

    // Save to YoutubeAgentMemory
    const memory = await YoutubeAgentMemory.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: {
          analyticsData: {
            views: parsedStats.views || 0,
            ctr: parsedStats.ctr || 0,
            watchTime: parsedStats.watchTime || 0,
            retention: parsedStats.retention || 0,
            parsedAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      stats: parsedStats,
      memory
    });
  } catch (err) {
    console.error('File parsing error:', err);
    res.status(500).json({ success: false, message: 'Failed to extract analytics: ' + err.message });
  }
});

// GET /oauth/client-id - Retrieve Google client ID for OAuth initialization
router.get('/oauth/client-id', async (req, res) => {
  res.json({
    success: true,
    clientId: process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
  });
});

// POST /oauth/connect - Exchange OAuth code for real YouTube channel data
router.post('/oauth/connect', auth, async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) {
    return res.status(400).json({ success: false, message: 'Authorization code and redirect URI are required' });
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Token exchange error:', tokenData);
      return res.status(400).json({ success: false, message: tokenData.error_description || 'Failed to exchange OAuth code' });
    }

    // 2. Fetch authenticated channel metadata from YouTube Data API
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const channelData = await channelResponse.json();
    if (!channelResponse.ok || !channelData.items || channelData.items.length === 0) {
      console.error('YouTube channel fetch error:', channelData);
      return res.status(400).json({ success: false, message: 'Failed to retrieve YouTube channel info or no channel found' });
    }

    const channelItem = channelData.items[0];
    const channelTitle = channelItem.snippet.title;
    const customUrl = channelItem.snippet.customUrl || `@channel_${channelItem.id}`;
    const subscribers = parseInt(channelItem.statistics.subscriberCount) || 0;
    const views = parseInt(channelItem.statistics.viewCount) || 0;
    const videoCount = parseInt(channelItem.statistics.videoCount) || 0;

    // Estimate watch time (views * 3 mins) & retention
    const estimatedWatchTime = Math.round(views * 0.05);
    const estimatedRetention = 58;

    // 3. Save connected YouTube channel data to YoutubeAgentMemory model
    const memory = await YoutubeAgentMemory.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: {
          channelName: customUrl,
          subscribers: subscribers,
          analyticsData: {
            views,
            ctr: 6.4,
            watchTime: estimatedWatchTime,
            retention: estimatedRetention,
            parsedAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      channel: {
        title: channelTitle,
        handle: customUrl,
        subscribers,
        views,
        videoCount,
        watchTime: estimatedWatchTime,
        retention: estimatedRetention
      },
      memory
    });
  } catch (err) {
    console.error('YouTube OAuth connection error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
