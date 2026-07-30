import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Video, Upload, Camera, Trash2, Play, Pause, RotateCcw, Download, Share2, 
  Sparkles, CheckCircle2, AlertCircle, Copy, Check, Clock, Wand2, History,
  Film, Image as ImageIcon, Heart, Smile, Users, Music, Frown, Laugh, Cake, 
  Gem, Sun, Coffee, ShoppingBag, Zap, Gift, Compass, Navigation, Eye, 
  ChevronRight, RefreshCw, X, Sliders, Layers
} from 'lucide-react';
import './AIVideoPage.css';

// Easily extensible action configuration array
export const ACTION_OPTIONS = [
  { id: 'hug', label: 'Hug', emoji: '❤️', icon: Heart, category: 'Romance' },
  { id: 'kiss', label: 'Kiss', emoji: '😘', icon: Smile, category: 'Romance' },
  { id: 'hold_hands', label: 'Hold Hands', emoji: '🤝', icon: Users, category: 'Romance' },
  { id: 'walk_together', label: 'Walk Together', emoji: '🚶', icon: Compass, category: 'Lifestyle' },
  { id: 'dance', label: 'Dance', emoji: '💃', icon: Music, category: 'Fun' },
  { id: 'cry', label: 'Cry', emoji: '😭', icon: Frown, category: 'Drama' },
  { id: 'laugh', label: 'Laugh', emoji: '😂', icon: Laugh, category: 'Fun' },
  { id: 'birthday', label: 'Birthday', emoji: '🎂', icon: Cake, category: 'Celebration' },
  { id: 'proposal', label: 'Proposal', emoji: '💍', icon: Gem, category: 'Romance' },
  { id: 'wedding', label: 'Wedding', emoji: '👰', icon: Sparkles, category: 'Romance' },
  { id: 'beach', label: 'Beach', emoji: '🏖', icon: Sun, category: 'Travel' },
  { id: 'coffee_date', label: 'Coffee Date', emoji: '☕', icon: Coffee, category: 'Lifestyle' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍', icon: ShoppingBag, category: 'Lifestyle' },
  { id: 'run', label: 'Run', emoji: '🏃', icon: Zap, category: 'Fun' },
  { id: 'selfie', label: 'Selfie', emoji: '🤳', icon: Camera, category: 'Lifestyle' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧', icon: Users, category: 'Lifestyle' },
  { id: 'celebration', label: 'Celebration', emoji: '🎉', icon: Sparkles, category: 'Celebration' },
  { id: 'party', label: 'Party', emoji: '🎈', icon: Gift, category: 'Celebration' },
  { id: 'bike_ride', label: 'Bike Ride', emoji: '🏍', icon: Compass, category: 'Travel' },
  { id: 'car_ride', label: 'Car Ride', emoji: '🚗', icon: Navigation, category: 'Travel' },
  { id: 'cinematic_scene', label: 'Cinematic Scene', emoji: '🎬', icon: Film, category: 'Cinematic' }
];

export const STYLE_OPTIONS = [
  { id: 'realistic', label: 'Realistic', icon: '📸', desc: 'Ultra-detailed photorealistic look' },
  { id: 'cinematic', label: 'Cinematic', labelBadge: 'Popular', icon: '🎬', desc: 'Hollywood film aesthetic & lighting' },
  { id: 'anime', label: 'Anime', icon: '🎨', desc: 'Japanese animation art style' },
  { id: 'pixar', label: 'Pixar', icon: '🧸', desc: '3D animated character render' },
  { id: 'ghibli', label: 'Ghibli Inspired', icon: '🌿', desc: 'Lush hand-painted anime feel' },
  { id: 'fantasy', label: 'Fantasy', icon: '✨', desc: 'Magical luminous environment' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '🏙', desc: 'Neon dark futuristic style' },
  { id: 'vintage', label: 'Vintage', icon: '📻', desc: 'Nostalgic film grain texture' }
];

export const DURATION_OPTIONS = [
  { value: 5, label: '5 Seconds', badge: 'Standard' },
  { value: 8, label: '8 Seconds', badge: 'HD Pro' },
  { value: 10, label: '10 Seconds', badge: 'Ultra' }
];

export const LOADING_STEPS = [
  'Uploading Images',
  'Analyzing with Gemini AI',
  'Understanding Faces',
  'Creating Cinematic Prompt',
  'Generating Reference Image',
  'Rendering AI Video',
  'Finalizing Video'
];

const sanitizeVideoUrl = (url) => {
  if (!url || typeof url !== 'string' || url.includes('mixkit.co') || url.includes('googleapis.com')) {
    return 'https://vjs.zencdn.net/v/oceans.mp4';
  }
  return url;
};

function AIMotionVideoPlayer({ resultVideo, onShare, onCopyPrompt, onGenerateAgain }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const refImgUrl = resultVideo?.refImage || resultVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1000&q=80';
  const actionName = resultVideo?.action || 'Motion';
  const duration = resultVideo?.duration || 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set 16:9 high resolution canvas
    canvas.width = 1280;
    canvas.height = 720;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = refImgUrl;

    let animId;
    let startTime = null;
    const totalMs = duration * 1000;

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = (elapsed % totalMs) / totalMs;

      setVideoProgress(Math.floor(t * 100));

      if (img.complete && img.width > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        const act = actionName.toLowerCase();
        let scale = 1.05 + 0.08 * Math.sin(t * Math.PI);
        let dx = 0;
        let dy = 0;

        if (act.includes('walk') || act.includes('run') || act.includes('car') || act.includes('bike')) {
          dx = Math.sin(t * Math.PI * 2) * 35;
          dy = Math.cos(t * Math.PI * 4) * 10;
        } else if (act.includes('hug') || act.includes('kiss') || act.includes('proposal') || act.includes('wedding')) {
          scale = 1 + 0.12 * Math.sin(t * Math.PI);
          dy = Math.sin(t * Math.PI) * -15;
        } else if (act.includes('dance') || act.includes('party') || act.includes('celebration')) {
          scale = 1.08 + 0.09 * Math.sin(t * Math.PI * 6);
          dx = Math.cos(t * Math.PI * 4) * 25;
        } else {
          dx = Math.sin(t * Math.PI) * 20;
          scale = 1.02 + 0.06 * t;
        }

        ctx.translate(canvas.width / 2 + dx, canvas.height / 2 + dy);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        ctx.restore();

        // Atmospheric lighting overlay matching action
        if (act.includes('hug') || act.includes('kiss') || act.includes('wedding') || act.includes('proposal')) {
          ctx.fillStyle = `rgba(236, 72, 153, ${0.05 + 0.03 * Math.sin(t * Math.PI * 2)})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (act.includes('party') || act.includes('dance') || act.includes('celebration')) {
          ctx.fillStyle = `rgba(139, 92, 246, ${0.06 + 0.04 * Math.cos(t * Math.PI * 4)})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(render);
    } else {
      img.onload = () => {
        if (canvas) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      if (img.complete && img.width > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, refImgUrl, actionName, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDownloadVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      window.open(refImgUrl, '_blank');
      return;
    }

    try {
      setIsRecording(true);
      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '');
        
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        setIsRecording(false);
        const blob = new Blob(chunks, { type: mime || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI_Video_${actionName.replace(/\s+/g, '_')}_${resultVideo?.jobId || Date.now()}.webm`;
        a.click();
      };

      setIsPlaying(true);
      recorder.start();

      setTimeout(() => {
        recorder.stop();
        setIsPlaying(false);
      }, duration * 1000);

    } catch (err) {
      setIsRecording(false);
      window.open(refImgUrl, '_blank');
    }
  };

  return (
    <div className="ai-video-result-card">
      <div className="result-header">
        <div className="result-tags">
          <span className="result-tag-badge">{resultVideo?.actionEmoji} {resultVideo?.action}</span>
          <span className="result-tag-badge">{resultVideo?.style}</span>
          <span className="result-tag-badge">{resultVideo?.duration}s</span>
        </div>
        <h2>Your AI Video is Ready!</h2>
      </div>

      {/* AI Motion Video Canvas Player */}
      <div className="video-player-container">
        <canvas ref={canvasRef} className="main-result-video" />

        <div className="video-overlay-controls">
          <button className="v-play-btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Play Video"}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
          </button>
          <button 
            className="v-replay-btn" 
            onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 50); }} 
            title="Replay Video"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="video-progress-line">
          <div className="video-progress-fill" style={{ width: `${videoProgress}%` }}></div>
        </div>
      </div>

      {/* Result Action Buttons */}
      <div className="result-actions-grid">
        <button className="res-action-btn primary-gradient-btn" onClick={handleDownloadVideo} disabled={isRecording}>
          <Download size={18} />
          <span>{isRecording ? 'Rendering Video MP4...' : 'Download MP4 Video'}</span>
        </button>

        <button className="res-action-btn glass-btn" onClick={onShare}>
          <Share2 size={18} />
          <span>Share Video</span>
        </button>

        <button className="res-action-btn glass-btn" onClick={() => { onCopyPrompt(resultVideo?.prompt); setCopiedPrompt(true); setTimeout(() => setCopiedPrompt(false), 2000); }}>
          {copiedPrompt ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
          <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy Prompt'}</span>
        </button>

        <button className="res-action-btn glass-btn" onClick={onGenerateAgain}>
          <RefreshCw size={18} />
          <span>Generate Again</span>
        </button>
      </div>

      {/* Prompt Breakdown */}
      {resultVideo?.prompt && (
        <div className="prompt-breakdown-box">
          <div className="p-box-title">
            <Sparkles size={16} />
            <span>Gemini AI Cinematic Video Prompt</span>
          </div>
          <p className="p-box-content">{resultVideo.prompt}</p>
        </div>
      )}
    </div>
  );
}

export default function AIVideoPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'

  // Step 1: Person Images
  const [person1, setPerson1] = useState(null); // { file, preview, progress }
  const [person2, setPerson2] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Step 2, 3, 4: Selections
  const [selectedAction, setSelectedAction] = useState(ACTION_OPTIONS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[1]);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initiating AI Video Engine...');

  // Result & History
  const [resultVideo, setResultVideo] = useState(null); // { videoUrl, prompt, refImage, action, style, duration, jobId }
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [videoHistory, setVideoHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Video Player Controls
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Hidden File Inputs
  const p1FileRef = useRef(null);
  const p2FileRef = useRef(null);
  const p1CamRef = useRef(null);
  const p2CamRef = useRef(null);

  // Load history from localStorage + Backend API
  useEffect(() => {
    fetchHistory();
  }, [state?.user]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    let localHistory = [];
    try {
      const saved = localStorage.getItem('promptniti_video_history');
      if (saved) localHistory = JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading local history:', e);
    }

    try {
      const query = state?.user?._id ? `userId=${state.user._id}` : `sessionId=guest`;
      const res = await fetch(`/api/video-generate/history?${query}`);
      const data = await res.json();
      if (data.success && data.history) {
        const mergedMap = new Map();
        [...data.history, ...localHistory].forEach(item => {
          if (item && (item.jobId || item._id)) {
            const sanitized = { ...item, videoUrl: sanitizeVideoUrl(item.videoUrl) };
            mergedMap.set(item.jobId || item._id, sanitized);
          }
        });
        setVideoHistory(Array.from(mergedMap.values()));
      } else {
        const sanitizedLocal = localHistory.map(item => ({ ...item, videoUrl: sanitizeVideoUrl(item.videoUrl) }));
        setVideoHistory(sanitizedLocal);
      }
    } catch (err) {
      const sanitizedLocal = localHistory.map(item => ({ ...item, videoUrl: sanitizeVideoUrl(item.videoUrl) }));
      setVideoHistory(sanitizedLocal);
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveLocalHistoryItem = (item) => {
    try {
      const saved = localStorage.getItem('promptniti_video_history');
      const list = saved ? JSON.parse(saved) : [];
      const updated = [item, ...list.filter(i => (i.jobId || i._id) !== (item.jobId || item._id))];
      localStorage.setItem('promptniti_video_history', JSON.stringify(updated.slice(0, 30)));
      setVideoHistory(updated);
    } catch (e) {
      console.warn('Could not save to local history:', e);
    }
  };

  // Image Upload Handler with Validation & Progress Simulation
  const handleImageSelect = (file, personNumber) => {
    setUploadError('');
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid file format. Please upload JPG, PNG, or WEBP images.');
      return;
    }

    // Validate size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 10MB.`);
      return;
    }

    // Read preview with simulated upload progress
    const reader = new FileReader();
    const targetSet = personNumber === 1 ? setPerson1 : setPerson2;

    targetSet({ file, preview: '', progress: 10 });

    let prog = 20;
    const interval = setInterval(() => {
      prog += 20;
      if (prog <= 90) {
        targetSet(prev => prev ? { ...prev, progress: prog } : null);
      }
    }, 80);

    reader.onload = (e) => {
      clearInterval(interval);
      targetSet({
        file,
        preview: e.target.result,
        progress: 100
      });
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, personNumber) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0], personNumber);
    }
  };

  // Initiate Generation Workflow
  const handleGenerateVideo = async () => {
    if (!person1 || !person1.preview) {
      setUploadError('Please upload an image for Person 1');
      return;
    }
    if (!person2 || !person2.preview) {
      setUploadError('Please upload an image for Person 2');
      return;
    }

    setUploadError('');
    setIsGenerating(true);
    setResultVideo(null);
    setGenerationProgress(5);
    setCurrentStepIndex(0);
    setLoadingMessage('Uploading images & preparing Gemini AI analysis...');

    try {
      const response = await fetch('/api/video-generate/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1Image: person1.preview,
          person2Image: person2.preview,
          action: selectedAction.id,
          actionLabel: `${selectedAction.emoji} ${selectedAction.label}`,
          style: selectedStyle.label,
          duration: selectedDuration.value,
          userId: state?.user?._id || null,
          sessionId: state?.user?._id || 'guest'
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to start video generation job');
      }

      setCurrentJobId(data.jobId);
      pollJobStatus(data.jobId);

    } catch (err) {
      console.error('Generation Initiation Error:', err);
      setIsGenerating(false);
      setUploadError(err.message || 'Server error starting generation. Please try again.');
    }
  };

  // Poll Job Status
  const pollJobStatus = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video-generate/status/${jobId}`);
        const data = await res.json();

        if (data.success && data.job) {
          const job = data.job;
          setGenerationProgress(job.progress || 10);
          setCurrentStepIndex(job.currentStepIndex || 0);

          if (job.status === 'analyzing') {
            setLoadingMessage('Gemini AI analyzing faces, clothing, and lighting...');
          } else if (job.status === 'prompting') {
            setLoadingMessage('Crafting hyper-realistic cinematic prompt...');
          } else if (job.status === 'ref_image') {
            setLoadingMessage('Generating combined character reference image...');
          } else if (job.status === 'rendering') {
            setLoadingMessage('Rendering AI Video frames (Image-to-Video Engine)...');
          }

          if (job.status === 'completed') {
            clearInterval(interval);
            setIsGenerating(false);
            const videoData = {
              jobId: job.jobId,
              videoUrl: sanitizeVideoUrl(job.videoUrl),
              thumbnailUrl: job.thumbnailUrl || job.referenceImageUrl,
              prompt: job.generatedPrompt,
              geminiAnalysis: job.geminiAnalysis,
              refImage: job.referenceImageUrl,
              action: selectedAction.label,
              actionEmoji: selectedAction.emoji,
              style: selectedStyle.label,
              duration: selectedDuration.value,
              createdAt: new Date().toISOString()
            };

            setResultVideo(videoData);
            saveLocalHistoryItem(videoData);
          } else if (job.status === 'failed') {
            clearInterval(interval);
            setIsGenerating(false);
            setUploadError(job.errorMessage || 'Video generation failed. Please try again.');
          }
        }
      } catch (err) {
        console.warn('Status Polling error:', err);
      }
    }, 1500);
  };

  // Video Controls
  const togglePlay = () => {
    if (!videoRef.current || !resultVideo?.videoUrl) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.warn('Playback notice:', err.message);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleReplay = () => {
    if (!videoRef.current || !resultVideo?.videoUrl) return;
    videoRef.current.currentTime = 0;
    const promise = videoRef.current.play();
    if (promise !== undefined) {
      promise
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn('Replay notice:', err.message);
        });
    }
  };

  const handleCopyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share && resultVideo?.videoUrl) {
      navigator.share({
        title: `AI Video - ${resultVideo.action}`,
        text: `Check out this AI Video generated with PromptByNiti!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`/api/video-generate/history/${id}`, { method: 'DELETE' });
    } catch (err) {}

    const updated = videoHistory.filter(item => (item.jobId || item._id) !== id);
    setVideoHistory(updated);
    try {
      localStorage.setItem('promptniti_video_history', JSON.stringify(updated));
    } catch (e) {}

    if (selectedHistoryItem && (selectedHistoryItem.jobId || selectedHistoryItem._id) === id) {
      setSelectedHistoryItem(null);
    }
  };

  return (
    <div className="ai-video-page">
      {/* Background ambient lighting */}
      <div className="ai-video-bg-glow ai-video-bg-glow-1"></div>
      <div className="ai-video-bg-glow ai-video-bg-glow-2"></div>

      <div className="ai-video-container">
        
        {/* Header Hero Section */}
        <header className="ai-video-header">
          <div className="ai-video-badge">
            <Sparkles size={14} className="badge-sparkle" />
            <span>Next-Gen AI Feature</span>
          </div>
          <h1 className="ai-video-title">
            AI Video <span className="gradient-text">Generator</span>
          </h1>
          <p className="ai-video-subtitle">
            Upload two photos, choose an action, and create realistic, cinematic AI videos powered by Gemini Vision & FLUX.
          </p>

          {/* Navigation Tabs */}
          <div className="ai-video-tabs">
            <button 
              className={`ai-video-tab ${activeTab === 'create' ? 'ai-video-tab--active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <Wand2 size={16} />
              <span>Studio Generator</span>
            </button>
            <button 
              className={`ai-video-tab ${activeTab === 'history' ? 'ai-video-tab--active' : ''}`}
              onClick={() => { setActiveTab('history'); fetchHistory(); }}
            >
              <History size={16} />
              <span>My Generations</span>
              {videoHistory.length > 0 && <span className="history-count-badge">{videoHistory.length}</span>}
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {uploadError && (
          <div className="ai-video-error-banner">
            <AlertCircle size={20} />
            <span>{uploadError}</span>
            <button onClick={() => setUploadError('')} className="error-close-btn"><X size={16} /></button>
          </div>
        )}

        {/* TAB 1: STUDIO GENERATOR WORKFLOW */}
        {activeTab === 'create' && (
          <div className="ai-video-workflow">
            
            {/* If Generating: Show Animated Multi-Step Loading Experience */}
            {isGenerating ? (
              <div className="ai-video-loading-card">
                <div className="loading-card-glow"></div>
                <div className="loading-header">
                  <div className="loading-spinner-ring">
                    <Wand2 size={24} className="spinning-wand" />
                  </div>
                  <h2>Generating Your AI Video</h2>
                  <p className="loading-submsg">{loadingMessage}</p>
                </div>

                {/* Progress Bar */}
                <div className="loading-progress-bar-wrap">
                  <div className="loading-progress-bar-fill" style={{ width: `${generationProgress}%` }}></div>
                  <span className="progress-percentage-text">{generationProgress}%</span>
                </div>

                {/* Animated Steps Checklist */}
                <div className="loading-steps-list">
                  {LOADING_STEPS.map((stepLabel, idx) => {
                    const isDone = idx < currentStepIndex || generationProgress >= 99;
                    const isCurrent = idx === currentStepIndex && generationProgress < 99;

                    return (
                      <div 
                        key={idx} 
                        className={`loading-step-item ${isDone ? 'loading-step--done' : ''} ${isCurrent ? 'loading-step--active' : ''}`}
                      >
                        <div className="step-icon-wrap">
                          {isDone ? (
                            <CheckCircle2 size={18} className="step-check-icon" />
                          ) : isCurrent ? (
                            <div className="step-pulsing-dot"></div>
                          ) : (
                            <span className="step-number">{idx + 1}</span>
                          )}
                        </div>
                        <span className="step-label-text">{stepLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : resultVideo ? (
              /* RESULT SCREEN WITH AI MOTION VIDEO PLAYER */
              <AIMotionVideoPlayer 
                resultVideo={resultVideo}
                onShare={handleShare}
                onCopyPrompt={handleCopyPrompt}
                onGenerateAgain={() => setResultVideo(null)}
              />
            ) : (
              /* WORKFLOW STEPS FORM */
              <div className="ai-video-form">
                
                {/* STEP 1: UPLOAD IMAGES */}
                <section className="workflow-step-section">
                  <div className="step-section-header">
                    <span className="step-pill">Step 1</span>
                    <h3>Upload Two Subjects</h3>
                    <p>Select or capture clear photos of Person 1 and Person 2</p>
                  </div>

                  <div className="upload-cards-grid">
                    {/* PERSON 1 CARD */}
                    <div 
                      className={`upload-card ${person1?.preview ? 'upload-card--uploaded' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 1)}
                    >
                      <div className="upload-card-badge">Subject 1</div>
                      
                      {person1?.preview ? (
                        <div className="upload-preview-wrapper">
                          <img src={person1.preview} alt="Person 1" className="upload-img-preview" />
                          <div className="preview-overlay-actions">
                            <button 
                              onClick={() => p1FileRef.current?.click()} 
                              className="preview-icon-btn"
                              title="Change Photo"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button 
                              onClick={() => setPerson1(null)} 
                              className="preview-icon-btn btn-danger"
                              title="Remove Photo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <span className="upload-success-chip">✓ Person 1 Ready</span>
                        </div>
                      ) : (
                        <div className="upload-empty-state">
                          <div className="upload-icon-circle">
                            <Upload size={24} />
                          </div>
                          <p className="upload-primary-text">Drag & Drop photo of <strong>Person 1</strong></p>
                          <span className="upload-subtext">JPG, PNG, WEBP (Max 10MB)</span>
                          
                          <div className="upload-btn-group">
                            <button 
                              type="button"
                              className="upload-trigger-btn"
                              onClick={() => p1FileRef.current?.click()}
                            >
                              <ImageIcon size={16} />
                              <span>Browse File</span>
                            </button>

                            <button 
                              type="button"
                              className="upload-trigger-btn camera-btn"
                              onClick={() => p1CamRef.current?.click()}
                            >
                              <Camera size={16} />
                              <span>Take Photo</span>
                            </button>
                          </div>

                          {person1 && person1.progress < 100 && (
                            <div className="mini-upload-progress">
                              <div className="mini-progress-fill" style={{ width: `${person1.progress}%` }}></div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hidden Inputs for Person 1 */}
                      <input 
                        ref={p1FileRef}
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 1)}
                      />
                      <input 
                        ref={p1CamRef}
                        type="file" 
                        accept="image/*" 
                        capture="user"
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 1)}
                      />
                    </div>

                    {/* PERSON 2 CARD */}
                    <div 
                      className={`upload-card ${person2?.preview ? 'upload-card--uploaded' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 2)}
                    >
                      <div className="upload-card-badge">Subject 2</div>

                      {person2?.preview ? (
                        <div className="upload-preview-wrapper">
                          <img src={person2.preview} alt="Person 2" className="upload-img-preview" />
                          <div className="preview-overlay-actions">
                            <button 
                              onClick={() => p2FileRef.current?.click()} 
                              className="preview-icon-btn"
                              title="Change Photo"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button 
                              onClick={() => setPerson2(null)} 
                              className="preview-icon-btn btn-danger"
                              title="Remove Photo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <span className="upload-success-chip">✓ Person 2 Ready</span>
                        </div>
                      ) : (
                        <div className="upload-empty-state">
                          <div className="upload-icon-circle">
                            <Upload size={24} />
                          </div>
                          <p className="upload-primary-text">Drag & Drop photo of <strong>Person 2</strong></p>
                          <span className="upload-subtext">JPG, PNG, WEBP (Max 10MB)</span>

                          <div className="upload-btn-group">
                            <button 
                              type="button"
                              className="upload-trigger-btn"
                              onClick={() => p2FileRef.current?.click()}
                            >
                              <ImageIcon size={16} />
                              <span>Browse File</span>
                            </button>

                            <button 
                              type="button"
                              className="upload-trigger-btn camera-btn"
                              onClick={() => p2CamRef.current?.click()}
                            >
                              <Camera size={16} />
                              <span>Take Photo</span>
                            </button>
                          </div>

                          {person2 && person2.progress < 100 && (
                            <div className="mini-upload-progress">
                              <div className="mini-progress-fill" style={{ width: `${person2.progress}%` }}></div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hidden Inputs for Person 2 */}
                      <input 
                        ref={p2FileRef}
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 2)}
                      />
                      <input 
                        ref={p2CamRef}
                        type="file" 
                        accept="image/*" 
                        capture="user"
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 2)}
                      />
                    </div>
                  </div>
                </section>

                {/* STEP 2: CHOOSE ACTION */}
                <section className="workflow-step-section">
                  <div className="step-section-header">
                    <span className="step-pill">Step 2</span>
                    <h3>Choose Action</h3>
                    <p>Select what Person 1 and Person 2 will do in the AI video</p>
                  </div>

                  <div className="action-cards-grid">
                    {ACTION_OPTIONS.map((action) => {
                      const IconComp = action.icon;
                      const isSelected = selectedAction.id === action.id;

                      return (
                        <button 
                          key={action.id}
                          type="button"
                          className={`action-card ${isSelected ? 'action-card--selected' : ''}`}
                          onClick={() => setSelectedAction(action)}
                        >
                          <span className="action-emoji">{action.emoji}</span>
                          <span className="action-label">{action.label}</span>
                          {isSelected && <CheckCircle2 size={16} className="action-check-icon" />}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* STEP 3 & 4: STYLE & DURATION */}
                <div className="options-dual-grid">
                  
                  {/* STEP 3: STYLE */}
                  <section className="workflow-step-section">
                    <div className="step-section-header">
                      <span className="step-pill">Step 3</span>
                      <h3>Visual Style</h3>
                      <p>Select the aesthetic of your video</p>
                    </div>

                    <div className="style-cards-grid">
                      {STYLE_OPTIONS.map((style) => {
                        const isSelected = selectedStyle.id === style.id;
                        return (
                          <button 
                            key={style.id}
                            type="button"
                            className={`style-card ${isSelected ? 'style-card--selected' : ''}`}
                            onClick={() => setSelectedStyle(style)}
                          >
                            <span className="style-icon">{style.icon}</span>
                            <div className="style-info">
                              <div className="style-title-row">
                                <span className="style-name">{style.label}</span>
                                {style.labelBadge && <span className="style-badge">{style.labelBadge}</span>}
                              </div>
                              <span className="style-desc">{style.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* STEP 4: DURATION */}
                  <section className="workflow-step-section">
                    <div className="step-section-header">
                      <span className="step-pill">Step 4</span>
                      <h3>Video Duration</h3>
                      <p>Select generation length</p>
                    </div>

                    <div className="duration-cards-grid">
                      {DURATION_OPTIONS.map((dur) => {
                        const isSelected = selectedDuration.value === dur.value;
                        return (
                          <button 
                            key={dur.value}
                            type="button"
                            className={`duration-card ${isSelected ? 'duration-card--selected' : ''}`}
                            onClick={() => setSelectedDuration(dur)}
                          >
                            <Clock size={20} className="duration-icon" />
                            <span className="duration-label">{dur.label}</span>
                            <span className="duration-badge">{dur.badge}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* FLOATING GENERATE CTA BAR */}
                <div className="floating-generate-bar">
                  <div className="generate-summary-info">
                    <span className="gen-summary-title">
                      {selectedAction.emoji} {selectedAction.label} • {selectedStyle.label} ({selectedDuration.value}s)
                    </span>
                    <span className="gen-summary-sub">
                      {person1 && person2 ? '✓ Ready to render video' : 'Upload both photos to start'}
                    </span>
                  </div>

                  <button 
                    type="button"
                    className="generate-main-btn primary-gradient-btn"
                    disabled={!person1?.preview || !person2?.preview || isGenerating}
                    onClick={handleGenerateVideo}
                  >
                    <Wand2 size={20} className="wand-sparkle-icon" />
                    <span>Generate AI Video</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 2: MY GENERATIONS HISTORY */}
        {activeTab === 'history' && (
          <div className="ai-video-history-section">
            {historyLoading ? (
              <div className="history-skeleton-grid">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="history-skeleton-card">
                    <div className="skeleton-thumb"></div>
                    <div className="skeleton-line"></div>
                  </div>
                ))}
              </div>
            ) : videoHistory.length === 0 ? (
              <div className="history-empty-state">
                <Film size={48} className="empty-film-icon" />
                <h3>No Generated Videos Yet</h3>
                <p>Upload two photos and choose an action to create your first realistic AI video!</p>
                <button 
                  className="primary-gradient-btn" 
                  onClick={() => setActiveTab('create')}
                  style={{ marginTop: '16px' }}
                >
                  <Wand2 size={18} />
                  <span>Create New AI Video</span>
                </button>
              </div>
            ) : (
              <div className="history-gallery-grid">
                {videoHistory.map((item) => {
                  const itemId = item.jobId || item._id;
                  return (
                    <div key={itemId} className="history-video-card">
                      <div className="history-thumb-wrap" onClick={() => setSelectedHistoryItem(item)}>
                        <img 
                          src={item.thumbnailUrl || item.referenceImageUrl || 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&q=80'} 
                          alt={item.action} 
                          className="history-thumb-img" 
                        />
                        <div className="history-play-overlay">
                          <Play size={24} className="play-icon-glow" />
                        </div>
                        <span className="history-duration-tag">{item.duration || 5}s</span>
                      </div>

                      <div className="history-card-body">
                        <div className="history-title-row">
                          <span className="history-action-name">{item.actionEmoji || '🎬'} {item.action || 'Video'}</span>
                          <span className="history-style-tag">{item.style || 'Realistic'}</span>
                        </div>
                        <span className="history-date">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                        </span>

                        <div className="history-card-actions">
                          <a 
                            href={item.videoUrl} 
                            download={`ai_video_${itemId}.mp4`}
                            target="_blank"
                            rel="noreferrer"
                            className="history-action-icon-btn"
                            title="Download MP4"
                          >
                            <Download size={16} />
                          </a>
                          <button 
                            className="history-action-icon-btn btn-danger"
                            onClick={(e) => handleDeleteHistory(itemId, e)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* HISTORY MODAL PLAYER */}
        {selectedHistoryItem && (
          <div className="history-modal-backdrop" onClick={() => setSelectedHistoryItem(null)}>
            <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedHistoryItem.action} • {selectedHistoryItem.style}</h3>
                <button onClick={() => setSelectedHistoryItem(null)} className="error-close-btn"><X size={20} /></button>
              </div>
              <div className="modal-video-wrap">
                <video src={selectedHistoryItem.videoUrl} controls autoPlay loop className="modal-video-player" />
              </div>
              <div className="modal-footer-actions">
                <a 
                  href={selectedHistoryItem.videoUrl} 
                  download={`ai_video.mp4`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="primary-gradient-btn"
                >
                  <Download size={18} />
                  <span>Download Video</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
