
import React, { useState } from "react";
import "./Agrement.css";
import axios from "axios";
import config from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import Breadcrumbs from "../../Breadcrumbs";
import { useNavigate } from "react-router-dom";

const Agrement = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in both title and description fields",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${config.BASE_URL}/api/group/agreements`,
        {
          title: formData.title,
          description: formData.description,
          status: "private", // Sending status as private
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
     if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("role");
          navigate("/login");
          return;
          }

      if (response.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Agreement created successfully!",
          confirmButtonColor: "#3085d6",
          timer: 2000,
        });
        // Reset form after successful submission
        setFormData({
          title: "",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error creating agreement:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to create agreement",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-4 container">
        <Breadcrumbs homePath={"/group_admin/dashboard"} />
      </div>
      <div className="agreement-container">
        <h2>Create New Agreement</h2>
        <form onSubmit={handleSubmit} className="agreement-form">
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter agreement title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter agreement description"
              rows="5"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Create Agreement"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Agrement;
