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
  const [loading, setLoading] = useState({});
  const [isAnnual, setIsAnnual] = useState(false);
  const [hasPurchasedPlan, setHasPurchasedPlan] = useState(false);
  const [plansData, setPlansData] = useState({
    mainPlans: [],
    expansionPacks: [],
    volumePacks: [],
  });

  // Set hasPurchasedPlan based on current plan name
  useEffect(() => {
    setHasPurchasedPlan(planName && ["starter", "pro", "enterprise"].includes(planName.toLowerCase()));
  }, [planName]);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${config.BASE_URL}/api/group/plans`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.status === "success") {
          const fetchedPlans = response.data.plans;

          const loadingState = {};
          const mainPlans = [];
          const expansionPacks = [];
          const volumePacks = [];

          fetchedPlans.forEach((plan) => {
            const id = plan.name.toLowerCase();
            const displayName = id.replace(/_/g, " "); 
            loadingState[id] = false;

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
                name: displayName,
                period: "month",
                description: "",
                features,
                featured: id === "pro",
                monthlyPrice: plan.monthly_price.toFixed(2),
                annualPrice: plan.annual_price.toFixed(2),
                isCurrent: planName?.toLowerCase() === id,
              });
            } else if (id.includes("growth") || id.includes("scale") || id.includes("max")) {
              expansionPacks.push({
                id,
                name: displayName,
                extraAgents: `+${plan.agents_per_month} agents`,
                monthlyPrice: plan.monthly_price.toFixed(2),
                pricePerAgent: (plan.monthly_price / plan.agents_per_month).toFixed(2),
              });
            } else if (id.includes("volume")) {
              volumePacks.push({
                id,
                name: displayName,
                extraInvoices: `+${plan.invoices_per_month} invoices/month`,
                monthlyPrice: plan.monthly_price.toFixed(2),
                annualPrice: plan.annual_price.toFixed(2),
                pricePerInvoice: (plan.monthly_price / plan.invoices_per_month).toFixed(2),
              });
            }
          });

          setLoading(loadingState);
          setPlansData({ mainPlans, expansionPacks, volumePacks });
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load subscription plans.",
        });
      }
    };

    fetchPlans();
  }, [token, planName]);

  const getPrice = (plan, isAnnual) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const handleSubscribe = async (plan) => {
    const price = getPrice(plan, isAnnual);
    if (!price || price === "NaN") {
      Swal.fire({
        icon: "error",
        title: "Invalid Plan",
        text: "This plan is not available at the moment.",
      });
      return;
    }

    setLoading((prev) => ({ ...prev, [plan.id]: true }));

    try {
      if (plan.id === "free_trial") {
        const res = await axios.post(
          `${config.BASE_URL}/api/start-free-trial`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Free Trial Started!",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => window.location.reload());
        }
      } else {
        const res = await axios.post(
          `${config.BASE_URL}/api/create-payment-intent`,
          {
            plan_id: plan.id,
            duration: isAnnual ? "annual" : "monthly",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status === 200) {
          navigate("/group_admin/checkout", {
            state: {
              planDetails: plan,
              clientSecret: res.data.clientSecret,
              paymentIntentId: res.data.id,
              amount: price,
              currency: "eur",
            },
          });
        }
      }
    } catch (err) {
      console.error("Subscription error:", err);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: err.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [plan.id]: false }));
    }
  };

  const handleExpansionPack = async (pack) => {
    setLoading((prev) => ({ ...prev, [pack.id]: true }));
    try {
      const res = await axios.post(
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

      if (res.status === 200) {
        navigate("/group_admin/checkout", {
          state: {
            planDetails: pack,
            clientSecret: res.data.clientSecret,
            paymentIntentId: res.data.id,
            amount: pack.monthlyPrice,
            currency: "eur",
            isExpansion: true,
          },
        });
      }
    } catch (err) {
      console.error("Expansion pack error:", err);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: err.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [pack.id]: false }));
    }
  };

  return (
    <div className="subscription-container">
      <h2 className="section-title">Subscription Plans</h2>
      <p className="section-subtitle">Select the perfect plan for your needs</p>

      {/* Toggle for Annual/Monthly */}
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

      {/* Main Plans */}
      <div className="cards-container">
        {plansData.mainPlans.map((plan) => (
          <div key={plan.id} className={`subscription-card ${plan.featured ? "featured" : ""} ${plan.isCurrent ? "current-plan" : ""}`}>
            {plan.featured && <div className="popular-badge">Most Popular</div>}
            <h3>{plan.name}</h3>
            <div className="price-container">
              <span className="price">€{getPrice(plan, isAnnual)}</span>
              <span className="period">/{isAnnual ? "year" : "month"}</span>
            </div>
            <ul className="features-list">
              {plan.features.map((feature, i) => (
                <li key={i}>• {feature}</li>
              ))}
            </ul>
            <button
              className={`subscribe-btn ${plan.isCurrent ? "current-btn" : ""}`}
              onClick={() => handleSubscribe(plan)}
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

      {/* Volume Packs */}
      {hasPurchasedPlan && plansData.volumePacks.length > 0 && (
        <div className="volume-section">
          <h2 className="section-title">Volume Packs</h2>
          <p className="section-subtitle">Add more invoices per month.</p>
          <div className="volume-cards-container">
            {plansData.volumePacks.map((pack) => (
              <div key={pack.id} className="volume-card">
                <h3>{pack.name}</h3>
                <div className="price-container">
                  <span className="price">€{isAnnual ? pack.annualPrice : pack.monthlyPrice}</span>
                  <span className="period">/{isAnnual ? "year" : "month"}</span>
                </div>
                <p>{pack.extraInvoices}</p>
                <p>Price per Invoice: €{pack.pricePerInvoice}</p>
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
      {hasPurchasedPlan && plansData.expansionPacks.length > 0 && (
        <div className="expansion-section">
          <h2 className="section-title">Expansion Packs</h2>
          <p className="section-subtitle">Add more agents without changing your current plan.</p>
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
              {plansData.expansionPacks.map((pack) => (
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
      )}
    </div>
  );
};

export default Subscription;