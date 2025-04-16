import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddUser.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const AddUser = ({ onAddUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    city: "",
    postalCode: "",
    role: "agent", // Default role
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
      // Extract only required fields for API
      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
        city: formData.city,
        postal_code: formData.postalCode,
      };

      const response = await axios.post(
        "http://34.142.252.64:8080/api/group/user",
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Pass token in headers
          },
        }
      );

      // If the API call is successful, show success message
      toast.success("User added successfully!");

      // Reset the form
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        country: "",
        city: "",
        postalCode: "",
        role: "agent", // Reset to default role
        address: "",
      });

      // Call the onAddUser prop if needed (optional)
      if (onAddUser) {
        onAddUser(formData);
      }
    } catch (error) {
      // Handle API errors
      console.error("Error adding user:", error);
      toast.error("Failed to add user. Please try again.");
    }
  };

  return (
    <div className="add-user-container">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-column flex-sm-row">
        <h2 className="mb-0">Add User</h2>
        <Link to="/group_admin/user-list">
          <button className=" w-100 fs-6 rounded px-3 py-2 btn bg-white">
            View User List
          </button>
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

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="agent">Sale Agent</option>
          <option value="supervisor">Supervisor</option>
          <option value="client">Clients</option>
        </select>
        {/* <textarea
          name="address"
          placeholder="Please enter address"
          value={formData.address}
          onChange={handleChange}
          required
        /> */}
        <button
          type="submit"
          // className="btn bg-white p-3 w-50 mx-auto rounded-pill d-block"
        >
          Add User
        </button>
      </form>
    </div>
  );
};

export default AddUser;
