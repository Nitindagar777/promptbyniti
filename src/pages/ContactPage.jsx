/* ContactPage — Direct Official Support & Contact Page */
import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import './LegalPages.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="legal-page contact-page">
      <SEOHead
        title="Contact Us — Prompt by Niti Official Support"
        description="Get in touch with the Prompt by Niti team. Contact us for account support, prompt engineering inquiries, commercial licensing, partnership, or general feedback."
        keywords="contact prompt by niti, promptbyniti support, contact Nitin Dagar, AI prompt support email"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' }
        ]}
      />

      <div className="container">
        <div className="legal-page__hero text-center">
          <div className="hero-badge">Get In Touch</div>
          <h1>We're Here to <span className="text-cyan">Help You</span></h1>
          <p className="hero-subtitle">
            Have questions about our AI prompt generator, template store, or account tokens? Reach out to our dedicated support team directly.
          </p>
        </div>

        <div className="mission-grid mb-xl">
          <div className="mission-card">
            <div className="mission-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-cyan)' }}>
              <Mail size={32} />
            </div>
            <h3>Email Us</h3>
            <p>For official support, billing inquiries, or media relations:</p>
            <a href="mailto:ndootweb@gmail.com" className="help-link">ndootweb@gmail.com</a>
          </div>

          <div className="mission-card">
            <div className="mission-icon" style={{ background: 'rgba(251, 146, 60, 0.1)', color: 'var(--color-orange)' }}>
              <Clock size={32} />
            </div>
            <h3>Response Time</h3>
            <p>We review every inquiry and typically reply within 12 to 24 hours during business days.</p>
          </div>

          <div className="mission-card">
            <div className="mission-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-purple)' }}>
              <MapPin size={32} />
            </div>
            <h3>Location</h3>
            <p>Prompt by Niti engineering team based in India, serving creator communities worldwide.</p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="legal-content contact-form-wrapper">
          <section className="legal-section">
            <div className="section-heading">
              <MessageSquare className="text-orange" />
              <h2>Send Us a Message</h2>
            </div>

            {submitted ? (
              <div className="contact-success-box text-center p-xl">
                <CheckCircle size={48} className="text-green mb-md" style={{ margin: '0 auto' }} />
                <h3>Message Received!</h3>
                <p>Thank you for reaching out. Our team will evaluate your message and get back to you shortly at <strong>{formData.email}</strong>.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Alex Rivera" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="e.g. alex@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    placeholder="How can we assist you?" 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea 
                    rows={6} 
                    required 
                    placeholder="Describe your request in detail..." 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg mt-md">
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
