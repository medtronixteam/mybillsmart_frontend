import React, { useState } from "react";
import "./GroupAdminProfileSetting.css";

const GroupAdminProfileSetting = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("Profile Updated Successfully!");
  };

  return (
    <div className="profile-edit-container container mt-3">
      <form onSubmit={handleSubmit} className="profile-form row">
        <div className="col-lg-6">
          {/* Name & Phone Number Card */}
          <div className="card profile-info-card">
            <h3 className="profile-card-heading">Edit Your Profile Info</h3>
            <div className="mb-3">
              <label htmlFor="name" className="form-label profile-input-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label profile-input-label">
                Phone Number
              </label>
              <input
                type="number"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary profile-submit-btn"
              >
                Update Profile Info
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          {/* Password Card */}
          <div className="card profile-password-card">
            <h3 className="profile-card-heading">Update Your Password</h3>
            <div className="mb-3">
              <label
                htmlFor="password"
                className="form-label profile-input-label"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="confirmPassword"
                className="form-label profile-input-label"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary profile-submit-btn"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GroupAdminProfileSetting;
