import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Subscription.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";

const Subscription = () => {
  const navigate = useNavigate();
  const { token, planName } = useAuth();
  const [loading, setLoading] = useState({
    starter: false,
    pro: false,
    enterprise: false,
    growth: false,
    scale: false,
    max: false
  });
  const [planPrices, setPlanPrices] = useState({});

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

  const expansionPacks = [
    {
      id: "growth",
      name: "Growth Pack",
      extraAgents: "+5 agents",
      monthlyPrice: "420",
      pricePerAgent: "84",
    },
    {
      id: "scale",
      name: "Scale Pack",
      extraAgents: "+10 agents",
      monthlyPrice: "790",
      pricePerAgent: "79",
    },
    {
      id: "max",
      name: "Max Pack",
      extraAgents: "+25 agents",
      monthlyPrice: "1700",
      pricePerAgent: "68",
    },
  ];

  // Fetch only prices from API
  useEffect(() => {
    const fetchPlanPrices = async () => {
      try {
        const response = await axios.get(
          "https://bill.medtronix.world/api/group/plans",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.status === "success") {
          const prices = {};
          response.data.plans.forEach((plan) => {
            prices[plan.name.toLowerCase()] = plan.price;
          });
          setPlanPrices(prices);
        }
      } catch (error) {
        console.error("Error fetching plan prices:", error);
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'Failed to load current prices. Using default pricing.',
        });
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
      isCurrent: planName && planName.toLowerCase() === plan.id,
    }));
  };

  const handleSubscription = async (selectedPlan) => {
    setLoading(prev => ({ ...prev, [selectedPlan.id]: true }));
    try {
      const amountInCents = parseFloat(selectedPlan.price) * 100;
      const response = await axios.post(
        "https://bill.medtronix.world/api/create-payment-intent",
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
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: error.response?.data?.message || "Payment processing failed",
      });
    } finally {
      setLoading(prev => ({ ...prev, [selectedPlan.id]: false }));
    }
  };

  const handleExpansionPack = async (pack) => {
    setLoading(prev => ({ ...prev, [pack.id]: true }));
    try {
      const amountInCents = parseFloat(pack.monthlyPrice) * 100;
      const response = await axios.post(
        "https://bill.medtronix.world/api/create-payment-intent",
        {
          plan_id: pack.id,
          amount: amountInCents,
          currency: "eur",
          is_expansion: true
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
            planDetails: pack,
            clientSecret: response.data.clientSecret,
            paymentIntentId: response.data.id,
            amount: amountInCents,
            currency: "eur",
            isExpansion: true
          },
        });
      }
    } catch (error) {
      console.error("Expansion pack error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: error.response?.data?.message || "Payment processing failed",
      });
    } finally {
      setLoading(prev => ({ ...prev, [pack.id]: false }));
    }
  };

  const plans = getPlansWithPrices();

  return (
    <div className="subscription-container">
      <h2 className="section-title">Subscription Plans</h2>
      <p className="section-subtitle">Select the perfect plan for your needs</p>

      <div className="cards-container">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`subscription-card ${plan.featured ? "featured" : ""} ${
              plan.isCurrent ? "current-plan" : ""
            }`}
          >
            {plan.featured && <div className="popular-badge">Most Popular</div>}
            {plan.isCurrent && <div className="current-badge">Your Plan</div>}
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
              className={`subscribe-btn ${
                plan.isCurrent ? "current-btn" : ""
              }`}
              onClick={() => handleSubscription(plan)}
              disabled={loading[plan.id] || plan.price === "N/A" || plan.isCurrent}
            >
              {loading[plan.id] ? "Processing..." : plan.isCurrent ? "Current Plan" : "Get Started"}
            </button>
          </div>
        ))}
      </div>

      {planName && (
        <div className="expansion-section">
          <h2 className="section-title">Agent Expansion Packs</h2>
          <p className="section-subtitle">
            Add more agents without changing your current subscription plan.
          </p>

          <div className="expansion-table-container">
            <table className="expansion-table">
              <thead>
                <tr>
                  <th>Pack Name</th>
                  <th>Extra Agents</th>
                  <th>Monthly Price</th>
                  <th>Price per Agent</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expansionPacks.map((pack) => (
                  <tr key={pack.id}>
                    <td>{pack.name}</td>
                    <td>{pack.extraAgents}</td>
                    <td>€{pack.monthlyPrice}</td>
                    <td>€{pack.pricePerAgent}</td>
                    <td>
                      <button
                        className="subscribe-btn"
                        onClick={() => handleExpansionPack(pack)}
                        disabled={loading[pack.id]}
                      >
                        {loading[pack.id] ? "Processing..." : "Add Pack"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;