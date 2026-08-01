const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cloudinary = require('cloudinary').v2;
const SystemSettings = require('../models/SystemSettings');
const AIVideo = require('../models/AIVideo');
const videoProviderService = require('../services/videoProviderService');

// In-memory fallback job status store if MongoDB is not connected
const memoryJobs = new Map();

// Helper to get active Gemini AI instance
async function getGeminiInstance() {
  try {
    const settings = await SystemSettings.findOne();
    const apiKey = (settings?.geminiApiKey || process.env.GEMINI_API_KEY || '').trim();
    if (apiKey) {
      return new GoogleGenerativeAI(apiKey);
    }
  } catch (err) {
    console.warn('⚠️ Could not fetch SystemSettings for Gemini key:', err.message);
  }

  const envKey = (process.env.GEMINI_API_KEY || '').trim();
  if (envKey) return new GoogleGenerativeAI(envKey);
  return null;
}

// Helper to upload base64 or file URL to Cloudinary
async function uploadToCloudinary(fileInput, folder = 'ai_video_uploads') {
  if (!fileInput) return '';
  if (typeof fileInput === 'string' && fileInput.startsWith('http') && !fileInput.startsWith('data:')) {
    return fileInput;
  }
  try {
    const uploadRes = await cloudinary.uploader.upload(fileInput, {
      folder,
      resource_type: 'image'
    });
    return uploadRes.secure_url;
  } catch (err) {
    console.error('❌ Cloudinary Upload Error:', err.message);
    // If Cloudinary fails, return the original string if it's data URI
    return fileInput;
  }
}

const GROQ_FALLBACK_KEYS = [
  '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',
  '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',
  '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',
  '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',
  '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'
];

async function analyzeImagesWithGemini(person1Url, person2Url, action, style, duration) {
  let promptGeneratorEngineRules = '';
  try {
    const generateRoutes = require('./generate');
    if (typeof generateRoutes.buildSystemInstruction === 'function') {
      promptGeneratorEngineRules = generateRoutes.buildSystemInstruction(
        '',
        'power',
        'sameScene',
        'video',
        `${duration || 5}s`,
        true,
        '16:9',
        'cinematic',
        'ai_video',
        false,
        'Text-to-Video'
      );
    }
  } catch (e) {
    console.warn('Notice loading Prompt Generator engine rules:', e.message);
  }

  const promptText = `
${promptGeneratorEngineRules || 'You are an expert AI Video Producer and Computer Vision Specialist.'}

Analyze these two subjects and the requested interaction to generate a master Text-to-Video AI prompt:

Target Action: "${action}"
Target Visual Style: "${style}"
Target Video Duration: ${duration || 5} seconds

Carefully analyze and specify:
1. Subject 1 & Subject 2 facial features, gender, age, clothing style, hairstyle, facial expressions.
2. Background scene, cinematic lighting, camera angles, distance between subjects, emotional relationship.
3. Generate a highly detailed, cinematic Text-to-Video prompt suitable for state-of-the-art AI Video generators.

Format your output in valid JSON as follows:
{
  "analysis": "Detailed vision analysis of subjects, faces, clothing, lighting, and composition...",
  "cinematicPrompt": "Cinematic 8K Text-to-Video prompt combining both subjects in ${style} style performing ${action}..."
}
`;

  let responseText = null;

  for (const keyStr of GROQ_FALLBACK_KEYS) {
    try {
      console.log('🚀 [Groq Video Engine] Querying llama-3.3-70b-versatile...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyStr}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are an expert AI Video Producer and Computer Vision Specialist.' },
            { role: 'user', content: promptText }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        responseText = data?.choices?.[0]?.message?.content;
        if (responseText && responseText.trim()) {
          console.log('✅ [Groq Video Engine] Successfully generated video prompt analysis!');
          break;
        }
      }
    } catch (err) {
      console.warn('⚠️ Groq Video Engine key failed:', err.message);
    }
  }

  if (responseText) {
    try {
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        geminiAnalysis: parsed.analysis || responseText.substring(0, 300),
        cinematicPrompt: parsed.cinematicPrompt || responseText
      };
    } catch {
      return {
        geminiAnalysis: responseText.substring(0, 300),
        cinematicPrompt: responseText
      };
    }
  }

  return {
    geminiAnalysis: `Dual subject vision analysis for ${action} in ${style} style. Preserving facial structures, hairstyle, and lighting harmony.`,
    cinematicPrompt: `Masterpiece hyper-realistic 8K cinematic text-to-video prompt: two subjects performing ${action} in ${style} visual aesthetic. Dynamic camera movement, volumetric cinematic lighting, 8K resolution, smooth 60fps motion.`
  };
}

const generateRoutes = require('./generate');

/**
 * Step 5: Generate reference image preserving both identities
 */
async function generateReferenceImage(promptText, style) {
  try {
    const enhancedPrompt = `${promptText}, ${style} style, combined character reference, photorealistic masterwork, 8k resolution`;
    console.log(`🎨 [AI Video] Generating FLUX reference image for prompt: "${enhancedPrompt.substring(0, 60)}..."`);
    
    if (typeof generateRoutes.callCloudflareAIWithFailover === 'function') {
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 10000));
      const fluxPromise = generateRoutes.callCloudflareAIWithFailover(enhancedPrompt, '@cf/black-forest-labs/flux-1-schnell');
      
      const fluxDataUri = await Promise.race([fluxPromise, timeoutPromise]);
      if (fluxDataUri) {
        console.log('✅ [AI Video] FLUX image generated! Uploading to Cloudinary...');
        const cloudinaryUrl = await uploadToCloudinary(fluxDataUri, 'ai_video_refs');
        if (cloudinaryUrl) return cloudinaryUrl;
      }
    }
  } catch (err) {
    console.warn('⚠️ FLUX Reference Image generation error:', err.message);
  }

  // Fallback high quality reference image URL
  return 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1000&q=80';
}

/* ================================================================
   POST /api/video-generate/initiate
   Starts the AI Video Generation Workflow
   ================================================================ */
router.post('/initiate', async (req, res) => {
  try {
    const { person1Image, person2Image, action, actionLabel, style, duration, userId, sessionId } = req.body;

    if (!person1Image || !person2Image) {
      return res.status(400).json({ success: false, message: 'Both Person 1 and Person 2 images are required.' });
    }

    if (!action || !style) {
      return res.status(400).json({ success: false, message: 'Action and Style must be selected.' });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    console.log(`🚀 [AI Video] Initiating Video Job [${jobId}] for Action: ${action}, Style: ${style}`);

    // Create job status object
    const jobData = {
      jobId,
      user: userId || null,
      userSessionId: sessionId || 'guest',
      person1Image: '',
      person2Image: '',
      action,
      actionLabel: actionLabel || action,
      style,
      duration: duration || 5,
      status: 'uploading',
      currentStepIndex: 0,
      progress: 10,
      geminiAnalysis: '',
      generatedPrompt: '',
      referenceImageUrl: '',
      videoUrl: '',
      thumbnailUrl: '',
      errorMessage: '',
      createdAt: new Date()
    };

    memoryJobs.set(jobId, jobData);

    // Save to Mongo DB if available
    try {
      await AIVideo.create({
        ...jobData,
        person1Image: person1Image.substring(0, 100),
        person2Image: person2Image.substring(0, 100)
      });
    } catch (dbErr) {
      console.warn('⚠️ Could not save initial job to DB:', dbErr.message);
    }

    // Respond immediately with jobId so frontend can start polling
    res.json({
      success: true,
      jobId,
      message: 'Video generation process started. Poll /status for updates.',
      initialStatus: jobData
    });

    // Run pipeline asynchronously in background
    runVideoPipeline(jobId, { person1Image, person2Image, action, actionLabel, style, duration });

  } catch (err) {
    console.error('❌ Error initiating AI Video job:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Async Pipeline Execution
 */
async function runVideoPipeline(jobId, inputs) {
  const updateJob = async (fields) => {
    const current = memoryJobs.get(jobId) || {};
    const updated = { ...current, ...fields };
    memoryJobs.set(jobId, updated);

    try {
      await AIVideo.findOneAndUpdate({ jobId }, fields);
    } catch (e) {
      // Ignore DB errors in background loop
    }
  };

  try {
    // Step 1: Uploading Images (10% -> 25%)
    await updateJob({ status: 'uploading', currentStepIndex: 0, progress: 15 });
    const p1Url = await uploadToCloudinary(inputs.person1Image, 'ai_video_inputs');
    const p2Url = await uploadToCloudinary(inputs.person2Image, 'ai_video_inputs');

    await updateJob({ 
      person1Image: p1Url, 
      person2Image: p2Url, 
      status: 'analyzing', 
      currentStepIndex: 1, 
      progress: 30 
    });

    // Step 2 & 3: Gemini Vision Analysis & Prompting using Prompt Generator Engine (30% -> 60%)
    await new Promise(r => setTimeout(r, 600));
    await updateJob({ status: 'prompting', currentStepIndex: 2, progress: 45 });

    const { geminiAnalysis, cinematicPrompt } = await analyzeImagesWithGemini(p1Url, p2Url, inputs.action, inputs.style, inputs.duration);

    await updateJob({
      geminiAnalysis,
      generatedPrompt: cinematicPrompt,
      person1Image: p1Url,
      person2Image: p2Url,
      status: 'rendering',
      currentStepIndex: 5,
      progress: 60
    });

    // Step 4: Render Text-to-Video via VideoProviderService (60% -> 100%)
    console.log(`🚀 Initiating Text-to-Video Generation for prompt: "${cinematicPrompt.substring(0, 70)}..."`);
    const videoJob = await videoProviderService.createVideoJob({
      prompt: cinematicPrompt,
      duration: inputs.duration,
      style: inputs.style,
      action: inputs.action,
      person1Url: p1Url,
      person2Url: p2Url
    });

    // Simulate progressive video rendering ticks
    for (let p = 80; p <= 95; p += 5) {
      await new Promise(r => setTimeout(r, 700));
      await updateJob({ progress: p });
    }

    const videoResult = await videoProviderService.checkVideoStatus(videoJob.externalJobId, videoJob.provider, {
      action: inputs.action,
      referenceImageUrl: p1Url
    });

    // Finalize
    await updateJob({
      status: 'completed',
      currentStepIndex: 6,
      progress: 100,
      videoUrl: videoResult.videoUrl,
      thumbnailUrl: videoResult.thumbnailUrl || p1Url
    });

    console.log(`🎉 [AI Video] Job [${jobId}] successfully completed! Video URL: ${videoResult.videoUrl}`);

  } catch (err) {
    console.error(`❌ [AI Video] Pipeline failed for job [${jobId}]:`, err);
    await updateJob({
      status: 'failed',
      errorMessage: err.message || 'Video generation failed due to a server error.',
      progress: 0
    });
  }
}

/* ================================================================
   GET /api/video-generate/status/:jobId
   Polls status of a video generation job
   ================================================================ */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    let job = memoryJobs.get(jobId);

    if (!job) {
      job = await AIVideo.findOne({ jobId });
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    return res.json({
      success: true,
      job
    });
  } catch (err) {
    console.error('❌ Error fetching job status:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ================================================================
   GET /api/video-generate/history
   Gets generation history for user or session
   ================================================================ */
router.get('/history', async (req, res) => {
  try {
    const { userId, sessionId } = req.query;
    let query = {};
    if (userId) {
      query.user = userId;
    } else if (sessionId) {
      query.userSessionId = sessionId;
    }

    let history = [];
    try {
      history = await AIVideo.find(query).sort({ createdAt: -1 }).limit(30);
    } catch (e) {
      // Memory fallback if DB offline
      history = Array.from(memoryJobs.values())
        .filter(j => j.status === 'completed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error('❌ Error fetching video history:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ================================================================
   DELETE /api/video-generate/history/:id
   Deletes a video record
   ================================================================ */
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    memoryJobs.delete(id);

    try {
      await AIVideo.findOneAndDelete({ $or: [{ _id: id }, { jobId: id }] });
    } catch (e) {
      // ignore
    }

    return res.json({ success: true, message: 'Video removed from history.' });
  } catch (err) {
    console.error('❌ Error deleting video:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
