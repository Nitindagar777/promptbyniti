/* AboutPage — Professional brand story */
import React from 'react';
import { Sparkles, Users, Shield, Zap, Globe, Target } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import './LegalPages.css';

export default function AboutPage() {
  return (
    <div className="legal-page about-page">
      <SEOHead
        title="About — AI Prompt Engineering Platform by Nitin Dagar"
        description="Learn about Prompt by Niti, the advanced AI prompt generator and feed with 3 consistency engines. Founded by Nitin Dagar. Generate and explore professional prompts for Midjourney, Sora, Flux, ChatGPT & more."
        keywords="about prompt by niti, promptbyniti, Nitin Dagar, AI prompt platform, prompt engineering, prompt feed creator, AI tools company, who made prompt by niti"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' }
        ]}
      />
      <div className="container">
        {/* Hero Section */}
        <div className="legal-page__hero">
          <div className="hero-badge">Our Story</div>
          <h1>Empowering Creativity through <span className="text-orange">AI Excellence</span></h1>
          <p className="hero-subtitle">
            Prompt by Niti is the world's most advanced prompt engineering platform,
            designed to bridge the gap between human imagination and AI generation.
          </p>
        </div>

        {/* Mission Grid */}
        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon"><Target size={32} /></div>
            <h3>Our Mission</h3>
            <p>To democratize high-end AI generation by providing the perfect linguistic formulas for every creative vision.</p>
          </div>
          <div className="mission-card">
            <div className="mission-icon"><Zap size={32} /></div>
            <h3>Our Vision</h3>
            <p>A world where anyone can produce studio-quality visual and textual content using the power of optimized prompts.</p>
          </div>
        </div>

        {/* Values Section */}
        <section className="about-section">
          <h2 className="section-title">Why Choose <span className="text-orange">Prompt by Niti</span> <span>?</span></h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-header">
                <Shield className="text-cyan" />
                <h4>Quality Guaranteed</h4>
              </div>
              <p>Every prompt on our feed is tested and optimized for specific models like Midjourney, Stable Diffusion, and GPT-4.</p>
            </div>
            <div className="value-item">
              <div className="value-header">
                <Users className="text-purple" />
                <h4>Creator First</h4>
              </div>
              <p>We provide a platform for prompt engineers to showcase their expertise and build a professional portfolio.</p>
            </div>
            <div className="value-item">
              <div className="value-header">
                <Sparkles className="text-pink" />
                <h4>AI-Driven Optimization</h4>
              </div>
              <p>Our built-in generator uses advanced LLMs to help you refine and vary your prompts in seconds.</p>
            </div>
          </div>
        </section>

        {/* Founder Quote */}
        <div className="founder-quote-box">
          <div className="quote-icon">"</div>
          <p className="quote-text">
            We didn't just build a prompt feed; we built a workshop for the next generation of creators.
            AI is the brush, but the prompt is the hand that guides it.
          </p>
          <div className="founder-meta">
            <strong>Nitin Dagar</strong>
            <span>Founder & Lead Engineer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
