import React, { useState } from "react";
import Swal from "sweetalert2";
import "./AddUser.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import config from "../../config";

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
    address: ""
  });
  const { token } = useAuth();

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
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'All fields are required!',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
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
        `${config.BASE_URL}/api/group/user`,
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success message with API response if available
      const successMessage = response.data?.message || 'User added successfully!';
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: successMessage,
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
      });

      // Reset the form
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        country: "",
        city: "",
        postalCode: "",
        role: "agent",
        address: ""
      });

      if (onAddUser) {
        onAddUser(formData);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      
      // Extract error message from API response or use default error message
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Failed to add user';
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMessage,
        confirmButtonText: 'OK'
      }); 
    }
  };

  return (
    <div className="add-user-container">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-column flex-sm-row">
        <h2 className="mb-0">Add User</h2>
        <Link to="/group_admin/user-list">
          <button className="w-100 fs-6 rounded px-3 py-2 btn bg-white">
            Users List
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
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
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
       
      </form>
      <button type="submit" onClick={handleSubmit}>
          Add User
        </button>
    </div>
  );
};

export default AddUser;