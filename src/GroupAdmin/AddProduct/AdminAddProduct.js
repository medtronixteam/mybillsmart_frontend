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
    p1: "",
    p2: "",
    p3: "",
    p4: "",
    p5: "",
    p6: "",
    power_term_peak: "",
    power_term_off_peak: "",
    contract_duration: "",
    customer_type: "residential",
    sales_commission: "",
    agreement_start: "",
    agreement_end: "",
    contract_terms: null,
  });

  const [gasForm, setGasForm] = useState({
    provider_name: "",
    product_name: "",
    fixed_term: "",
    rl1: "",
    rl2: "",
    rl3: "",
    contract_duration: "",
    customer_type: "residential",
    sales_commission: "",
    agreement_start: "",
    agreement_end: "",
    contract_terms: null,
  });

  const [combinedForm, setCombinedForm] = useState({
    provider_name: "",
    product_name: "",
    // Electricity fields
    light_category: "",
    p1: "",
    p2: "",
    p3: "",
    p4: "",
    p5: "",
    p6: "",
    power_term_peak: "",
    power_term_off_peak: "",
    // Gas fields
    fixed_term: "",
    rl1: "",
    rl2: "",
    rl3: "",
    // Common fields
    contract_duration: "",
    customer_type: "residential",
    sales_commission: "",
    agreement_start: "",
    agreement_end: "",
    contract_terms: null,
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
      setElectricityForm({ ...electricityForm, contract_terms: file });
    } else if (formType === "gas") {
      setGasForm({ ...gasForm, contract_terms: file });
    } else {
      setCombinedForm({ ...combinedForm, contract_terms: file });
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

      const response = await fetch(`${config.BASE_URL}/api/supervisor/electricity-products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

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
        p1: "",
        p2: "",
        p3: "",
        p4: "",
        p5: "",
        p6: "",
        power_term_peak: "",
        power_term_off_peak: "",
        contract_duration: "",
        customer_type: "residential",
        sales_commission: "",
        agreement_start: "",
        agreement_end: "",
        contract_terms: null,
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

      const response = await fetch(`${config.BASE_URL}/api/supervisor/gas-products`, {
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
        fixed_term: "",
        rl1: "",
        rl2: "",
        rl3: "",
        contract_duration: "",
        customer_type: "residential",
        sales_commission: "",
        agreement_start: "",
        agreement_end: "",
        contract_terms: null,
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

      const response = await fetch(`${config.BASE_URL}/api/supervisor/combined-products`, {
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
        p1: "",
        p2: "",
        p3: "",
        p4: "",
        p5: "",
        p6: "",
        power_term_peak: "",
        power_term_off_peak: "",
        fixed_term: "",
        rl1: "",
        rl2: "",
        rl3: "",
        contract_duration: "",
        customer_type: "residential",
        sales_commission: "",
        agreement_start: "",
        agreement_end: "",
        contract_terms: null,
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
      </div>

      <div className="add-product-container mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="mb-0">Add Agreement</h1>
          <Link to="/group_admin/products">
            <button className="btn btn-outline-primary">View Products</button>
          </Link>
        </div>

        {/* Tabs Navigation */}
        <div className="product-tabs mb-4">
          <button
            className={`tab-btn ${activeTab === "electricity" ? "active" : ""}`}
            onClick={() => handleTabChange("electricity")}
          >
            Electricity
          </button>
          <button
            className={`tab-btn ${activeTab === "gas" ? "active" : ""}`}
            onClick={() => handleTabChange("gas")}
          >
            Gas
          </button>
          <button
            className={`tab-btn ${activeTab === "combined" ? "active" : ""}`}
            onClick={() => handleTabChange("combined")}
          >
            Combined
          </button>
        </div>

        {/* Electricity Form */}
        {activeTab === "electricity" && (
          <form onSubmit={submitElectricityForm} className="product-form">
            <h3>Electricity Product</h3>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Provider Name</label>
                <input
                  type="text"
                  name="provider_name"
                  placeholder="Provider Name"
                  value={electricityForm.provider_name}
                  onChange={handleElectricityChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="Product Name"
                  value={electricityForm.product_name}
                  onChange={handleElectricityChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Customer Type</label>
                <select
                  name="customer_type"
                  value={electricityForm.customer_type}
                  onChange={handleElectricityChange}
                  required
                  className="form-control"
                >
                  <option value="residential">Residential</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label>Light Category</label>
                <input
                  type="text"
                  name="light_category"
                  placeholder="Light Category"
                  value={electricityForm.light_category}
                  onChange={handleElectricityChange}
                  className="form-control"
                />
              </div>
            </div>

            <h4 className="mt-4">Power Terms (€/kW/month)</h4>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Peak Power Term</label>
                <input
                  type="number"
                  name="power_term_peak"
                  placeholder="Peak Power Term"
                  value={electricityForm.power_term_peak}
                  onChange={handleElectricityChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Off-Peak Power Term</label>
                <input
                  type="number"
                  name="power_term_off_peak"
                  placeholder="Off-Peak Power Term"
                  value={electricityForm.power_term_off_peak}
                  onChange={handleElectricityChange}
                  className="form-control"
                />
              </div>
            </div>

            <h4 className="mt-4">Energy Terms (€/kWh)</h4>
            <div className="row">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div className="col-md-4 mb-3" key={`p${num}`}>
                  <label>{`P${num}`}</label>
                  <input
                    type="number"
                    name={`p${num}`}
                    placeholder={`P${num}`}
                    value={electricityForm[`p${num}`]}
                    onChange={handleElectricityChange}
                    className="form-control"
                  />
                </div>
              ))}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Contract Duration (months)</label>
                <input
                  type="text"
                  name="contract_duration"
                  placeholder="Contract Duration"
                  value={electricityForm.contract_duration}
                  onChange={handleElectricityChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Sales Commission</label>
                <input
                  type="number"
                  name="sales_commission"
                  placeholder="Sales Commission"
                  value={electricityForm.sales_commission}
                  onChange={handleElectricityChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Agreement Start Date</label>
                <input
                  type="date"
                  name="agreement_start"
                  value={electricityForm.agreement_start}
                  onChange={handleElectricityChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Agreement End Date</label>
                <input
                  type="date"
                  name="agreement_end"
                  value={electricityForm.agreement_end}
                  onChange={handleElectricityChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label>Contract Terms (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, "electricity")}
                  className="form-control"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Add Electricity Product
            </button>
          </form>
        )}

        {/* Gas Form */}
        {activeTab === "gas" && (
          <form onSubmit={submitGasForm} className="product-form">
            <h3>Gas Product</h3>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Provider Name</label>
                <input
                  type="text"
                  name="provider_name"
                  placeholder="Provider Name"
                  value={gasForm.provider_name}
                  onChange={handleGasChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="Product Name"
                  value={gasForm.product_name}
                  onChange={handleGasChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Customer Type</label>
                <select
                  name="customer_type"
                  value={gasForm.customer_type}
                  onChange={handleGasChange}
                  required
                  className="form-control"
                >
                  <option value="residential">Residential</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label>Fixed Term (€/month)</label>
                <input
                  type="number"
                  name="fixed_term"
                  placeholder="Fixed Term"
                  value={gasForm.fixed_term}
                  onChange={handleGasChange}
                  className="form-control"
                />
              </div>
            </div>

            <h4 className="mt-4">Variable Terms (€/kWh)</h4>
            <div className="row">
              {[1, 2, 3].map((num) => (
                <div className="col-md-4 mb-3" key={`rl${num}`}>
                  <label>{`RL${num}`}</label>
                  <input
                    type="number"
                    name={`rl${num}`}
                    placeholder={`RL${num}`}
                    value={gasForm[`rl${num}`]}
                    onChange={handleGasChange}
                    className="form-control"
                  />
                </div>
              ))}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Contract Duration (months)</label>
                <input
                  type="text"
                  name="contract_duration"
                  placeholder="Contract Duration"
                  value={gasForm.contract_duration}
                  onChange={handleGasChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Sales Commission</label>
                <input
                  type="number"
                  name="sales_commission"
                  placeholder="Sales Commission"
                  value={gasForm.sales_commission}
                  onChange={handleGasChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Agreement Start Date</label>
                <input
                  type="date"
                  name="agreement_start"
                  value={gasForm.agreement_start}
                  onChange={handleGasChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Agreement End Date</label>
                <input
                  type="date"
                  name="agreement_end"
                  value={gasForm.agreement_end}
                  onChange={handleGasChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label>Contract Terms (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, "gas")}
                  className="form-control"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Add Gas Product
            </button>
          </form>
        )}

        {/* Combined Form */}
        {activeTab === "combined" && (
          <form onSubmit={submitCombinedForm} className="product-form">
            <h3>Combined Electricity + Gas Product</h3>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Provider Name</label>
                <input
                  type="text"
                  name="provider_name"
                  placeholder="Provider Name"
                  value={combinedForm.provider_name}
                  onChange={handleCombinedChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="Product Name"
                  value={combinedForm.product_name}
                  onChange={handleCombinedChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Customer Type</label>
                <select
                  name="customer_type"
                  value={combinedForm.customer_type}
                  onChange={handleCombinedChange}
                  required
                  className="form-control"
                >
                  <option value="residential">Residential</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label>Dual Contract Discount (%)</label>
                <input
                  type="number"
                  name="dual_discount"
                  placeholder="Dual Discount"
                  value={combinedForm.dual_discount}
                  onChange={handleCombinedChange}
                  className="form-control"
                />
              </div>
            </div>

            <h4 className="mt-4">Electricity Terms</h4>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Light Category</label>
                <input
                  type="text"
                  name="light_category"
                  placeholder="Light Category"
                  value={combinedForm.light_category}
                  onChange={handleCombinedChange}
                  className="form-control"
                />
              </div>
            </div>

            <h5 className="mt-3">Power Terms (€/kW/month)</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Peak Power Term</label>
                <input
                  type="number"
                  name="power_term_peak"
                  placeholder="Peak Power Term"
                  value={combinedForm.power_term_peak}
                  onChange={handleCombinedChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Off-Peak Power Term</label>
                <input
                  type="number"
                  name="power_term_off_peak"
                  placeholder="Off-Peak Power Term"
                  value={combinedForm.power_term_off_peak}
                  onChange={handleCombinedChange}
                  className="form-control"
                />
              </div>
            </div>

            <h5 className="mt-3">Energy Terms (€/kWh)</h5>
            <div className="row">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div className="col-md-4 mb-3" key={`p${num}`}>
                  <label>{`P${num}`}</label>
                  <input
                    type="number"
                    name={`p${num}`}
                    placeholder={`P${num}`}
                    value={combinedForm[`p${num}`]}
                    onChange={handleCombinedChange}
                    className="form-control"
                  />
                </div>
              ))}
            </div>

            <h4 className="mt-4">Gas Terms</h4>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Fixed Term (€/month)</label>
                <input
                  type="number"
                  name="fixed_term"
                  placeholder="Fixed Term"
                  value={combinedForm.fixed_term}
                  onChange={handleCombinedChange}
                  className="form-control"
                />
              </div>
            </div>

            <h5 className="mt-3">Variable Terms (€/kWh)</h5>
            <div className="row">
              {[1, 2, 3].map((num) => (
                <div className="col-md-4 mb-3" key={`rl${num}`}>
                  <label>{`RL${num}`}</label>
                  <input
                    type="number"
                    name={`rl${num}`}
                    placeholder={`RL${num}`}
                    value={combinedForm[`rl${num}`]}
                    onChange={handleCombinedChange}
                    className="form-control"
                  />
                </div>
              ))}
            </div>

            <h4 className="mt-4">Common Terms</h4>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Contract Duration (months)</label>
                <input
                  type="text"
                  name="contract_duration"
                  placeholder="Contract Duration"
                  value={combinedForm.contract_duration}
                  onChange={handleCombinedChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Sales Commission</label>
                <input
                  type="number"
                  name="sales_commission"
                  placeholder="Sales Commission"
                  value={combinedForm.sales_commission}
                  onChange={handleCombinedChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Agreement Start Date</label>
                <input
                  type="date"
                  name="agreement_start"
                  value={combinedForm.agreement_start}
                  onChange={handleCombinedChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Agreement End Date</label>
                <input
                  type="date"
                  name="agreement_end"
                  value={combinedForm.agreement_end}
                  onChange={handleCombinedChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label>Contract Terms (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, "combined")}
                  className="form-control"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Add Combined Product
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default AdminAddProduct;