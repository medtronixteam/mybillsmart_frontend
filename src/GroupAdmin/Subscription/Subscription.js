import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Subscription.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import Swal from "sweetalert2";

const Subscription = () => {
  const navigate = useNavigate();
  const { token, planName } = useAuth();

  const [loading, setLoading] = useState({
    free_trial: false,
    starter: false,
    pro: false,
    enterprise: false,
    growth_pack: false,
    scale_pack: false,
    max_pack: false,
    volume_mini: false,
    volume_medium: false,
    volume_max: false,
  });

  const [planPrices, setPlanPrices] = useState({});
  const [isAnnual, setIsAnnual] = useState(false);
  const [hasPurchasedPlan, setHasPurchasedPlan] = useState(false);
  const [dynamicPlans, setDynamicPlans] = useState({
    mainPlans: [],
    expansionPacks: [],
    volumePacks: [],
  });

  // Check if user has an active paid plan
  useEffect(() => {
    setHasPurchasedPlan(planName && ["starter", "pro", "enterprise"].includes(planName.toLowerCase()));
  }, [planName]);

  // Fetch plan data from API
  useEffect(() => {
    const fetchPlanPrices = async () => {
      try {
        const response = await axios.get(`${config.BASE_URL}/api/group/plans`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.status === "success") {
          const fetchedPlans = response.data.plans;

          const prices = {};
          const mainPlans = [];
          const expansionPacks = [];
          const volumePacks = [];

          fetchedPlans.forEach((plan) => {
            const id = plan.name.toLowerCase();
            prices[id] = {
              monthly: plan.monthly_price.toFixed(2),
              annual: plan.annual_price.toFixed(2),
            };

            const features = [];

            if (plan.agents_per_month > 0)
              features.push(`${plan.agents_per_month} active agent${plan.agents_per_month !== 1 ? "s" : ""}`);
            if (plan.invoices_per_month > 0)
              features.push(`Up to ${plan.invoices_per_month.toLocaleString()} invoice${plan.invoices_per_month !== 1 ? "s" : ""}/month`);
            else if (id.includes("pack"))
              features.push("Add more agents without changing your current plan");

            features.push("Access to dashboard");
            features.push("Email support");

            if (["free_trial", "starter", "pro", "enterprise"].includes(id)) {
              mainPlans.push({
                id,
                name: plan.name,
                period: "month",
                description: "",
                features,
                featured: id === "pro",
                price: prices[id]?.monthly || "N/A",
                isCurrent: planName?.toLowerCase() === id,
              });
            } else if (id.includes("growth") || id.includes("scale") || id.includes("max")) {
              expansionPacks.push({
                id,
                name: plan.name,
                extraAgents: `+${plan.agents_per_month} agents`,
                monthlyPrice: plan.monthly_price.toFixed(2),
                pricePerAgent: (plan.monthly_price / plan.agents_per_month).toFixed(2),
              });
            } else if (id.includes("volume")) {
              volumePacks.push({
                id,
                name: plan.name,
                extraAgents: `+${plan.agents_per_month} agents`,
                monthlyPrice: plan.monthly_price.toFixed(2),
                annualPrice: plan.annual_price.toFixed(2),
                pricePerAgent: (plan.monthly_price / plan.agents_per_month).toFixed(2),
              });
            }
          });

          setDynamicPlans({ mainPlans, expansionPacks, volumePacks });
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

        // Default fallback values
        setPlanPrices({
          starter: { monthly: "99.00", annual: "990.00" },
          pro: { monthly: "450.00", annual: "4500.00" },
          enterprise: { monthly: "1890.00", annual: "18900.00" },
        });

        setDynamicPlans({
          mainPlans: [
            {
              id: "starter",
              name: "Starter",
              period: "month",
              description: "For individual agents or small businesses",
              features: ["1 active agent", "Up to 200 invoices/month"],
              featured: false,
            },
            {
              id: "pro",
              name: "Pro",
              period: "month",
              description: "For commercial teams",
              features: ["5 active agents", "Up to 1000 invoices/month"],
              featured: true,
            },
            {
              id: "enterprise",
              name: "Enterprise",
              period: "month",
              description: "For large businesses",
              features: ["25 active agents", "Up to 5000 invoices/month"],
              featured: false,
            },
          ],
          expansionPacks: [],
          volumePacks: [],
        });
      }
    };

    fetchPlanPrices();
  }, [token]);

  const getPlansWithPrices = () => {
    return dynamicPlans.mainPlans.map((plan) => ({
      ...plan,
      price: planPrices[plan.id]?.[isAnnual ? "annual" : "monthly"] || "N/A",
      isCurrent: planName?.toLowerCase() === plan.id,
    }));
  };

  const handleSubscription = async (selectedPlan) => {
    if (selectedPlan.price === "N/A" && !selectedPlan.isTrial) {
      Swal.fire({
        icon: "error",
        title: "Price Not Available",
        text: "This plan is currently unavailable. Please try again later.",
      });
      return;
    }

    setLoading((prev) => ({ ...prev, [selectedPlan.id]: true }));

    try {
      if (selectedPlan.isTrial) {
        const response = await axios.post(
          `${config.BASE_URL}/api/start-free-trial`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Free Trial Started!",
            text: "Your 7-day free trial has been activated!",
            timer: 3000,
            showConfirmButton: false,
          }).then(() => window.location.reload());
        }
      } else {
        const response = await axios.post(
          `${config.BASE_URL}/api/create-payment-intent`,
          {
            plan_id: selectedPlan.id,
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
      }
    } catch (error) {
      console.error("Subscription error:", error);
      Swal.fire({
        icon: "error",
        title: selectedPlan.isTrial ? "Trial Failed" : "Payment Failed",
        text:
          error.response?.data?.message ||
          (selectedPlan.isTrial
            ? "Failed to start free trial. Please try again."
            : "Payment processing failed. Please try again."),
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
          is_expansion: true,
          duration: "monthly",
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

      {/* Show toggle only when user has purchased a plan */}
      {hasPurchasedPlan && (
        <div className="toggle-switch-container">
          <span>Monthly</span>
          <label className="switch">
            <input type="checkbox" checked={isAnnual} onChange={() => setIsAnnual(!isAnnual)} />
            <span className="slider round"></span>
          </label>
          <span>Annual</span>
        </div>
      )}

      <div className="cards-container">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`subscription-card ${
              plan.featured ? "featured" : ""
            } ${plan.isCurrent ? "current-plan" : ""}`}
          >
            {plan.featured && <div className="popular-badge">Most Popular</div>}
            <h3 className="plan-name">{plan.name}</h3>
            <div className="price-container">
              <span className="price">€{plan.price}</span>
              <span className="period">/{isAnnual ? "year" : "month"}</span>
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
              className={`subscribe-btn ${plan.isCurrent ? "current-btn" : ""}`}
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

      {/* Volume Packs Section */}
      {hasPurchasedPlan && dynamicPlans.volumePacks.length > 0 && (
        <div className="volume-section">
          <h2 className="section-title">Volume Packs</h2>
          <p className="section-subtitle">Add more agents without changing your current subscription plan.</p>
          <div className="volume-cards-container">
            {dynamicPlans.volumePacks.map((pack) => (
              <div key={pack.id} className="volume-card">
                <h3 className="volume-name">{pack.name}</h3>
                <div className="volume-price-container">
                  <span className="volume-price">€{isAnnual ? pack.annualPrice : pack.monthlyPrice}</span>
                  <span className="volume-period">/{isAnnual ? "year" : "month"}</span>
                </div>
                <p className="volume-extra-agents">{pack.extraAgents}</p>
                <p className="volume-price-per-agent">Price per Agent: €{pack.pricePerAgent}</p>
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

      {/* Expansion Packs Table */}
      {hasPurchasedPlan && dynamicPlans.expansionPacks.length > 0 && (
        <div className="expansion-section">
          <h2 className="section-title">Expansion Packs</h2>
          <p className="section-subtitle">Add more agents without changing your current subscription plan.</p>
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
                {dynamicPlans.expansionPacks.map((pack) => (
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