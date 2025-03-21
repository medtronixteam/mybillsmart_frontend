import React, { useState } from "react";
import "./ProfileSetting.css";
import { useAuth } from "../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast CSS

const ProfileEdit = () => {
  // State for profile data
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    city: "",
    country: "",
    address: "",
    postalCode: "",
  });

  // State for password data
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Get token from AuthContext
  const { token } = useAuth();

  // Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Validate profile fields
    if (
      !profileData.name ||
      !profileData.city ||
      !profileData.country ||
      !profileData.address ||
      !profileData.postalCode
    ) {
      toast.error("Please fill all the fields!"); // Replace alert with toast
      return;
    }

    setLoadingProfile(true);

    try {
      const transformedProfileData = {
        ...profileData,
        postal_code: profileData.postalCode,
      };

      const response = await fetch("http://34.142.252.64:8080/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transformedProfileData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully!"); // Replace alert with toast
        console.log("Profile updated:", result);
      } else {
        toast.error(`Failed to update profile: ${result.message || "Unknown error"}`); // Replace alert with toast
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again."); // Replace alert with toast
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Check if new password and confirm password match
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New password and confirm password do not match!"); // Replace alert with toast
      return;
    }

    // Check if current password is provided
    if (!passwordData.current_password) {
      toast.error("Please enter your current password!"); // Replace alert with toast
      return;
    }

    setLoadingPassword(true);

    try {
      const response = await fetch("http://34.142.252.64:8080/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          confirm_password: passwordData.confirm_password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Password updated successfully!"); // Replace alert with toast
        console.log("Password updated:", result);
      } else {
        toast.error(`Failed to update password: ${result.message || "Unknown error"}`); // Replace alert with toast
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password. Please try again."); // Replace alert with toast
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="profile-edit-container container mt-3">
      {/* Add ToastContainer to display toasts */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

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
                type="number"
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
                disabled={loadingProfile}
              >
                {loadingProfile ? "Updating..." : "Update Profile Info"}
              </button>
            </div>
          </form>
        </div>

        {/* Password Card */}
        <div className="col-xl-6">
          <form onSubmit={handlePasswordSubmit} className="card profile-password-card h-100">
            <h3 className="profile-card-heading">Update Your Password</h3>
            <div className="">
              <label htmlFor="current_password" className="form-label profile-input-label">
                Current Password
              </label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                placeholder="Enter your current password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label htmlFor="new_password" className="form-label profile-input-label">
                New Password
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                placeholder="Enter your new password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="">
              <label htmlFor="confirm_password" className="form-label profile-input-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                placeholder="Confirm your new password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                className="form-control profile-input-field"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary profile-submit-btn"
                disabled={loadingPassword}
              >
                {loadingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;