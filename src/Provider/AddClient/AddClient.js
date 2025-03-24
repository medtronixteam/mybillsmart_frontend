import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddClient.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const AddUser = ({ onAddUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    city: "",
    postalCode: "",
    role: "agent", // Default role for the first API call
  });
  const { token } = useAuth(); // Get token from AuthContext

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      toast.error("All fields are required!");
      return;
    }

    try {
      // Extract only required fields for the first API call
      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role, // Role for the first API call (agent)
      };

      // First API call to register the user
      const registerResponse = await axios.post(
        "http://34.142.252.64:8080/api/register",
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Pass token in headers
          },
        }
      );

      // If the first API call is successful, show success message
      toast.success("User registered successfully!");

      // Prepare data for the second API call
      const supervisorData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "client", // Role for the second API call (client)
      };

    

      toast.success("User added as client successfully!");

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        country: "",
        city: "",
        postalCode: "",
        role: "agent", // Reset to default role
      });

      // Call the onAddUser prop if needed (optional)
      if (onAddUser) {
        onAddUser(formData);
      }
    } catch (error) {
      // Handle API errors
      console.error("Error:", error);
      toast.error("Failed to process. Please try again.");
    }
  };

  return (
    <div className="add-user-container">
      <h1>Add Client</h1>
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
        <button type="submit" className="w-100">
          Add Client
        </button>
      </form>
    </div>
  );
};

export default AddUser;