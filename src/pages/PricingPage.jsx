/* PricingPage — Monetization plans */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { pricingPlans } from '../data/promptData';
import { Crown, Check, Star, Shield, Zap, Sparkles } from 'lucide-react';
import './PricingPage.css';

export default function PricingPage() {
  const { state, setPlan } = useApp();

  const handleSelectPlan = (planId) => {
    setPlan(planId);
    alert(`Successfully upgraded to ${planId.toUpperCase()} plan! (Demo)`);
  };

  return (
    <div className="pricing-page" id="pricing-page">
      <div className="container">
        {/* Header */}
        <div className="pricing-page__header">
          <h1 className="section-title">Get More <span className="text-orange">Tokens</span></h1>
          <p className="section-desc">
            Unlock the full power of Prompt by Niti. Generate unlimited, private, and optimized prompts.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="pricing-grid">
          {pricingPlans.map(plan => (
            <div
              key={plan.id}
              className={`pricing-card card ${plan.popular ? 'pricing-card--popular' : ''} ${state.plan === plan.id ? 'pricing-card--current' : ''}`}
            >
              {plan.popular && (
                <div className="pricing-card__popular-tag">
                  <Star size={12} /> Most Popular
                </div>
              )}
              {state.plan === plan.id && (
                <div className="pricing-card__current-tag">Current Plan</div>
              )}
              
              <h3 className="pricing-card__name" dangerouslySetInnerHTML={{ __html: plan.name }}></h3>
              <p className="pricing-card__description" dangerouslySetInnerHTML={{ __html: plan.description }}></p>
              <div className="pricing-card__price">
                <span className="pricing-card__currency">$</span>
                <span className="pricing-card__amount">{plan.price}</span>
                {plan.period !== 'forever' && <span className="pricing-card__period">/{plan.period}</span>}
              </div>
              <p className="pricing-card__credits">
                <span className="text-orange">{plan.credits === -1 ? 'Unlimited' : plan.credits}</span> Prompt Packs{plan.period !== 'forever' ? `/${plan.period === 'month' ? 'mo' : plan.period}` : ''}
              </p>
              
              <ul className="pricing-card__features">
                {plan.features.map((feat, i) => (
                  <li key={i}>
                    <Check size={14} />
                    <span dangerouslySetInnerHTML={{ __html: feat }}></span>
                  </li>
                ))}
              </ul>
              
              <button
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} pricing-card__cta`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={state.plan === plan.id}
              >
                {state.plan === plan.id ? 'Current Plan' : plan.cta}
              </button>
            </div>
          ))}
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
              <h4 className="text-pink">70% Royalties</h4>
              <p>Best for creators</p>
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
