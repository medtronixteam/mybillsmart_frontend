import React, { useState } from "react";
import "./GroupAdminProfileSetting.css";
import { useAuth } from "../../contexts/AuthContext";

const GroupAdminProfileSetting = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    city: "",
    country: "",
    address: "",
    postalCode: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "", // Add current password field
    newPassword: "", // Rename password to newPassword
    confirmPassword: "",
  });

  const { token } = useAuth();

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    console.log("Profile Data Submitted:", profileData);
    alert("Profile Info Updated Successfully!");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Check if new password and confirm password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }

    try {
      // Make API call to update password
      const response = await fetch("http://34.142.252.64:8080/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword, // Include current password
          newPassword: passwordData.newPassword, // Include new password
          confirmPassword: passwordData.confirmPassword, // Include confirm password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Password updated successfully!");
        console.log("Password updated:", result);
      } else {
        alert(`Failed to update password: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="profile-edit-container container mt-3">
      <div className="profile-form row">
        {/* Profile Info Card */}
        <div className="col-xl-6">
          <form onSubmit={handleProfileSubmit} className="card profile-info-card h-100">
            <h3 className="profile-card-heading">Edit Your Profile Info</h3>
            <div className="">
              <label htmlFor="name" className="form-label profile-input-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label htmlFor="city" className="form-label profile-input-label">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter your city"
                value={profileData.city}
                onChange={handleProfileChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label htmlFor="country" className="form-label profile-input-label">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Enter your Country"
                value={profileData.country}
                onChange={handleProfileChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label htmlFor="address" className="form-label profile-input-label">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter your Address"
                value={profileData.address}
                onChange={handleProfileChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label htmlFor="postalCode" className="form-label profile-input-label">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                placeholder="Enter your Postal Code"
                value={profileData.postalCode}
                onChange={handleProfileChange}
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
          </form>
        </div>

        {/* Password Card */}
        <div className="col-xl-6">
          <form onSubmit={handlePasswordSubmit} className="card profile-password-card h-100">
            <h3 className="profile-card-heading">Update Your Password</h3>
            <div className="">
              <label htmlFor="currentPassword" className="form-label profile-input-label">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                placeholder="Enter your current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label htmlFor="newPassword" className="form-label profile-input-label">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="Enter your new password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label htmlFor="confirmPassword" className="form-label profile-input-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupAdminProfileSetting;