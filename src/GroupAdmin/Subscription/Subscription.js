import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Subscription.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

const Subscription = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [planPrices, setPlanPrices] = useState({});
  const [apiError, setApiError] = useState(null);

  // Static plan data with all details except price
  const staticPlans = [
    {
      id: "starter",
      name: "Starter",
      period: "month",
      description: "For individual agents or small businesses",
      features: [
        "1 active agent",
        "Up to 200 invoices/month",
        "AI-powered savings analysis",
        "Automatic generation of personalized offers",
        "Offer delivery via WhatsApp and email",
        "Access to the web dashboard",
        "Email support",
      ],
      featured: false,
    },
    {
      id: "pro",
      name: "Pro",
      period: "month",
      description: "For commercial teams",
      features: [
        "Up to 5 active agents",
        "Up to 1,000 invoices/month",
        "Agreement and provider management",
        "Automatic commission calculation",
        "Performance dashboard per agent",
        "WhatsApp integration via Twilio",
        "Priority support",
        "Basic API access",
      ],
      featured: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      period: "month",
      description: "For large businesses",
      features: [
        "Up to 25 active agents",
        "Up to 5,000 invoices/month",
        "Multi-tier team structure (agents and sub-agents)",
        "Advanced API integration (CRM, ERP, etc.)",
        "Custom reporting",
        "Dedicated technical support",
        "Supervisor dashboard with agreement management",
        "Scheduling of time-based offers/campaigns",
      ],
      featured: false,
    },
  ];

  // Fetch only prices from API
  useEffect(() => {
    const fetchPlanPrices = async () => {
      try {
        const response = await axios.get(`${config.BASE_URL}/api/group/plans`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.status === "success") {
          const prices = {};
          response.data.plans.forEach((plan) => {
            prices[plan.name.toLowerCase()] = plan.price;
          });
          setPlanPrices(prices);
        }
      } catch (error) {
        console.error("Error fetching plan prices:", error);
        setApiError("Failed to load current prices. Using default pricing.");
        // Fallback to default prices
        setPlanPrices({
          starter: "99.00",
          pro: "450.00",
          enterprise: "1890.00",
        });
      }
    };

    fetchPlanPrices();
  }, [token]);

  // Combine static plan data with dynamic prices
  const getPlansWithPrices = () => {
    return staticPlans.map((plan) => ({
      ...plan,
      price: planPrices[plan.id] || "N/A",
    }));
  };

  const handleSubscription = async (selectedPlan) => {
    setLoading(true);
    try {
      const amountInCents = parseFloat(selectedPlan.price) * 100;
      const response = await axios.post(
        `${config.BASE_URL}/api/create-payment-intent`,
        {
          plan_id: selectedPlan.id,
          amount: amountInCents,
          currency: "eur",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        navigate("/group_admin/checkout", {
          state: {
            planDetails: selectedPlan,
            clientSecret: response.data.clientSecret,
            paymentIntentId: response.data.id,
            amount: amountInCents,
            currency: "eur",
          },
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert(error.response?.data?.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const plans = getPlansWithPrices();

  return (
    <div className="subscription-container">
      <h2 className="section-title">Subscription Plans</h2>
      <p className="section-subtitle">Select the perfect plan for your needs</p>

      {apiError && <div className="alert alert-warning">{apiError}</div>}

      <div className="cards-container">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`subscription-card ${plan.featured ? "featured" : ""}`}
          >
            {plan.featured && <div className="popular-badge">Most Popular</div>}
            <h3 className="plan-name">{plan.name}</h3>
            <div className="price-container">
              <span className="price">€{plan.price}</span>
              <span className="period">/{plan.period}</span>
            </div>
            <p className="plan-description">{plan.description}</p>
            <div className="features-container">
              <h4 className="features-title">Includes:</h4>
              <ul className="features-list">
                {plan.features.map((feature, i) => (
                  <li key={i} className="feature-item">
                    <span className="feature-icon">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="subscribe-btn"
              onClick={() => handleSubscription(plan)}
              disabled={loading || plan.price === "N/A"}
            >
              {loading ? "Processing..." : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
