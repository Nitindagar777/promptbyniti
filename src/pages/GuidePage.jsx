/* GuidePage — Interactive Prompt Engineering Masterclass & Guide */
import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Image as ImageIcon, Video, Code, Bot, 
  Terminal, ShieldCheck, Cpu, Layers, HelpCircle, CheckCircle, Copy, Check
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import './LegalPages.css';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('midjourney');
  const [copiedCode, setCopiedCode] = useState('');

  const copySnippet = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="legal-page guide-page">
      <SEOHead
        title="AI Prompt Engineering Guide & Mastery Handbook — Prompt by Niti"
        description="Master AI prompt engineering for Midjourney v6, Flux, Sora, ChatGPT, DALL-E 3 & Stable Diffusion. Learn character consistency (cref), style reference (sref), video motion vectors, and AIDA copywriting formulas."
        keywords="prompt engineering guide, midjourney prompt guide, midjourney cref sref tutorial, flux prompt guide, sora video prompt guide, chatgpt system prompts, AI prompt tutorial 2026, prompt by niti guide"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Prompt Engineering Guide', url: '/guide' }
        ]}
      />
      
      <div className="container">
        {/* Header Hero */}
        <div className="legal-page__hero text-center">
          <div className="hero-badge">Official Masterclass</div>
          <h1>AI Prompt Engineering <span className="text-orange">Handbook</span></h1>
          <p className="hero-subtitle">
            Comprehensive rules, parameter cheat sheets, and architectural blueprints for crafting high-precision prompts across visual, video, and text generative AI models.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="guide-tabs">
          <button 
            className={`guide-tab-btn ${activeTab === 'midjourney' ? 'active' : ''}`}
            onClick={() => setActiveTab('midjourney')}
          >
            <ImageIcon size={18} /> Midjourney & Flux
          </button>
          <button 
            className={`guide-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            <Video size={18} /> Sora & Video AI
          </button>
          <button 
            className={`guide-tab-btn ${activeTab === 'llm' ? 'active' : ''}`}
            onClick={() => setActiveTab('llm')}
          >
            <Bot size={18} /> ChatGPT & Claude
          </button>
          <button 
            className={`guide-tab-btn ${activeTab === 'copywriting' ? 'active' : ''}`}
            onClick={() => setActiveTab('copywriting')}
          >
            <Terminal size={18} /> AIDA Copywriting
          </button>
        </div>

        {/* TAB 1: Midjourney & Flux */}
        {activeTab === 'midjourney' && (
          <div className="legal-content guide-content">
            <section className="legal-section">
              <div className="section-heading">
                <ImageIcon className="text-cyan" />
                <h2>1. Midjourney v6 & Flux Image Prompt Architecture</h2>
              </div>
              <p>
                Generative image models parse prompts as weighted semantic tokens. Structuring your prompt sequentially improves detail adherence and reduces AI hallucinations.
              </p>
              
              <div className="guide-formula-box">
                <h4>Recommended Formula Blueprint:</h4>
                <code className="blueprint-code">
                  [Subject] + [Action/Pose] + [Environment/Setting] + [Lighting & Atmosphere] + [Camera Lens & Style] + [Parameters]
                </code>
              </div>

              <h3>Key Parameters Cheat Sheet</h3>
              <div className="guide-table-wrapper">
                <table className="guide-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Syntax</th>
                      <th>Description</th>
                      <th>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Aspect Ratio</strong></td>
                      <td><code>--ar [W:H]</code></td>
                      <td>Sets canvas aspect ratio (16:9 for landscape, 9:16 for story, 4:5 for IG post).</td>
                      <td><code>--ar 16:9</code></td>
                    </tr>
                    <tr>
                      <td><strong>Character Ref</strong></td>
                      <td><code>--cref [URL]</code></td>
                      <td>Maintains facial features and character identity across multiple renders.</td>
                      <td><code>--cref https://... --cw 100</code></td>
                    </tr>
                    <tr>
                      <td><strong>Style Ref</strong></td>
                      <td><code>--sref [URL/Code]</code></td>
                      <td>Transfers color scheme, aesthetic texture, and artistic mood.</td>
                      <td><code>--sref 124984210</code></td>
                    </tr>
                    <tr>
                      <td><strong>Stylize Value</strong></td>
                      <td><code>--stylize [0-1000]</code></td>
                      <td>Controls how strongly Midjourney applies its default artistic finish.</td>
                      <td><code>--s 250</code></td>
                    </tr>
                    <tr>
                      <td><strong>Chaos / Variety</strong></td>
                      <td><code>--c [0-100]</code></td>
                      <td>Determines variation between grid choices. Higher values yield unexpected art.</td>
                      <td><code>--c 25</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="code-example-card mt-md">
                <div className="code-header">
                  <span>Copyable Midjourney v6 Master Sample</span>
                  <button onClick={() => copySnippet('A cinematic ultra-realistic portrait of a cyberpunk hacker wearing a neon-glowing visor, sitting inside a rain-slicked Tokyo alley, volumetric lighting, shot on 35mm lens, f/1.8 aperture, photo-realistic skin texture, 8k resolution --ar 16:9 --v 6.0 --stylize 250')}>
                    {copiedCode.includes('cyberpunk hacker') ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                  </button>
                </div>
                <pre><code>A cinematic ultra-realistic portrait of a cyberpunk hacker wearing a neon-glowing visor, sitting inside a rain-slicked Tokyo alley, volumetric lighting, shot on 35mm lens, f/1.8 aperture, photo-realistic skin texture, 8k resolution --ar 16:9 --v 6.0 --stylize 250</code></pre>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: Video AI */}
        {activeTab === 'video' && (
          <div className="legal-content guide-content">
            <section className="legal-section">
              <div className="section-heading">
                <Video className="text-purple" />
                <h2>2. Sora, Runway Gen-3 & Kling Video Prompting</h2>
              </div>
              <p>
                Video generative models require camera trajectory commands and temporal motion descriptions to ensure smooth, artifact-free footage without morphing glitches.
              </p>

              <h3>Camera Motion Anchors</h3>
              <ul>
                <li><strong>Pan (Left/Right):</strong> Horizontal camera movement across a fixed vertical axis.</li>
                <li><strong>Tilt (Up/Down):</strong> Vertical angle shift ideal for architectural or tall subject reveals.</li>
                <li><strong>Dolly In/Out:</strong> Smooth forward or backward physical camera movement through 3D space.</li>
                <li><strong>Orbit Shot:</strong> 360-degree rotational camera movement around a central subject.</li>
              </ul>

              <div className="code-example-card mt-md">
                <div className="code-header">
                  <span>Sora Cinematic Video Prompt Formula</span>
                  <button onClick={() => copySnippet('Smooth slow-motion 60fps tracking shot of an astronaut walking on a reflective obsidian crystal planet, camera slowly dollies in, hyper-realistic physics, ambient starlight reflections, cinematic depth of field')}>
                    {copiedCode.includes('astronaut walking') ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                  </button>
                </div>
                <pre><code>Smooth slow-motion 60fps tracking shot of an astronaut walking on a reflective obsidian crystal planet, camera slowly dollies in, hyper-realistic physics, ambient starlight reflections, cinematic depth of field</code></pre>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: LLMs */}
        {activeTab === 'llm' && (
          <div className="legal-content guide-content">
            <section className="legal-section">
              <div className="section-heading">
                <Bot className="text-pink" />
                <h2>3. ChatGPT (GPT-4o) & Claude 3.5 System Prompt Blueprinting</h2>
              </div>
              <p>
                To eliminate generic AI responses, engineer system prompts using Role-Task-Context-Constraint (RTCC) priming.
              </p>

              <div className="guide-formula-box">
                <h4>RTCC Architecture:</h4>
                <ol>
                  <li><strong>Role:</strong> Act as an expert senior software engineer & technical writer.</li>
                  <li><strong>Task:</strong> Analyze the provided code for security vulnerabilities and refactor.</li>
                  <li><strong>Context:</strong> Production Node.js backend processing 10,000 requests/min.</li>
                  <li><strong>Constraint:</strong> Do not break backwards compatibility. Return cleanly commented code only.</li>
                </ol>
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: Copywriting */}
        {activeTab === 'copywriting' && (
          <div className="legal-content guide-content">
            <section className="legal-section">
              <div className="section-heading">
                <Terminal className="text-orange" />
                <h2>4. AIDA & PAS Copywriting Framework Prompting</h2>
              </div>
              <p>
                Boost conversions by directing AI models through proven psychological marketing frameworks.
              </p>
              
              <ul>
                <li><strong>Attention (A):</strong> Pattern-interrupt hook or bold statement.</li>
                <li><strong>Interest (I):</strong> Data-backed intrigue and problem framing.</li>
                <li><strong>Desire (D):</strong> Transformation showcase and emotional benefits.</li>
                <li><strong>Action (A):</strong> Single clear, frictionless call to action.</li>
              </ul>
            </section>
          </div>
        )}

        {/* Platform Integrity Note */}
        <div className="legal-footer-note mt-xl">
          <p>
            Have questions about prompt engineering or want to publish your own templates? Visit our <a href="/help" style={{ color: 'var(--text-orange)' }}>Help Center</a> or check out the <a href="/templates" style={{ color: 'var(--text-cyan)' }}>Templates Store</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
