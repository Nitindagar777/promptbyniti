/* PricingPage — Monetization plans with Razorpay */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { pricingPlans } from '../data/promptData';
import { Crown, Check, Star, Shield, Zap, Sparkles, Loader } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import './PricingPage.css';

const API_URL = '/api';

export default function PricingPage() {
  const { state, setPlan, login } = useApp();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSelectPlan = async (planId) => {
    // Must be logged in
    if (!state.user) {
      navigate('/login');
      return;
    }

    try {
      setLoadingPlan(planId);
      const token = localStorage.getItem('promptbyniti_token');

      // Step 1: Create Razorpay Order on backend
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert(orderData.message || 'Could not create order');
        setLoadingPlan(null);
        return;
      }

      // Step 2: Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Prompt by Niti',
        description: `${planId === 'starter' ? 'Starter' : planId === 'pro' ? 'Creator' : 'Studio'} One-time Pack`,
        image: '/image1.png',
        order_id: orderData.orderId,
        handler: async function (response) {
          // Step 3: Verify Payment on backend
          try {
            const verifyRes = await fetch(`${API_URL}/payment/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Refresh user data from server
              const meRes = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const meData = await meRes.json();
              if (meData.success) {
                login(meData.user, token);
              }
              setPlan(planId);
              alert('🎉 Plan upgraded successfully! Enjoy your new Prompt Packs!');
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verify error:', err);
            alert('Error verifying payment. Please contact support.');
          }
          setLoadingPlan(null);
        },
        prefill: {
          name: state.user?.name || '',
          email: state.user?.email || ''
        },
        theme: {
          color: '#8b5cf6'
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment error:', err);
      alert('Something went wrong. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="pricing-page" id="pricing-page">
      <SEOHead
        title="Pricing — AI Prompt Token Packs & Plans"
        description="Get prompt packs and token plans for Prompt by Niti. Unlock AI prompt generation for Midjourney, Sora, Flux, ChatGPT & more. Grow your social media content and followers with premium AI prompts."
        keywords="prompt pricing, AI prompt plans, buy tokens, prompt credits, prompt packs, prompt by niti pricing, AI prompt subscription, prompt token packs, free AI prompts, grow social media followers"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Pricing', url: '/pricing' }
        ]}
        noIndex={false}
      />
      <br></br>
      <div className="container">
        {/* Section 1: Prompt Token Packs */}
        <div className="pricing-section-header">
          <h2 className="pricing-section-title title-prompts">Prompt Pack Token Tiers</h2>
          <p className="pricing-section-desc">One-time token packs to generate fully optimized, high-converting prompts.</p>
        </div>

        <div className="pricing-grid pricing-grid--prompts">
          {pricingPlans.map(plan => (
            <div
              key={plan.id}
              className={`pricing-card pricing-card--compact pricing-card--${plan.id} ${plan.id === 'starter' ? 'theme-starter' : plan.id === 'pro' ? 'theme-pro pricing-card--popular' : 'theme-enterprise'} ${state.plan === plan.id ? 'pricing-card--current' : ''}`}
            >
              {plan.popular && (
                <div className="pricing-card__popular-tag">
                  <Star size={12} /> Best Value
                </div>
              )}
              {state.plan === plan.id && (
                <div className="pricing-card__current-tag">Current</div>
              )}

              <h3 className="pricing-card__name" style={{ color: plan.id === 'starter' ? '#06b6d4' : plan.id === 'pro' ? '#35e177' : '#a855f7' }}>
                {plan.id === 'starter' ? 'Starter' : plan.id === 'pro' ? 'Creator' : 'Studio'}
              </h3>
              <div className="pricing-card__price">
                <span className="pricing-card__currency">$</span>
                <span className="pricing-card__amount" style={{ fontSize: '38px' }}>{plan.price}</span>
                <span className="pricing-card__period">/ pack</span>
              </div>
              <p className="pricing-card__credits" style={{ marginBottom: '16px' }}>
                <span className="text-orange">{plan.credits}</span> Packs
              </p>

              <ul className="pricing-card__features">
                {plan.features.slice(0, 4).map((feat, i) => ( // limit list to keep it compact
                  <li key={i}>
                    <Check size={14} />
                    <span dangerouslySetInnerHTML={{ __html: feat }}></span>
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} pricing-card__cta`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={state.plan === plan.id || loadingPlan === plan.id}
              >
                {loadingPlan === plan.id ? (
                  <><Loader size={16} className="spin" /> Processing...</>
                ) : state.plan === plan.id ? (
                  'Current Plan'
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Section 2: AI Agent Autopilot Plans */}
        <div className="pricing-section-header" style={{ marginTop: '80px' }}>
          <h2 className="pricing-section-title title-agents">AI Agent Autopilot Plans</h2>
          <p className="pricing-section-desc">Fully autonomous virtual models syncing with your ecosystems 24/7.</p>
        </div>

        <div className="pricing-grid pricing-grid--agents">
          {/* Agent Tier 1: Starter */}
          <div className="pricing-card pricing-card--agent pricing-card--compact theme-starter">
            <span className="pricing-card__name" style={{ color: '#06b6d4' }}>Starter Agent</span>
            <div className="pricing-card__price">
              <span className="pricing-card__currency">$</span>
              <span className="pricing-card__amount" style={{ fontSize: '38px' }}>19</span>
              <span className="pricing-card__period">/ month</span>
            </div>

            <ul className="pricing-card__features">
              <li>
                <Check size={14} />
                <span><span className="text-cyan">1</span> Custom AI Agent</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-cyan">1,000</span> Vector Memory Logs</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-cyan">2</span> Connected Platforms</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-cyan">Standard</span> Execution Speed</span>
              </li>
            </ul>

            <button className="btn btn-secondary pricing-card__cta">
              Get Started
            </button>
          </div>

          {/* Agent Tier 2: Pro */}
          <div className="pricing-card pricing-card--agent pricing-card--compact theme-pro pricing-card--popular">
            <div className="pricing-card__popular-tag">
              <Star size={12} /> Most Popular
            </div>
            <span className="pricing-card__name" style={{ color: '#35e177' }}>Pro Autopilot</span>
            <div className="pricing-card__price">
              <span className="pricing-card__currency">$</span>
              <span className="pricing-card__amount" style={{ fontSize: '38px' }}>49</span>
              <span className="pricing-card__period">/ month</span>
            </div>

            <ul className="pricing-card__features">
              <li>
                <Check size={14} />
                <span><span className="text-green">5</span> Custom AI Agents</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-green">100,000</span> Vector Memory Logs</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-green">Unlimited</span> Platform Sync</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-green">Advanced</span> Guardrails & Safety</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-green">Priority</span> Queue Speed</span>
              </li>
            </ul>

            <button className="btn btn-primary pricing-card__cta">
              Unlock Pro Autopilot <Zap size={14} style={{ fill: 'currentColor', marginLeft: '4px' }} />
            </button>
          </div>

          {/* Agent Tier 3: Enterprise */}
          <div className="pricing-card pricing-card--agent pricing-card--compact theme-enterprise">
            <span className="pricing-card__name" style={{ color: '#a855f7' }}>Enterprise Scale</span>
            <div className="pricing-card__price">
              <span className="pricing-card__currency">$</span>
              <span className="pricing-card__amount" style={{ fontSize: '38px' }}>149</span>
              <span className="pricing-card__period">/ month</span>
            </div>

            <ul className="pricing-card__features">
              <li>
                <Check size={14} />
                <span><span className="text-purple">Unlimited</span> Custom Agents</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-purple">Dedicated</span> Memory Clusters</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-purple">Custom API</span> Integrations</span>
              </li>
              <li>
                <Check size={14} />
                <span><span className="text-purple">24/7</span> Dedicated Support SLA</span>
              </li>
            </ul>

            <button className="btn btn-secondary pricing-card__cta">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Social Media Growth Callout */}
        <div className="seller-earnings-box">
          <h3>🚀 Grow Your Social Media</h3>
          <p>Use AI-generated content to boost your social media presence and grow your followers.</p>
          <div className="seller-earnings-example">
            <div className="seller-earnings-row">
              <span>Generate stunning content</span>
              <strong>AI-powered</strong>
            </div>
            <div className="seller-earnings-row">
              <span>Increase engagement</span>
              <strong className="text-green">10x faster</strong>
            </div>
            <div className="seller-earnings-row seller-earnings-row--fee">
              <span>Grow followers organically</span>
              <span>All platforms</span>
            </div>
          </div>
          <p className="seller-earnings-note">Your first prompt generation is always free — no purchase needed.</p>
        </div>

        {/* Trust Badges */}
        <div className="pricing-trust">
          <div className="trust-badge">
            <Shield size={20} className="trust-badge__icon text-green" />
            <div>
              <h4 className="text-green">Secure Payments</h4>
              <p>100% encrypted</p>
            </div>
          </div>
          <div className="trust-badge">
            <Zap size={20} className="trust-badge__icon text-orange" />
            <div>
              <h4 className="text-orange">Instant Access</h4>
              <p>Features unlock now</p>
            </div>
          </div>
          <div className="trust-badge">
            <Check size={20} className="trust-badge__icon text-cyan" />
            <div>
              <h4 className="text-cyan">Cancel Anytime</h4>
              <p>No long-term contracts</p>
            </div>
          </div>
          <div className="trust-badge">
            <Sparkles size={20} className="trust-badge__icon text-pink" />
            <div>
              <h4 className="text-pink">Grow Followers</h4>
              <p>Boost your reach</p>
            </div>
          </div>
          <div className="trust-badge">
            <Crown size={20} className="trust-badge__icon text-purple" />
            <div>
              <h4 className="text-purple">24/7 Support</h4>
              <p>We are here to help</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
