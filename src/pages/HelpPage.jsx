/* HelpPage — Professional Help Center & Social Hub */
import React from 'react';
import { 
  Mail, MessageSquare, Play, Camera, MessageCircle, 
  LifeBuoy, BookOpen, ShieldQuestion,
  ExternalLink, Send
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import './LegalPages.css';

export default function HelpPage() {
  return (
    <div className="legal-page help-page">
      <SEOHead
        title="Help Center — AI Prompt & Agent Generation Support"
        description="Get help with Prompt by Niti. FAQ about AI Prompt & Agent Generation, token purchases, autonomous agents, image-to-video prompts & more. Prompts. Agents. Built by AI."
        keywords="prompt by niti help, AI prompt & agent generation, autonomous ai agents help, prompt support, AI prompt FAQ"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Help Center', url: '/help' }
        ]}
      />
      <div className="container">
        {/* Hero Section */}
        <div className="legal-page__hero text-center">
          <div className="hero-badge">Support Hub</div>
          <h1>How can we <span className="text-purple">Help You</span>?</h1>
          <p className="hero-subtitle">
            Need assistance with AI Prompt & Agent Generation? Get in touch with our team or join our creator community.
          </p>
        </div>

        {/* Quick Contact Grid */}
        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-purple)' }}>
              <Mail size={32} />
            </div>
            <h3>Email Support</h3>
            <p>Direct support for account, billing, and technical inquiries.</p>
            <a href="mailto:ndootweb@gmail.com" className="help-link">ndootweb@gmail.com</a>
          </div>
          <div className="mission-card">
            <div className="mission-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-cyan)' }}>
              <MessageSquare size={32} />
            </div>
            <h3>Discord Community</h3>
            <p>Join our 24/7 community of prompt engineering and creators.</p>
            <a href="https://discord.gg/vMSfcpQDpu" className="help-link">Join Discord <ExternalLink size={14} /></a>
          </div>
        </div>

        {/* Social Media Section */}
        <section className="about-section">
          <h2 className="section-title">Connect with <span className="text-orange">Nitin</span></h2>
          <div className="social-grid-premium" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <a href="https://www.youtube.com/@promptbyniti" className="social-card youtube">
              <Play size={40} />
              <div className="social-info">
                <h4>YouTube</h4>
                <span>Tutorials & Tips</span>
              </div>
            </a>
            <a href="https://www.instagram.com/prompt_by_niti/" className="social-card instagram">
              <Camera size={40} />
              <div className="social-info">
                <h4>Instagram</h4>
                <span>Behind the Scenes</span>
              </div>
            </a>
            <a href="https://x.com/ndoot_official" className="social-card twitter">
              <MessageCircle size={40} />
              <div className="social-info">
                <h4>X (Twitter)</h4>
                <span>Daily Updates</span>
              </div>
            </a>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="legal-section mt-xl">
          <div className="section-heading">
            <ShieldQuestion className="text-purple" />
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-mini-list">
            <div className="faq-item">
              <h4>How do I buy tokens?</h4>
              <p>Tokens can be purchased through the Pricing page using Razorpay. They are added to your account instantly.</p>
            </div>
            <div className="faq-item">
              <h4>Can I share my Midjourney prompts?</h4>
              <p>Yes! Our feed supports Midjourney, Stable Diffusion, DALL-E, and more. Use the "Post" page to start.</p>
            </div>
            <div className="faq-item">
              <h4>How do I contact the founder?</h4>
              <p>You can reach Nitin directly via LinkedIn or Twitter for collaborations and business inquiries.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
