/* PricingPage — Monetization plans with Razorpay */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { pricingPlans } from '../data/promptData';
import { Crown, Check, Star, Shield, Zap, Sparkles, Loader } from 'lucide-react';
import './PricingPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8844/api';

export default function PricingPage() {
  const { state, setPlan, login } = useApp();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSelectPlan = async (planId) => {
    // Free plan — just set it
    if (planId === 'free') {
      setPlan('free');
      return;
    }

    // Must be logged in
    if (!state.user) {
      alert('Please login first to upgrade your plan.');
      navigate('/auth');
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
        description: `${planId === 'pro' ? 'Creator' : 'Studio'} One-time Pack`,
        image: '/image.png',
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
      <div className="container">
        {/* Header */}
        <div className="pricing-page__header">
          <h1 className="section-title">Get More <span className="text-orange">Prompt Packs</span></h1>
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
              </div>
              <p className="pricing-card__credits">
                <span className="text-orange">{plan.credits}</span> Prompt Packs
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
