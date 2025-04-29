import React, { useState } from "react";
import Swal from "sweetalert2";
// import "./AddUser.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../Breadcrumbs";

const UserAddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    city: "",
    postalCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonColor: "#3085d6",
    });
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: message,
      confirmButtonColor: "#3085d6",
      timer: 1500,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.country ||
      !formData.city ||
      !formData.postalCode
    ) {
      showErrorAlert("All fields are required!");
      setIsSubmitting(false);
      return;
    }

    // Show loading alert
    const loadingAlert = Swal.fire({
      title: "Adding Client",
      html: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        postalCode: formData.postalCode,
        role: "client",
      };

      const response = await axios.post(
        `${config.BASE_URL}/api/agent/user`,
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadingAlert.close();
      showSuccessAlert("Client added successfully!");

      // Reset the form
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        country: "",
        city: "",
        postalCode: "",
      });
    } catch (error) {
      loadingAlert.close();
      console.error("Error adding client:", error);
      showErrorAlert(
        error.response?.data?.message ||
          "Failed to add client. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mt-4 container">
        <Breadcrumbs homePath={"/user/dashboard"} />
      </div>
      <div className="add-user-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="mb-0">Add User</h1>
          <Link to="/user/user-list">
            <button className="btn btn-primary w-100 fs-6">User List</button>
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="postalCode"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
            required
          />
        </form>
        <button type="submit" disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "Adding Client..." : "Add Client"}
        </button>
      </div>
    </>
  );
};

export default UserAddUser;
