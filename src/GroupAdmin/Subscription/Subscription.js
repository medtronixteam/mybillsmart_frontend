import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Subscription.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Swal from "sweetalert2";
// import { duration } from "html2canvas/dist/types/css/property-descriptors/duration";
// import { duration } from "html2canvas/dist/types/css/property-descriptors/duration";
// import { duration } from "html2canvas/dist/types/css/property-descriptors/duration";

const Subscription = () => {
  const navigate = useNavigate();
  const { token, planName } = useAuth();
  const [loading, setLoading] = useState({
    starter: false,
    pro: false,
    enterprise: false,
    growth: false,
    scale: false,
    max: false,
  });
  const [planPrices, setPlanPrices] = useState({});
  const [isAnnual, setIsAnnual] = useState(false); // State for toggling between monthly and annual pricing

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

  const volumePacks = [
    {
      id: "volume_mini",
      name: "Volume Mini",
      extraAgents: "+5 agents",
      monthlyPrice: "420",
      annualPrice: "4200",
      pricePerAgent: "84",
    },
    {
      id: "volume_medium",
      name: "Volume Medium",
      extraAgents: "+10 agents",
      monthlyPrice: "790",
      annualPrice: "7900",
      pricePerAgent: "79",
    },
    {
      id: "volume_max",
      name: "Volume Max",
      extraAgents: "+25 agents",
      monthlyPrice: "1700",
      annualPrice: "17000",
      pricePerAgent: "68",
    },
  ];

  const expansionPacks = [
    {
      id: "growth_pack",
      name: "Growth Pack",
      extraAgents: "+5 agents",
      monthlyPrice: "420",
      pricePerAgent: "84",
    },
    {
      id: "scale_pack",
      name: "Scale Pack",
      extraAgents: "+10 agents",
      monthlyPrice: "790",
      pricePerAgent: "79",
    },
    {
      id: "max_pack",
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
        const response = await axios.get(`${config.BASE_URL}/api/group/plans`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.status === "success") {
          const prices = {};
          response.data.plans.forEach((plan) => {
            prices[plan.name.toLowerCase()] = {
              monthly: plan.monthly_price,
              annual: plan.annual_price,
              duration : "monthly"
            };
          });
          setPlanPrices(prices);
        }
      } catch (error) {
        console.error("Error fetching plan prices:", error);
        Swal.fire({
          icon: "error",
          title: "Price Loading Failed",
          text: "Failed to load current prices. Using default pricing.",
          timer: 3000,
          showConfirmButton: false,
        });
        // Fallback to default prices
        setPlanPrices({
          starter: { monthly: "99.00", annual: "990.00" },
          pro: { monthly: "450.00", annual: "4500.00" },
          enterprise: { monthly: "1890.00", annual: "18900.00" },
        });
      }
    };
    fetchPlanPrices();
  }, [token]);

  // Combine static plan data with dynamic prices
  const getPlansWithPrices = () => {
    return staticPlans.map((plan) => ({
      ...plan,
      price: planPrices[plan.id]?.[isAnnual ? "annual" : "monthly"] || "N/A",
      isCurrent: planName && planName.toLowerCase() === plan.id,
    }));
  };

  const handleSubscription = async (selectedPlan) => {
    if (selectedPlan.price === "N/A") {
      Swal.fire({
        icon: "error",
        title: "Price Not Available",
        text: "This plan is currently unavailable. Please try again later.",
      });
      return;
    }
    setLoading((prev) => ({ ...prev, [selectedPlan.id]: true }));
    try {
     
       
      const response = await axios.post(
        `${config.BASE_URL}/api/create-payment-intent`,
        {
          plan_id: selectedPlan.id,
          // amount: planPrices[selectedPlan.id]?.[isAnnual ? "annual" : "monthly"],
          // currency: "eur",
          duration: isAnnual ? "annual" : "monthly",
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
            amount: planPrices[selectedPlan.id]?.[isAnnual ? "annual" : "monthly"],
            currency: "eur",
          },
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text:
          error.response?.data?.message ||
          "Payment processing failed. Please try again.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [selectedPlan.id]: false }));
    }
  };

  const handleExpansionPack = async (pack) => {
    setLoading((prev) => ({ ...prev, [pack.id]: true }));
    try {
      const amountInCents = parseFloat(pack.monthlyPrice) * 100;
      const response = await axios.post(
        `${config.BASE_URL}/api/create-payment-intent`,
        {
          plan_id: pack.id,
          // amount: amountInCents,
          // currency: "eur",
          is_expansion: true,
          duration : "monthly",
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
            isExpansion: true,
          },
        });
      }
    } catch (error) {
      console.error("Expansion pack error:", error);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text:
          error.response?.data?.message ||
          "Payment processing failed. Please try again.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [pack.id]: false }));
    }
  };

  const plans = getPlansWithPrices();

  return (
    <div className="subscription-container">
      <h2 className="section-title">Subscription Plans</h2>
      <p className="section-subtitle">Select the perfect plan for your needs</p>

      {/* Toggle Switch for Monthly/Annual Pricing */}
      <div className="toggle-switch-container">
        <span>Monthly</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isAnnual}
            onChange={() => setIsAnnual(!isAnnual)}
          />
          <span className="slider round"></span>
        </label>
        <span>Annual</span>
      </div>

      <div className="cards-container">
        {plans.map((plan) => (
          <div
            key={plan.id} 
            className={`subscription-card ${
              plan.featured ? "featured" : ""
            } ${plan.isCurrent ? "current-plan" : ""}`}
          >
            {plan.featured && <div className="popular-badge">Most Popular</div>}
            {/* {plan.isCurrent && <div className="current-badge"></div>} */}
            <h3 className="plan-name">{plan.name}</h3>
            <div className="price-container">
              <span className="price">€{plan.price}</span>
              <span className="period">
                /{isAnnual ? "year" : plan.period}
              </span>
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
              disabled={loading[plan.id] || plan.isCurrent}
            >
              {loading[plan.id]
                ? "Processing..."
                : plan.isCurrent
                ? "Current Plan"
                : "Get Started"}
            </button>
          </div>
        ))}
      </div>

      {planName && (
      <div className="volume-section">
        <h2 className="section-title">Volume Packs</h2>
        <p className="section-subtitle">
          Add more agents without changing your current subscription plan.
        </p>
        <div className="volume-cards-container">
          {volumePacks.map((pack) => (
            <div key={pack.id} className="volume-card">
              <h3 className="volume-name">{pack.name}</h3>
              <div className="volume-price-container">
                <span className="volume-price">
                  €{isAnnual ? pack.annualPrice : pack.monthlyPrice}
                </span>
                <span className="volume-period">
                  /{isAnnual ? "year" : "month"}
                </span>
              </div>
              <p className="volume-extra-agents">{pack.extraAgents}</p>
              <p className="volume-price-per-agent">
                Price per Agent: €{pack.pricePerAgent}
              </p>
              <button
                className="subscribe-btn"
                onClick={() => handleExpansionPack(pack)}
                disabled={loading[pack.id]}
              >
                {loading[pack.id] ? "Processing..." : "Add Pack"}
              </button>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Expansion Packs Section */}
      {planName && (
        <div className="expansion-section">
          <h2 className="section-title">Expansion Packs</h2>
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