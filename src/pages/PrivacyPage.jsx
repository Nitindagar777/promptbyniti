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
            <p>We collect information you provide directly to us when you create an account, purchase tokens, post prompts to our feed, or utilize the AI Agent Autopilot Workspace. This includes:</p>
            <ul>
              <li><strong>Personal Info:</strong> Name, email address, and profile biography.</li>
              <li><strong>Financial Info:</strong> Payment details processed securely via Razorpay (we do not store credit card numbers).</li>
              <li><strong>Content:</strong> The prompts, images, and descriptions you generate or upload.</li>
              <li><strong>Connected YouTube Data:</strong> If you connect your YouTube channel, we retrieve read-only details via Google OAuth (such as your channel handle, subscriber count, video list, and basic upload frequency metrics).</li>
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
              <li>Powering the AI Agent Workspace to draft video script concepts, formulate thumbnail ideas, audit keyword SEO tags, and suggest upload schedule strategies based on your connected channel statistics.</li>
            </ul>
          </section>

          <section className="legal-section">
            <div className="section-heading">
              <Server className="text-pink" />
              <h2>3. Data Storage & Security</h2>
            </div>
            <p>We use industry-standard security measures to protect your information. Your prompts and generated assets are stored on secure cloud servers with restricted access. YouTube OAuth session tokens are stored securely using encrypted storage. You can disconnect your YouTube channel at any any time via the workspace header, which instantly deletes all associated access tokens and channel metadata caches.</p>
          </section>

          <section className="legal-section">
            <div className="section-heading">
              <Share2 className="text-orange" />
              <h2>4. Sharing of Information</h2>
            </div>
            <p>We do not sell your personal data. We only share information with third-party service providers (like payment processors) necessary to complete your requests. <strong>Google API Scopes:</strong> Our app's use and transfer of information received from Google APIs to any other app will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-pink, #ff0055)', textDecoration: 'underline' }}>Google API Services User Data Policy</a>, including the Limited Use requirements. We do not share or transfer any Google/YouTube user data with external third-party AI models or databases.</p>
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
