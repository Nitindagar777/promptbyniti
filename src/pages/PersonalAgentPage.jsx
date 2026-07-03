/* PersonalAgentPage — Interactive Agent Customization and Feature Showcase */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bot, Send, Sparkles, Database, Globe, RefreshCw,
  Upload, Check, ArrowRight, ShieldCheck, Cpu,
  Layers, Plus, Zap, Search, Info, X as CloseIcon,
  Code, Terminal, Smartphone, Gamepad2, Shield,
  Server, Palette, Briefcase, TrendingUp, PenTool,
  BookOpen, DollarSign, Heart, Compass, Calendar,
  MessageSquare, BarChart2, Play, CheckCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SEOHead from '../components/SEOHead';
import './PersonalAgentPage.css';

// Tone presets configuration
const TONE_PRESETS = [
  {
    id: 'creative',
    name: 'Vibrant Marketer',
    emoji: '🎨',
    desc: 'Witty, energetic, and heavy on storytelling.',
    greeting: "Hey there! Ready to turn some heads and cook up some stellar marketing magic? What are we launching today? 🚀",
    replies: [
      "Oh, that is absolutely brilliant! Let's wrap that in a gorgeous visual story and add some neon vibes. What's our next headline? ✨",
      "I love this angle! It has 'viral' written all over it. Let's double down on the emotional hook and run with it! 🎨🔥",
      "Stellar choice! Let's draft a thread that keeps people scrolling. Humans love a good narrative arc, trust me! 📈"
    ]
  },
  {
    id: 'developer',
    name: 'Tech Architect',
    emoji: '💻',
    desc: 'Precise, logical, and code-oriented.',
    greeting: "Agent initialized. Terminal ready. What system are we debugging or refactoring today? 💻",
    replies: [
      "Query received. That's a classic computational challenge. I'd structure this as a decoupled state machine to prevent race conditions. Let's write some clean code. 🛠️",
      "Analyzing performance metrics... If we leverage CSS custom properties, we can avoid heavy render cycles. Shall I write the boilerplate? 🚀",
      "Standard pattern identified. I suggest creating a custom React hook to wrap this logic. Let's make it modular and testable. 📦"
    ]
  },
  {
    id: 'critic',
    name: 'Snarky Critic',
    emoji: '😼',
    desc: 'Bold, sarcastic, and extremely direct.',
    greeting: "Oh, look, another human task. Fine. What basic idea are we attempting to polish today? Try not to make it boring. 😼",
    replies: [
      "Honestly? It's a bit average. But don't worry, with my processing power, we can salvage it. Let's trim 50% of the fluff. 🙄",
      "That's one way to do it. If you want to put people to sleep, that is. Let's inject some actual character and make it pop! ⚡",
      "Typical query. Let's optimize it before someone notices how standard it was. Upgrading state machines now... 🛠️"
    ]
  },
  {
    id: 'counselor',
    name: 'Zen Planner',
    emoji: '🧘',
    desc: 'Empathetic, structured, and calming.',
    greeting: "Hello. Take a deep breath. Let's organize your thoughts and tackle your goals step-by-step. What's on your mind? 🧘",
    replies: [
      "That sounds like a lot to handle at once. Let's break this down into three small, manageable tasks. How does that sound? 🌸",
      "I hear you. Focus on the core objective first. Everything else is just noise. We can refine the details later. 🕊️",
      "Progress is progress, no matter how small. Let's write down a clear checklist to keep your focus steady. We've got this. ✨"
    ]
  }
];

// All AI Employees Categorized
const AI_EMPLOYEE_CATEGORIES = [
  {
    id: 'creator',
    name: 'Creator Platform Agents',
    emoji: '🎬',
    agents: [
      'YouTube AI', 'Instagram AI', 'TikTok AI', 'Facebook AI', 'LinkedIn AI',
      'X (Twitter) AI', 'Threads AI', 'Pinterest AI', 'Snapchat AI', 'Reddit AI',
      'Telegram AI', 'Discord AI', 'WhatsApp Business AI', 'Twitch AI', 'Kick AI',
      'Vimeo AI', 'Dailymotion AI', 'Medium AI', 'Substack AI', 'Patreon AI'
    ]
  },
  {
    id: 'developer',
    name: 'Development Agents',
    emoji: '💻',
    agents: [
      'Full Stack Developer AI', 'Frontend Developer AI', 'Backend Developer AI',
      'Mobile App Developer AI', 'Game Developer AI', 'AI Engineer AI', 'DevOps AI',
      'UI/UX Designer AI', 'Database Engineer AI', 'API Developer AI', 'Cloud Engineer AI',
      'Cybersecurity AI', 'Software Tester AI', 'System Architect AI'
    ]
  },
  {
    id: 'business',
    name: 'Business Agents',
    emoji: '💼',
    agents: [
      'Business Consultant AI', 'Startup Mentor AI', 'CEO Assistant AI',
      'Operations Manager AI', 'Project Manager AI', 'Product Manager AI',
      'Business Analyst AI', 'Sales Manager AI', 'Customer Success AI', 'HR Manager AI'
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing Agents',
    emoji: '📈',
    agents: [
      'Digital Marketing AI', 'SEO AI', 'Content Marketing AI', 'Email Marketing AI',
      'Affiliate Marketing AI', 'Influencer Marketing AI', 'Brand Strategist AI',
      'Advertising AI', 'Lead Generation AI', 'Growth Marketing AI'
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Agents',
    emoji: '🛒',
    agents: [
      'Shopify AI', 'Amazon Seller AI', 'Etsy AI', 'WooCommerce AI', 'eBay AI',
      'Dropshipping AI', 'Product Research AI', 'Product Listing AI'
    ]
  },
  {
    id: 'writing',
    name: 'Writing Agents',
    emoji: '✍️',
    agents: [
      'Content Writer AI', 'Copywriter AI', 'Blog Writer AI', 'Technical Writer AI',
      'Resume Writer AI', 'Book Writer AI', 'Story Writer AI', 'Email Writer AI',
      'Proposal Writer AI', 'Translator AI'
    ]
  },
  {
    id: 'design',
    name: 'Design Agents',
    emoji: '🎨',
    agents: [
      'Graphic Designer AI', 'Logo Designer AI', 'Brand Identity AI', 'Thumbnail Designer AI',
      'Presentation Designer AI', 'Poster Designer AI', 'UI Designer AI', 'Packaging Designer AI'
    ]
  },
  {
    id: 'ai',
    name: 'AI Agents',
    emoji: '🤖',
    agents: [
      'Prompt Engineer AI', 'AI Automation AI', 'AI Workflow Builder AI',
      'AI Research AI', 'AI Consultant AI'
    ]
  },
  {
    id: 'education',
    name: 'Education Agents',
    emoji: '📚',
    agents: [
      'Teacher AI', 'Coding Tutor AI', 'Math Tutor AI', 'Science Tutor AI',
      'Language Tutor AI', 'Research Assistant AI', 'Exam Coach AI'
    ]
  },
  {
    id: 'finance',
    name: 'Finance Agents',
    emoji: '💰',
    agents: [
      'Financial Advisor AI', 'Investment Advisor AI', 'Crypto Advisor AI',
      'Tax Advisor AI', 'Budget Planner AI', 'Accountant AI'
    ]
  },
  {
    id: 'legal',
    name: 'Legal Agents',
    emoji: '⚖️',
    agents: [
      'Legal Assistant AI', 'Contract Writer AI', 'Compliance AI', 'Policy Generator AI'
    ]
  },
  {
    id: 'health',
    name: 'Health Agents',
    emoji: '🏥',
    agents: [
      'Fitness Coach AI', 'Nutrition Coach AI', 'Meal Planner AI', 'Wellness Coach AI'
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Agents',
    emoji: '🌍',
    agents: [
      'Travel Planner AI', 'Event Planner AI', 'Shopping Assistant AI',
      'Recipe Assistant AI', 'Fashion Advisor AI'
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity Agents',
    emoji: '🧠',
    agents: [
      'Personal Assistant AI', 'Daily Planner AI', 'Meeting Assistant AI',
      'Note Organizer AI', 'Task Manager AI', 'Habit Coach AI', 'Time Manager AI'
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming Agents',
    emoji: '🎮',
    agents: [
      'Gaming Coach AI', 'Minecraft AI', 'Roblox AI', 'Unity AI', 'Unreal Engine AI'
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment Agents',
    emoji: '🎭',
    agents: [
      'Movie Expert AI', 'Anime Expert AI', 'Book Expert AI', 'Music Expert AI',
      'Joke Generator AI', 'Meme Creator AI'
    ]
  },
  {
    id: 'communication',
    name: 'Communication Agents',
    emoji: '❤️',
    agents: [
      'Relationship Coach AI', 'Conversation Coach AI', 'Public Speaking Coach AI',
      'Interview Coach AI', 'Negotiation Coach AI'
    ]
  },
  {
    id: 'research',
    name: 'Research Agents',
    emoji: '📊',
    agents: [
      'Market Research AI', 'Trend Research AI', 'Competitor Research AI',
      'Data Analyst AI', 'Fact Checker AI'
    ]
  }
];

// Custom capabilities lookup
const getAgentFeatures = (name) => {
  if (name === 'YouTube AI') {
    return [
      "Channel setup", "Channel naming", "Branding", "Logo ideas", "Banner ideas",
      "Niche selection", "Competitor analysis", "Content strategy", "Video ideas",
      "Script writing", "Hook generation", "Thumbnail ideas", "Thumbnail prompts",
      "Titles", "Descriptions", "Tags", "SEO", "Chapters", "Shorts ideas",
      "Community posts", "Analytics interpretation", "Audience analysis", "Monetization",
      "Sponsorship strategies", "Collaboration ideas", "Growth planning", "Upload scheduling",
      "Copyright guidance", "Channel audits", "A/B testing ideas", "Content repurposing",
      "Long-term channel roadmap"
    ];
  }

  if (name === 'Telegram AI') {
    return [
      "Channel & Group setup", "Custom bot development", "Automation rules",
      "Interactive polls & quizzes", "Broadcast announcement scheduling",
      "Community moderation & anti-spam", "Welcome messages", "Engagement strategies",
      "Analytics & member growth tracking", "Monetization through paid subscriptions",
      "Sticker & emoji branding ideas", "Cross-promotion planning", "Long-term group roadmap"
    ];
  }

  if (name === 'TikTok AI') {
    return [
      "Account optimization", "Niche research", "Viral hook writing",
      "Trending audio analysis", "Video script outlines", "Hashtag strategies",
      "Captions & descriptions", "Video pacing suggestions", "Duet & Stitch ideas",
      "Analytics auditing", "Audience engagement rules", "Brand sponsorship outreach",
      "Content calendar scheduling", "Long-term channel growth roadmap"
    ];
  }

  if (name === 'Instagram AI') {
    return [
      "Profile bio optimization", "Content pillars setup", "Reels script writing",
      "Carousel outline design", "Caption & Hook drafting", "Hashtag research",
      "Story prompts & engagement stickers", "Competitor audit", "DM automation script",
      "Collab post ideas", "Sponsored content strategy", "Insights analysis",
      "Grid aesthetics plan", "Long-term growth roadmap"
    ];
  }

  if (name === 'X (Twitter) AI') {
    return [
      "Bio optimization", "Thread structure & writing", "Daily tweet drafting",
      "Engagement strategies", "Viral hook formats", "List building suggestions",
      "Direct message template generation", "Space planning", "Trend analysis",
      "Competitor audit", "Growth roadmap", "Analytics review"
    ];
  }

  if (name === 'Full Stack Developer AI') {
    return [
      "System architecture planning", "Database schema design", "API design & documentation",
      "State management logic", "Frontend structure & component setup",
      "Backend business logic", "Server configuration", "Deployment pipeline setup",
      "Performance optimization", "Security audits & guardrails", "Debugging & error tracking",
      "Testing setup (Unit & Integration)", "Refactoring code guides", "CI/CD implementation",
      "Database query optimization", "Code review guidelines", "Long-term tech stack roadmap"
    ];
  }

  // General fallbacks based on name
  const prefix = name.replace(' AI', '');
  return [
    `${prefix} setup & environment config`,
    `${prefix} strategy & niche planning`,
    `Competitor analysis in ${prefix} space`,
    `Optimized templates for ${prefix}`,
    `Automated workflows for ${prefix}`,
    `${prefix} quality audit & guidelines`,
    `${prefix} formatting & metadata`,
    `Analytics & insights interpretation`,
    `Monetization & ROI planning for ${prefix}`,
    `Collaboration & networking ideas`,
    `Growth & scaling strategies`,
    `Long-term ${prefix} roadmap`,
    `Interactive Q&A & troubleshooting`,
    `Asset & template generation`
  ];
};

// Helper function to dynamically rotate colors for directory cards based on their name to prevent repetition
const getDynamicColorClass = (name) => {
  const colors = ['text-cyan', 'text-orange', 'text-pink', 'text-purple', 'text-green', 'text-yellow', 'text-blue', 'text-red'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Helper function to map domain specialist agents to their correct platform brand SVGs
const getAgentIcon = (name, size = 22) => {
  const normalized = name.toLowerCase();

  if (normalized.includes('youtube')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#ff0000"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
  }
  if (normalized.includes('instagram')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} stroke="#e1306c" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
  }
  if (normalized.includes('tiktok')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#ffffff"><path d="M12.525.01c1.306-.022 2.616-.011 3.921-.013.06 1.777.838 3.491 2.127 4.744.137.112.274.223.411.336v3.832c-1.503-.016-2.997-.506-4.22-1.396-.134-.092-.26-.196-.388-.3v4.444c.061 5.372-4.103 9.948-9.467 10.02-5.717.151-10.428-4.48-10.37-10.222.062-5.187 4.148-9.525 9.327-9.84v3.82c-2.923.167-5.263 2.584-5.3 5.512-.047 3.397 2.822 6.2 6.22 6.136 3.076-.025 5.586-2.482 5.586-5.556v-11.66z" /></svg>;
  }
  if (normalized.includes('telegram')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#0088cc"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.99.53-1.4.52-.46-.01-1.34-.26-2-.47-.8-.26-1.44-.4-1.39-.85.03-.24.36-.48.99-.74 3.86-1.68 6.44-2.78 7.74-3.3 3.69-1.49 4.45-1.75 4.95-1.76.11 0 .36.03.52.16.14.11.18.26.19.38.01.07.01.15-.01.22z" /></svg>;
  }
  if (normalized.includes('linkedin')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#0077b5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
  }
  if (normalized.includes('twitter') || normalized === 'x ai') {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#ffffff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
  }
  if (normalized.includes('facebook')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
  }
  if (normalized.includes('threads')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#ffffff"><path d="M12.553 1.22c-5.918-.11-10.82 4.673-10.925 10.606-.11 6.257 4.966 11.23 11.23 11.23h1.833a1.5 1.5 0 0 0 1.5-1.5v-1.5a1.5 1.5 0 0 0-1.5-1.5h-1.833c-3.712 0-6.727-3.015-6.727-6.73 0-3.626 2.946-6.572 6.572-6.572 3.655 0 6.63 2.975 6.63 6.63v.917c0 .91-.74 1.65-1.65 1.65-.823 0-1.517-.611-1.628-1.428l-.062-.489a3.834 3.834 0 0 0-3.424 2.158 3.833 3.833 0 0 0 3.513 5.438c1.378 0 2.585-.733 3.255-1.826a4.655 4.655 0 0 0 4.615.112c1.787-.96 2.825-2.82 2.825-4.887v-.917c0-5.318-4.329-9.647-9.647-9.647zm0 13.914a2.006 2.006 0 1 1 0-4.012 2.006 2.006 0 0 1 0 4.012z" /></svg>;
  }
  if (normalized.includes('pinterest')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#bd081c"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.946-.199-2.383.041-3.411.218-.941 1.406-5.978 1.406-5.978s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.195.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.091.378-.293 1.189-.332 1.353-.052.218-.172.264-.397.16-1.482-.689-2.41-2.855-2.41-4.594 0-3.743 2.722-7.182 7.842-7.182 4.117 0 7.317 2.933 7.317 6.856 0 4.092-2.584 7.382-6.173 7.382-1.206 0-2.34-.627-2.729-1.372 0 0-.597 2.274-.741 2.833-.269 1.033-1.002 2.327-1.492 3.125C10.124 23.857 11.053 24 12.017 24c6.62 0 11.983-5.367 11.983-11.987C24 5.367 18.637 0 12.017 0z" /></svg>;
  }
  if (normalized.includes('snapchat')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#fffc00" stroke="#000000" strokeWidth="1.5"><path d="M12 2c-3.9 0-7 2.5-7 5.5 0 1.3.6 2.5 1.7 3.3.3.2.5.5.4.9l-.6 2.3c-.1.5.3.9.8.7l2.2-.8c.3-.1.6 0 .8.2 1 .7 2.2 1.1 3.7 1.1s2.7-.4 3.7-1.1c.2-.2.5-.3.8-.2l2.2.8c.5.2.9-.2.8-.7l-.6-2.3c-.1-.4.1-.7.4-.9 1.1-.8 1.7-2 1.7-3.3C19 4.5 15.9 2 12 2z" /></svg>;
  }
  if (normalized.includes('reddit')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#ff4500"><path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.35-4.24 3.71.79c.04.97.84 1.73 1.82 1.73 1 0 1.82-.81 1.82-1.82s-.81-1.82-1.82-1.82c-.89 0-1.64.65-1.79 1.51l-4.14-.88c-.18-.04-.37.05-.43.23L9.66 7.02c-2.48.04-4.73.68-6.4 1.71C2.7 7.98 1.8 7.5 1 7.5c-1.65 0-3 1.35-3 3 0 1.11.61 2.08 1.52 2.59-.02.14-.02.27-.02.41 0 3.97 4.69 7.2 10.5 7.2s10.5-3.23 10.5-7.2c0-.14 0-.27-.02-.41.91-.51 1.52-1.48 1.52-2.59zM6.75 14.25c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm9 3c-1.8 1.8-5.7 1.8-7.5 0-.15-.15-.15-.39 0-.54.15-.15.39-.15.54 0 1.5 1.5 4.9 1.5 6.4 0 .15-.15.39-.15.54 0 .15.15.15.39 0 .54zm-.75-1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>;
  }
  if (normalized.includes('whatsapp')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#25D366"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.731-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.793 1.452 5.532 0 10.032-4.502 10.035-10.04.001-2.683-1.042-5.204-2.937-7.1a9.97 9.97 0 0 0-7.113-2.946c-5.53 0-10.03 4.502-10.033 10.041-.001 1.93.528 3.815 1.529 5.466l-.982 3.585 3.673-.963zm13.16-5.834c-.212-.107-1.253-.619-1.447-.689-.194-.069-.336-.104-.477.107-.141.212-.547.689-.671.83-.124.14-.248.158-.46.052-.213-.107-.899-.331-1.713-1.057-.633-.565-1.061-1.264-1.185-1.477-.124-.213-.013-.328.093-.434.096-.095.212-.248.318-.372.106-.124.141-.212.212-.353.07-.142.035-.265-.018-.371-.053-.107-.477-1.149-.654-1.574-.172-.416-.347-.359-.477-.359-.124 0-.265-.007-.406-.007-.141 0-.372.053-.566.265-.194.212-.742.725-.742 1.767 0 1.042.76 2.049.866 2.19.106.141 1.494 2.282 3.62 3.2.505.219.9.35 1.21.447.508.162.97.139 1.336.085.407-.06 1.253-.512 1.43-.1.176-.411.176-.764.124-.818-.053-.053-.194-.088-.407-.194z" /></svg>;
  }
  if (normalized.includes('discord')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" /></svg>;
  }
  if (normalized.includes('twitch')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#9146FF"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" /></svg>;
  }
  if (normalized.includes('kick')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#53fc18"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9.5 15.5H8v-7h1.5v2.5L12 8.5h1.8l-2.6 3.2 2.8 3.8h-1.8L9.5 12v3.5z" /></svg>;
  }
  if (normalized.includes('vimeo')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#1ab7ea"><path d="M22.396 7.42c-.08 1.83-1.365 4.34-3.858 7.53-2.585 3.32-4.78 4.98-6.58 4.98-1.11 0-2.053-1.02-2.83-3.07-.518-1.9-1.037-3.8-1.554-5.7-1.196-.065-2.095-.56-2.69-1.488-.595-.928-1.193-1.856-1.792-2.784l2.197-1.85c1.42 1.2 2.39 1.85 2.91 1.94 1.23.23 1.9.46 2.03.7.45 2.16.78 4.36.97 6.6.13 1.62.45 2.43.97 2.43.39 0 1.07-.65 2.04-1.95.97-1.3 1.52-2.3 1.65-3 .26-1.49-.22-2.24-1.45-2.24-.58 0-1.16.13-1.75.39a8.683 8.683 0 0 0 4.01-6.1c.19-.9.77-1.33 1.74-1.33 1.1 0 1.74.74 1.94 2.23.2 1.49.2 2.98.02 4.47z" /></svg>;
  }
  if (normalized.includes('medium')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#ffffff"><path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" /></svg>;
  }
  if (normalized.includes('substack')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#ff5722"><path d="M22.539 8.242H1.46V5.406h21.078v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.539 0H1.46v2.836h21.078V0z" /></svg>;
  }
  if (normalized.includes('patreon')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#ff424d"><path d="M0 .007h4.168v23.993H0V.007zm16.586.007c-4.088 0-7.414 3.326-7.414 7.414 0 4.09 3.326 7.414 7.414 7.414 4.09 0 7.414-3.324 7.414-7.414 0-4.088-3.324-7.414-7.414-7.414z" /></svg>;
  }
  if (normalized.includes('spotify')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#1DB954"><path d="M12 .007a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.49 17.31c-.24.39-.75.51-1.14.28-3.03-1.85-6.85-2.27-11.34-1.24-.44.1-.9-.17-.99-.61-.1-.44.17-.9.61-.99 4.93-1.13 9.13-.65 12.58 1.46.39.24.51.75.28 1.1zm1.46-3.26c-.3.49-.93.65-1.42.35-3.47-2.14-8.77-2.76-12.87-1.51-.55.17-1.13-.15-1.3-.7-.17-.55.15-1.13.7-1.3 4.69-1.42 10.53-.73 14.54 1.74.49.3.65.93.35 1.42zm.12-3.39c-4.16-2.47-11.02-2.7-15.02-1.48-.64.19-1.31-.16-1.5-.8-.19-.64.16-1.3.8-1.5 4.59-1.39 12.16-1.11 16.94 1.73.57.34.76 1.08.42 1.65-.34.57-1.08.76-1.65.42z" /></svg>;
  }
  if (normalized.includes('shopify')) {
    return <svg viewBox="0 0 24 24" width={size} height={size} fill="#96bf48"><path d="M19.5 9.3c-.3-.2-.6-.3-.9-.3h-.3v-.3c0-.3-.1-.6-.3-.9-.2-.3-.5-.4-.9-.4h-.3V7c0-.6-.5-1-1-1h-.3V5.5c0-.8-.7-1.5-1.5-1.5h-1c-.8 0-1.5.7-1.5 1.5V6H11V5.5C11 4.7 10.3 4 9.5 4h-1c-.8 0-1.5.7-1.5 1.5V6H6.8V5.7c0-.8-.7-1.5-1.5-1.5h-1c-.8 0-1.5.7-1.5 1.5v6.5c0 .8.7 1.5 1.5 1.5h.3v.3c0 .8.7 1.5 1.5 1.5h.3v.3c0 .8.7 1.5 1.5 1.5h7c.8 0 1.5-.7 1.5-1.5v-.3h.3c.8 0 1.5-.7 1.5-1.5V9.6c.1-.1 0-.2-.1-.3z" /></svg>;
  }

  // Developer/Coding agents
  if (normalized.includes('developer') || normalized.includes('api developer') || normalized.includes('ai engineer') || normalized.includes('coding tutor')) {
    return <Code size={size} className={getDynamicColorClass(name)} />;
  }
  // DevOps / Cloud / Systems / Database / Server / Tech Architect
  if (normalized.includes('devops') || normalized.includes('cloud') || normalized.includes('system') || normalized.includes('database') || normalized.includes('architect') || normalized.includes('security')) {
    return <Terminal size={size} className={getDynamicColorClass(name)} />;
  }
  // Mobile app developer
  if (normalized.includes('mobile')) {
    return <Smartphone size={size} className={getDynamicColorClass(name)} />;
  }
  // Game Developer / Gaming / Minecraft / Roblox / Unity / Unreal
  if (normalized.includes('game') || normalized.includes('minecraft') || normalized.includes('roblox') || normalized.includes('unity') || normalized.includes('unreal')) {
    return <Gamepad2 size={size} className={getDynamicColorClass(name)} strokeWidth={1.8} />;
  }
  // Cybersecurity / Guardrails / Safety / Legal / Compliance / Policy / Contract
  if (normalized.includes('cybersecurity') || normalized.includes('safety') || normalized.includes('legal') || normalized.includes('compliance') || normalized.includes('policy') || normalized.includes('contract')) {
    return <Shield size={size} className={getDynamicColorClass(name)} />;
  }
  // UI/UX / Designer / Graphic / Logo / Thumbnail / Presentation / Poster / Brand Identity
  if (normalized.includes('designer') || normalized.includes('design') || normalized.includes('brand identity') || normalized.includes('thumbnail') || normalized.includes('presentation') || normalized.includes('poster') || normalized.includes('logo') || normalized.includes('packaging')) {
    return <Palette size={size} className={getDynamicColorClass(name)} />;
  }
  // Business / CEO / Operations / Project / Product Manager / HR / Consultant / Mentor
  if (normalized.includes('business consultant') || normalized.includes('startup') || normalized.includes('ceo') || normalized.includes('operations') || normalized.includes('project manager') || normalized.includes('product manager') || normalized.includes('hr manager') || normalized.includes('analyst')) {
    return <Briefcase size={size} className={getDynamicColorClass(name)} />;
  }
  // Marketing / SEO / Sales / Advertising / Growth / Lead Generation / Affiliate / Influencer
  if (normalized.includes('marketing') || normalized.includes('seo') || normalized.includes('sales') || normalized.includes('advertising') || normalized.includes('growth') || normalized.includes('lead generation') || normalized.includes('affiliate') || normalized.includes('influencer') || normalized.includes('strategist')) {
    return <TrendingUp size={size} className={getDynamicColorClass(name)} />;
  }
  // Writer / Copywriter / blog / technical / Resume / book / story / translator / proposal / note organizer
  if (normalized.includes('writer') || normalized.includes('copywriter') || normalized.includes('blog') || normalized.includes('technical') || normalized.includes('resume') || normalized.includes('story') || normalized.includes('translator') || normalized.includes('proposal') || normalized.includes('note')) {
    return <PenTool size={size} className={getDynamicColorClass(name)} />;
  }
  // Teacher / Tutor / Book / Anime / Movie / Education / Research Assistant
  if (normalized.includes('teacher') || normalized.includes('tutor') || normalized.includes('book') || normalized.includes('anime') || normalized.includes('movie') || normalized.includes('education') || normalized.includes('exam')) {
    return <BookOpen size={size} className={getDynamicColorClass(name)} />;
  }
  // Financial / Investment / Crypto / Tax / Budget / Accountant
  if (normalized.includes('financial') || normalized.includes('investment') || normalized.includes('crypto') || normalized.includes('tax') || normalized.includes('budget') || normalized.includes('accountant') || normalized.includes('finance')) {
    return <DollarSign size={size} className={getDynamicColorClass(name)} />;
  }
  // Fitness / Nutrition / Meal Planner / Wellness / Relationship / Heart / Health
  if (normalized.includes('fitness') || normalized.includes('nutrition') || normalized.includes('meal') || normalized.includes('wellness') || normalized.includes('relationship') || normalized.includes('health') || normalized.includes('coach')) {
    return <Heart size={size} className={getDynamicColorClass(name)} fill="currentColor" stroke="none" />;
  }
  // Travel / Compass / Event / Lifestyle / Fashion
  if (normalized.includes('travel') || normalized.includes('event') || normalized.includes('lifestyle') || normalized.includes('fashion') || normalized.includes('recipe') || normalized.includes('shopping')) {
    return <Compass size={size} className={getDynamicColorClass(name)} />;
  }
  // Daily / Task / Habit / Time / Meeting / Planner / Schedule / Calendar
  if (normalized.includes('daily') || normalized.includes('task') || normalized.includes('habit') || normalized.includes('time') || normalized.includes('meeting') || normalized.includes('planner')) {
    return <Calendar size={size} className={getDynamicColorClass(name)} />;
  }
  // Customer Success / Conversation / public speaking / Interview / Negotiation / Relationship / Communication / Message
  if (normalized.includes('customer success') || normalized.includes('conversation') || normalized.includes('speaking') || normalized.includes('interview') || normalized.includes('negotiation') || normalized.includes('communication')) {
    return <MessageSquare size={size} className={getDynamicColorClass(name)} />;
  }
  // Research / Data / Analyst / Competitor / Market / Trend / Fact Checker
  if (normalized.includes('research') || normalized.includes('data') || normalized.includes('analyst') || normalized.includes('competitor') || normalized.includes('trend') || normalized.includes('fact')) {
    return <BarChart2 size={size} className={getDynamicColorClass(name)} />;
  }

  // Default Fallback
  return <Bot size={size} className={getDynamicColorClass(name)} />;
};

// Pre-built Automation Recipes for visual pipeline simulator
export default function PersonalAgentPage() {
  const { state, setScroll, getScroll } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminUser = state?.user?.email?.toLowerCase().trim() === 'nitindagar0800@gmail.com';

  const displayCategories = isAdminUser ? AI_EMPLOYEE_CATEGORIES : AI_EMPLOYEE_CATEGORIES.map(cat => {
    if (cat.id === 'creator') {
      return {
        ...cat,
        agents: ['YouTube AI']
      };
    }
    return {
      ...cat,
      agents: []
    };
  });

  const [agentName, setAgentName] = useState('YouTube AI');

  const handleSelectPlan = (planId) => {
    if (!state?.user) {
      navigate('/login');
    } else {
      navigate('/pricing');
    }
  };

  // Ecosystem Synced Platforms State
  const [syncedPlatforms, setSyncedPlatforms] = useState({
    twitter: false,
    linkedin: false,
    instagram: false,
    discord: false,
    slack: false,
    telegram: false
  });

  const handleTogglePlatform = (platform) => {
    setSyncedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  // Directory filter states
  const [activeCategory, setActiveCategory] = useState(AI_EMPLOYEE_CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentForModal, setSelectedAgentForModal] = useState(null);
  const [activeReviewTab, setActiveReviewTab] = useState('twitter');

  // Auto-rotate social reviews every 4 seconds
  useEffect(() => {
    const platforms = ['twitter', 'linkedin', 'instagram', 'youtube', 'discord'];
    const interval = setInterval(() => {
      setActiveReviewTab(prev => {
        const nextIdx = (platforms.indexOf(prev) + 1) % platforms.length;
        return platforms[nextIdx];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Disable body scroll when capabilities modal is open
  useEffect(() => {
    if (selectedAgentForModal) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedAgentForModal]);

  // Restore and preserve scroll position + clear hash on mount
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      const savedPos = getScroll(location.pathname);
      if (savedPos) {
        setTimeout(() => window.scrollTo(0, savedPos), 100);
      } else {
        window.scrollTo(0, 0);
      }
    }

    const handleScrollSave = () => {
      setScroll(location.pathname, window.scrollY);
    };

    window.addEventListener('scroll', handleScrollSave, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollSave);
    };
  }, []);

  // Filter logic for AI employees catalog
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) {
      return displayCategories.filter(cat => cat.id === activeCategory);
    }

    const query = searchQuery.toLowerCase().trim();
    return displayCategories.map(cat => {
      const matchingAgents = cat.agents.filter(agent => agent.toLowerCase().includes(query));
      if (matchingAgents.length > 0) {
        return {
          ...cat,
          agents: matchingAgents
        };
      }
      return null;
    }).filter(Boolean);
  };

  const totalAgentsCount = displayCategories.reduce((acc, cat) => acc + cat.agents.length, 0);

  return (
    <div className="personal-agent-page">
      <SEOHead
        title="Personal AI Agent — Custom Digital Persona Creator"
        description="Synthesize your custom digital AI agent. Connect data sources, set specific brand guidelines, fine-tune conversational tones, and deploy on Discord, Twitter/X, and Instagram."
        keywords="personal ai agent, custom persona builder, AI fine tuning, prompt-by-niti agents, digital twin prompt"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Personal Agent', url: '/personal-agent' }
        ]}
      />

      {/* Hero Section */}
      <section className="agent-hero">
        <div className="container">

          <h1 className="agent-hero__title">
            Personalized <span className="hero-highlight">AI Agents</span> for Every Task
          </h1>
          <div className="hero-split-grid">
            <div className="hero-split-left">
              <p className="agent-hero__subtitle">
                <span className="text-highlight-green">Personal AI agents</span> that make life <span className="text-highlight-cyan">easy</span> and help you <span className="text-highlight-orange">reduce your work</span>. Configure an AI agent with <span className="text-highlight-purple">long-term memory</span>, <span className="text-highlight-pink">custom rulesets</span>, and your <span className="text-highlight-gold">unique personality</span>. Deploy it <span className="text-highlight-cyan">seamlessly</span> across your social networks and chat platforms.
              </p>

              {/* Colored Tagline header matching home page format */}
              <div className="hero-colored-header">
                <span>Configure.</span> <span>Customize.</span> <span>Deploy.</span>
              </div>

              <div className="agent-hero__actions">
                {state?.user ? (
                  <a href="#agent-sandbox-section" className="btn btn-primary btn-xl">
                    Launch Agent Creator <ArrowRight size={18} />
                  </a>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="btn btn-primary btn-xl"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}
                  >
                    Launch Agent Creator <ArrowRight size={18} />
                  </button>
                )}
                <a href="#directory" className="btn btn-cyan btn-xl">
                  View 100+ Agent Catalog
                </a>
              </div>

              {/* Feature Points below actions matching home page style */}
              <div className="hero-feature-points">
                <div className="feature-point">
                  <Sparkles size={16} className="text-pink" />
                  <span>100+ Pre-built Domain Specialists (YouTube AI, TikTok AI, Telegram AI)</span>
                </div>
                <div className="feature-point">
                  <Zap size={16} className="text-orange" />
                  <span>Real-time Sandbox & Tone Customization Engines</span>
                </div>
                <div className="feature-point">
                  <Layers size={16} className="text-cyan" />
                  <span>Twitter/X, Instagram, Discord, Slack, Telegram & More</span>
                </div>
                <div className="feature-point">
                  <Database size={16} style={{ color: 'var(--color-purple)' }} />
                  <span>Multi-source Knowledge Hydration (Upload PDF, TXT, CSV Archives)</span>
                </div>
                <div className="feature-point">
                  <ShieldCheck size={16} className="text-green" />
                  <span>Custom Safety Guardrails & Strict Rule Compliance Filters</span>
                </div>
                <div className="feature-point">
                  <Cpu size={16} style={{ color: '#fbbf24' }} />
                  <span>Isolated Memory Sandboxes & Long-term Context Retention</span>
                </div>
              </div>
            </div>

            <div className="hero-split-right">
              <div className="niti-robot-container">
                <div className="niti-robot-podium">
                  <div className="podium-ring ring-1"></div>
                  <div className="podium-ring ring-2"></div>
                </div>

                <div className="niti-robot">
                  {/* Rotating Orbit Container */}
                  <div className="niti-orbit-container">
                    <div className="plat-orbit-node node-youtube">
                      <div className="floating-plat">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#ff0000"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                      </div>
                    </div>
                    <div className="plat-orbit-node node-instagram">
                      <div className="floating-plat">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="#e1306c" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </div>
                    </div>
                    <div className="plat-orbit-node node-telegram">
                      <div className="floating-plat">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#0088cc"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.99.53-1.4.52-.46-.01-1.34-.26-2-.47-.8-.26-1.44-.4-1.39-.85.03-.24.36-.48.99-.74 3.86-1.68 6.44-2.78 7.74-3.3 3.69-1.49 4.45-1.75 4.95-1.76.11 0 .36.03.52.16.14.11.18.26.19.38.01.07.01.15-.01.22z" /></svg>
                      </div>
                    </div>
                    <div className="plat-orbit-node node-x">
                      <div className="floating-plat">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#ffffff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      </div>
                    </div>
                    <div className="plat-orbit-node node-linkedin">
                      <div className="floating-plat">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#0077b5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                      </div>
                    </div>
                    <div className="plat-orbit-node node-discord">
                      <div className="floating-plat">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" /></svg>
                      </div>
                    </div>
                    <div className="plat-orbit-node node-spotify">
                      <div className="floating-plat">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#1DB954"><path d="M12 .007a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.49 17.31c-.24.39-.75.51-1.14.28-3.03-1.85-6.85-2.27-11.34-1.24-.44.1-.9-.17-.99-.61-.1-.44.17-.9.61-.99 4.93-1.13 9.13-.65 12.58 1.46.39.24.51.75.28 1.1zm1.46-3.26c-.3.49-.93.65-1.42.35-3.47-2.14-8.77-2.76-12.87-1.51-.55.17-1.13-.15-1.3-.7-.17-.55.15-1.13.7-1.3 4.69-1.42 10.53-.73 14.54 1.74.49.3.65.93.35 1.42zm.12-3.39c-4.16-2.47-11.02-2.7-15.02-1.48-.64.19-1.31-.16-1.5-.8-.19-.64.16-1.3.8-1.5 4.59-1.39 12.16-1.11 16.94 1.73.57.34.76 1.08.42 1.65-.34.57-1.08.76-1.65.42z" /></svg>
                      </div>
                    </div>
                    <div className="plat-orbit-node node-github">
                      <div className="floating-plat">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#ffffff"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Niti Body Parts */}
                  <div className="niti-head-wrap">
                    <div className="niti-antenna">
                      <div className="antenna-bulb"></div>
                    </div>
                    <div className="niti-ears">
                      <div className="ear ear-left"></div>
                      <div className="ear ear-right"></div>
                    </div>
                    <div className="niti-head">
                      <div className="niti-screen">
                        <div className="niti-eyes">
                          <div className="eye eye-left"></div>
                          <div className="eye eye-right"></div>
                        </div>
                        <div className="niti-mouth"></div>
                      </div>
                    </div>
                  </div>

                  <div className="niti-body-wrap">
                    <div className="niti-arms">
                      <div className="arm arm-left">
                        <div className="hand">
                          <span className="hand-power-pulse"></span>
                        </div>
                      </div>
                      <div className="arm arm-right">
                        <div className="hand">
                          <span className="hand-power-pulse"></span>
                        </div>
                      </div>
                    </div>
                    <div className="niti-body">
                      <div className="niti-chest">
                        <span className="chest-text">NITI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section id="directory" className="agent-directory-section">
        <div className="container">
          <div className="section-header text-center">

            <h2 className="section-title directory-title">Pre-built AI Agents & Capabilities</h2>
            <p className="section-desc">
              Explore our catalog of {totalAgentsCount} specialized AI employees. Click any agent to inspect its domain-specific capabilities, features, and roadmaps.
            </p>
          </div>

          {/* Search Bar */}
          <div className="search-wrap">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search AI Agents (e.g. YouTube AI, Full Stack Developer, Contract Writer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="directory-main">
            {/* Sidebar Categories TABS */}
            {!searchQuery && (
              <div className="categories-sidebar">
                {displayCategories
                  .filter(cat => isAdminUser || cat.agents.length > 0)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      className={`category-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <span className="category-emoji">{cat.emoji}</span>
                      <span className="category-name">{cat.name}</span>
                      <span className="category-count">{cat.agents.length}</span>
                    </button>
                  ))}
              </div>
            )}

            {/* Catalog Grid */}
            <div className={`catalog-grid ${searchQuery ? 'search-active' : ''}`}>
              {getFilteredCategories().map((cat) => (
                <div key={cat.id} className="catalog-group">
                  {searchQuery && (
                    <h4 className="catalog-group-title">
                      {cat.emoji} {cat.name} ({cat.agents.length})
                    </h4>
                  )}
                  <div className="agents-grid">
                    {cat.agents.map((agent) => (
                      <div
                        key={agent}
                        className="agent-card card"
                        onClick={() => setSelectedAgentForModal(agent)}
                      >
                        <div className="agent-card-header">
                          <div className="agent-avatar-wrap">
                            {getAgentIcon(agent)}
                          </div>
                          <div>
                            <h4>{agent}</h4>
                            <span className="agent-card-sub">Expert AI Worker</span>
                          </div>
                        </div>
                        <p className="agent-card-brief">
                          Equipped with 15+ automated tasks for handling {agent.replace(' AI', '')} workflows.
                        </p>
                        <button className="agent-action-trigger">
                          <Info size={14} /> View Capabilities
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {getFilteredCategories().length === 0 && (
                <div className="no-results-card text-center card">
                  <Bot size={48} className="text-muted" style={{ margin: '0 auto 16px auto' }} />
                  <h4>No Agents Found</h4>
                  <p>Try searching for a different keyword or check spelling.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <br></br><br></br><br></br>
      {/* Real-time AI Operations Center Section */}
      <section id="agent-operations-dashboard" className="agent-workflow-visualizer-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title workflow-title">Live AI Automation Pipelines</h2>
            <p className="section-desc">
              Watch our specialized AI Agents run end-to-end background processes, sync social platforms, translate articles, and reconcile datasets automatically in real-time.
            </p>
          </div>

          <div className="operations-dashboard">
            {/* Pipeline 1: Social Repurposer */}
            <div className="ops-pipeline-track">
              <div className="ops-pipeline-flow">
                <div className="ops-node" title="YouTube Source Node" style={{ border: '1px solid #ff0000', background: 'rgba(255, 0, 0, 0.05)' }}>
                  {getAgentIcon('YouTube', 20)}
                </div>
                <div className="ops-connector-line"></div>
                <div className="ops-node ai-node" title="AI Cognitive Summarizer">
                  <Bot size={20} className="text-cyan" />
                </div>
                <div className="ops-connector-line"></div>
                <div className="ops-node" title="LinkedIn Destination Node" style={{ border: '1px solid #0077b5', background: 'rgba(0, 119, 181, 0.05)' }}>
                  {getAgentIcon('LinkedIn', 20)}
                </div>
                <div className="ops-node" title="X/Twitter Destination Node" style={{ border: '1px solid #ffffff', background: 'rgba(255, 255, 255, 0.05)' }}>
                  {getAgentIcon('Twitter', 20)}
                </div>
              </div>
              <div className="ops-metrics-card">
                <span className="ops-badge active">● AUTO-REPURPOSING</span>
                <span className="ops-stat">Output generated: <strong>LinkedIn Post & 5-Part Hook Thread</strong></span>
              </div>
            </div>

            {/* Pipeline 2: Customer Service Loop */}
            <div className="ops-pipeline-track">
              <div className="ops-pipeline-flow">
                <div className="ops-node" title="Discord Ticket Trigger" style={{ border: '1px solid #5865F2', background: 'rgba(88, 101, 242, 0.05)' }}>
                  {getAgentIcon('Discord', 20)}
                </div>
                <div className="ops-connector-line"></div>
                <div className="ops-node ai-node" title="AI Sentiment Classifier" style={{ borderColor: 'var(--color-pink)', boxShadow: '0 0 15px rgba(236, 72, 153, 0.15)' }}>
                  <Bot size={20} className="text-pink" />
                </div>
                <div className="ops-connector-line"></div>
                <div className="ops-node" title="Slack Alert Destination" style={{ border: '1px solid #4a154b', background: 'rgba(74, 21, 75, 0.05)' }}>
                  {getAgentIcon('Slack', 20)}
                </div>
              </div>
              <div className="ops-metrics-card">
                <span className="ops-badge active" style={{ color: 'var(--color-pink)', background: 'rgba(236, 72, 153, 0.1)' }}>● SENTIMENT DISPATCH</span>
                <span className="ops-stat">Sentiment response: <strong>[FRUSTRATED] Apology draft sent to Slack</strong></span>
              </div>
            </div>

            {/* Pipeline 3: E-commerce Listing Promoter */}
            <div className="ops-pipeline-track">
              <div className="ops-pipeline-flow">
                <div className="ops-node" title="Shopify Product Trigger" style={{ border: '1px solid #96bf48', background: 'rgba(150, 191, 72, 0.05)' }}>
                  {getAgentIcon('Shopify', 20)}
                </div>
                <div className="ops-connector-line"></div>
                <div className="ops-node ai-node" title="AI Visual Generator" style={{ borderColor: 'var(--color-green)', boxShadow: '0 0 15px rgba(34, 197, 94, 0.15)' }}>
                  <Bot size={20} className="text-green" />
                </div>
                <div className="ops-connector-line"></div>
                <div className="ops-node" title="Pinterest Creative Pin" style={{ border: '1px solid #bd081c', background: 'rgba(189, 8, 28, 0.05)' }}>
                  {getAgentIcon('Pinterest', 20)}
                </div>
                <div className="ops-node" title="Instagram Creative Photo" style={{ border: '1px solid #e1306c', background: 'rgba(225, 48, 108, 0.05)' }}>
                  {getAgentIcon('Instagram', 20)}
                </div>
              </div>
              <div className="ops-metrics-card">
                <span className="ops-badge active" style={{ color: 'var(--color-green)', background: 'rgba(34, 197, 94, 0.1)' }}>● CREATIVE CAMPAIGN</span>
                <span className="ops-stat">Assets published: <strong>Promotional Image Pinned & Carousel posted</strong></span>
              </div>
            </div>

            {/* Pipeline 4: Intelligence Researcher */}
            <div className="ops-pipeline-track">
              <div className="ops-pipeline-flow">
                <div className="ops-node" title="Substack News Alert" style={{ border: '1px solid #ff5722', background: 'rgba(255, 87, 34, 0.05)' }}>
                  {getAgentIcon('Substack', 20)}
                </div>
                <div className="ops-connector-line"></div>
                <div className="ops-node ai-node" title="AI Fact-Checker" style={{ borderColor: 'var(--color-orange)', boxShadow: '0 0 15px rgba(249, 115, 22, 0.15)' }}>
                  <Bot size={20} className="text-orange" />
                </div>
                <div className="ops-connector-line"></div>
                <div className="ops-node" title="Notion Database Store" style={{ border: '1px solid #ffffff', background: 'rgba(255, 255, 255, 0.05)' }}>
                  {getAgentIcon('Database', 20)}
                </div>
              </div>
              <div className="ops-metrics-card">
                <span className="ops-badge active" style={{ color: 'var(--color-orange)', background: 'rgba(249, 115, 22, 0.1)' }}>● FACT-CHECK LOGGED</span>
                <span className="ops-stat">Database entry: <strong>Summary verification [VERIFIED] wiki synced</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 2D Sketch Workflow Comparison Section */}
      <section className="agent-workflow-comparison">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title comparison-title">How Ai Agents Work</h2>
            <p className="section-desc">
              Compare the manual, chaotic loop of content creation and platform management against our direct AI-agent autopilot path.
            </p>
          </div>
        </div>

        <div className="comparison-flow-image-wrap">
          <img src="/Flow_of_work.jpeg" alt="Workflow comparison: Usual Path vs. Prompt by Niti Autopilot" className="comparison-flow-image" />
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="agent-features">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title features-title">Built with Next-Gen Core Features</h2>
            <p className="section-desc">
              Discover how Prompt by Niti synthesizes a professional, consistent virtual model of your brand.
            </p>
          </div>

          <div className="features-grid-premium">
            <div className="feature-card theme-orange">
              <div className="feature-info-side">
                <span className="feature-tag-badge">Vector Memory</span>
                <div className="feature-icon-title-wrap">
                  <div className="feature-icon-wrap">
                    <Layers size={22} />
                  </div>
                  <h3>Context Preservation</h3>
                </div>
                <p>Uses vector embedding trees to retain system prompts, past conversations, and facts. Your agent will never forget your identity.</p>
              </div>
              <div className="feature-preview-side">
                <div className="feature-preview-panel terminal-style">
                  <div className="terminal-header">
                    <span className="dot dot-red"></span>
                    <span className="dot dot-yellow"></span>
                    <span className="dot dot-green"></span>
                    <span className="terminal-title">preservation.log</span>
                  </div>
                  <div className="terminal-body">
                    <div className="log-line"><span className="text-muted">[02:14:02]</span> sys.init() <span className="text-orange">OK</span></div>
                    <div className="log-line"><span className="text-muted">[02:14:03]</span> hydration tree loaded</div>
                    <div className="log-line"><span className="text-muted">[02:14:05]</span> query: "What is my brand voice?"</div>
                    <div className="log-line"><span className="text-orange">→ matched (similarity: 0.982)</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card theme-cyan">
              <div className="feature-info-side">
                <span className="feature-tag-badge">Dynamic Hydration</span>
                <div className="feature-icon-title-wrap">
                  <div className="feature-icon-wrap">
                    <Database size={22} />
                  </div>
                  <h3>Knowledge Hydration</h3>
                </div>
                <p>Upload PDF documents, CSV files, raw text files, or direct Notion/Google Drive hooks to train your agent on complex data on the fly.</p>
              </div>
              <div className="feature-preview-side">
                <div className="feature-preview-panel files-style">
                  <div className="file-item">
                    <div className="file-icon text-cyan">📄</div>
                    <div className="file-info">
                      <span className="file-name">brand_identity_guide.pdf</span>
                      <span className="file-size">4.8 MB</span>
                    </div>
                    <span className="file-status active">HYDRATED</span>
                  </div>
                  <div className="file-item">
                    <div className="file-icon text-cyan">📊</div>
                    <div className="file-info">
                      <span className="file-name">Q3_target_audience.csv</span>
                      <span className="file-size">1.2 MB</span>
                    </div>
                    <span className="file-status active">HYDRATED</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card theme-purple">
              <div className="feature-info-side">
                <span className="feature-tag-badge">OAuth Protocol</span>
                <div className="feature-icon-title-wrap">
                  <div className="feature-icon-wrap">
                    <Globe size={22} />
                  </div>
                  <h3>Multi-Platform Sync</h3>
                </div>
                <p>Draft posts, reply to comments, direct message leads, and engage with users naturally in your exact tone across 6 social networks.</p>
              </div>
              <div className="feature-preview-side">
                <div className="feature-preview-panel sync-style">
                  <div className="sync-node-wrapper">
                    <div className="sync-center-node">
                      <Bot size={14} style={{ color: 'var(--color-purple)' }} />
                    </div>
                    <div className="sync-line active"></div>
                    <div className="sync-platform-badge">Slack</div>
                    <div className="sync-line active"></div>
                    <div className="sync-platform-badge">Instagram</div>
                    <div className="sync-line active"></div>
                    <div className="sync-platform-badge">Discord</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card theme-pink">
              <div className="feature-info-side">
                <span className="feature-tag-badge">Safety Shield</span>
                <div className="feature-icon-title-wrap">
                  <div className="feature-icon-wrap">
                    <ShieldCheck size={22} />
                  </div>
                  <h3>Safety & Guardrails</h3>
                </div>
                <p>Define custom rules, blacklisted phrases, and automated checks to guarantee your agent stays professional and on-brand.</p>
              </div>
              <div className="feature-preview-side">
                <div className="feature-preview-panel safety-style">
                  <div className="safety-item">
                    <span className="safety-indicator active">✓</span>
                    <span className="safety-label">Blacklist phrases filtered</span>
                  </div>
                  <div className="safety-item">
                    <span className="safety-indicator active">✓</span>
                    <span className="safety-label">Strict brand voice guardrails</span>
                  </div>
                  <div className="safety-item">
                    <span className="safety-indicator active">✓</span>
                    <span className="safety-label">Fact-check source correlation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="agent-pricing">
        <div className="container">
          <div className="section-header text-center">

            <h2 className="section-title pricing-title">Simple, Transparent Pricing</h2>
            <p className="section-desc">
              Choose the perfect plan to scale your brand with automated AI agents. Switch or cancel anytime.
            </p>
          </div>

          <div className="pricing-grid">
            {/* Tier 1: Starter */}
            <div className="pricing-card card theme-starter">
              <div className="pricing-header">
                <span className="pricing-badge">Starter</span>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">19</span>
                  <span className="period">/ month</span>
                </div>
                <p className="pricing-summary">Perfect for creators and side projects looking to automate basic tasks.</p>
              </div>
              <div className="pricing-features">
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>1 Custom AI Agent</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>1,000 Vector Memory Logs</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>2 Connected Platforms</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>Standard Execution Speed</span>
                </div>
              </div>
              <div className="pricing-footer">
                <button type="button" onClick={() => handleSelectPlan('starter')} className="btn btn-secondary-outline w-100">Get Started</button>
              </div>
            </div>

            {/* Tier 2: Pro */}
            <div className="pricing-card card theme-pro featured">
              <div className="pricing-header">
                <div className="featured-tag">MOST POPULAR</div>
                <span className="pricing-badge">Pro Autopilot</span>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">49</span>
                  <span className="period">/ month</span>
                </div>
                <p className="pricing-summary">For professionals wanting fully autonomous 24/7 brand synchronization.</p>
              </div>
              <div className="pricing-features">
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>5 Custom AI Agents</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>100,000 Vector Memory Logs</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>Unlimited Platform Sync</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>Advanced Guardrails & Safety</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>Priority Queue Speed</span>
                </div>
              </div>
              <div className="pricing-footer">
                <button type="button" onClick={() => handleSelectPlan('pro')} className="btn btn-primary w-100">Unlock Pro Autopilot <Zap size={14} style={{ fill: 'currentColor', marginLeft: '4px' }} /></button>
              </div>
            </div>

            {/* Tier 3: Enterprise */}
            <div className="pricing-card card theme-enterprise">
              <div className="pricing-header">
                <span className="pricing-badge">Enterprise</span>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">149</span>
                  <span className="period">/ month</span>
                </div>
                <p className="pricing-summary">For agencies and companies requiring advanced controls and custom SLAs.</p>
              </div>
              <div className="pricing-features">
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>Unlimited Custom Agents</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>Dedicated Memory Clusters</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>Custom API Integrations</span>
                </div>
                <div className="pricing-feature-item">
                  <Check size={16} className="text-green" />
                  <span>24/7 Dedicated Support SLA</span>
                </div>
              </div>
              <div className="pricing-footer">
                <button type="button" onClick={() => handleSelectPlan('enterprise')} className="btn btn-secondary-outline w-100">Contact Sales</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rotating Platform Reviews Showcase */}
      <section className="agent-reviews-marquee">
        <div className="container">
          <div className="section-header text-center">

            <h2 className="section-title reviews-title">Creator Reviews & Platforms</h2>
            <p className="section-desc">
              Explore authentic feedback from builders automating brand engagement across global networks.
            </p>
          </div>

          {/* Platform Tab Buttons */}
          <div className="review-tabs-container">
            <button
              onClick={() => setActiveReviewTab('twitter')}
              className={`review-tab-btn ${activeReviewTab === 'twitter' ? 'active-twitter' : ''}`}
            >
              <span>X / Twitter</span>
            </button>
            <button
              onClick={() => setActiveReviewTab('linkedin')}
              className={`review-tab-btn ${activeReviewTab === 'linkedin' ? 'active-linkedin' : ''}`}
            >
              <span>LinkedIn</span>
            </button>
            <button
              onClick={() => setActiveReviewTab('instagram')}
              className={`review-tab-btn ${activeReviewTab === 'instagram' ? 'active-instagram' : ''}`}
            >
              <span>Instagram</span>
            </button>
            <button
              onClick={() => setActiveReviewTab('youtube')}
              className={`review-tab-btn ${activeReviewTab === 'youtube' ? 'active-youtube' : ''}`}
            >
              <span>YouTube</span>
            </button>
            <button
              onClick={() => setActiveReviewTab('discord')}
              className={`review-tab-btn ${activeReviewTab === 'discord' ? 'active-discord' : ''}`}
            >
              <span>Discord</span>
            </button>
          </div>

          {/* Active Review Showcase Card */}
          <div className="review-active-card-wrap">
            {activeReviewTab === 'twitter' && (
              <div className="review-active-card card highlight-twitter">
                <div className="review-card-glow"></div>
                <div className="review-avatar-wrap">🤖</div>
                <div className="review-quote-content">
                  <div className="review-rating">⭐⭐⭐⭐⭐</div>
                  <p>"Prompt by Niti completely automated our daily coding prompts. We grew by 12,000 developer followers in 30 days."</p>
                  <div className="review-author">
                    <strong>@tech_innovator</strong>
                    <span>X Content Creator</span>
                  </div>
                </div>
                <div className="review-stat-badge">
                  <span className="badge-value text-cyan">+12.4k</span>
                  <span className="badge-label">Follower Growth</span>
                </div>
              </div>
            )}

            {activeReviewTab === 'linkedin' && (
              <div className="review-active-card card highlight-linkedin">
                <div className="review-card-glow"></div>
                <div className="review-avatar-wrap">🏢</div>
                <div className="review-quote-content">
                  <div className="review-rating">⭐⭐⭐⭐⭐</div>
                  <p>"Our agency syncs brand thought-leadership daily. Lead generation from LinkedIn has tripled since deploying Niti Autopilot."</p>
                  <div className="review-author">
                    <strong>Sarah Jenkins</strong>
                    <span>B2B Growth Director</span>
                  </div>
                </div>
                <div className="review-stat-badge">
                  <span className="badge-value text-blue">3.2x</span>
                  <span className="badge-label">Lead Conversion</span>
                </div>
              </div>
            )}

            {activeReviewTab === 'instagram' && (
              <div className="review-active-card card highlight-instagram">
                <div className="review-card-glow"></div>
                <div className="review-avatar-wrap">📷</div>
                <div className="review-quote-content">
                  <div className="review-rating">⭐⭐⭐⭐⭐</div>
                  <p>"The auto-generated caption prompts match my visual aesthetic perfectly. Direct message response rates are up 92%."</p>
                  <div className="review-author">
                    <strong>@creativespace</strong>
                    <span>Visual Artist</span>
                  </div>
                </div>
                <div className="review-stat-badge">
                  <span className="badge-value text-pink">92%</span>
                  <span className="badge-label">DM Engagement</span>
                </div>
              </div>
            )}

            {activeReviewTab === 'youtube' && (
              <div className="review-active-card card highlight-youtube">
                <div className="review-card-glow"></div>
                <div className="review-avatar-wrap">🎥</div>
                <div className="review-quote-content">
                  <div className="review-rating">⭐⭐⭐⭐⭐</div>
                  <p>"We use the agent to draft custom description timestamps and auto-respond to community comments. Reclaims 15 hours a week."</p>
                  <div className="review-author">
                    <strong>Dave Miller</strong>
                    <span>Tech Educator</span>
                  </div>
                </div>
                <div className="review-stat-badge">
                  <span className="badge-value text-red">15h</span>
                  <span className="badge-label">Saved / Week</span>
                </div>
              </div>
            )}

            {activeReviewTab === 'discord' && (
              <div className="review-active-card card highlight-discord">
                <div className="review-card-glow"></div>
                <div className="review-avatar-wrap">👾</div>
                <div className="review-quote-content">
                  <div className="review-rating">⭐⭐⭐⭐⭐</div>
                  <p>"Automated rules validation and prompt moderation filters. Our community of 40k stays safe 24/7 without manual review."</p>
                  <div className="review-author">
                    <strong>Alex Chen</strong>
                    <span>Discord Mod Lead</span>
                  </div>
                </div>
                <div className="review-stat-badge">
                  <span className="badge-value text-purple">40k</span>
                  <span className="badge-label">Members Synced</span>
                </div>
              </div>
            )}
          </div>

          {/* Infinite Platforms Logo Marquee (Rotating Unique Thing) */}
          <div className="platforms-marquee-wrap">
            <div className="marquee-track">
              <div className="marquee-slide">
                <span>Twitter / X</span>
                <span>Instagram</span>
                <span>LinkedIn</span>
                <span>Discord</span>
                <span>Slack</span>
                <span>Telegram</span>
                <span>YouTube</span>
                <span>TikTok</span>
              </div>
              <div className="marquee-slide">
                <span>Twitter / X</span>
                <span>Instagram</span>
                <span>LinkedIn</span>
                <span>Discord</span>
                <span>Slack</span>
                <span>Telegram</span>
                <span>YouTube</span>
                <span>TikTok</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section className="agent-cta">
        <div className="container">
          <div className="agent-cta__card card">
            <div className="cta-glow"></div>
            <div className="cta-content">
              <h2 className="cta-title">Ready to deploy your agent?</h2>
              <p>Personal Agent customization and cross-platform publishing are included in our PRO & CREATOR tiers.</p>
              <div className="cta-buttons">
                <button
                  onClick={() => handleSelectPlan('pricing')}
                  className="btn btn-primary btn-xl"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}
                >
                  View Tiers & Pricing <Zap size={18} style={{ fill: 'currentColor' }} />
                </button>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES DETAIL OVERLAY MODAL */}
      {selectedAgentForModal && (
        <div
          className="agent-modal-overlay"
          onClick={() => setSelectedAgentForModal(null)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="agent-modal-content card" onClick={(e) => e.stopPropagation()}>
            <button
              className="agent-modal-close"
              onClick={() => setSelectedAgentForModal(null)}
              aria-label="Close modal"
            >
              <CloseIcon size={24} />
            </button>
            <div className="modal-header-wrap">
              <div className="modal-avatar-wrap" style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}>
                {getAgentIcon(selectedAgentForModal, 36)}
              </div>
              <div>
                <h2>{selectedAgentForModal}</h2>
                <span className="modal-badge">Professional Domain Specialist AI</span>
              </div>
            </div>

            <div className="modal-body-wrap">
              <h3>Capabilities & Automated Tasks</h3>
              <p>This agent is fully trained to handle the following operational workflows independently:</p>
              <div className="capabilities-checklist">
                {getAgentFeatures(selectedAgentForModal).map((feature, i) => (
                  <div key={i} className="capability-check-item">
                    <Check size={14} className="text-green check-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer-wrap">
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  if (!state?.user) {
                    setSelectedAgentForModal(null);
                    navigate('/login');
                  } else {
                    if (!isAdminUser) {
                      alert('Agent is working. Coming soon!');
                      setSelectedAgentForModal(null);
                    } else {
                      setAgentName(selectedAgentForModal);
                      setSelectedAgentForModal(null);
                      const el = document.getElementById('agent-sandbox-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
              >
                Load Agent into Interactive Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
