/* PricingPage — Monetization plans */
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { pricingPlans } from '../data/promptData';
import { Crown, Check, Star, Shield, Zap } from 'lucide-react';
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
          <div className="section-tag">
            <Crown size={14} /> Premium Access
          </div>
          <h1 className="section-title">Invest in Better Prompts</h1>
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
              
              <h3 className="pricing-card__name">{plan.name}</h3>
              <div className="pricing-card__price">
                <span className="pricing-card__currency">$</span>
                <span className="pricing-card__amount">{plan.price}</span>
                {plan.period !== 'forever' && <span className="pricing-card__period">/{plan.period}</span>}
              </div>
              <p className="pricing-card__credits">
                {plan.credits === -1 ? 'Unlimited' : plan.credits} generations{plan.period !== 'forever' ? `/${plan.period === 'month' ? 'mo' : plan.period}` : ''}
              </p>
              
              <ul className="pricing-card__features">
                {plan.features.map((feat, i) => (
                  <li key={i}>
                    <Check size={14} />
                    <span>{feat}</span>
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
            <Shield size={20} className="trust-badge__icon" />
            <div>
              <h4>Secure Payments</h4>
              <p>100% encrypted transactions</p>
            </div>
          </div>
          <div className="trust-badge">
            <Zap size={20} className="trust-badge__icon" />
            <div>
              <h4>Instant Access</h4>
              <p>Features unlock immediately</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
