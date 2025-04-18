import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddProduct.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

const AddProduct = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    provider_name: "",
    product_name: "",
    light_category: "",
    fixed_rate: "",
    rl1: "",
    rl2: "",
    rl3: "",
    p1: "",
    p2: "",
    p3: "",
    p4: "",
    p5: "",
    p6: "",
    points_per_deal:"",
    discount_period_start: "",
    discount_period_end: "",
    meter_rental: "",
    sales_commission: "",
    
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some((value) => !value)) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const response = await fetch(`${config.BASE_URL}/api/supervisor/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      await response.json();
      toast.success("Product added successfully!");
      setFormData({
        provider_name: "",
        product_name: "",
        light_category: "",
        fixed_rate: "",
        rl1: "",
        rl2: "",
        rl3: "",
        p1: "",
        p2: "",
        p3: "",
        p4: "",
        p5: "",
        p6: "",
        discount_period_start: "",
        discount_period_end: "",
        meter_rental: "",
        sales_commission: "",
       
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="add-product-container mx-auto">
      <h1>Add Products</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="provider_name"
          placeholder="Provider Name"
          value={formData.provider_name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="product_name"
          placeholder="Product Name"
          value={formData.product_name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="light_category"
          placeholder="Light Category"
          value={formData.light_category}
          onChange={handleChange}
        />
        <input
          type="number"
          name="fixed_rate"
          placeholder="Fixed Rate"
          value={formData.fixed_rate}
          onChange={handleChange}
        />
        <input
          type="number"
          name="rl1"
          placeholder="RL1"
          value={formData.rl1}
          onChange={handleChange}
        />
        <input
          type="number"
          name="rl2"
          placeholder="RL2"
          value={formData.rl2}
          onChange={handleChange}
        />
        <input
          type="number"
          name="rl3"
          placeholder="RL3"
          value={formData.rl3}
          onChange={handleChange}
        />
        <input
          type="number"
          name="p1"
          placeholder="P1"
          value={formData.p1}
          onChange={handleChange}
        />
        <input
          type="number"
          name="p2"
          placeholder="P2"
          value={formData.p2}
          onChange={handleChange}
        />
        <input
          type="number"
          name="p3"
          placeholder="P3"
          value={formData.p3}
          onChange={handleChange}
        />
        <input
          type="number"
          name="p4"
          placeholder="P4"
          value={formData.p4}
          onChange={handleChange}
        />
        <input
          type="number"
          name="p5"
          placeholder="P5"
          value={formData.p5}
          onChange={handleChange}
        />
        <input
          type="number"
          name="p6"
          placeholder="P6"
          value={formData.p6}
          onChange={handleChange}
        />
        <input
          type="number"
          name="points_per_deal"
          placeholder="points_per_deal"
          value={formData.points_per_deal}
          onChange={handleChange}
        />
        <div className="date-container">
          <div className="date-field">
            <label>Discount Period Start</label>
            <input
              type="date"
              name="discount_period_start"
              value={formData.discount_period_start}
              onChange={handleChange}
            />
          </div>
          <div className="date-field">
            <label>Discount Period End</label>
            <input
              type="date"
              name="discount_period_end"
              value={formData.discount_period_end}
              onChange={handleChange}
            />
          </div>
        </div>
        <input
          type="number"
          name="meter_rental"
          placeholder="Meter Rental"
          value={formData.meter_rental}
          onChange={handleChange}
        />
        <input
          type="number"
          name="sales_commission"
          placeholder="Sales Commission"
          value={formData.sales_commission}
          onChange={handleChange}
        />
      </form>
      <button type="submit" onClick={handleSubmit}>
        Add Product
      </button>
    </div>
  );
};

export default AddProduct;
