import React, { useState } from "react";
import Swal from "sweetalert2";
import "./AdminAddProduct.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../Breadcrumbs";

const AdminAddProduct = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("electricity");

  // Form states for each product type
  const [electricityForm, setElectricityForm] = useState({
    provider_name: "",
    product_name: "",
    light_category: "",
    fixed_rate: "",
    p1: "",
    p2: "",
    p3: "",
    p4: "",
    p5: "",
    p6: "",
    power_term: "",
    peak: "",
    off_peak: "",
    energy_term_by_time: "",
    variable_term_by_tariff: "",
    contract_duration: "",
    customer_type: "residential",
    sales_commission: "",
    points_per_deal: "",
    meter_rental: "",
    validity_period_from: "",
    validity_period_to: "",
    discount_period_start: "",
    discount_period_end: "",
    contact_terms: "",
  });

  const [gasForm, setGasForm] = useState({
    provider_name: "",
    product_name: "",
    light_category: "",
    fixed_rate: "",
    rl1: "",
    rl2: "",
    rl3: "",
    contract_duration: "",
    customer_type: "residential",
    sales_commission: "",
    points_per_deal: "",
    meter_rental: "",
    validity_period_from: "",
    validity_period_to: "",
    discount_period_start: "",
    discount_period_end: "",
    contact_terms: "",
    power_term: "",
    peak: "",
    off_peak: "",
    energy_term_by_time: "",
    variable_term_by_tariff: "",
  });

  const [combinedForm, setCombinedForm] = useState({
    provider_name: "",
    product_name: "",
    // Electricity fields
    light_category: "",
    fixed_rate: "",
    p1: "",
    p2: "",
    p3: "",
    p4: "",
    p5: "",
    p6: "",
    power_term: "",
    peak: "",
    off_peak: "",
    energy_term_by_time: "",
    variable_term_by_tariff: "",
    // Gas fields
    rl1: "",
    rl2: "",
    rl3: "",
    // Common fields
    contract_duration: "",
    customer_type: "residential",
    sales_commission: "",
    points_per_deal: "",
    meter_rental: "",
    validity_period_from: "",
    validity_period_to: "",
    discount_period_start: "",
    discount_period_end: "",
    contact_terms: "",
    dual_discount: "",
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleElectricityChange = (e) => {
    const { name, value } = e.target;
    setElectricityForm({ ...electricityForm, [name]: value });
  };

  const handleGasChange = (e) => {
    const { name, value } = e.target;
    setGasForm({ ...gasForm, [name]: value });
  };

  const handleCombinedChange = (e) => {
    const { name, value } = e.target;
    setCombinedForm({ ...combinedForm, [name]: value });
  };

  const handleFileUpload = (e, formType) => {
    const file = e.target.files[0];
    if (formType === "electricity") {
      setElectricityForm({ ...electricityForm, contact_terms: file });
    } else if (formType === "gas") {
      setGasForm({ ...gasForm, contact_terms: file });
    } else {
      setCombinedForm({ ...combinedForm, contact_terms: file });
    }
  };

  const submitElectricityForm = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.entries(electricityForm).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });

      const response = await fetch(
        `${config.BASE_URL}/api/electricity/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to add electricity product");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Electricity product added successfully!",
        confirmButtonText: "OK",
      });

      // Reset form
      setElectricityForm({
        provider_name: "",
        product_name: "",
        light_category: "",
        fixed_rate: "",
        p1: "",
        p2: "",
        p3: "",
        p4: "",
        p5: "",
        p6: "",
        power_term: "",
        peak: "",
        off_peak: "",
        energy_term_by_time: "",
        variable_term_by_tariff: "",
        contract_duration: "",
        customer_type: "residential",
        sales_commission: "",
        points_per_deal: "",
        meter_rental: "",
        validity_period_from: "",
        validity_period_to: "",
        discount_period_start: "",
        discount_period_end: "",
        contact_terms: "",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
        confirmButtonText: "OK",
      });
    }
  };

  const submitGasForm = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.entries(gasForm).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });

      const response = await fetch(`${config.BASE_URL}/api/gas/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add gas product");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Gas product added successfully!",
        confirmButtonText: "OK",
      });

      // Reset form
      setGasForm({
        provider_name: "",
        product_name: "",
        light_category: "",
        fixed_rate: "",
        rl1: "",
        rl2: "",
        rl3: "",
        contract_duration: "",
        customer_type: "residential",
        sales_commission: "",
        points_per_deal: "",
        meter_rental: "",
        validity_period_from: "",
        validity_period_to: "",
        discount_period_start: "",
        discount_period_end: "",
        contact_terms: "",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
        confirmButtonText: "OK",
      });
    }
  };

  const submitCombinedForm = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.entries(combinedForm).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });

      const response = await fetch(`${config.BASE_URL}/api/both/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add combined product");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Combined product added successfully!",
        confirmButtonText: "OK",
      });

      // Reset form
      setCombinedForm({
        provider_name: "",
        product_name: "",
        light_category: "",
        fixed_rate: "",
        p1: "",
        p2: "",
        p3: "",
        p4: "",
        p5: "",
        p6: "",
        power_term: "",
        peak: "",
        off_peak: "",
        energy_term_by_time: "",
        variable_term_by_tariff: "",
        rl1: "",
        rl2: "",
        rl3: "",
        contract_duration: "",
        customer_type: "residential",
        sales_commission: "",
        points_per_deal: "",
        meter_rental: "",
        validity_period_from: "",
        validity_period_to: "",
        discount_period_start: "",
        discount_period_end: "",
        contact_terms: "",
        dual_discount: "",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <div className="mt-4 container">
        <Breadcrumbs homePath={"/group_admin/dashboard"} />

        <div className="row justify-content-center text-center">
          <div className="col-md-2 col-4">
            <button
              className={`tab-btn ${
                activeTab === "electricity" ? "active" : ""
              }`}
              onClick={() => handleTabChange("electricity")}
            >
              Electricity
            </button>
          </div>
          <div className="col-md-2 col-4">
            <button
              className={`tab-btn ${activeTab === "gas" ? "active" : ""}`}
              onClick={() => handleTabChange("gas")}
            >
              Gas
            </button>
          </div>
          <div className="col-md-2 col-4">
            <button
              className={`tab-btn ${activeTab === "combined" ? "active" : ""}`}
              onClick={() => handleTabChange("combined")}
            >
              Combined
            </button>
          </div>
        </div>
      </div>

      <div className="add-product-container mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-column flex-sm-row">
          <h1 className="mb-0">Add Product</h1>
          <Link to="/group_admin/products">
            <button className="btn btn-primary w-100 fs-6">
              View Products
            </button>
          </Link>
        </div>

        {/* Electricity Form */}
        {activeTab === "electricity" && (
          <form onSubmit={submitElectricityForm} className="container">
            <div className="row">
              <div className="col-12">
                <h3>Electricity Agreement</h3>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Provider Name*</label>
                <input
                  type="text"
                  name="provider_name"
                  placeholder="Provider Name"
                  value={electricityForm.provider_name}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Product Name*</label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="Product Name"
                  value={electricityForm.product_name}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Customer Type*</label>
                <select
                  name="customer_type"
                  value={electricityForm.customer_type}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                >
                  <option value="residential">Residential</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Light Category*</label>
                <input
                  type="text"
                  name="light_category"
                  placeholder="Light Category"
                  value={electricityForm.light_category}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Fixed Rate*</label>
                <input
                  type="number"
                  step="0.01"
                  name="fixed_rate"
                  placeholder="Fixed Rate"
                  value={electricityForm.fixed_rate}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Meter Rental*</label>
                <input
                  type="number"
                  step="0.01"
                  name="meter_rental"
                  placeholder="Meter Rental"
                  value={electricityForm.meter_rental}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12">
                <h4 className="mt-4">Power Terms</h4>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Power Term*</label>
                <input
                  type="number"
                  step="0.01"
                  name="power_term"
                  placeholder="Power Term"
                  value={electricityForm.power_term}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Peak*</label>
                <input
                  type="text"
                  name="peak"
                  placeholder="Peak"
                  value={electricityForm.peak}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Off Peak*</label>
                <input
                  type="text"
                  name="off_peak"
                  placeholder="Off Peak"
                  value={electricityForm.off_peak}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Energy Term By Time*</label>
                <input
                  type="text"
                  name="energy_term_by_time"
                  placeholder="Energy Term By Time"
                  value={electricityForm.energy_term_by_time}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Variable Term By Tariff*</label>
                <input
                  type="text"
                  name="variable_term_by_tariff"
                  placeholder="Variable Term By Tariff"
                  value={electricityForm.variable_term_by_tariff}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12">
                <h4 className="mt-4">Energy Terms (€/kWh)</h4>
              </div>

              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div className="col-12 col-sm-6 col-md-4 mb-3" key={`p${num}`}>
                  <label>{`P${num}`}</label>
                  <input
                    type="number"
                    step="0.0001"
                    name={`p${num}`}
                    placeholder={`P${num}`}
                    value={electricityForm[`p${num}`]}
                    onChange={handleElectricityChange}
                    className="form-control w-100"
                  />
                </div>
              ))}

              <div className="col-12 col-md-6 mb-3">
                <label>Contract Duration*</label>
                <input
                  type="text"
                  name="contract_duration"
                  placeholder="Contract Duration"
                  value={electricityForm.contract_duration}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Agent Commission*</label>
                <input
                  type="number"
                  step="0.01"
                  name="sales_commission"
                  placeholder="Agent Commission"
                  value={electricityForm.sales_commission}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Points Per Deal*</label>
                <input
                  type="number"
                  name="points_per_deal"
                  placeholder="Points Per Deal"
                  value={electricityForm.points_per_deal}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Validity Period From*</label>
                <input
                  type="date"
                  name="validity_period_from"
                  value={electricityForm.validity_period_from}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Validity Period To*</label>
                <input
                  type="date"
                  name="validity_period_to"
                  value={electricityForm.validity_period_to}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Discount Period Start</label>
                <input
                  type="date"
                  name="discount_period_start"
                  value={electricityForm.discount_period_start}
                  onChange={handleElectricityChange}
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Discount Period End</label>
                <input
                  type="date"
                  name="discount_period_end"
                  value={electricityForm.discount_period_end}
                  onChange={handleElectricityChange}
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 mb-3">
                <label>Contract Terms*</label>
                <textarea
                  name="contact_terms"
                  placeholder="Contract Terms"
                  value={electricityForm.contact_terms}
                  onChange={handleElectricityChange}
                  required
                  className="form-control w-100 h-100"
                />
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary mt-5 w-100 w-md-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Gas Form */}
        {activeTab === "gas" && (
          <form onSubmit={submitGasForm} className="container">
            <div className="row">
              <div className="col-12">
                <h3>Gas Agreement</h3>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Provider Name*</label>
                <input
                  type="text"
                  name="provider_name"
                  placeholder="Provider Name"
                  value={gasForm.provider_name}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Product Name*</label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="Product Name"
                  value={gasForm.product_name}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Customer Type*</label>
                <select
                  name="customer_type"
                  value={gasForm.customer_type}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                >
                  <option value="residential">Residential</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Light Category*</label>
                <input
                  type="text"
                  name="light_category"
                  placeholder="Light Category"
                  value={gasForm.light_category}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Fixed Rate*</label>
                <input
                  type="number"
                  step="0.01"
                  name="fixed_rate"
                  placeholder="Fixed Rate"
                  value={gasForm.fixed_rate}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Power Term*</label>
                <input
                  type="number"
                  step="0.01"
                  name="power_term"
                  placeholder="Power Term"
                  value={gasForm.power_term}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Meter Rental*</label>
                <input
                  type="number"
                  step="0.01"
                  name="meter_rental"
                  placeholder="Meter Rental"
                  value={gasForm.meter_rental}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>
              <div className="col-12 col-md-6 mb-3">
                <label>Peak*</label>
                <input
                  type="text"
                  name="peak"
                  placeholder="Peak"
                  value={gasForm.peak}
                  onChange={handleGasChange}  
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Off Peak*</label>
                <input
                  type="text"
                  name="off_peak"
                  placeholder="Off Peak"
                  value={gasForm.off_peak}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Energy Term By Time*</label>
                <input
                  type="text"
                  name="energy_term_by_time"
                  placeholder="Energy Term By Time"
                  value={gasForm.energy_term_by_time}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Variable Term By Tariff*</label>
                <input
                  type="text"
                  name="variable_term_by_tariff"
                  placeholder="Variable Term By Tariff"
                  value={gasForm.variable_term_by_tariff}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>
              <div className="col-12">
                <h4 className="mt-4">Variable Terms (€/kWh)</h4>
              </div>

              {[1, 2, 3].map((num) => (
                <div className="col-12 col-sm-6 col-md-4 mb-3" key={`rl${num}`}>
                  <label>{`RL${num}`}</label>
                  <input
                    type="number"
                    step="0.0001"
                    name={`rl${num}`}
                    placeholder={`RL${num}`}
                    value={gasForm[`rl${num}`]}
                    onChange={handleGasChange}
                    className="form-control w-100"
                  />
                </div>
              ))}

              <div className="col-12 col-md-6 mb-3">
                <label>Contract Duration*</label>
                <input
                  type="text"
                  name="contract_duration"
                  placeholder="Contract Duration"
                  value={gasForm.contract_duration}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Agent Commission*</label>
                <input
                  type="number"
                  step="0.01"
                  name="sales_commission"
                  placeholder="Agent Commission"
                  value={gasForm.sales_commission}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Points Per Deal*</label>
                <input
                  type="number"
                  name="points_per_deal"
                  placeholder="Points Per Deal"
                  value={gasForm.points_per_deal}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Validity Period From*</label>
                <input
                  type="date"
                  name="validity_period_from"
                  value={gasForm.validity_period_from}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Validity Period To*</label>
                <input
                  type="date"
                  name="validity_period_to"
                  value={gasForm.validity_period_to}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Discount Period Start</label>
                <input
                  type="date"
                  name="discount_period_start"
                  value={gasForm.discount_period_start}
                  onChange={handleGasChange}
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Discount Period End</label>
                <input
                  type="date"
                  name="discount_period_end"
                  value={gasForm.discount_period_end}
                  onChange={handleGasChange}
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 mb-3">
                <label>Contract Terms*</label>
                <textarea
                  name="contact_terms"
                  placeholder="Contract Terms"
                  value={gasForm.contact_terms}
                  onChange={handleGasChange}
                  required
                  className="form-control w-100 h-100"
                />
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary mt-5 w-100 w-md-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Combined Form */}
        {activeTab === "combined" && (
          <form onSubmit={submitCombinedForm} className="container">
            <div className="row">
              <div className="col-12">
                <h3>Combined Agreement + Gas Agreement</h3>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Provider Name*</label>
                <input
                  type="text"
                  name="provider_name"
                  placeholder="Provider Name"
                  value={combinedForm.provider_name}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Product Name*</label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="Product Name"
                  value={combinedForm.product_name}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Customer Type*</label>
                <select
                  name="customer_type"
                  value={combinedForm.customer_type}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                >
                  <option value="residential">Residential</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Dual Contract Discount (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="dual_discount"
                  placeholder="Dual Discount"
                  value={combinedForm.dual_discount}
                  onChange={handleCombinedChange}
                  className="form-control w-100"
                />
              </div>

              <div className="col-12">
                <h4 className="mt-4">Electricity Terms</h4>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Light Category*</label>
                <input
                  type="text"
                  name="light_category"
                  placeholder="Light Category"
                  value={combinedForm.light_category}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Fixed Rate*</label>
                <input
                  type="number"
                  step="0.01"
                  name="fixed_rate"
                  placeholder="Fixed Rate"
                  value={combinedForm.fixed_rate}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12">
                <h5 className="mt-3">Power Terms</h5>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Power Term*</label>
                <input
                  type="number"
                  step="0.01"
                  name="power_term"
                  placeholder="Power Term"
                  value={combinedForm.power_term}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Peak*</label>
                <input
                  type="text"
                  name="peak"
                  placeholder="Peak"
                  value={combinedForm.peak}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Off Peak*</label>
                <input
                  type="text"
                  name="off_peak"
                  placeholder="Off Peak"
                  value={combinedForm.off_peak}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Energy Term By Time*</label>
                <input
                  type="text"
                  name="energy_term_by_time"
                  placeholder="Energy Term By Time"
                  value={combinedForm.energy_term_by_time}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Variable Term By Tariff*</label>
                <input
                  type="text"
                  name="variable_term_by_tariff"
                  placeholder="Variable Term By Tariff"
                  value={combinedForm.variable_term_by_tariff}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12">
                <h5 className="mt-3">Energy Terms (€/kWh)</h5>
              </div>

              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div className="col-12 col-sm-6 col-md-4 mb-3" key={`p${num}`}>
                  <label>{`P${num}`}</label>
                  <input
                    type="number"
                    step="0.0001"
                    name={`p${num}`}
                    placeholder={`P${num}`}
                    value={combinedForm[`p${num}`]}
                    onChange={handleCombinedChange}
                    className="form-control w-100"
                  />
                </div>
              ))}

              <div className="col-12">
                <h4 className="mt-4">Gas Terms</h4>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Fixed Rate*</label>
                <input
                  type="number"
                  step="0.01"
                  name="fixed_rate"
                  placeholder="Fixed Rate"
                  value={combinedForm.fixed_rate}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Meter Rental*</label>
                <input
                  type="number"
                  step="0.01"
                  name="meter_rental"
                  placeholder="Meter Rental"
                  value={combinedForm.meter_rental}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12">
                <h5 className="mt-3">Variable Terms (€/kWh)</h5>
              </div>

              {[1, 2, 3].map((num) => (
                <div className="col-12 col-sm-6 col-md-4 mb-3" key={`rl${num}`}>
                  <label>{`RL${num}`}</label>
                  <input
                    type="number"
                    step="0.0001"
                    name={`rl${num}`}
                    placeholder={`RL${num}`}
                    value={combinedForm[`rl${num}`]}
                    onChange={handleCombinedChange}
                    className="form-control w-100"
                  />
                </div>
              ))}

              <div className="col-12">
                <h4 className="mt-4">Common Terms</h4>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Contract Duration*</label>
                <input
                  type="text"
                  name="contract_duration"
                  placeholder="Contract Duration"
                  value={combinedForm.contract_duration}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Agent Commission*</label>
                <input
                  type="number"
                  step="0.01"
                  name="sales_commission"
                  placeholder="Agent Commission"
                  value={combinedForm.sales_commission}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Points Per Deal*</label>
                <input
                  type="number"
                  name="points_per_deal"
                  placeholder="Points Per Deal"
                  value={combinedForm.points_per_deal}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Validity Period From*</label>
                <input
                  type="date"
                  name="validity_period_from"
                  value={combinedForm.validity_period_from}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Validity Period To*</label>
                <input
                  type="date"
                  name="validity_period_to"
                  value={combinedForm.validity_period_to}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Discount Period Start</label>
                <input
                  type="date"
                  name="discount_period_start"
                  value={combinedForm.discount_period_start}
                  onChange={handleCombinedChange}
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label>Discount Period End</label>
                <input
                  type="date"
                  name="discount_period_end"
                  value={combinedForm.discount_period_end}
                  onChange={handleCombinedChange}
                  className="form-control w-100"
                />
              </div>

              <div className="col-12 mb-3">
                <label>Contract Terms*</label>
                <textarea
                  name="contact_terms"
                  placeholder="Contract Terms"
                  value={combinedForm.contact_terms}
                  onChange={handleCombinedChange}
                  required
                  className="form-control w-100 h-100"
                />
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary mt-5 w-100 w-md-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default AdminAddProduct;
