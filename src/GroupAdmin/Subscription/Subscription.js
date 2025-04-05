import React from 'react';
import './Subscription.css';

const Subscription = () => {
  const plans = [
    {
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

  return (
    <div className="subscription-container">
      <h2 className="section-title">Choose Your Plan</h2>
      <p className="section-subtitle">Select the perfect plan for your needs</p>
      
      <div className="cards-container">
        {plans.map((plan, index) => (
          <div 
            key={index} 
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
            <button className="subscribe-btn">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;