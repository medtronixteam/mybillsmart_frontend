import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProviderSubscription.css';
import axios from 'axios';
import { useAuth } from "../../contexts/AuthContext";

const ProviderSubscription = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: "9.99",
      period: "month",
      features: [
        "10 GB Storage",
        "5 Email Accounts",
        "24/7 Support",
        "Basic Dashboard"
      ],
      featured: false
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "19.99",
      period: "month",
      features: [
        "50 GB Storage",
        "10 Email Accounts",
        "Priority Support",
        "Advanced Dashboard",
        "API Access"
      ],
      featured: true
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: "49.99",
      period: "month",
      features: [
        "Unlimited Storage",
        "Unlimited Accounts",
        "24/7 VIP Support",
        "Advanced Analytics",
        "API Access",
        "Dedicated Account Manager"
      ],
      featured: false
    }
  ];

  const handleSubscription = async (selectedPlan) => {
    setLoading(true);
    try {
      const amountInCents = parseFloat(selectedPlan.price) * 100;
      const response = await axios.post(
        'http://34.142.252.64:8080/api/create-payment-intent',
        {
          plan_id: selectedPlan.id,
          amount: amountInCents,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200) {
        navigate('/supervisor/checkout', {
          state: {
            planDetails: selectedPlan,
            clientSecret: response.data.clientSecret,
            paymentIntentId: response.data.id,
            amount: amountInCents, // Use the amount you calculated
            currency: 'usd' // Or get from API if available
          }
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-container">
      <h2 className="section-title">Choose Your Plan</h2>
      <p className="section-subtitle">Select the perfect plan for your needs</p>
      
      <div className="cards-container">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`subscription-card ${plan.featured ? 'featured' : ''}`}
          >
            {plan.featured && <div className="popular-badge">Most Popular</div>}
            <h3 className="plan-name">{plan.name}</h3>
            <div className="price-container">
              <span className="price">${plan.price}</span>
              <span className="period">/{plan.period}</span>
            </div>
            <ul className="features-list">
              {plan.features.map((feature, i) => (
                <li key={i} className="feature-item">
                  <span className="feature-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              className="subscribe-btn"
              onClick={() => handleSubscription(plan)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderSubscription;