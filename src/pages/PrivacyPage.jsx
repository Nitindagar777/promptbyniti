/* PrivacyPage — Clear and transparent privacy policy */
import React from 'react';
import { ShieldCheck, Eye, Lock, Server, Share2, Bell } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import './LegalPages.css';

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="legal-page privacy-page">
      <SEOHead
        title="Privacy Policy — Prompt by Niti"
        description="Read Prompt by Niti's privacy policy. Learn how we protect your data, handle personal information, and ensure secure transactions on our AI prompt feed."
        keywords="prompt by niti privacy, AI prompt privacy policy, data protection, prompt feed privacy"
      />
      <div className="container">
        <div className="legal-page__hero text-center">
          <h1>Privacy <span className="text-purple">Policy</span></h1>
          <p className="text-muted">Last Updated: {lastUpdated}</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <div className="section-heading">
              <Eye className="text-cyan" />
              <h2>1. Information We Collect</h2>
            </div>
            <p>We collect information you provide directly to us when you create an account, purchase tokens, or post prompts to our feed. This includes:</p>
            <ul>
              <li><strong>Personal Info:</strong> Name, email address, and profile biography.</li>
              <li><strong>Financial Info:</strong> Payment details processed securely via Razorpay (we do not store credit card numbers).</li>
              <li><strong>Content:</strong> The prompts, images, and descriptions you generate or upload.</li>
            </ul>
          </section>

          <section className="legal-section">
            <div className="section-heading">
              <Lock className="text-purple" />
              <h2>2. How We Use Your Data</h2>
            </div>
            <p>Your data is used to provide, maintain, and improve our services, including:</p>
            <ul>
              <li>Processing transactions and sending related information.</li>
              <li>Personalizing your experience and providing content relevant to your interests.</li>
              <li>Monitoring and analyzing trends, usage, and activities.</li>
            </ul>
          </section>

          <section className="legal-section">
            <div className="section-heading">
              <Server className="text-pink" />
              <h2>3. Data Storage & Security</h2>
            </div>
            <p>We use industry-standard security measures to protect your information. Your prompts and generated assets are stored on secure cloud servers with restricted access.</p>
          </section>

          <section className="legal-section">
            <div className="section-heading">
              <Share2 className="text-orange" />
              <h2>4. Sharing of Information</h2>
            </div>
            <p>We do not sell your personal data. We only share information with third-party service providers (like payment processors) necessary to complete your requests.</p>
          </section>

          <section className="legal-section">
            <div className="section-heading">
              <Bell className="text-cyan" />
              <h2>5. Your Rights</h2>
            </div>
            <p>You have the right to access, update, or delete your personal information at any time through your account settings or by contacting our support team.</p>
          </section>

          <div className="legal-footer-note">
            <p>Questions about our Privacy Policy? Contact us at <strong>privacy@promptbyniti.com</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
