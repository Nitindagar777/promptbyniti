import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Send, Sparkles, Database, Globe, RefreshCw,
  Upload, Check, ArrowRight, ShieldCheck, Cpu,
  Layers, Plus, Zap, Search, Info, X as CloseIcon,
  Code, Terminal, Smartphone, Gamepad2, Shield,
  Server, Palette, Briefcase, TrendingUp, PenTool,
  BookOpen, DollarSign, Heart, Compass, Calendar,
  MessageSquare, BarChart2, Play, CheckCircle, ArrowLeft,
  Home, Video, Image, FileText, Settings, Users, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SEOHead from '../components/SEOHead';
import './AgentSandboxPage.css';

export default function AgentSandboxPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  // Onboarding & Active Tabs States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('agent_sandbox_active_tab') || 'overview';
  });
  const [simStep, setSimStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSimActive, setIsSimActive] = useState(true);
  const [chatSimStep, setChatSimStep] = useState(0);
  const [auditingRowId, setAuditingRowId] = useState(null);
  const [evaluatingIdeaId, setEvaluatingIdeaId] = useState(null);

  // Onboarding Wizard Form State
  const [wizardData, setWizardData] = useState({
    channelName: '',
    niche: '',
    language: 'English',
    audience: '',
    country: 'United States',
    goal: '',
    uploadFrequency: '2 Videos / Week',
    tone: 'Friendly & Informative',
    editingStyle: 'Fast-paced / Minimalist',
    brandColor: '#FF0000',
    competitors: ''
  });

  // Long-Term Channel Memory State
  const [memory, setMemory] = useState({
    channelName: '@promptbyniti',
    niche: 'prompt generate',
    audience: '',
    brandColor: '',
    country: '',
    goal: '',
    tone: '',
    editingStyle: '',
    uploadFrequency: '',
    subscribers: 1250,
    competitors: [],
    analyticsData: {
      views: 124500,
      ctr: 6.1,
      watchTime: 4200,
      retention: 62,
      parsedAt: new Date()
    }
  });

  // Dynamic suggestions state
  const [suggestions, setSuggestions] = useState([
    { id: 1, title: '💡 Generate Shorts & Video Ideas', desc: 'Conduct keyword research and retrieve title scores.', actionType: 'workflows', param: '100 Video Ideas Generator' },
    { id: 2, title: '💬 Reply to Comments', desc: 'Establish automated templates based on user logs.', actionType: 'chat', param: 'Draft an outlines list for replying to my recent comments.' },
    { id: 3, title: '📈 Improve CTR', desc: 'Audit optimization tags and meta descriptions.', actionType: 'seo' },
    { id: 4, title: '📝 Outline Video Script', desc: 'Generate high-converting scripts based on video ideas.', actionType: 'scripts' }
  ]);

  // Edit Memory Toggle
  const [isEditingMemory, setIsEditingMemory] = useState(false);
  const [editableMemory, setEditableMemory] = useState({});

  // Interactive Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const chatEndRef = useRef(null);

  // Task List States (Phase 11)
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Record Video: AI Automation Pipeline walkthrough', completed: false },
    { id: 2, text: 'Make Thumbnail with YouTube accent colors', completed: false },
    { id: 3, text: 'Upload new schedule and video script', completed: true },
    { id: 4, text: 'Post interactive community poll on YouTube', completed: false },
    { id: 5, text: 'Check real-time SEO rankings and CTR metrics', completed: false }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Workflow Simulator States (Phases 6, 9, 10)
  const [runningWorkflow, setRunningWorkflow] = useState(null); // { name, progress, currentStep }
  const [workflowResults, setWorkflowResults] = useState(null); // Generated output cards

  // General timeline logs (Phase 5: Right Status Panel)
  const [timelineLogs, setTimelineLogs] = useState([
    { time: '16:10', text: 'Channel settings loaded from memory' },
    { time: '16:15', text: 'Connected to YouTube Data API securely' },
    { time: '16:32', text: 'Audited channel CTR: 6.1% CTR is average' },
    { time: '16:35', text: 'Checked uploads: detected 8-day inactivity gap' }
  ]);

  // Video Idea generator state
  const [ideas, setIdeas] = useState([
    { id: 1, title: 'I Hired a YouTube Manager (And It is An AI Agent)', views: '15.2K potential views', ctr: '9.2% potential CTR', difficulty: 'Low' },
    { id: 2, title: 'How to Build an AI Automation Pipeline in 10 Mins', views: '42K potential views', ctr: '8.4% potential CTR', difficulty: 'Medium' },
    { id: 3, title: 'Vite vs NextJS 15 - The Honest Creator Comparison', views: '12K potential views', ctr: '7.8% potential CTR', difficulty: 'High' }
  ]);

  // Current Video Script State
  const [activeScript, setActiveScript] = useState({
    title: 'I Hired a YouTube Manager (And It is An AI Agent)',
    hook: '[0:00 - 0:30] Start with a massive hook! Hold a robot icon to the camera and say "This robot is currently planning my next 10 videos, editing my scripts, and writing my descriptions. I hired an AI employee, and here is how much money they saved me in week 1."',
    intro: '[0:30 - 1:15] Introduce the concept of AI employees. Explain why standard chatbot interfaces are dead, and why a structured workspace platform is the future of content creation.',
    body: '[1:15 - 4:30] Walk through the three columns of the manager. (1) The Left navigation channel database, (2) The interactive workflows, (3) The active logs and automated task execution tracker.',
    outro: '[4:30 - 5:00] End with a call to action. Prompt users to subscribe to Tech With Nitin and unlock the agent sandbox using the links below.'
  });

  // Midjourney Thumbnail Prompts
  const [thumbnailPrompts, setThumbnailPrompts] = useState([
    { title: 'AI YouTube Manager', prompt: 'A cinematic high-detail shot of a workspace. In the center is a glowing dark glass screen showing dashboard analytics, red and neon cyan lights, high-contrast, octane render, 8k, photorealistic --ar 16:9' },
    { title: 'NextJS vs Vite Speed', prompt: 'A highly dynamic abstract comparison split screen. Left side glowing neon green lightning bolt, right side neon blue atomic spin logo, dark matte backgrounds, energetic motion trails --ar 16:9' }
  ]);
  const [customThumbnailTitle, setCustomThumbnailTitle] = useState('');
  const [customThumbnailPrompt, setCustomThumbnailPrompt] = useState('');

  // SEO tools keyword state
  const [seoKeyword, setSeoKeyword] = useState('');
  const [seoResults, setSeoResults] = useState(null);

  // Documents / Knowledge Base State
  const [documents, setDocuments] = useState([
    { name: 'analytics_report_q2.pdf', size: '1.4 MB', date: 'Jul 2, 2026', status: 'Parsed & Hydrated' },
    { name: 'brand_identity_guide.pdf', size: '820 KB', date: 'Jul 3, 2026', status: 'Loaded in Memory' },
    { name: 'video_script_outline.docx', size: '45 KB', date: 'Jul 4, 2026', status: 'Active Draft' }
  ]);

  // Settings Toggles State
  const [integrations, setIntegrations] = useState({
    googleSignIn: true,
    youtubeDataApi: true,
    mongodbSync: true,
    geminiApiKey: true
  });

  // Auto scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading]);

  // Persist active tab across refreshes
  useEffect(() => {
    localStorage.setItem('agent_sandbox_active_tab', activeTab);
    // Clear workflow running states on tab changes to avoid flickering/crossover
    setRunningWorkflow(null);
    setWorkflowResults(null);
    setAuditingRowId(null);
    setEvaluatingIdeaId(null);
    setCustomThumbnailTitle('');
    setThumbnailPrompts([
      { title: 'AI YouTube Manager', prompt: 'A cinematic high-detail shot of a workspace. In the center is a glowing dark glass screen showing dashboard analytics, red and neon cyan lights, high-contrast, octane render, 8k, photorealistic --ar 16:9' },
      { title: 'NextJS vs Vite Speed', prompt: 'A highly dynamic abstract comparison split screen. Left side glowing neon green lightning bolt, right side neon blue atomic spin logo, dark matte backgrounds, energetic motion trails --ar 16:9' }
    ]);
  }, [activeTab]);

  // Fetch memory and chats from API on load
  useEffect(() => {
    if (state?.user) {
      // Memory
      fetch('/api/youtube-agent/memory', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.memory) {
            const loadedMemory = data.memory;
            setMemory(prev => ({
              ...prev,
              ...loadedMemory,
              channelName: loadedMemory.channelName || '@promptbyniti',
              niche: loadedMemory.niche || 'prompt generate',
              subscribers: loadedMemory.subscribers || 1250,
              analyticsData: loadedMemory.analyticsData || prev.analyticsData
            }));
            setShowOnboarding(false);
          } else {
            setShowOnboarding(false);
          }
          setIsLoaded(true);
        })
        .catch(err => {
          console.error('Fetch memory failed:', err);
          setIsLoaded(true);
        });

      // Chat logs
      fetch('/api/youtube-agent/chat', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.messages) {
            setChatMessages(data.messages);
          }
        })
        .catch(err => console.error('Fetch chat failed:', err));
    } else {
      setIsLoaded(true);
    }
  }, [state?.user, state?.token]);

  // --- DEMO AUTOMATION SIMULATION LOOP (Overview Section) ---
  const runSimPhase = (step) => {
    if (step === 0) {
      // Phase 0: Start AI workflow simulation
      setRunningWorkflow({
        name: "Compiling Video Suggestions",
        progress: 15,
        currentStep: "Auditing channel stats..."
      });
      setTimelineLogs(prevLogs => [
        ...prevLogs,
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "AI triggered automation audit." }
      ]);
    } 
    else if (step === 1) {
      // Phase 1: Update progress & fluctuate metrics & Fast Typist Task 1
      setRunningWorkflow(prevWorkflow => prevWorkflow ? {
        ...prevWorkflow,
        progress: 55,
        currentStep: "Evaluating keyword trends..."
      } : null);
      
      setMemory(prevMem => ({
        ...prevMem,
        subscribers: 1262,
        analyticsData: {
          ...prevMem.analyticsData,
          ctr: 6.3,
          views: 124580
        }
      }));
      setTimelineLogs(prevLogs => [
        ...prevLogs,
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Subscribers & CTR metrics synchronized." }
      ]);

      const textToType = "Research competitor thumbnail concepts";
      let currentText = "";
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < textToType.length) {
          currentText += textToType[charIndex];
          setNewTaskText(currentText);
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setTasks(prevTasks => {
              if (prevTasks.some(t => t.text === textToType)) return prevTasks;
              return [...prevTasks, { id: 101, text: textToType, completed: false }];
            });
            setNewTaskText('');
            setTimelineLogs(prevLogs => [
              ...prevLogs,
              { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Added task: " + textToType }
            ]);
          }, 200);
        }
      }, 15);
    } 
    else if (step === 2) {
      // Phase 2: Complete AI workflow & Fast Typist Task 2 & Update Suggestions
      setRunningWorkflow(prevWorkflow => prevWorkflow ? {
        ...prevWorkflow,
        progress: 100,
        currentStep: "Finished audit."
      } : null);
      
      setTimeout(() => {
        setRunningWorkflow(null);
      }, 600);

      setTimelineLogs(prevLogs => [
        ...prevLogs,
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Completed channel audit: suggestions updated." }
      ]);

      setSuggestions([
        { id: 11, title: '🎥 Render AI Thumbnail Draft', desc: 'Synthesize Midjourney visuals based on optimized metadata.', actionType: 'thumbnails' },
        { id: 12, title: '📅 Schedule Upload Slot', desc: 'Add newly drafted script to the Content Calendar.', actionType: 'planner' },
        { id: 13, title: '🤖 Auto-translate Video Description', desc: 'Translate metadata into 5 foreign languages.', actionType: 'seo' }
      ]);

      const textToType = "Draft automated description tags";
      let currentText = "";
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < textToType.length) {
          currentText += textToType[charIndex];
          setNewTaskText(currentText);
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setTasks(prevTasks => {
              if (prevTasks.some(t => t.text === textToType)) return prevTasks;
              return [...prevTasks, { id: 102, text: textToType, completed: false }];
            });
            setNewTaskText('');
            setTimelineLogs(prevLogs => [
              ...prevLogs,
              { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Added task: " + textToType }
            ]);
          }, 200);
        }
      }, 15);
    } 
    else if (step === 3) {
      // Complete Task 1 & Task 2
      setTasks(prevTasks => {
        const toComplete = prevTasks.filter(t => t.id === 1 || t.id === 2);
        toComplete.forEach(t => {
          setTimelineLogs(prevLogs => {
            const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Completed task: ${t.text}` };
            if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
            return [...prevLogs, newLog];
          });
        });
        return prevTasks.map(t => (t.id === 1 || t.id === 2) ? { ...t, completed: true } : t);
      });

      setMemory(prevMem => ({
        ...prevMem,
        subscribers: 1278,
        analyticsData: {
          ...prevMem.analyticsData,
          ctr: 6.5,
          views: 124690
        }
      }));
    } 
    else if (step === 4) {
      // Complete Task 4
      setTasks(prevTasks => {
        const task4 = prevTasks.find(t => t.id === 4);
        if (task4) {
          setTimelineLogs(prevLogs => {
            const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Completed task: ${task4.text}` };
            if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
            return [...prevLogs, newLog];
          });
          return prevTasks.map(t => t.id === 4 ? { ...t, completed: true } : t);
        }
        return prevTasks;
      });
    }
    else if (step === 5) {
      // Complete Task 5 & Task 102
      setTasks(prevTasks => {
        const toComplete = prevTasks.filter(t => t.id === 5 || t.id === 102);
        toComplete.forEach(t => {
          setTimelineLogs(prevLogs => {
            const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Completed task: ${t.text}` };
            if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
            return [...prevLogs, newLog];
          });
        });
        return prevTasks.map(t => (t.id === 5 || t.id === 102) ? { ...t, completed: true } : t);
      });
    }
    else if (step === 6) {
      // Phase 6: Reset loop parameters to defaults
      setMemory(prevMem => ({
        ...prevMem,
        channelName: '@promptbyniti',
        niche: 'prompt generate',
        subscribers: 1250,
        analyticsData: {
          ...prevMem.analyticsData,
          ctr: 6.1,
          views: 124500
        }
      }));
      setTasks([
        { id: 1, text: 'Record Video: AI Automation Pipeline walkthrough', completed: false },
        { id: 2, text: 'Make Thumbnail with YouTube accent colors', completed: false },
        { id: 3, text: 'Upload new schedule and video script', completed: true },
        { id: 4, text: 'Post interactive community poll on YouTube', completed: false },
        { id: 5, text: 'Check real-time SEO rankings and CTR metrics', completed: false }
      ]);
      setTimelineLogs([
        { time: '16:10', text: 'Channel settings loaded from memory' },
        { time: '16:15', text: 'Connected to YouTube Data API securely' },
        { time: '16:32', text: 'Audited channel CTR: 6.1% CTR is average' },
        { time: '16:35', text: 'Checked uploads: detected 8-day inactivity gap' }
      ]);
      setSuggestions([
        { id: 1, title: '💡 Generate Shorts & Video Ideas', desc: 'Conduct keyword research and retrieve title scores.', actionType: 'workflows', param: '100 Video Ideas Generator' },
        { id: 2, title: '💬 Reply to Comments', desc: 'Establish automated templates based on user logs.', actionType: 'chat', param: 'Draft an outlines list for replying to my recent comments.' },
        { id: 3, title: '📈 Improve CTR', desc: 'Audit optimization tags and meta descriptions.', actionType: 'seo' },
        { id: 4, title: '📝 Outline Video Script', desc: 'Generate high-converting scripts based on video ideas.', actionType: 'scripts' }
      ]);
    }
  };

  useEffect(() => {
    if (!isLoaded || activeTab !== 'overview' || !isSimActive) return;

    // Run first step instantly on mount/load
    runSimPhase(0);
    setSimStep(0);

    const interval = setInterval(() => {
      setSimStep(prev => {
        const nextStep = (prev + 1) % 7;
        runSimPhase(nextStep);
        return nextStep;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isLoaded, activeTab, isSimActive]);

  // Reset demo state when simulation is disabled manually
  useEffect(() => {
    if (!isSimActive) {
      setRunningWorkflow(null);
      setNewTaskText('');
      setChatMessages([]);
      setInputMessage('');
      setIsChatLoading(false);
      setAuditingRowId(null);
      setEvaluatingIdeaId(null);
      setCustomThumbnailTitle('');
      setThumbnailPrompts([
        { title: 'AI YouTube Manager', prompt: 'A cinematic high-detail shot of a workspace. In the center is a glowing dark glass screen showing dashboard analytics, red and neon cyan lights, high-contrast, octane render, 8k, photorealistic --ar 16:9' },
        { title: 'NextJS vs Vite Speed', prompt: 'A highly dynamic abstract comparison split screen. Left side glowing neon green lightning bolt, right side neon blue atomic spin logo, dark matte backgrounds, energetic motion trails --ar 16:9' }
      ]);
    }
  }, [isSimActive]);

  // --- DEMO AUTOMATION SIMULATION LOOP (Interactive Chat Section) ---
  useEffect(() => {
    if (!isLoaded || activeTab !== 'chat' || !isSimActive) return;

    let typingInterval = null;
    setChatSimStep(0);

    const runChatStep = (step) => {
      if (typingInterval) clearInterval(typingInterval);

      if (step === 0) {
        setChatMessages([]);
        setRunningWorkflow(null);
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Chat session started: awaiting user input." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });

        const textToType = "Suggest 3 video ideas for @promptbyniti channel.";
        let currentText = "";
        let charIndex = 0;
        typingInterval = setInterval(() => {
          if (charIndex < textToType.length) {
            currentText += textToType[charIndex];
            setInputMessage(currentText);
            charIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, 12);
      } 
      else if (step === 1) {
        setInputMessage("");
        setChatMessages([
          { sender: 'user', text: "Suggest 3 video ideas for @promptbyniti channel." }
        ]);
        setIsChatLoading(true);
        setRunningWorkflow({
          name: "Brainstorming Video Suggestions",
          progress: 40,
          currentStep: "Cross-referencing niche databases..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "User query: Suggest 3 video ideas." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      } 
      else if (step === 2) {
        setIsChatLoading(false);
        setRunningWorkflow(null);
        setChatMessages([
          { sender: 'user', text: "Suggest 3 video ideas for @promptbyniti channel." },
          { 
            sender: 'agent', 
            text: `Here are 3 high-impact video concepts tailored specifically for your channel '@promptbyniti' and niche 'prompt generate':

1. 🚀 **"The Prompt Engineering Roadmap 2026"**
   - **Target Audience:** Developers & AI Creators.
   - **Description:** A step-by-step masterclass covering custom system prompts, vector memory storage, and instruction injection security.
   - **CTR Outlook:** 9.4% (Very High).

2. ⚡ **"Vite vs Next.js 15: Ultimate SEO Prompt Guide"**
   - **Target Audience:** Frontend Engineers.
   - **Description:** A deep-dive comparison on how to structure static prompts and server actions to maximize Google organic discoverability.
   - **CTR Outlook:** 8.8% (High).

3. 🤖 **"I Built a 100% Autonomous YouTube Autopilot Workspace"**
   - **Target Audience:** Business Automators & Solopreneurs.
   - **Description:** A behind-the-scenes tour showing how AI agents draft scripts, render cards, and sync metadata in real-time.
   - **CTR Outlook:** 9.8% (Exceptional).`
          }
        ]);
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "AI generated 3 channel concepts based on niche." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      } 
      else if (step === 3) {
        const textToType = "Can you outline the script for Vite vs Next.js?";
        let currentText = "";
        let charIndex = 0;
        typingInterval = setInterval(() => {
          if (charIndex < textToType.length) {
            currentText += textToType[charIndex];
            setInputMessage(currentText);
            charIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, 12);
      } 
      else if (step === 4) {
        setInputMessage("");
        setChatMessages([
          { sender: 'user', text: "Suggest 3 video ideas for @promptbyniti channel." },
          { 
            sender: 'agent', 
            text: `Here are 3 high-impact video concepts tailored specifically for your channel '@promptbyniti' and niche 'prompt generate':

1. 🚀 **"The Prompt Engineering Roadmap 2026"**
   - **Target Audience:** Developers & AI Creators.
   - **Description:** A step-by-step masterclass covering custom system prompts, vector memory storage, and instruction injection security.
   - **CTR Outlook:** 9.4% (Very High).

2. ⚡ **"Vite vs Next.js 15: Ultimate SEO Prompt Guide"**
   - **Target Audience:** Frontend Engineers.
   - **Description:** A deep-dive comparison on how to structure static prompts and server actions to maximize Google organic discoverability.
   - **CTR Outlook:** 8.8% (High).

3. 🤖 **"I Built a 100% Autonomous YouTube Autopilot Workspace"**
   - **Target Audience:** Business Automators & Solopreneurs.
   - **Description:** A behind-the-scenes tour showing how AI agents draft scripts, render cards, and sync metadata in real-time.
   - **CTR Outlook:** 9.8% (Exceptional).`
          },
          { sender: 'user', text: "Can you outline the script for Vite vs Next.js?" }
        ]);
        setIsChatLoading(true);
        setRunningWorkflow({
          name: "Outlining Video Scripts",
          progress: 50,
          currentStep: "Synthesizing SEO hooks..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "User query: Outline script for Vite vs Next.js." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      } 
      else if (step === 5) {
        setIsChatLoading(false);
        setRunningWorkflow(null);
        setChatMessages([
          { sender: 'user', text: "Suggest 3 video ideas for @promptbyniti channel." },
          { 
            sender: 'agent', 
            text: `Here are 3 high-impact video concepts tailored specifically for your channel '@promptbyniti' and niche 'prompt generate':

1. 🚀 **"The Prompt Engineering Roadmap 2026"**
   - **Target Audience:** Developers & AI Creators.
   - **Description:** A step-by-step masterclass covering custom system prompts, vector memory storage, and instruction injection security.
   - **CTR Outlook:** 9.4% (Very High).

2. ⚡ **"Vite vs Next.js 15: Ultimate SEO Prompt Guide"**
   - **Target Audience:** Frontend Engineers.
   - **Description:** A deep-dive comparison on how to structure static prompts and server actions to maximize Google organic discoverability.
   - **CTR Outlook:** 8.8% (High).

3. 🤖 **"I Built a 100% Autonomous YouTube Autopilot Workspace"**
   - **Target Audience:** Business Automators & Solopreneurs.
   - **Description:** A behind-the-scenes tour showing how AI agents draft scripts, render cards, and sync metadata in real-time.
   - **CTR Outlook:** 9.8% (Exceptional).`
          },
          { sender: 'user', text: "Can you outline the script for Vite vs Next.js?" },
          { 
            sender: 'agent', 
            text: `Here is a comprehensive, high-retention video script outline for **"Vite vs Next.js 15: Ultimate SEO Prompt Guide"**:

* 🎙️ **The Hook [0:00 - 0:45]**
  - **Visual:** Split screen showing terminal booting Vite in 12ms on the left, vs a Next.js server pre-rendering on the right.
  - **Script Outline:** "Vite boots up in milliseconds, but did you know Next.js could double your search traffic in weeks? In this video, we outline the exact prompt templates I used to automate my SEO optimization pipelines."

* 💡 **Core Segment 1: Speed vs indexing [0:45 - 2:30]**
  - **Visual:** Interactive charts showing time-to-first-byte (TTFB) and Google crawler indexing scores.
  - **Script Outline:** "We analyze how Vite's client-side rendering (CSR) compares to Next.js static site generation (SSG) for SEO crawlers."

* 🛠️ **Core Segment 2: Autopilot Prompt Setup [2:30 - 4:15]**
  - **Visual:** Walkthrough of your Autopilot Workspace showing prompt generation rules.
  - **Script Outline:** "How to feed schema tags, meta titles, and descriptions directly into the Gemini API workspace to automate tagging."

* 🎬 **Outro & Call to Action [4:15 - 5:00]**
  - **Visual:** Pointing to the subscription button and highlighting the @promptbyniti sandbox repository.
  - **Script Outline:** "Make sure to download these custom templates below. Try it in the live sandbox, and subscribe for weekly AI workspace walkthroughs!"`
          }
        ]);
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "AI compiled script outline and visual sections." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
      else if (step === 6) {
        const textToType = "What are the recommended keywords for this?";
        let currentText = "";
        let charIndex = 0;
        typingInterval = setInterval(() => {
          if (charIndex < textToType.length) {
            currentText += textToType[charIndex];
            setInputMessage(currentText);
            charIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, 12);
      }
      else if (step === 7) {
        setInputMessage("");
        setChatMessages([
          { sender: 'user', text: "Suggest 3 video ideas for @promptbyniti channel." },
          { 
            sender: 'agent', 
            text: `Here are 3 high-impact video concepts tailored specifically for your channel '@promptbyniti' and niche 'prompt generate':

1. 🚀 **"The Prompt Engineering Roadmap 2026"**
   - **Target Audience:** Developers & AI Creators.
   - **Description:** A step-by-step masterclass covering custom system prompts, vector memory storage, and instruction injection security.
   - **CTR Outlook:** 9.4% (Very High).

2. ⚡ **"Vite vs Next.js 15: Ultimate SEO Prompt Guide"**
   - **Target Audience:** Frontend Engineers.
   - **Description:** A deep-dive comparison on how to structure static prompts and server actions to maximize Google organic discoverability.
   - **CTR Outlook:** 8.8% (High).

3. 🤖 **"I Built a 100% Autonomous YouTube Autopilot Workspace"**
   - **Target Audience:** Business Automators & Solopreneurs.
   - **Description:** A behind-the-scenes tour showing how AI agents draft scripts, render cards, and sync metadata in real-time.
   - **CTR Outlook:** 9.8% (Exceptional).`
          },
          { sender: 'user', text: "Can you outline the script for Vite vs Next.js?" },
          { 
            sender: 'agent', 
            text: `Here is a comprehensive, high-retention video script outline for **"Vite vs Next.js 15: Ultimate SEO Prompt Guide"**:

* 🎙️ **The Hook [0:00 - 0:45]**
  - **Visual:** Split screen showing terminal booting Vite in 12ms on the left, vs a Next.js server pre-rendering on the right.
  - **Script Outline:** "Vite boots up in milliseconds, but did you know Next.js could double your search traffic in weeks? In this video, we outline the exact prompt templates I used to automate my SEO optimization pipelines."

* 💡 **Core Segment 1: Speed vs indexing [0:45 - 2:30]**
  - **Visual:** Interactive charts showing time-to-first-byte (TTFB) and Google crawler indexing scores.
  - **Script Outline:** "We analyze how Vite's client-side rendering (CSR) compares to Next.js static site generation (SSG) for SEO crawlers."

* 🛠️ **Core Segment 2: Autopilot Prompt Setup [2:30 - 4:15]**
  - **Visual:** Walkthrough of your Autopilot Workspace showing prompt generation rules.
  - **Script Outline:** "How to feed schema tags, meta titles, and descriptions directly into the Gemini API workspace to automate tagging."

* 🎬 **Outro & Call to Action [4:15 - 5:00]**
  - **Visual:** Pointing to the subscription button and highlighting the @promptbyniti sandbox repository.
  - **Script Outline:** "Make sure to download these custom templates below. Try it in the live sandbox, and subscribe for weekly AI workspace walkthroughs!"`
          },
          { sender: 'user', text: "What are the recommended keywords for this?" }
        ]);
        setIsChatLoading(true);
        setRunningWorkflow({
          name: "Auditing Keyword Competition",
          progress: 60,
          currentStep: "Retrieving tag metadata..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "User query: Retrieve optimized keyword tags." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
      else if (step === 8) {
        setIsChatLoading(false);
        setRunningWorkflow(null);
        setChatMessages([
          { sender: 'user', text: "Suggest 3 video ideas for @promptbyniti channel." },
          { 
            sender: 'agent', 
            text: `Here are 3 high-impact video concepts tailored specifically for your channel '@promptbyniti' and niche 'prompt generate':

1. 🚀 **"The Prompt Engineering Roadmap 2026"**
   - **Target Audience:** Developers & AI Creators.
   - **Description:** A step-by-step masterclass covering custom system prompts, vector memory storage, and instruction injection security.
   - **CTR Outlook:** 9.4% (Very High).

2. ⚡ **"Vite vs Next.js 15: Ultimate SEO Prompt Guide"**
   - **Target Audience:** Frontend Engineers.
   - **Description:** A deep-dive comparison on how to structure static prompts and server actions to maximize Google organic discoverability.
   - **CTR Outlook:** 8.8% (High).

3. 🤖 **"I Built a 100% Autonomous YouTube Autopilot Workspace"**
   - **Target Audience:** Business Automators & Solopreneurs.
   - **Description:** A behind-the-scenes tour showing how AI agents draft scripts, render cards, and sync metadata in real-time.
   - **CTR Outlook:** 9.8% (Exceptional).`
          },
          { sender: 'user', text: "Can you outline the script for Vite vs Next.js?" },
          { 
            sender: 'agent', 
            text: `Here is a comprehensive, high-retention video script outline for **"Vite vs Next.js 15: Ultimate SEO Prompt Guide"**:

* 🎙️ **The Hook [0:00 - 0:45]**
  - **Visual:** Split screen showing terminal booting Vite in 12ms on the left, vs a Next.js server pre-rendering on the right.
  - **Script Outline:** "Vite boots up in milliseconds, but did you know Next.js could double your search traffic in weeks? In this video, we outline the exact prompt templates I used to automate my SEO optimization pipelines."

* 💡 **Core Segment 1: Speed vs indexing [0:45 - 2:30]**
  - **Visual:** Interactive charts showing time-to-first-byte (TTFB) and Google crawler indexing scores.
  - **Script Outline:** "We analyze how Vite's client-side rendering (CSR) compares to Next.js static site generation (SSG) for SEO crawlers."

* 🛠️ **Core Segment 2: Autopilot Prompt Setup [2:30 - 4:15]**
  - **Visual:** Walkthrough of your Autopilot Workspace showing prompt generation rules.
  - **Script Outline:** "How to feed schema tags, meta titles, and descriptions directly into the Gemini API workspace to automate tagging."

* 🎬 **Outro & Call to Action [4:15 - 5:00]**
  - **Visual:** Pointing to the subscription button and highlighting the @promptbyniti sandbox repository.
  - **Script Outline:** "Make sure to download these custom templates below. Try it in the live sandbox, and subscribe for weekly AI workspace walkthroughs!"`
          },
          { sender: 'user', text: "What are the recommended keywords for this?" },
          {
            sender: 'agent',
            text: `Here is a targeted list of optimized high-traffic keywords and tag metadata for **"Vite vs Next.js 15: Ultimate SEO Prompt Guide"**:

* 📈 **Primary Search Keywords:**
  - \`vite vs nextjs seo performance\` (Search Volume: 24K/mo | Competition: Low)
  - \`nextjs 15 static site generation tutorial\` (Search Volume: 18K/mo | Competition: Medium)
  - \`prompt generate youtube automation\` (Search Volume: 12K/mo | Competition: Very Low)

* 🏷️ **Meta Description Snippet:**
  - *"Vite vs Next.js 15 for SEO. Learn how to generate high-performing prompts that automate your metadata indexing using custom AI agents. Setup your autopilot workspace inside Tech With Nitin."*

* 🧩 **Suggested Hashtags:**
  - \`#nextjs15\` \`#vite\` \`#promptengineering\` \`#youtubeautomation\``
          }
        ]);
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "AI suggested keywords: #nextjs15, #vite." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
      else if (step === 9) {
        setChatMessages([]);
        setInputMessage("");
        setIsChatLoading(false);
        setRunningWorkflow(null);
        setTimelineLogs([
          { time: '16:10', text: 'Channel settings loaded from memory' },
          { time: '16:15', text: 'Connected to YouTube Data API securely' },
          { time: '16:32', text: 'Audited channel CTR: 6.1% CTR is average' },
          { time: '16:35', text: 'Checked uploads: detected 8-day inactivity gap' }
        ]);
      }
    };

    // Run first step instantly
    runChatStep(0);

    const interval = setInterval(() => {
      setChatSimStep(prev => {
        const nextStep = (prev + 1) % 10;
        runChatStep(nextStep);
        return nextStep;
      });
    }, 2800);

    return () => {
      clearInterval(interval);
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [isLoaded, activeTab, isSimActive]);

  // --- GLOBAL SIDEBAR SIMULATION LOOP (For all other views) ---
  useEffect(() => {
    if (!isLoaded || !isSimActive) return;
    if (activeTab === 'overview' || activeTab === 'chat' || activeTab === 'workflows' || activeTab === 'planner' || activeTab === 'ideas' || activeTab === 'scripts' || activeTab === 'thumbnails') return;

    let globalSimStep = 0;
    const runGlobalStep = (step) => {
      const currentStep = step % 4;
      
      if (currentStep === 0) {
        setRunningWorkflow({
          name: "Background Vector Database Indexing",
          progress: 20,
          currentStep: "Parsing memory clusters..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Scheduled background database optimization started." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
      else if (currentStep === 1) {
        setRunningWorkflow(prev => prev ? {
          ...prev,
          progress: 65,
          currentStep: "Pruning redundant semantic nodes..."
        } : null);
      }
      else if (currentStep === 2) {
        setRunningWorkflow(prev => prev ? {
          ...prev,
          progress: 100,
          currentStep: "Indexing completed."
        } : null);
        setTimeout(() => {
          setRunningWorkflow(null);
        }, 600);
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Background database optimization successful." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
      else if (currentStep === 3) {
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Health check: All APIs (YouTube, Gemini, MongoDB) synced." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
    };

    // Run first step instantly
    runGlobalStep(0);

    const interval = setInterval(() => {
      globalSimStep++;
      runGlobalStep(globalSimStep);
    }, 2800);

    return () => {
      clearInterval(interval);
    };
  }, [isLoaded, activeTab, isSimActive]);

  // --- WORKFLOWS TAB AUTOPLAY SIMULATION LOOP ---
  useEffect(() => {
    if (!isLoaded || activeTab !== 'workflows' || !isSimActive) return;

    let workflowsSimStep = 0;
    
    const runWorkflowsStep = (step) => {
      const current = step % 4;
      if (current === 0) {
        runWorkflowSimulation('Launch Channel Strategy');
      } else if (current === 1) {
        runWorkflowSimulation('100 Video Ideas Generator');
      } else if (current === 2) {
        runWorkflowSimulation('Analyze Competitors & Gaps');
      } else if (current === 3) {
        runWorkflowSimulation('90-Day Channel Growth Plan');
      }
    };

    // Run first step instantly
    runWorkflowsStep(0);

    const interval = setInterval(() => {
      workflowsSimStep++;
      runWorkflowsStep(workflowsSimStep);
    }, 7500);

    return () => {
      clearInterval(interval);
    };
  }, [isLoaded, activeTab, isSimActive]);

  // --- CONTENT PLANNER TAB AUTOPLAY SIMULATION LOOP ---
  useEffect(() => {
    if (!isLoaded || activeTab !== 'planner' || !isSimActive) return;

    let plannerSimStep = 0;

    const runPlannerStep = (step) => {
      const current = step % 4;
      if (current === 0) {
        setAuditingRowId(1);
        setRunningWorkflow({
          name: "Auditing Calendar Metadata",
          progress: 30,
          currentStep: "Analyzing SEO keyword optimization tags..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Planner Audit: Analyzing SEO tags for 'I Hired a YouTube Manager'..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      } 
      else if (current === 1) {
        setAuditingRowId(2);
        setRunningWorkflow({
          name: "Drafting Script Outlines",
          progress: 60,
          currentStep: "Formulating hook variants for 'Why I Am Quitting NextJS'..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Planner Audit: Drafting script outline for 'Why I Am Quitting NextJS'..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      } 
      else if (current === 2) {
        setAuditingRowId(3);
        setRunningWorkflow({
          name: "Fetching Historical Metrics",
          progress: 90,
          currentStep: "Aggregating views and watchtime logs..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Planner Audit: Fetching historical stats for 'Automating developer tools'..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      } 
      else if (current === 3) {
        setAuditingRowId(null);
        setRunningWorkflow(null);
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Planner Audit complete: calendar schedule fully optimized." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
    };

    // Run first step instantly
    runPlannerStep(0);

    const interval = setInterval(() => {
      plannerSimStep++;
      runPlannerStep(plannerSimStep);
    }, 2800);

    return () => {
      clearInterval(interval);
    };
  }, [isLoaded, activeTab, isSimActive]);

  // --- VIDEO IDEAS TAB AUTOPLAY SIMULATION LOOP ---
  useEffect(() => {
    if (!isLoaded || activeTab !== 'ideas' || !isSimActive) return;

    let ideasSimStep = 0;

    const runIdeasStep = (step) => {
      const current = step % 4;
      if (current === 0) {
        setEvaluatingIdeaId(1);
        setRunningWorkflow({
          name: "Structuring Script Sections",
          progress: 25,
          currentStep: "Writing script hook templates..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Video Ideas: Generating outline for 'I Hired a YouTube Manager'..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      } 
      else if (current === 1) {
        setEvaluatingIdeaId(2);
        setRunningWorkflow({
          name: "Structuring Script Sections",
          progress: 60,
          currentStep: "Formulating core tutorial walkthrough segments..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Video Ideas: Generating outline for 'How to Build an AI Automation Pipeline'..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      } 
      else if (current === 2) {
        setEvaluatingIdeaId(3);
        setRunningWorkflow({
          name: "Structuring Script Sections",
          progress: 90,
          currentStep: "Structuring outro CTAs and subscription links..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Video Ideas: Generating outline for 'Vite vs NextJS 15'..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      } 
      else if (current === 3) {
        setEvaluatingIdeaId(null);
        setRunningWorkflow(null);
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Video Ideas: All script templates drafted and cached in vector storage." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
    };

    // Run first step instantly
    runIdeasStep(0);

    const interval = setInterval(() => {
      ideasSimStep++;
      runIdeasStep(ideasSimStep);
    }, 2800);

    return () => {
      clearInterval(interval);
    };
  }, [isLoaded, activeTab, isSimActive]);

  // --- VIDEO SCRIPTS TAB AUTOPLAY SIMULATION LOOP ---
  useEffect(() => {
    if (!isLoaded || activeTab !== 'scripts' || !isSimActive) return;

    let scriptsSimStep = 0;
    let typingInterval = null;

    const fullTexts = {
      title: 'I Hired a YouTube Manager (And It is An AI Agent)',
      hook: '[0:00 - 0:30] Start with a massive hook! Hold a robot icon to the camera and say "This robot is currently planning my next 10 videos, editing my scripts, and writing my descriptions. I hired an AI employee, and here is how much money they saved me in week 1."',
      intro: '[0:30 - 1:15] Introduce the concept of AI employees. Explain why standard chatbot interfaces are dead, and why a structured workspace platform is the future of content creation.',
      body: '[1:15 - 4:30] Walk through the three columns of the manager. (1) The Left navigation channel database, (2) The interactive workflows, (3) The active logs and automated task execution tracker.',
      outro: '[4:30 - 5:00] End with a call to action. Prompt users to subscribe to Tech With Nitin and unlock the agent sandbox using the links below.'
    };

    const runScriptsStep = (step) => {
      if (typingInterval) clearInterval(typingInterval);
      const current = step % 5;

      if (current === 0) {
        // Clear all script sections for typing
        setActiveScript({ title: fullTexts.title, hook: '', intro: '', body: '', outro: '' });
        setRunningWorkflow({
          name: "Writing Video Hook (Section 1)",
          progress: 15,
          currentStep: "Formulating attention-grabbing statements..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Video Scripts: Outlining Section 1 Video Hook..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });

        let currentText = "";
        let charIndex = 0;
        typingInterval = setInterval(() => {
          if (charIndex < fullTexts.hook.length) {
            currentText += fullTexts.hook[charIndex];
            setActiveScript(prev => ({ ...prev, hook: currentText }));
            charIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, 10);
      }
      else if (current === 1) {
        // Section 1 is full, type Section 2
        setActiveScript(prev => ({ ...prev, hook: fullTexts.hook, intro: '', body: '', outro: '' }));
        setRunningWorkflow({
          name: "Writing Intro Segment (Section 2)",
          progress: 40,
          currentStep: "Structuring AI employee niche definitions..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Video Scripts: Drafting Section 2 Introduction..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });

        let currentText = "";
        let charIndex = 0;
        typingInterval = setInterval(() => {
          if (charIndex < fullTexts.intro.length) {
            currentText += fullTexts.intro[charIndex];
            setActiveScript(prev => ({ ...prev, intro: currentText }));
            charIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, 10);
      }
      else if (current === 2) {
        // Section 1 & 2 are full, type Section 3
        setActiveScript(prev => ({ ...prev, hook: fullTexts.hook, intro: fullTexts.intro, body: '', outro: '' }));
        setRunningWorkflow({
          name: "Writing Core Walkthrough (Section 3)",
          progress: 70,
          currentStep: "Detailing modular sandbox columns..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Video Scripts: Writing Section 3 Walkthrough..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });

        let currentText = "";
        let charIndex = 0;
        typingInterval = setInterval(() => {
          if (charIndex < fullTexts.body.length) {
            currentText += fullTexts.body[charIndex];
            setActiveScript(prev => ({ ...prev, body: currentText }));
            charIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, 10);
      }
      else if (current === 3) {
        // Section 1, 2, 3 are full, type Section 4
        setActiveScript(prev => ({ ...prev, hook: fullTexts.hook, intro: fullTexts.intro, body: fullTexts.body, outro: '' }));
        setRunningWorkflow({
          name: "Writing Outro CTA (Section 4)",
          progress: 90,
          currentStep: "Adding subscriber metrics optimization..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Video Scripts: Formulating Section 4 Outro..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });

        let currentText = "";
        let charIndex = 0;
        typingInterval = setInterval(() => {
          if (charIndex < fullTexts.outro.length) {
            currentText += fullTexts.outro[charIndex];
            setActiveScript(prev => ({ ...prev, outro: currentText }));
            charIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, 10);
      }
      else if (current === 4) {
        // All complete
        setActiveScript(fullTexts);
        setRunningWorkflow(null);
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Video Scripts: Full outline compiled and ready for export." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
    };

    // Run first step instantly
    runScriptsStep(0);

    const interval = setInterval(() => {
      scriptsSimStep++;
      runScriptsStep(scriptsSimStep);
    }, 4200);

    return () => {
      clearInterval(interval);
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [isLoaded, activeTab, isSimActive]);

  // --- THUMBNAIL PROMPTS TAB AUTOPLAY SIMULATION LOOP ---
  useEffect(() => {
    if (!isLoaded || activeTab !== 'thumbnails' || !isSimActive) return;

    let thumbSimStep = 0;
    let typingInterval = null;

    const topicText = "Python Automation Script Guide";
    const generatedPrompt = "A high-impact cinematic rendering of a computer terminal glowing with vibrant Python code, cybernetic python snake made of neon circuit boards wrapped around the screen, dark futuristic setting, depth of field --ar 16:9";

    const runThumbStep = (step) => {
      if (typingInterval) clearInterval(typingInterval);
      const current = step % 4;

      if (current === 0) {
        // Typing phase
        setCustomThumbnailTitle('');
        setThumbnailPrompts([
          { title: 'AI YouTube Manager', prompt: 'A cinematic high-detail shot of a workspace. In the center is a glowing dark glass screen showing dashboard analytics, red and neon cyan lights, high-contrast, octane render, 8k, photorealistic --ar 16:9' },
          { title: 'NextJS vs Vite Speed', prompt: 'A highly dynamic abstract comparison split screen. Left side glowing neon green lightning bolt, right side neon blue atomic spin logo, dark matte backgrounds, energetic motion trails --ar 16:9' }
        ]);

        setRunningWorkflow({
          name: "Extracting Visual Style Tokens",
          progress: 20,
          currentStep: "Analyzing video topic keywords..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Thumbnails: Initializing visual keyword extraction for 'Python Automation Script Guide'..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });

        let currentText = "";
        let charIndex = 0;
        typingInterval = setInterval(() => {
          if (charIndex < topicText.length) {
            currentText += topicText[charIndex];
            setCustomThumbnailTitle(currentText);
            charIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, 15);
      }
      else if (current === 1) {
        // Finalize typing and process prompt styles, clear input prompt so it's removed during synthesis
        setCustomThumbnailTitle('');
        setRunningWorkflow({
          name: "Generating Midjourney Prompt",
          progress: 60,
          currentStep: "Formulating photorealistic render attributes..."
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Thumbnails: Synthesizing photorealistic rendering attributes..." };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });
      }
      else if (current === 2) {
        // Add generated prompt dynamically to list (card is already visible with empty prompt first)
        const newCard = {
          title: topicText,
          prompt: ""
        };
        setThumbnailPrompts(prev => {
          if (prev.some(p => p.title === topicText)) return prev;
          return [newCard, ...prev];
        });

        setRunningWorkflow({
          name: "Prompt cached in system memory",
          progress: 100,
          currentStep: "Caching prompt successful!"
        });
        setTimelineLogs(prevLogs => {
          const newLog = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "Thumbnails: Successfully generated and cached Midjourney prompt for 'Python Automation Script'!" };
          if (prevLogs.some(l => l.text === newLog.text)) return prevLogs;
          return [...prevLogs, newLog];
        });

        // Type out the prompt text-by-text inside the visible card!
        let currentPromptText = "";
        let charIndex = 0;
        typingInterval = setInterval(() => {
          if (charIndex < generatedPrompt.length) {
            currentPromptText += generatedPrompt.substring(charIndex, charIndex + 2);
            setThumbnailPrompts(prev => {
              const updated = [...prev];
              if (updated[0] && updated[0].title === topicText) {
                updated[0] = { ...updated[0], prompt: currentPromptText };
              }
              return updated;
            });
            charIndex += 2;
          } else {
            clearInterval(typingInterval);
          }
        }, 10);
      }
      else if (current === 3) {
        // Idle between iterations
        setRunningWorkflow(null);
      }
    };

    // Run first step instantly
    runThumbStep(0);

    const interval = setInterval(() => {
      thumbSimStep++;
      runThumbStep(thumbSimStep);
    }, 3800);

    return () => {
      clearInterval(interval);
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [isLoaded, activeTab, isSimActive]);

  // Save memory fields
  const handleSaveMemory = async (updatedFields) => {
    if (!state?.user) return;
    try {
      const response = await fetch('/api/youtube-agent/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(updatedFields)
      });
      const data = await response.json();
      if (data.success && data.memory) {
        setMemory(prev => ({ ...prev, ...data.memory }));
      }
    } catch (err) {
      console.error('Save memory failed:', err);
    }
  };

  // Onboarding submit
  const handleSaveOnboarding = async () => {
    const preparedMemory = {
      channelName: wizardData.channelName,
      niche: wizardData.niche,
      language: wizardData.language,
      audience: wizardData.audience,
      country: wizardData.country,
      goal: wizardData.goal,
      uploadFrequency: wizardData.uploadFrequency,
      tone: wizardData.tone,
      editingStyle: wizardData.editingStyle,
      brandColor: wizardData.brandColor,
      competitors: wizardData.competitors.split(',').map(c => c.trim()).filter(Boolean)
    };

    try {
      const response = await fetch('/api/youtube-agent/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(preparedMemory)
      });
      const data = await response.json();
      if (data.success && data.memory) {
        setMemory(prev => ({ ...prev, ...data.memory }));
        setShowOnboarding(false);
        setTimelineLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: 'Onboarding completed! YouTube Manager database ready.' }
        ]);
      }
    } catch (err) {
      console.error('Save memory failed:', err);
      alert('Failed to save channel profile. Please try again.');
    }
  };

  // Interactive Tasks functions
  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
    setTimelineLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Added task: ${newTask.text}` }
    ]);
  };

  // Simulated Workflows runner (Phase 6 / 9 / 10)
  const runWorkflowSimulation = (workflowName) => {
    setRunningWorkflow({ name: workflowName, progress: 0, currentStep: 'Initializing AI automation...' });
    setWorkflowResults(null);
    setTimelineLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Workflow trigger: ${workflowName}` }
    ]);

    const steps = [
      { progress: 15, step: 'Auditing keyword opportunities and monthly volumes...' },
      { progress: 40, step: 'Analyzing competitor structures and audience gaps...' },
      { progress: 65, step: 'Formulating high-converting viral title variants...' },
      { progress: 85, step: 'Drafting Midjourney graphical assets prompts...' },
      { progress: 100, step: 'Completed workflow asset compilation!' }
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const stepInfo = steps[currentStepIndex];
        setRunningWorkflow(prev => ({
          ...prev,
          progress: stepInfo.progress,
          currentStep: stepInfo.step
        }));
        setTimelineLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: stepInfo.step }
        ]);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        setRunningWorkflow(prev => prev ? {
          ...prev,
          progress: 100,
          currentStep: 'Completed workflow asset compilation!'
        } : null);

        if (!isSimActive) {
          setTimeout(() => {
            setRunningWorkflow(null);
          }, 2000);
        }

        // Populate mock strategy results card outputs
        let outputs = null;
        if (workflowName.includes('Launch')) {
          outputs = {
            type: 'Launch Strategy',
            title: '🚀 Launch Strategy Outputs',
            branding: {
              name: memory.channelName || 'New Tech Creator',
              niche: memory.niche || 'Technology Tutorials',
              logoPrompt: 'A glowing metallic camera lens inside a vector code bracket, cyberpunk red accents, futuristic matte black backdrop, octane render, 8k --ar 1:1',
              bannerPrompt: 'An abstract tech grid pattern containing coding language scripts glowing neon red and neon teal, cinematic depth of field --ar 16:9'
            },
            checklist: [
              'Verify Google YouTube Account Credentials',
              'Set branding accent to YouTube Red (#FF0000)',
              'Save Midjourney banner prompt and upload generated graphic',
              'Configure advanced channel keywords metadata',
              'Launch script writer task'
            ]
          };
        } else if (workflowName.includes('Ideas')) {
          outputs = {
            type: '100 Video Ideas',
            title: '💡 Curated Video Idea Bank',
            ideas: [
              { title: 'I Rebuilt the YouTube Algorithm in Python', niche: 'Coding', CTR: '9.4%' },
              { title: 'The NextJS Feature Nobody is Telling You About', niche: 'NextJS', CTR: '8.8%' },
              { title: 'How to Build an AI Employee Using Node.js', niche: 'AI Agents', CTR: '8.5%' },
              { title: 'Vite Port Config Guide (Step-by-Step Tutorial)', niche: 'Web Dev', CTR: '7.9%' },
              { title: 'Code Review: React vs Vue in 2026', niche: 'Frameworks', CTR: '7.2%' }
            ]
          };
        } else if (workflowName.includes('Competitors')) {
          outputs = {
            type: 'Competitor Audit',
            title: '📈 Competitor Intelligence Gaps',
            insights: [
              'Competitors upload video content on Friday evenings. Scheduling on Tuesday afternoons will capture higher initial engagement.',
              'Audience requests code walkthrough files; competitors only provide slide decks. Uploading project GitHub links will establish immediately higher viewer value.',
              'Most channels lack structured descriptions. Utilizing formatted segment lists will increase organic search rankings by 12%.'
            ],
            keywords: ['ai coding workspace', 'youtube manager agent', 'vite configuration tutorial', 'gemini react api']
          };
        } else {
          outputs = {
            type: 'Growth Plan',
            title: '📅 90-Day High Growth Plan',
            calendar: [
              { phase: 'Weeks 1-3: Establishment', description: 'Publish 3 tutorial walk-through videos focusing on Vite/React setups.' },
              { phase: 'Weeks 4-6: Engagement Hooks', description: 'Convert tutorials into 12 short-form vertical videos. Target immediate hook sentences.' },
              { phase: 'Weeks 7-12: Monetization Flow', description: 'Engage brand deals, import sponsor documents, and set up templates shop.' }
            ]
          };
        }
        setWorkflowResults(outputs);
      }
    }, 1200);
  };

  // Document Upload functions
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !state?.user) return;
    setIsUploading(true);
    setTimelineLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Uploading file: ${file.name}` }
    ]);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result.split(',')[1];
      try {
        const response = await fetch('/api/youtube-agent/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: file.type,
            fileName: file.name
          })
        });
        const data = await response.json();
        if (data.success) {
          alert('Analytics report parsed and hydrated into agent memory successfully!');
          if (data.memory) setMemory(data.memory);

          const newDoc = {
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Parsed & Hydrated'
          };
          setDocuments(prev => [newDoc, ...prev]);
          setTimelineLogs(prev => [
            ...prev,
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Analytics database hydrated from ${file.name}` }
          ]);
        }
      } catch (err) {
        console.error('File parsing failed:', err);
        alert('Failed to parse analytics report.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Send interactive chat messages
  const handleSendMessage = async (textToSend) => {
    if (!textToSend || !state?.user) return;
    setIsChatLoading(true);

    const userMsg = { sender: 'user', text: textToSend, createdAt: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setTimelineLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `User message sent` }
    ]);

    try {
      const response = await fetch('/api/youtube-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ prompt: textToSend })
      });
      const data = await response.json();
      if (data.success) {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'agent',
            text: data.text,
            structuredData: data.structuredData,
            suggestedSteps: data.suggestedSteps,
            createdAt: new Date()
          }
        ]);
        if (data.memory) {
          setMemory(prev => ({ ...prev, ...data.memory }));
        }
        setTimelineLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: 'AI response completed' }
        ]);
      }
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Keyword SEO Auditer simulator
  const handleSEOSearch = (e) => {
    e.preventDefault();
    if (!seoKeyword.trim()) return;
    setTimelineLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `SEO Search: "${seoKeyword}"` }
    ]);

    setSeoResults({
      keyword: seoKeyword,
      volume: '8.4K searches / mo',
      difficulty: '32/100 (Easy)',
      ctrScore: '8.9% Average CTR',
      titles: [
        `${seoKeyword} - Step-by-Step Developer Guide`,
        `Why Everyone is Talking About ${seoKeyword} in 2026`,
        `I Built a App with ${seoKeyword} (Honest Review)`
      ],
      tags: [seoKeyword, `${seoKeyword} tutorial`, `${seoKeyword} setup`, 'coding tools', 'vite configuration']
    });
  };

  // Thumbnail Generator mockup
  const handleGenerateThumbnailPrompt = (e) => {
    e.preventDefault();
    if (!customThumbnailTitle.trim()) return;

    const generatedPrompt = `A stunning visual concept for "${customThumbnailTitle}". Hyperrealistic details, rich saturated colors, high-contrast typography background, cinematic lighting --ar 16:9 --v 6.0`;

    const newPrompt = {
      title: customThumbnailTitle,
      prompt: generatedPrompt
    };
    setThumbnailPrompts(prev => [newPrompt, ...prev]);
    setCustomThumbnailTitle('');
    setTimelineLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Generated thumbnail prompt: ${newPrompt.title}` }
    ]);
  };

  // Save Edited Memory Details
  const handleUpdateMemoryDetails = async () => {
    await handleSaveMemory(editableMemory);
    setIsEditingMemory(false);
    setTimelineLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: 'Updated Memory profile details successfully.' }
    ]);
  };

  // Switch to Edit Mode in Memory
  const enableEditMemoryMode = () => {
    setEditableMemory({
      channelName: memory.channelName,
      niche: memory.niche,
      audience: memory.audience,
      language: memory.language || 'English',
      country: memory.country,
      goal: memory.goal,
      uploadFrequency: memory.uploadFrequency,
      tone: memory.tone,
      editingStyle: memory.editingStyle,
      brandColor: memory.brandColor
    });
    setIsEditingMemory(true);
  };

  // --- RENDERING CENTER VIEWS ---
  const renderCenterContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="center-dashboard-view">
            <div className="view-header">
              <h2>Good Morning, {state.user?.name || 'Creator'} 👋</h2>
              <p>Here is your YouTube Manager activity and channel state today.</p>
            </div>

            {/* Metrics cards row */}
            <div className="metrics-summary-grid">
              <div className="metric-card shadow-sm">
                <div className="card-lbl">Channel Name</div>
                <div className="card-val text-red">{memory.channelName || 'Not configured'}</div>
                <div className="card-sub">{memory.niche || 'Niche unselected'}</div>
              </div>
              <div className="metric-card shadow-sm">
                <div className="card-lbl">Subscribers</div>
                <div className="card-val">{memory.subscribers?.toLocaleString() || '1,250'}</div>
                <div className="card-sub text-green">● Growing Daily</div>
              </div>
              <div className="metric-card shadow-sm">
                <div className="card-lbl">Upload Goal</div>
                <div className="card-val">{memory.uploadFrequency || '2 Videos / Week'}</div>
                <div className="card-sub">Next scheduled: Tomorrow</div>
              </div>
              <div className="metric-card shadow-sm">
                <div className="card-lbl">Average CTR</div>
                <div className="card-val">{memory.analyticsData?.ctr ? `${memory.analyticsData.ctr}%` : '6.1%'}</div>
                <div className="card-sub text-green">▲ 0.8% this week</div>
              </div>
              <div className="metric-card shadow-sm">
                <div className="card-lbl">Retention</div>
                <div className="card-val">{memory.analyticsData?.retention ? `${memory.analyticsData.retention}%` : '62%'}</div>
                <div className="card-sub">Watch time: {memory.analyticsData?.watchTime || '4.2K'}h</div>
              </div>
            </div>

            {/* Suggestions & Interactive Checklist Grid */}
            <div className="dashboard-columns-grid">
              {/* Tasks Checklist */}
              <div className="dashboard-pane card shadow-sm">
                <div className="pane-header">
                  <CheckCircle size={18} className="text-red" />
                  <h3>Today's Task List</h3>
                </div>
                <div className="pane-content">
                  <ul className="interactive-todo-list">
                    {tasks.map(task => (
                      <li key={task.id} className={task.completed ? 'completed' : ''}>
                        <label className="checkbox-wrap">
                          <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
                          <span className="checkbox-custom"></span>
                          <span className="task-text">{task.text}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <form onSubmit={handleAddTask} className="add-task-inline-form">
                  <input type="text" placeholder="Add a new custom task..." value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} />
                  <button type="submit" className="btn btn-secondary btn-xs"><Plus size={14} /></button>
                </form>
              </div>

              {/* Suggestions chips */}
              <div className="dashboard-pane card shadow-sm">
                <div className="pane-header">
                  <Sparkles size={18} className="text-red" />
                  <h3>Today's Suggestions</h3>
                </div>
                <div className="pane-content">
                  <p className="suggest-intro">Click any recommended action below to execute with your AI manager immediately:</p>
                  <div className="action-buttons-list">
                    {suggestions.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => {
                          if (s.actionType === 'workflows') {
                            setActiveTab('workflows');
                            runWorkflowSimulation(s.param);
                          } else if (s.actionType === 'chat') {
                            setActiveTab('chat');
                            handleSendMessage(s.param);
                          } else {
                            setActiveTab(s.actionType);
                          }
                        }} 
                        className="suggest-card animate-fade-in"
                      >
                        <div className="suggest-title">{s.title}</div>
                        <div className="suggest-desc">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="chat-container">
            <div className="chat-messages-log">
              {chatMessages.length === 0 ? (
                <div className="chat-empty-state">
                  <Bot size={36} className="text-muted" />
                  <p>I am your YouTube AI Channel Manager. Ask me to write scripts, generate ideas, analyze data, or build a growth strategy based on your channel niche!</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-bubble-wrap ${msg.sender}`}>
                    <div className="chat-avatar">
                      {msg.sender === 'agent' ? (
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="#ff0000">
                          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      ) : '👤'}
                    </div>
                    <div className="chat-bubble-content">
                      <div className="chat-text">{msg.text}</div>
                      {msg.suggestedSteps && msg.suggestedSteps.length > 0 && (
                        <div className="chat-suggested-steps">
                          <span className="steps-title">Recommended Actions:</span>
                          <div className="steps-list">
                            {msg.suggestedSteps.map((step, idx) => (
                              <button key={idx} onClick={() => handleSendMessage(step)} className="step-action-btn">{step}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="chat-bubble-wrap agent loading">
                  <div className="chat-avatar">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#ff0000">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div className="chat-bubble-content">
                    <span className="loading-dots">Thinking<span>.</span><span>.</span><span>.</span></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input form */}
            <form className="chat-input-bar" onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}>
              <input type="text" placeholder="Ask YouTube AI anything about your channel..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} disabled={isChatLoading} />
              <button type="submit" className="btn btn-primary btn-icon" disabled={isChatLoading || !inputMessage.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>
        );

      case 'workflows':
        return (
          <div className="workflows-view">
            <div className="view-header">
              <h2>🚀 Interactive AI Channel Workflows</h2>
              <p>Run automated, multi-step optimization templates with one click.</p>
            </div>

            <div className="workflows-templates-grid">
              <div className={`workflow-temp-card card shadow-sm ${runningWorkflow?.name === 'Launch Channel Strategy' ? 'running-active' : ''}`}>
                <div className="card-top">
                  <span className="badge">18 Steps | 2 min</span>
                  <Zap size={20} className="text-red" />
                </div>
                <h3>Launch Channel Strategy</h3>
                <p>Audits niche, generates Midjourney branding prompt assets, and devises metadata structures.</p>
                <button 
                  onClick={() => runWorkflowSimulation('Launch Channel Strategy')} 
                  className={`btn w-100 ${runningWorkflow?.name === 'Launch Channel Strategy' ? 'btn-danger' : 'btn-primary'}`} 
                  disabled={runningWorkflow && runningWorkflow?.name !== 'Launch Channel Strategy'}
                >
                  {runningWorkflow?.name === 'Launch Channel Strategy' ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <RefreshCw size={16} className="spinner-icon" />
                      Running...
                    </span>
                  ) : 'Run Workflow'}
                </button>
              </div>

              <div className={`workflow-temp-card card shadow-sm ${runningWorkflow?.name === '100 Video Ideas Generator' ? 'running-active' : ''}`}>
                <div className="card-top">
                  <span className="badge">AI Research</span>
                  <Sparkles size={20} className="text-red" />
                </div>
                <h3>100 Video Ideas Generator</h3>
                <p>Mines keyword patterns and outlines content topics scoring highest for potential search CTR.</p>
                <button 
                  onClick={() => runWorkflowSimulation('100 Video Ideas Generator')} 
                  className={`btn w-100 ${runningWorkflow?.name === '100 Video Ideas Generator' ? 'btn-danger' : 'btn-primary'}`} 
                  disabled={runningWorkflow && runningWorkflow?.name !== '100 Video Ideas Generator'}
                >
                  {runningWorkflow?.name === '100 Video Ideas Generator' ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <RefreshCw size={16} className="spinner-icon" />
                      Running...
                    </span>
                  ) : 'Run Workflow'}
                </button>
              </div>

              <div className={`workflow-temp-card card shadow-sm ${runningWorkflow?.name === 'Analyze Competitors & Gaps' ? 'running-active' : ''}`}>
                <div className="card-top">
                  <span className="badge">5 Steps | 1 min</span>
                  <Database size={20} className="text-red" />
                </div>
                <h3>Analyze Competitors</h3>
                <p>Audits competing channels to reveal untapped content schedule opportunities and metadata tags.</p>
                <button 
                  onClick={() => runWorkflowSimulation('Analyze Competitors & Gaps')} 
                  className={`btn w-100 ${runningWorkflow?.name === 'Analyze Competitors & Gaps' ? 'btn-danger' : 'btn-primary'}`} 
                  disabled={runningWorkflow && runningWorkflow?.name !== 'Analyze Competitors & Gaps'}
                >
                  {runningWorkflow?.name === 'Analyze Competitors & Gaps' ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <RefreshCw size={16} className="spinner-icon" />
                      Running...
                    </span>
                  ) : 'Run Workflow'}
                </button>
              </div>

              <div className={`workflow-temp-card card shadow-sm ${runningWorkflow?.name === '90-Day Channel Growth Plan' ? 'running-active' : ''}`}>
                <div className="card-top">
                  <span className="badge">24 Steps | 3 min</span>
                  <TrendingUp size={20} className="text-red" />
                </div>
                <h3>90-Day Growth Plan</h3>
                <p>Compiles structured upload milestones, expansion benchmarks, and audience retention loops.</p>
                <button 
                  onClick={() => runWorkflowSimulation('90-Day Channel Growth Plan')} 
                  className={`btn w-100 ${runningWorkflow?.name === '90-Day Channel Growth Plan' ? 'btn-danger' : 'btn-primary'}`} 
                  disabled={runningWorkflow && runningWorkflow?.name !== '90-Day Channel Growth Plan'}
                >
                  {runningWorkflow?.name === '90-Day Channel Growth Plan' ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <RefreshCw size={16} className="spinner-icon" />
                      Running...
                    </span>
                  ) : 'Run Workflow'}
                </button>
              </div>
            </div>

            {/* Workflow Progress Bar */}
            {runningWorkflow && (
              <div className="active-workflow-loader card shadow-md">
                <div className="loader-title">
                  <RefreshCw className="animate-spin text-red" />
                  <h4>Running: {runningWorkflow.name}</h4>
                </div>
                <div className="progress-meter">
                  <div className="progress-bar-fill" style={{ width: `${runningWorkflow.progress}%` }}></div>
                </div>
                <div className="progress-step-text">{runningWorkflow.currentStep}</div>
              </div>
            )}

            {/* Results Cards (Phase 7) */}
            {(workflowResults || runningWorkflow) && (
              <div className="workflow-results-container card shadow-sm">
                <div className="results-header">
                  <h3>{workflowResults ? workflowResults.title : `⚡ AI Compiler: ${runningWorkflow?.name}`}</h3>
                  {workflowResults && (
                    <div className="actions">
                      <button onClick={() => alert('Strategy strategy results exported to project documents')} className="btn btn-secondary-outline btn-xs">Export to Docs</button>
                    </div>
                  )}
                </div>

                <div className="results-content-pane">
                  {(!workflowResults || (runningWorkflow && runningWorkflow.progress < 100)) ? (
                    <div className="workflow-processing-placeholder">
                      <div className="processing-pulse-bar">
                        <span className="dot animate-pulse"></span>
                        <span>AI Agent is compiling real-time insights... ({runningWorkflow?.progress || 0}%)</span>
                      </div>
                      <div className="mock-results-skeletons">
                        <div className="skeleton-row line-long"></div>
                        <div className="skeleton-row line-medium"></div>
                        <div className="skeleton-row line-short"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {workflowResults.type === 'Launch Strategy' && (
                        <div className="launch-results-cards">
                          <div className="res-card">
                            <h5>Channel Identity Setup</h5>
                            <p><strong>Name:</strong> {workflowResults.branding.name}</p>
                            <p><strong>Niche:</strong> {workflowResults.branding.niche}</p>
                          </div>
                          <div className="res-card">
                            <h5>AI Graphic Prompts</h5>
                            <div className="prompt-block">
                              <strong>Logo:</strong> <code>{workflowResults.branding.logoPrompt}</code>
                            </div>
                            <div className="prompt-block">
                              <strong>Banner:</strong> <code>{workflowResults.branding.bannerPrompt}</code>
                            </div>
                          </div>
                          <div className="res-card">
                            <h5>Action Items Checklist</h5>
                            <ul>
                              {workflowResults.checklist.map((item, idx) => (
                                <li key={idx}>✓ {item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {workflowResults.type === '100 Video Ideas' && (
                        <table className="workflow-ideas-table">
                          <thead>
                            <tr>
                              <th>Video Title</th>
                              <th>Niche Cluster</th>
                              <th>CTR Potential</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workflowResults.ideas.map((idea, idx) => (
                              <tr key={idx}>
                                <td><strong>{idea.title}</strong></td>
                                <td>{idea.niche}</td>
                                <td><span className="badge-green">{idea.CTR}</span></td>
                                <td>
                                  <button onClick={() => {
                                    setActiveScript({
                                      title: idea.title,
                                      hook: `[0:00 - 0:30] Massively hooks audience on ${idea.title}.`,
                                      intro: `[0:30 - 1:15] Introduces ${idea.niche} concept details.`,
                                      body: '[1:15 - 4:30] Expands on the core automation walkthrough points.',
                                      outro: '[4:30 - 5:00] Subscribe call to action.'
                                    });
                                    setActiveTab('scripts');
                                  }} className="btn btn-secondary btn-xs">Outline Script</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {workflowResults.type === 'Competitor Audit' && (
                        <div className="competitor-insights-wrap">
                          <div className="res-card">
                            <h5>Strategic Opportunities</h5>
                            <ul>
                              {workflowResults.insights.map((insight, idx) => (
                                <li key={idx}>{insight}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="res-card">
                            <h5>Optimized Tag Keywords</h5>
                            <div className="badge-grid">
                              {workflowResults.keywords.map((kw, idx) => (
                                <span key={idx} className="badge-tag">{kw}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {workflowResults.type === 'Growth Plan' && (
                        <div className="growth-plan-roadmap">
                          {workflowResults.calendar.map((item, idx) => (
                            <div key={idx} className="roadmap-phase-card res-card">
                              <h4>{item.phase}</h4>
                              <p>{item.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'planner':
        return (
          <div className="planner-view">
            <div className="view-header">
              <h2>📅 Channel Content Planner</h2>
              <p>Manage and audit scheduled video upload deadlines.</p>
            </div>

            <div className="calendar-grid-wrap card">
              <div className="calendar-legend">
                <span className="legend-item"><span className="dot published"></span> Published</span>
                <span className="legend-item"><span className="dot scheduled"></span> Scheduled</span>
                <span className="legend-item"><span className="dot draft"></span> Draft</span>
              </div>
              <table className="calendar-planner-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Video Title</th>
                    <th>Platform Niche</th>
                    <th>Status</th>
                    <th>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={auditingRowId === 1 ? 'row-auditing' : ''}>
                    <td><strong>Jul 5, 2026</strong></td>
                    <td>I Hired a YouTube Manager (AI Agent sandbox walk)</td>
                    <td>AI Agents</td>
                    <td><span className="status-label scheduled">Scheduled</span></td>
                    <td>
                      <button 
                        onClick={() => setActiveTab('seo')} 
                        className={`btn btn-xs ${auditingRowId === 1 ? 'btn-danger' : 'btn-secondary'}`}
                        disabled={auditingRowId && auditingRowId !== 1}
                      >
                        {auditingRowId === 1 ? '⏳ Auditing...' : 'SEO tags'}
                      </button>
                    </td>
                  </tr>
                  <tr className={auditingRowId === 2 ? 'row-auditing' : ''}>
                    <td><strong>Jul 8, 2026</strong></td>
                    <td>Why I Am Quitting NextJS for Vite config</td>
                    <td>Web Dev</td>
                    <td><span className="status-label draft">Draft</span></td>
                    <td>
                      <button 
                        onClick={() => { setActiveScript({ title: 'Why I Am Quitting NextJS for Vite config', hook: '[0:00 - 0:30] Hook about NextJS overheads.', intro: '[0:30 - 1:15] Vite dev speeds comparison.', body: '[1:15 - 4:30] Core bundle benchmarks and setup.', outro: '[4:30 - 5:00] End wrap.' }); setActiveTab('scripts'); }} 
                        className={`btn btn-xs ${auditingRowId === 2 ? 'btn-danger' : 'btn-secondary'}`}
                        disabled={auditingRowId && auditingRowId !== 2}
                      >
                        {auditingRowId === 2 ? '⏳ Writing...' : 'Write Outline'}
                      </button>
                    </td>
                  </tr>
                  <tr className={auditingRowId === 3 ? 'row-auditing' : ''}>
                    <td><strong>Jun 28, 2026</strong></td>
                    <td>Automating developer tools with Antigravity</td>
                    <td>AI Coding</td>
                    <td><span className="status-label published">Published</span></td>
                    <td>
                      <button 
                        onClick={() => setActiveTab('analytics')} 
                        className={`btn btn-xs ${auditingRowId === 3 ? 'btn-danger' : 'btn-secondary'}`}
                        disabled={auditingRowId && auditingRowId !== 3}
                      >
                        {auditingRowId === 3 ? '⏳ Fetching...' : 'Views stats'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'ideas':
        return (
          <div className="ideas-view">
            <div className="view-header">
              <h2>🎬 Curated Video Ideas</h2>
              <p>AI-mined topics tailored to your channel's niche audience.</p>
            </div>

            <div className="ideas-listing card">
              <table className="ideas-table">
                <thead>
                  <tr>
                    <th>Suggested Topic / Title</th>
                    <th>Estimated Traffic</th>
                    <th>CTR Potential</th>
                    <th>Difficulty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ideas.map(idea => (
                    <tr key={idea.id} className={evaluatingIdeaId === idea.id ? 'row-auditing' : ''}>
                      <td><strong>{idea.title}</strong></td>
                      <td>{idea.views}</td>
                      <td><span className="badge-green">{idea.ctr}</span></td>
                      <td><span className={`difficulty-badge ${idea.difficulty.toLowerCase()}`}>{idea.difficulty}</span></td>
                      <td>
                        <button 
                          onClick={() => {
                            setActiveScript({
                              title: idea.title,
                              hook: `[0:00 - 0:30] Start with a massive hook about ${idea.title}.`,
                              intro: `[0:30 - 1:15] Give introduction on the core theme.`,
                              body: `[1:15 - 4:30] Walkthrough steps, tutorials, and practical developer insights.`,
                              outro: `[4:30 - 5:00] Summary and subscriber call to action.`
                            });
                            setActiveTab('scripts');
                          }} 
                          className={`btn btn-xs ${evaluatingIdeaId === idea.id ? 'btn-danger' : 'btn-primary'}`}
                          disabled={evaluatingIdeaId && evaluatingIdeaId !== idea.id}
                        >
                          {evaluatingIdeaId === idea.id ? '⏳ Outlining...' : 'Write Script'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'scripts':
        return (
          <div className="scripts-view">
            <div className="view-header">
              <h2>📝 Video Scripts Outline Workspace</h2>
              <p>Write, edit, and export structured, high-retention video scripts.</p>
            </div>

            <div className="script-workspace-split">
              {/* Left pane: meta */}
              <div className="script-meta-pane card">
                <h4>Active Video Outline</h4>
                <div className="meta-field">
                  <label>Working Video Title</label>
                  <input type="text" value={activeScript.title} onChange={(e) => setActiveScript(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className="meta-actions">
                  <button onClick={() => {
                    navigator.clipboard.writeText(`Title: ${activeScript.title}\n\nHook:\n${activeScript.hook}\n\nIntroduction:\n${activeScript.intro}\n\nBody:\n${activeScript.body}\n\nOutro:\n${activeScript.outro}`);
                    alert('Script script template copied to clipboard!');
                  }} className="btn btn-secondary-outline w-100">📋 Copy Entire Script</button>
                  <button 
                    onClick={() => alert('Script draft exported to project documents')} 
                    className={`btn btn-primary w-100 ${(isSimActive && activeScript.hook && activeScript.intro && activeScript.body && activeScript.outro) ? 'animate-pulse' : ''}`} 
                    style={{ 
                      marginTop: '10px',
                      boxShadow: (isSimActive && activeScript.hook && activeScript.intro && activeScript.body && activeScript.outro) ? '0 0 15px rgba(239, 68, 68, 0.6)' : 'none',
                      borderColor: (isSimActive && activeScript.hook && activeScript.intro && activeScript.body && activeScript.outro) ? '#ef4444' : ''
                    }}
                  >
                    Export to Docs
                  </button>
                </div>
              </div>

              {/* Right pane: Script outline body */}
              <div className="script-editor-pane card">
                <div className="editor-section">
                  <label>🪝 Section 1: Video Hook (0:00 - 0:30)</label>
                  <textarea value={activeScript.hook} onChange={(e) => setActiveScript(prev => ({ ...prev, hook: e.target.value }))}></textarea>
                </div>
                <div className="editor-section">
                  <label>🎬 Section 2: Introduction (0:30 - 1:15)</label>
                  <textarea value={activeScript.intro} onChange={(e) => setActiveScript(prev => ({ ...prev, intro: e.target.value }))}></textarea>
                </div>
                <div className="editor-section">
                  <label>📂 Section 3: Core Body & Walkthrough (1:15 - 4:30)</label>
                  <textarea value={activeScript.body} onChange={(e) => setActiveScript(prev => ({ ...prev, body: e.target.value }))}></textarea>
                </div>
                <div className="editor-section">
                  <label>🎯 Section 4: Outro & Call to Action (4:30 - 5:00)</label>
                  <textarea value={activeScript.outro} onChange={(e) => setActiveScript(prev => ({ ...prev, outro: e.target.value }))}></textarea>
                </div>
              </div>
            </div>
          </div>
        );

      case 'thumbnails':
        return (
          <div className="thumbnails-view">
            <div className="view-header">
              <h2>🖼 AI Thumbnail Prompts Engine</h2>
              <p>Generate highly-optimized visual concepts for Midjourney or DALL-E.</p>
            </div>

            <div className="thumbnails-layout-grid">
              {/* Creator block */}
              <div className="thumbnails-creator-panel card">
                <h4>Generate New Visual Concept</h4>
                <form onSubmit={handleGenerateThumbnailPrompt} className="thumbnail-generator-form">
                  <div className="form-group">
                    <label>Video Title or Theme</label>
                    <input type="text" placeholder="e.g. Building an AI Youtube Manager" value={customThumbnailTitle} onChange={(e) => setCustomThumbnailTitle(e.target.value)} required />
                  </div>
                  <button 
                    type="submit" 
                    className={`btn w-100 ${(isSimActive && customThumbnailTitle) ? 'btn-danger animate-pulse' : 'btn-primary'}`}
                    disabled={isSimActive && customThumbnailTitle}
                  >
                    {(isSimActive && customThumbnailTitle) ? '⏳ Synthesizing Prompt...' : 'Build Thumbnail Prompt'}
                  </button>
                </form>
              </div>

              {/* Prompts list */}
              <div className="thumbnails-list-panel">
                {thumbnailPrompts.map((t, idx) => (
                  <div key={idx} className="thumbnail-prompt-card card shadow-sm">
                    <h5>🎬 Concept: {t.title}</h5>
                    <div className="prompt-content">
                      <code>{t.prompt}</code>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => {
                        navigator.clipboard.writeText(t.prompt);
                        alert('Midjourney prompt copied to clipboard!');
                      }} className="btn btn-secondary-outline btn-xs">Copy Prompt</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="analytics-view">
            <div className="view-header">
              <h2>📈 Channel Performance Analytics</h2>
              <p>Audited views and engagement stats synced from database reports.</p>
            </div>

            {/* Growth Graph panel */}
            <div className="analytics-growth-graph card shadow-sm">
              <h4>Subscriber Milestones & Growth Curve</h4>
              {/* SVG Mock Chart */}
              <div className="mock-svg-chart-container">
                <svg viewBox="0 0 500 150" className="growth-curve-svg">
                  <path
                    d="M 0 130 C 100 110, 200 90, 300 70 C 400 50, 450 30, 500 15"
                    fill="none"
                    stroke="#FF0000"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <circle cx="300" cy="70" r="5" fill="#FF0000" />
                  <text x="310" y="65" fill="#ffffff" fontSize="10">Target Met: 1.2K Subs</text>
                </svg>
              </div>
              <div className="chart-legend">
                <span>June 1</span>
                <span>June 15</span>
                <span>June 30</span>
                <span>July 4 (Today)</span>
              </div>
            </div>

            {/* Metric specifics */}
            <div className="analytics-spec-grid">
              <div className="metric-spec-card card">
                <h5>Impressions Click-Through Rate (CTR)</h5>
                <div className="spec-big">{memory.analyticsData?.ctr ? `${memory.analyticsData.ctr}%` : '6.1%'}</div>
                <p>Your CTR has improved by 0.8% since your last upload layout optimization.</p>
              </div>
              <div className="metric-spec-card card">
                <h5>Audience Retention & Watch Time</h5>
                <div className="spec-big">{memory.analyticsData?.retention ? `${memory.analyticsData.retention}%` : '62%'}</div>
                <p>Average watch duration is 4.2K total hours. Retention spikes during video hook introductions.</p>
              </div>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="seo-view">
            <div className="view-header">
              <h2>🎯 Channel SEO & Metadata Auditer</h2>
              <p>Audit title opportunities and retrieve search volume indexes.</p>
            </div>

            <div className="seo-columns-layout">
              {/* Left Form */}
              <div className="seo-form-card card">
                <h4>Keyword Search Analyzer</h4>
                <form onSubmit={handleSEOSearch} className="seo-search-form">
                  <div className="form-group">
                    <label>Target Keyword</label>
                    <input type="text" placeholder="e.g. NextJS 15 configurations" value={seoKeyword} onChange={(e) => setSeoKeyword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Audit Keyword SEO</button>
                </form>
              </div>

              {/* Right Output */}
              <div className="seo-results-pane">
                {seoResults ? (
                  <div className="seo-results-card card shadow-sm">
                    <h4>Results for: "{seoResults.keyword}"</h4>
                    <div className="seo-metrics-row">
                      <div className="seo-metric-box">
                        <span>Search Volume</span>
                        <strong>{seoResults.volume}</strong>
                      </div>
                      <div className="seo-metric-box">
                        <span>Competition Score</span>
                        <strong>{seoResults.difficulty}</strong>
                      </div>
                      <div className="seo-metric-box">
                        <span>CTR Outlook</span>
                        <strong>{seoResults.ctrScore}</strong>
                      </div>
                    </div>

                    <div className="seo-recommended-titles">
                      <h5>High CTR Title Recommendations</h5>
                      <ul>
                        {seoResults.titles.map((title, i) => (
                          <li key={i}>
                            <Check size={14} className="text-green" /> <span>{title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="seo-recommended-tags">
                      <h5>Recommended SEO Tag Meta List</h5>
                      <div className="tags-list">
                        {seoResults.tags.map((tag, i) => (
                          <span key={i} className="tag-badge">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="seo-empty-results card">
                    <Info size={24} className="text-muted" />
                    <p>Enter a target keyword on the left to review metrics and high CTR recommendations.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'memory':
        return (
          <div className="memory-view">
            <div className="view-header">
              <h2>🧠 AI Channel Memory Engine</h2>
              <p>Review the configured channel parameters that outline the AI manager's long-term profile.</p>
            </div>

            {isEditingMemory ? (
              <div className="memory-edit-form-container card">
                <h4>Edit Channel Profile Settings</h4>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>Channel Name</label>
                    <input type="text" value={editableMemory.channelName || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, channelName: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Channel Niche / Topic</label>
                    <input type="text" value={editableMemory.niche || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, niche: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Target Audience</label>
                    <input type="text" value={editableMemory.audience || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, audience: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <input type="text" value={editableMemory.language || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, language: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Target Country</label>
                    <input type="text" value={editableMemory.country || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, country: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Upload Goals</label>
                    <input type="text" value={editableMemory.goal || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, goal: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Upload Frequency</label>
                    <input type="text" value={editableMemory.uploadFrequency || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, uploadFrequency: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Tone Style</label>
                    <input type="text" value={editableMemory.tone || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, tone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Editing Style</label>
                    <input type="text" value={editableMemory.editingStyle || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, editingStyle: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Brand Accent Color</label>
                    <input type="text" value={editableMemory.brandColor || ''} onChange={(e) => setEditableMemory(prev => ({ ...prev, brandColor: e.target.value }))} />
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={handleUpdateMemoryDetails} className="btn btn-primary">Save Profile</button>
                  <button onClick={() => setIsEditingMemory(false)} className="btn btn-secondary-outline">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="memory-cards-display">
                <div className="memory-cards-grid">
                  <div className="mem-prop-card card">
                    <h5>Identity</h5>
                    <p><strong>Channel Name:</strong> {memory.channelName || 'Not Set'}</p>
                    <p><strong>Topic Niche:</strong> {memory.niche || 'Not Set'}</p>
                    <p><strong>Language:</strong> {memory.language || 'English'}</p>
                  </div>

                  <div className="mem-prop-card card">
                    <h5>Audience / Goals</h5>
                    <p><strong>Target Viewers:</strong> {memory.audience || 'Not Set'}</p>
                    <p><strong>Country Target:</strong> {memory.country || 'Not Set'}</p>
                    <p><strong>Subscribers Milestone:</strong> {memory.goal || 'Not Set'}</p>
                  </div>

                  <div className="mem-prop-card card">
                    <h5>Content Style</h5>
                    <p><strong>Upload Schedule:</strong> {memory.uploadFrequency || 'Not Set'}</p>
                    <p><strong>Video Voice Tone:</strong> {memory.tone || 'Not Set'}</p>
                    <p><strong>Editing Style:</strong> {memory.editingStyle || 'Not Set'}</p>
                  </div>

                  <div className="mem-prop-card card">
                    <h5>Branding Accent</h5>
                    <p><strong>Color Theme:</strong> <span style={{ color: memory.brandColor || '#ffffff', fontWeight: 'bold' }}>{memory.brandColor || 'Not Set'}</span></p>
                    <p><strong>Competitor list:</strong> {(memory.competitors || []).join(', ') || 'None set'}</p>
                  </div>
                </div>
                <button onClick={enableEditMemoryMode} className="btn btn-primary edit-mem-btn">Edit Memory Profile</button>
              </div>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="documents-view">
            <div className="view-header">
              <h2>📁 Knowledge Base & Loaded Documents</h2>
              <p>Upload PDF or TXT reports to train your agent on your channel data forever.</p>
            </div>

            <div className="documents-layout-grid">
              {/* Upload panel */}
              <div className="docs-upload-card card">
                <h4>Hydrate System Knowledge</h4>
                <p className="upload-desc">Select an analytics report or brand guidelines file to load into vector database memories.</p>
                <label className="analytics-upload-btn btn btn-secondary-outline">
                  {isUploading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} /> Parsing File...
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> Upload document (PDF/TXT)
                    </>
                  )}
                  <input type="file" accept=".pdf,.txt,.docx" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>

              {/* Docs list */}
              <div className="docs-list-panel card">
                <h4>Active Documents Database</h4>
                <ul className="docs-list">
                  {documents.map((doc, idx) => (
                    <li key={idx} className="doc-row">
                      <div className="doc-meta">
                        <span className="doc-icon">📄</span>
                        <div className="doc-info">
                          <span className="doc-name">{doc.name}</span>
                          <span className="doc-size">{doc.size} | Uploaded {doc.date}</span>
                        </div>
                      </div>
                      <span className="doc-status-badge">{doc.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="settings-view">
            <div className="view-header">
              <h2>⚙ API Integrations & Switches</h2>
              <p>Configure access levels for the YouTube AI Autopilot Manager.</p>
            </div>

            <div className="settings-cards-list">
              <div className="setting-card card shadow-sm">
                <div className="setting-details">
                  <h4>Google Authentication Credentials</h4>
                  <p>Enables single sign-on security protocols and user configuration records.</p>
                </div>
                <div className="toggle-switch">
                  <input type="checkbox" id="g-sign-in" checked={integrations.googleSignIn} onChange={() => setIntegrations(prev => ({ ...prev, googleSignIn: !prev.googleSignIn }))} />
                  <label htmlFor="g-sign-in"></label>
                </div>
              </div>

              <div className="setting-card card shadow-sm">
                <div className="setting-details">
                  <h4>YouTube Data API Sync</h4>
                  <p>Grants agent workspace read/write access to check subscriber counts and schedule video uploads.</p>
                </div>
                <div className="toggle-switch">
                  <input type="checkbox" id="yt-api" checked={integrations.youtubeDataApi} onChange={() => setIntegrations(prev => ({ ...prev, youtubeDataApi: !prev.youtubeDataApi }))} />
                  <label htmlFor="yt-api"></label>
                </div>
              </div>

              <div className="setting-card card shadow-sm">
                <div className="setting-details">
                  <h4>MongoDB Workspace Persistence</h4>
                  <p>Keeps long-term database memories safe across browser workspace instances.</p>
                </div>
                <div className="toggle-switch">
                  <input type="checkbox" id="mongo" checked={integrations.mongodbSync} onChange={() => setIntegrations(prev => ({ ...prev, mongodbSync: !prev.mongodbSync }))} />
                  <label htmlFor="mongo"></label>
                </div>
              </div>

              <div className="setting-card card shadow-sm">
                <div className="setting-details">
                  <h4>Gemini Core API Services</h4>
                  <p>Handles the generative intelligence engine for scriptwriting and outlines.</p>
                </div>
                <div className="toggle-switch">
                  <input type="checkbox" id="gemini" checked={integrations.geminiApiKey} onChange={() => setIntegrations(prev => ({ ...prev, geminiApiKey: !prev.geminiApiKey }))} />
                  <label htmlFor="gemini"></label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown workspace view</div>;
    }
  };

  // --- RENDERING ONBOARDING WIZARD ---
  if (showOnboarding) {
    return (
      <div className="agent-sandbox-page onboarding-wizard-layout">
        <SEOHead
          title="Onboarding Wizard — YouTube Manager Setup"
          description="Initialize your personal YouTube AI manager. Configure your niche, goals, and style."
        />

        <div className="wizard-card-wrap card shadow-lg">
          <div className="wizard-header">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="#ff0000" className="youtube-brand-icon">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <h2>Build Your YouTube AI Manager</h2>
            <p>Let's configure your agent channel settings. We only ask once.</p>
          </div>

          <div className="wizard-progress-bar">
            <div className={`step-dot ${wizardStep >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-connector"></div>
            <div className={`step-dot ${wizardStep >= 2 ? 'active' : ''}`}>2</div>
            <div className="step-connector"></div>
            <div className={`step-dot ${wizardStep >= 3 ? 'active' : ''}`}>3</div>
            <div className="step-connector"></div>
            <div className={`step-dot ${wizardStep >= 4 ? 'active' : ''}`}>4</div>
          </div>

          <div className="wizard-step-body">
            {wizardStep === 1 && (
              <div className="step-panel animate-fade">
                <h4>Step 1: Channel Profile</h4>
                <div className="form-group">
                  <label>Channel Name</label>
                  <input type="text" placeholder="e.g. Tech With Nitin" value={wizardData.channelName} onChange={(e) => setWizardData(prev => ({ ...prev, channelName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Channel Niche / Core Topic</label>
                  <input type="text" placeholder="e.g. AI Tutorials, Web Development" value={wizardData.niche} onChange={(e) => setWizardData(prev => ({ ...prev, niche: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <input type="text" placeholder="e.g. English, Hindi" value={wizardData.language} onChange={(e) => setWizardData(prev => ({ ...prev, language: e.target.value }))} />
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="step-panel animate-fade">
                <h4>Step 2: Audience & Goals</h4>
                <div className="form-group">
                  <label>Target Audience</label>
                  <input type="text" placeholder="e.g. Students, Software Engineers" value={wizardData.audience} onChange={(e) => setWizardData(prev => ({ ...prev, audience: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Target Country</label>
                  <input type="text" placeholder="e.g. United States, India" value={wizardData.country} onChange={(e) => setWizardData(prev => ({ ...prev, country: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Monetization / Subscriber Goal</label>
                  <input type="text" placeholder="e.g. Reach 100K subs & $2K/mo ad revenue" value={wizardData.goal} onChange={(e) => setWizardData(prev => ({ ...prev, goal: e.target.value }))} />
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="step-panel animate-fade">
                <h4>Step 3: Content Style</h4>
                <div className="form-group">
                  <label>Upload Frequency</label>
                  <input type="text" placeholder="e.g. 2 Videos / Week, Weekly" value={wizardData.uploadFrequency} onChange={(e) => setWizardData(prev => ({ ...prev, uploadFrequency: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Voice Tone Style</label>
                  <input type="text" placeholder="e.g. Friendly, Informative, Energetic" value={wizardData.tone} onChange={(e) => setWizardData(prev => ({ ...prev, tone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Editing Style</label>
                  <input type="text" placeholder="e.g. Fast-paced with visuals, Cinematic minimal" value={wizardData.editingStyle} onChange={(e) => setWizardData(prev => ({ ...prev, editingStyle: e.target.value }))} />
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="step-panel animate-fade">
                <h4>Step 4: Branding Details</h4>
                <div className="form-group">
                  <label>Brand Accent Color</label>
                  <input type="text" placeholder="e.g. Neon Red, Deep Purple (#FF0000)" value={wizardData.brandColor} onChange={(e) => setWizardData(prev => ({ ...prev, brandColor: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Competitors (Comma separated)</label>
                  <input type="text" placeholder="e.g. TechLead, Fireship, MrBeast" value={wizardData.competitors} onChange={(e) => setWizardData(prev => ({ ...prev, competitors: e.target.value }))} />
                </div>
              </div>
            )}
          </div>

          <div className="wizard-actions">
            {wizardStep > 1 && (
              <button onClick={() => setWizardStep(prev => prev - 1)} className="btn btn-secondary-outline">Back</button>
            )}

            {wizardStep < 4 ? (
              <button
                onClick={() => {
                  if (wizardStep === 1 && (!wizardData.channelName || !wizardData.niche)) {
                    alert('Please enter Channel Name and Niche.');
                    return;
                  }
                  setWizardStep(prev => prev + 1);
                }}
                className="btn btn-primary"
                style={{ marginLeft: 'auto' }}
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={handleSaveOnboarding} className="btn btn-primary animate-pulse" style={{ marginLeft: 'auto' }}>
                Save & Launch Workspace
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- THREE-COLUMN WORKSPACE PLATFORM LAYOUT ---
  return (
    <div className="agent-sandbox-page workspace-dashboard-layout">
      <SEOHead
        title="YouTube AI Manager Workspace — Creator Studio"
        description="Interact with the YouTube AI Agent. Connect data, configure rulesets, and automate video script creation workflows."
      />

      {/* Top Header */}
      <header className="sandbox-top-header">
        <div className="header-left">
          <button onClick={() => window.close()} className="btn-close-workspace">
            <ArrowLeft size={16} /> Close Workspace
          </button>
        </div>
        <div className="header-center">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#ff0000" className="youtube-brand-icon">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="header-brand-title">YouTube Autopilot Workspace</span>
          
          <div className="mode-toggle-pill">
            <button className="mode-toggle-btn active" title="Active demo workspace sandbox" disabled>
              Demo Mode
            </button>
            <button 
              className="mode-toggle-btn premium-btn" 
              title="Unlock full Autopilot integrations"
              onClick={() => navigate('/pricing', { state: { scrollTo: 'agents' } })}
            >
              Go Premium ✨
            </button>
          </div>
        </div>
        <div className="header-right">
          <span className="user-profile-badge">
            👤 {state.user?.name || 'Creator'}
          </span>
        </div>
      </header>

      {/* Main 3-column body */}
      <div className="workspace-main-body">
        {/* Column 1: Left Navigation Sidebar */}
        <aside className="workspace-sidebar">
          <div className="sidebar-section-title">Workspace Navigation</div>
          <nav className="sidebar-nav">
            <button onClick={() => setActiveTab('overview')} className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
              <Home size={18} /> Overview
            </button>
            <button onClick={() => setActiveTab('chat')} className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}>
              <MessageSquare size={18} /> Interactive Chat
            </button>
            <button onClick={() => setActiveTab('workflows')} className={`nav-item ${activeTab === 'workflows' ? 'active' : ''}`}>
              <Zap size={18} /> Workflows
            </button>
            <button onClick={() => setActiveTab('planner')} className={`nav-item ${activeTab === 'planner' ? 'active' : ''}`}>
              <Calendar size={18} /> Content Planner
            </button>
            <button onClick={() => setActiveTab('ideas')} className={`nav-item ${activeTab === 'ideas' ? 'active' : ''}`}>
              <Sparkles size={18} /> Video Ideas
            </button>
            <button onClick={() => setActiveTab('scripts')} className={`nav-item ${activeTab === 'scripts' ? 'active' : ''}`}>
              <PenTool size={18} /> Video Scripts
            </button>
            <button onClick={() => setActiveTab('thumbnails')} className={`nav-item ${activeTab === 'thumbnails' ? 'active' : ''}`}>
              <Image size={18} /> Thumbnails
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}>
              <BarChart2 size={18} /> Analytics
            </button>
            <button onClick={() => setActiveTab('seo')} className={`nav-item ${activeTab === 'seo' ? 'active' : ''}`}>
              <Globe size={18} /> SEO & Tags
            </button>
            <button onClick={() => setActiveTab('memory')} className={`nav-item ${activeTab === 'memory' ? 'active' : ''}`}>
              <Database size={18} /> Memory Engine
            </button>
            <button onClick={() => setActiveTab('documents')} className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`}>
              <FileText size={18} /> Knowledge Base
            </button>
            <button onClick={() => setActiveTab('settings')} className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
              <Settings size={18} /> API Toggles
            </button>
          </nav>

          <div className="demo-control-panel">
            <div className="sidebar-section-title">Demo Control</div>
            <button 
              onClick={() => setIsSimActive(prev => !prev)} 
              className={`demo-sim-toggle-btn ${isSimActive ? 'running' : 'stopped'}`}
              title={isSimActive ? "Pause the automated demo walk" : "Resume the automated demo walk"}
            >
              {isSimActive ? '⏹ Stop Demo Autoplay' : '▶ Start Demo Autoplay'}
            </button>
          </div>
        </aside>

        {/* Column 2: Center Content Area */}
        <main className="workspace-center-content">
          {renderCenterContent()}
        </main>

        {/* Column 3: Right AI Status Panel */}
        <aside className="workspace-right-status">
          <div className="status-header">
            <div className="status-indicator">
              <span className={`status-dot ${isChatLoading || runningWorkflow ? 'active-thinking' : 'active-idle'}`}></span>
              <span className="status-text">{isChatLoading || runningWorkflow ? '🟢 AI Working' : '⚪ AI Idle'}</span>
            </div>
          </div>

          {runningWorkflow && (
            <div className="status-progress-card">
              <h4>Running: {runningWorkflow.name}</h4>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${runningWorkflow.progress}%` }}></div>
              </div>
              <div className="progress-step-desc">{runningWorkflow.currentStep}</div>
            </div>
          )}

          <div className="status-badges-card">
            <h4>Connected Systems</h4>
            <div className="badge-grid">
              <div className={`status-badge ${integrations.youtubeDataApi ? 'connected' : 'disconnected'}`}>
                <span>YouTube API</span>
                <span className="badge-dot"></span>
              </div>
              <div className={`status-badge ${integrations.mongodbSync ? 'connected' : 'disconnected'}`}>
                <span>MongoDB Sync</span>
                <span className="badge-dot"></span>
              </div>
              <div className={`status-badge ${integrations.geminiApiKey ? 'connected' : 'disconnected'}`}>
                <span>Gemini API</span>
                <span className="badge-dot"></span>
              </div>
            </div>
          </div>

          <div className="status-stats-summary">
            <h4>Workspace Overview</h4>
            <div className="stat-summary-row">
              <span>Channel Profile</span>
              <strong>{memory.channelName ? 'Loaded' : 'Uninitialized'}</strong>
            </div>
            <div className="stat-summary-row">
              <span>Active Tasks</span>
              <strong>{tasks.filter(t => !t.completed).length} Pending</strong>
            </div>
            <div className="stat-summary-row">
              <span>Knowledge Base</span>
              <strong>{documents.length} Docs</strong>
            </div>
          </div>

          <div className="status-timeline-card">
            <h4>AI Activity Timeline</h4>
            <div className="timeline-items">
              {timelineLogs.slice(-6).map((log, index) => (
                <div key={index} className="timeline-log-row">
                  <span className="log-time">{log.time}</span>
                  <span className="log-text">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
