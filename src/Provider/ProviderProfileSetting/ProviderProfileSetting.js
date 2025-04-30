import React, { useState, useEffect } from "react";
import "./ProviderProfileSetting.css";
import { useAuth } from "../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../../config";
import Breadcrumbs from "../../Breadcrumbs";
const ProviderProfileSetting = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    city: "",
    country: "",
    address: "",
    postalCode: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [twoFA, setTwoFA] = useState({
    code: "",
    loading: false,
    showConfirmation: false,
    showOTPInput: false,
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const { token, is2FAEnabled, update2FAStatus } = useAuth();

  useEffect(() => {}, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handle2FAChange = (e) => {
    const { name, value } = e.target;
    setTwoFA({ ...twoFA, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (
      !profileData.name ||
      !profileData.city ||
      !profileData.country ||
      !profileData.address ||
      !profileData.postalCode
    ) {
      toast.error("Please fill all the fields!");
      return;
    }

    setLoadingProfile(true);
    try {
      const transformedProfileData = {
        ...profileData,
        postal_code: profileData.postalCode,
      };

      const response = await fetch(`${config.BASE_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transformedProfileData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(
          `Failed to update profile: ${result.message || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    if (!passwordData.current_password) {
      toast.error("Please enter your current password!");
      return;
    }

    setLoadingPassword(true);
    try {
      const response = await fetch(`${config.BASE_URL}/api/change-password`, {
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
        toast.success("Password updated successfully!");
      } else {
        toast.error(
          `Failed to update password: ${result.message || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    setTwoFA((prev) => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${config.BASE_URL}/api/2fa/enable`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(
          "OTP sent to your email. Please check and enter the code."
        );
        setTwoFA((prev) => ({
          ...prev,
          loading: false,
          showOTPInput: true,
        }));
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.message || "Failed to enable 2FA");
      setTwoFA((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFA.code) {
      toast.error("Please enter the verification code");
      return;
    }

    setTwoFA((prev) => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${config.BASE_URL}/api/2fa/verify/code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ two_factor_code: twoFA.code }),
      });

      if (response.ok) {
        update2FAStatus(true);
        setTwoFA((prev) => ({
          ...prev,
          code: "",
          loading: false,
          showOTPInput: false,
        }));
        toast.success("2FA enabled successfully!");
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      toast.error("Invalid code. Please try again.");
      setTwoFA((prev) => ({ ...prev, loading: false }));
    }
  };

  // Show disable confirmation dialog
  const showDisableConfirmation = () => {
    setTwoFA((prev) => ({ ...prev, showConfirmation: true }));
  };

  // Cancel disable confirmation
  const cancelDisableConfirmation = () => {
    setTwoFA((prev) => ({ ...prev, showConfirmation: false }));
  };

  // Disable 2FA after confirmation
  const handleDisable2FA = async () => {
    setTwoFA((prev) => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${config.BASE_URL}/api/2fa/disable`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        update2FAStatus(false);
        setTwoFA((prev) => ({
          ...prev,
          code: "",
          loading: false,
          showConfirmation: false,
        }));
        toast.success("2FA disabled successfully!");
      } else {
        throw new Error("Failed to disable");
      }
    } catch (error) {
      toast.error("Failed to disable 2FA");
      setTwoFA((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="profile-edit-container container mt-3">
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
      <Breadcrumbs homePath={"/supervisor/dashboard"} />

      <div className="profile-form row">
        {/* Profile Info Card */}
        <div className="col-xl-6">
          <form
            onSubmit={handleProfileSubmit}
            className="profile-info-card h-100 p-5 bg-transparent"
          >
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
              <label
                htmlFor="country"
                className="form-label profile-input-label"
              >
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
              <label
                htmlFor="address"
                className="form-label profile-input-label"
              >
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
              <label
                htmlFor="postalCode"
                className="form-label profile-input-label"
              >
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
          <form
            onSubmit={handlePasswordSubmit}
            className=" profile-password-card h-100 p-5 bg-transparent"
          >
            <h3 className="profile-card-heading">Update Your Password</h3>
            <div className="">
              <label
                htmlFor="current_password"
                className="form-label profile-input-label"
              >
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
              <label
                htmlFor="new_password"
                className="form-label profile-input-label"
              >
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
              <label
                htmlFor="confirm_password"
                className="form-label profile-input-label"
              >
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

        {/* 2FA Card */}
        <div className="col-12 mt-4">
          <div className=" profile-2fa-card shadow-none bg-transparent py-5">
            <h3 className="profile-card-heading">
              Two-Factor Authentication (2FA)
            </h3>

            {is2FAEnabled ? (
              <div className="text-center">
                {twoFA.showConfirmation ? (
                  <div className="confirmation-dialog">
                    <p className="text-white">
                      Are you sure you want to disable 2FA? This will reduce
                      your account security.
                    </p>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <button
                        onClick={handleDisable2FA}
                        className="btn btn-danger"
                        disabled={twoFA.loading}
                      >
                        {twoFA.loading ? "Processing..." : "Yes, Disable"}
                      </button>
                      <button
                        onClick={cancelDisableConfirmation}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-white">✓ 2FA is currently enabled</p>
                    <button
                      onClick={showDisableConfirmation}
                      className="btn btn-danger"
                      disabled={twoFA.loading}
                    >
                      Disable 2FA
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center">
                {twoFA.showOTPInput ? (
                  <>
                    <div className="mb-3">
                      <p className="text-white">
                        Enter the 6-digit code sent to your email:
                      </p>
                      <input
                        type="text"
                        name="code"
                        value={twoFA.code}
                        onChange={handle2FAChange}
                        placeholder="123456"
                        className="form-control text-center"
                        style={{ maxWidth: "200px", margin: "0 auto" }}
                        autoFocus
                      />
                    </div>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        onClick={handleVerify2FA}
                        className="btn btn-success"
                        disabled={twoFA.loading}
                      >
                        {twoFA.loading ? "Verifying..." : "Verify & Enable"}
                      </button>
                      <button
                        onClick={() =>
                          setTwoFA((prev) => ({
                            ...prev,
                            code: "",
                            showOTPInput: false,
                          }))
                        }
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-white">
                      Add an extra layer of security to your account
                    </p>
                    <button
                      onClick={handleEnable2FA}
                      className="btn btn-primary"
                      disabled={twoFA.loading}
                    >
                      {twoFA.loading ? "Sending OTP..." : "Enable 2FA"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileSetting;
