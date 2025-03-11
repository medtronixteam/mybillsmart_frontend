import React, { useState } from "react";
import "./ProviderProfileSetting.css";

const ProviderProfileSetting = () => {
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
        <div className="col-xl-6">
          {/* Name & Phone Number Card */}
          <div className="card profile-info-card h-100">
            <h3 className="profile-card-heading">Edit Your Profile Info</h3>
            <div className="">
              <label
                htmlFor="name"
                className="form-label profile-input-label "
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label
                htmlFor="city"
                className="form-label profile-input-label "
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter your city"
                value={formData.phone}
                onChange={handleChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label
                htmlFor="country"
                className="form-label profile-input-label "
              >
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Enter your Country"
                value={formData.phone}
                onChange={handleChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label
                htmlFor="address"
                className="form-label profile-input-label "
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter your Address"
                value={formData.phone}
                onChange={handleChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label
                htmlFor="postalCode"
                className="form-label profile-input-label "
              >
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                placeholder="Enter your Postal Code"
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
        <div className="col-xl-6">
          {/* Password Card */}
          <div className="card profile-password-card h-100">
            <h3 className="profile-card-heading">Update Your Password</h3>
            <div className="">
              <label
                htmlFor="password"
                className="form-label profile-input-label "
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label
                htmlFor="confirmPassword"
                className="form-label profile-input-label "
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
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

export default ProviderProfileSetting;
