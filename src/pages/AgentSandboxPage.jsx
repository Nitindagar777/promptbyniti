import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Send, Sparkles, Database, Globe, RefreshCw,
  Upload, Check, ArrowRight, ShieldCheck, Cpu,
  Layers, Plus, Zap, Search, Info, X as CloseIcon,
  Code, Terminal, Smartphone, Gamepad2, Shield,
  Server, Palette, Briefcase, TrendingUp, PenTool,
  BookOpen, DollarSign, Heart, Compass, Calendar,
  MessageSquare, BarChart2, Play, CheckCircle, ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SEOHead from '../components/SEOHead';
import './AgentSandboxPage.css';

export default function AgentSandboxPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  // Sandbox State Hooks
  const [memory, setMemory] = useState({
    channelName: '',
    niche: '',
    audience: '',
    brandColor: '',
    country: '',
    goal: '',
    tone: '',
    editingStyle: '',
    uploadFrequency: '',
    subscribers: 0,
    competitors: []
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSandboxTab, setActiveSandboxTab] = useState('chat'); // 'chat' or 'structured'

  const chatEndRef = useRef(null);

  // Auto scroll chat log
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading]);

  // Fetch Memory and Chat logs from backend on load
  useEffect(() => {
    if (state?.user) {
      // Memory
      fetch('/api/youtube-agent/memory', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.memory) {
          setMemory(data.memory);
        }
      })
      .catch(err => console.error('Fetch memory failed:', err));

      // Chat
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
    }
  }, [state?.user]);

  // Save memory manually/auto
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
        setMemory(data.memory);
      }
    } catch (err) {
      console.error('Save memory failed:', err);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend, workflowType = null) => {
    if (!textToSend || !state?.user) return;
    setIsChatLoading(true);

    const userMsg = { sender: 'user', text: textToSend, createdAt: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    try {
      const response = await fetch('/api/youtube-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ prompt: textToSend, workflowType })
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
          setMemory(data.memory);
        }
        if (data.structuredData) {
          setActiveSandboxTab('structured');
        }
      }
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !state?.user) return;
    setIsUploading(true);

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

  return (
    <div className="agent-sandbox-page">
      <SEOHead
        title="AI Autopilot Sandbox Workspace — Creator Studio"
        description="Interact with the YouTube AI Agent. Connect data, configure rulesets, and automate video script creation workflows."
      />

      <section className="sandbox-header-hero">
        <div className="container">
          <button onClick={() => window.close()} className="btn btn-secondary-outline btn-back">
            <ArrowLeft size={16} /> Close Workspace
          </button>
          <div className="header-meta-wrap">
            <div className="meta-icon">🤖</div>
            <div>
              <h1>YouTube AI Autopilot Sandbox</h1>
              <p className="meta-desc">Configure brand identity, analyze metrics, and run multi-step content schedules.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="agent-sandbox-section">
        <div className="container">
          <div className="sandbox-grid">
            {/* Left Column: Long-Term Memory Panel */}
            <div className="sandbox-panel memory-panel card">
              <div className="panel-header">
                <Database size={18} className="text-orange" />
                <h3>Agent Memory & Identity</h3>
              </div>
              <div className="panel-scroll-content">
                <div className="memory-form-group">
                  <label>Channel Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tech With Nitin"
                    value={memory.channelName || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemory(prev => ({ ...prev, channelName: val }));
                      handleSaveMemory({ channelName: val });
                    }}
                  />
                </div>

                <div className="memory-form-group">
                  <label>Channel Niche / Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. AI Tutorials, Tech News"
                    value={memory.niche || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemory(prev => ({ ...prev, niche: val }));
                      handleSaveMemory({ niche: val });
                    }}
                  />
                </div>

                <div className="memory-form-row">
                  <div className="memory-form-group half">
                    <label>Target Audience</label>
                    <input
                      type="text"
                      placeholder="e.g. Students, Devs"
                      value={memory.audience || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemory(prev => ({ ...prev, audience: val }));
                        handleSaveMemory({ audience: val });
                      }}
                    />
                  </div>
                  <div className="memory-form-group half">
                    <label>Brand Accent Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Dark Orange"
                      value={memory.brandColor || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemory(prev => ({ ...prev, brandColor: val }));
                        handleSaveMemory({ brandColor: val });
                      }}
                    />
                  </div>
                </div>

                <div className="memory-form-row">
                  <div className="memory-form-group half">
                    <label>Upload Frequency</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Videos / Week"
                      value={memory.uploadFrequency || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemory(prev => ({ ...prev, uploadFrequency: val }));
                        handleSaveMemory({ uploadFrequency: val });
                      }}
                    />
                  </div>
                  <div className="memory-form-group half">
                    <label>Subscribers</label>
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={memory.subscribers || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setMemory(prev => ({ ...prev, subscribers: val }));
                        handleSaveMemory({ subscribers: val });
                      }}
                    />
                  </div>
                </div>

                <div className="memory-form-group">
                  <label>Voice Tone & Style</label>
                  <input
                    type="text"
                    placeholder="e.g. Friendly, Informative, Snarky"
                    value={memory.tone || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemory(prev => ({ ...prev, tone: val }));
                      handleSaveMemory({ tone: val });
                    }}
                  />
                </div>

                <div className="memory-form-group">
                  <label>Video Editing Style</label>
                  <input
                    type="text"
                    placeholder="e.g. Fast-paced, Minimal, Cinematic"
                    value={memory.editingStyle || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemory(prev => ({ ...prev, editingStyle: val }));
                      handleSaveMemory({ editingStyle: val });
                    }}
                  />
                </div>

                {/* Analytics Upload */}
                <div className="analytics-upload-box">
                  <h4>📊 Hydrate Channel Analytics</h4>
                  <p className="upload-desc">Upload a PDF or TXT report containing channel stats to automatically teach your agent.</p>
                  <label className="analytics-upload-btn btn btn-secondary-outline">
                    {isUploading ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} /> Parsing Report...
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> Upload Report (PDF/TXT)
                      </>
                    )}
                    <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                  </label>

                  {memory.analyticsData && memory.analyticsData.parsedAt && (
                    <div className="analytics-display-stats">
                      <div className="stat-row">
                        <span>Total Views:</span>
                        <strong>{memory.analyticsData.views?.toLocaleString()}</strong>
                      </div>
                      <div className="stat-row">
                        <span>Average CTR:</span>
                        <strong>{memory.analyticsData.ctr}%</strong>
                      </div>
                      <div className="stat-row">
                        <span>Watch Time:</span>
                        <strong>{memory.analyticsData.watchTime}h</strong>
                      </div>
                      <div className="stat-row">
                        <span>Audience Retention:</span>
                        <strong>{memory.analyticsData.retention}%</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Chat & Workspaces Panel */}
            <div className="sandbox-panel workspace-panel card">
              <div className="panel-tabs">
                <button
                  onClick={() => setActiveSandboxTab('chat')}
                  className={`tab-btn ${activeSandboxTab === 'chat' ? 'active' : ''}`}
                >
                  <MessageSquare size={16} /> Interactive Chat
                </button>
                <button
                  onClick={() => setActiveSandboxTab('structured')}
                  className={`tab-btn ${activeSandboxTab === 'structured' ? 'active' : ''}`}
                  disabled={!chatMessages.some(m => m.sender === 'agent' && m.structuredData)}
                >
                  <Zap size={16} /> Workflow Strategies
                </button>
              </div>

              <div className="panel-tab-content">
                {activeSandboxTab === 'chat' ? (
                  <div className="chat-container">
                    <div className="chat-messages-log">
                      {chatMessages.length === 0 ? (
                        <div className="chat-empty-state">
                          <Bot size={36} className="text-muted" />
                          <p>I am YouTube AI, your personal manager. Let's grow your channel! Ask me to generate titles, draft outlines, design a logo, or perform a brand audit.</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} className={`chat-bubble-wrap ${msg.sender}`}>
                            <div className="chat-avatar">
                              {msg.sender === 'agent' ? '🤖' : '👤'}
                            </div>
                            <div className="chat-bubble-content">
                              <div className="chat-text">{msg.text}</div>

                              {msg.structuredData && (
                                <button
                                  onClick={() => setActiveSandboxTab('structured')}
                                  className="btn btn-secondary-outline btn-xs btn-open-workflow"
                                  style={{ marginTop: '8px' }}
                                >
                                  <Zap size={12} /> View Workflow Dashboard
                                </button>
                              )}

                              {msg.suggestedSteps && msg.suggestedSteps.length > 0 && (
                                <div className="chat-suggested-steps">
                                  <span className="steps-title">Recommended Actions:</span>
                                  <div className="steps-list">
                                    {msg.suggestedSteps.map((step, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSendMessage(step)}
                                        className="step-action-btn"
                                      >
                                        {step}
                                      </button>
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
                          <div className="chat-avatar">🤖</div>
                          <div className="chat-bubble-content">
                            <span className="loading-dots">Thinking<span>.</span><span>.</span><span>.</span></span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Suggestions Panel */}
                    <div className="chat-suggestions-chips">
                      <button onClick={() => handleSendMessage("Plan my new channel launch strategy")} className="chip-btn">🚀 Launch Channel</button>
                      <button onClick={() => handleSendMessage("Generate 10 video ideas for my niche")} className="chip-btn">💡 Video Ideas</button>
                      <button onClick={() => handleSendMessage("Audit my channel optimization and CTR")} className="chip-btn">📈 SEO Audit</button>
                      <button onClick={() => handleSendMessage("Write a high-converting video script hook")} className="chip-btn">✍️ Write Hook</button>
                    </div>

                    {/* Chat Input Field */}
                    <form
                      className="chat-input-bar"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage(inputMessage);
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Ask YouTube AI anything about your channel..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={isChatLoading}
                      />
                      <button type="submit" className="btn btn-primary btn-icon" disabled={isChatLoading || !inputMessage.trim()}>
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="structured-workflow-dashboard">
                    {(() => {
                      const lastMsgWithData = [...chatMessages].reverse().find(m => m.sender === 'agent' && m.structuredData);
                      if (!lastMsgWithData) return <div className="no-data-msg">No workflow strategy files found yet. Ask YouTube AI to build a strategy.</div>;
                      const data = lastMsgWithData.structuredData;
                      return (
                        <div className="workflow-card-viewer">
                          <h4 className="workflow-view-title">📁 Active Strategy Workspace</h4>
                          {data.channel_name && (
                            <div className="view-card-section">
                              <span className="section-label">Identity Context</span>
                              <h3>{data.channel_name}</h3>
                              {data.description && <p>{data.description}</p>}
                            </div>
                          )}

                          {data.titles && Array.isArray(data.titles) && (
                            <div className="view-card-section">
                              <span className="section-label">Proposed Title Options</span>
                              <ul className="workflow-list-props">
                                {data.titles.map((title, i) => (
                                  <li key={i}>
                                    <span className="bullet-num">{i + 1}</span>
                                    <p>{title}</p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {data.content_calendar && Array.isArray(data.content_calendar) && (
                            <div className="view-card-section">
                              <span className="section-label">Content Schedule & Calendar</span>
                              <div className="workflow-timeline">
                                {data.content_calendar.map((item, i) => (
                                  <div key={i} className="timeline-node">
                                    <span className="node-date">{item.date || `Day ${i + 1}`}</span>
                                    <h4>{item.title}</h4>
                                    <p>{item.notes || item.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {data.growth_strategy && (
                            <div className="view-card-section">
                              <span className="section-label">Growth Roadmap</span>
                              <p>{typeof data.growth_strategy === 'string' ? data.growth_strategy : JSON.stringify(data.growth_strategy)}</p>
                            </div>
                          )}

                          {data.checklist && Array.isArray(data.checklist) && (
                            <div className="view-card-section">
                              <span className="section-label">Task Checklists</span>
                              <div className="workflow-checklists">
                                {data.checklist.map((item, i) => (
                                  <div key={i} className="check-todo-item">
                                    <CheckCircle size={16} className="text-green" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {data.logo_prompt && (
                            <div className="view-card-section">
                              <span className="section-label">AI Graphic Asset Prompt (Logo/Banner)</span>
                              <div className="prompt-copy-block">
                                <code>{data.logo_prompt}</code>
                                <button onClick={() => {
                                  navigator.clipboard.writeText(data.logo_prompt);
                                  alert('Copied to clipboard!');
                                }} className="btn btn-secondary-outline btn-xs">Copy</button>
                                </div>
                            </div>
                          )}

                          <button onClick={() => setActiveSandboxTab('chat')} className="btn btn-secondary-outline w-100" style={{ marginTop: '20px' }}>
                            ← Back to Chat Workspace
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
