import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../contexts/AuthContext";
import "./GroupAdminWhatsapp.css";
import Breadcrumbs from "../../Breadcrumbs";
import config from "../../config";
const GroupAdminWhatsapp = () => {
  const auth = useAuth();
  const email = auth.email || "";

  const API_BASE_URL = "https://waha.ai3dscanning.com";
  const DEFAULT_SESSION_NAME = email
    ? email
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase()
        .substring(0, 32)
    : "default";

  const [step, setStep] = useState(1); 
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
  const [sessionStatus, setSessionStatus] = useState("disconnected");
  const [currentSession, setCurrentSession] = useState(DEFAULT_SESSION_NAME);
    const { token } = useAuth();
  

  const statusCheckInterval = useRef(null);

  const sanitizeSessionName = (name) => {
    return name.replace(/[^a-zA-Z0-9-_]/g, "").substring(0, 32);
  };

const callWhatsappLink = async () => {
  try {
    await axios.post(`${config.BASE_URL}/api/whatsapp/link`, {
      session_name: sanitizeSessionName(currentSession),
    }, {
      headers: {
        Authorization: `Bearer ${auth.token}` 
      }
    });
    console.log("WhatsApp link API called successfully");
  } catch (err) {
    console.error("Error calling whatsapp/link API:", err);
  }
};

const callWhatsappUnlink = async () => {
  try {
    await axios.get(`${config.BASE_URL}/api/whatsapp/unlink`, {
     
      headers: {
        Authorization: `Bearer ${auth.token}` 
      }
    });
    console.log("WhatsApp unlink API called successfully");
  } catch (err) {
    console.error("Error calling whatsapp/unlink API:", err);
    // You can choose to show this error to user or just log it
  }
};

  // API: Create new session
  const createSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/sessions`, {
        name: sanitizeSessionName(currentSession),
      });
      await startSession();
    } catch (err) {
      if (err.response?.status === 409) {
        // Session already exists, just start it
        await startSession();
      } else {
        setError(err.response?.data?.message || "Failed to create session");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // API: Start session
  const startSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/sessions/${sanitizeSessionName(
          currentSession
        )}/start`
      );

      // Check initial status
      const status = await getSessionInfo();
      handleStatusResponse(status);

      // Start polling for status changes
      startStatusPolling();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start session");
      setIsLoading(false);
    }
  };

  // API: Get session info
  const getSessionInfo = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/sessions/${sanitizeSessionName(currentSession)}`
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return { status: "NOT_FOUND" };
      }
      throw err;
    }
  };

  // API: Stop session
  const stopSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(
        `${API_BASE_URL}/api/sessions/${sanitizeSessionName(
          currentSession
        )}/stop`
      );
      setStep(5); // Show stopped state
      setSessionStatus("stopped");
      clearInterval(statusCheckInterval.current);
      // Call unlink API when session is stopped
      await callWhatsappUnlink();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to stop session");
    } finally {
      setIsLoading(false);
    }
  };

  // API: Delete session
  const deleteSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(
        `${API_BASE_URL}/api/sessions/${sanitizeSessionName(currentSession)}`
      );
      setStep(1); // Reset to initial state
      setSessionStatus("disconnected");
      clearInterval(statusCheckInterval.current);
      // Call unlink API when session is deleted
      await callWhatsappUnlink();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete session");
    } finally {
      setIsLoading(false);
    }
  };

  // API: Get QR code
  const getQRCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/${sanitizeSessionName(currentSession)}/auth/qr`,
        { params: { ts: Date.now() }, responseType: "blob" } // Important for image data
      );

      // Create a URL for the blob image
      const imageUrl = URL.createObjectURL(response.data);
      setQrCode(imageUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get QR code");
      setQrCode("");
    } finally {
      setIsLoading(false);
    }
  };

  // API: Get profile info
  const getProfileInfo = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/sessions/${sanitizeSessionName(currentSession)}/me`
      );
      setProfileInfo(response.data);
      // Call link API when profile info is successfully fetched (meaning WhatsApp is connected)
      await callWhatsappLink();
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  // Handle status response
  const handleStatusResponse = (status) => {
    if (!status) return;

    switch (status.status) {
      case "WORKING":
        getProfileInfo();
        setSessionStatus("connected");
        setStep(4);
        clearInterval(statusCheckInterval.current);
        break;
      case "SCAN_QR_CODE":
        getQRCode();
        setSessionStatus("scanning");
        setStep(3);
        break;
      case "STOPPED":
      case "FAILED":
        setSessionStatus("stopped");
        setStep(5);
        // Call unlink API when session is stopped or failed
        callWhatsappUnlink();
        break;
      case "NOT_FOUND":
        setSessionStatus("not_found");
        setStep(2); // Need to create session
        break;
      default:
        break;
    }
  };

  // Start polling for status changes
  const startStatusPolling = () => {
    clearInterval(statusCheckInterval.current);
    statusCheckInterval.current = setInterval(async () => {
      try {
        const status = await getSessionInfo();
        handleStatusResponse(status);
      } catch (err) {
        console.error("Status polling error:", err);
      }
    }, 5000); // Check every 5 seconds
  };

  // Initial load - check session status
  useEffect(() => {
    const initialize = async () => {
      const status = await getSessionInfo();
      handleStatusResponse(status);
    };

    initialize();

    return () => {
      clearInterval(statusCheckInterval.current);
    };
  }, []);

  const renderQRCode = () => {
    if (!qrCode) return null;

    return (
      <div className="wai-qr-wrapper">
        <img src={qrCode} alt="WhatsApp QR Code" className="wai-qr-image" />
        <p className="wai-scan-instruction">Scan this code with WhatsApp</p>
      </div>
    );
  };

  // Loading state for auth
  if (!auth.initialized) {
    return <div className="wai-loading">Loading authentication...</div>;
  }

  // Auth check
  if (!auth.isAuthenticated) {
    return (
      <div className="wai-auth-required">
        Please login to access WhatsApp integration
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 container">
        <Breadcrumbs homePath={"/group_admin/dashboard"} />
      </div>
      <div className="wai-container">
        <div className="wai-main-panel">
          {/* Step 1: Initial state */}
          {step === 1 && (
            <div className="wai-connect-card">
              <div className="wai-card-header">
                <h2>WhatsApp Integration</h2>
                <div className="wai-whatsapp-icon">💬</div>
              </div>
              <p className="wai-card-description">
                Connect your WhatsApp Business account to get started
              </p>

              <div className="wai-session-info">
                <p>Session: {currentSession}</p>
                <p>Status: {sessionStatus}</p>
              </div>

              <div className="wai-action-buttons">
                <button
                  className="wai-primary-btn"
                  onClick={createSession}
                  disabled={isLoading}
                >
                  {isLoading ? "Initializing..." : "Connect WhatsApp"}
                </button>
              </div>

              {error && <div className="wai-error-message">{error}</div>}
            </div>
          )}

          {/* Step 2: Create Session */}
          {step === 2 && (
            <div className="wai-connect-card">
              <div className="wai-card-header">
                <h2 className="mb-0">Create New Session</h2>
                <div className="wai-whatsapp-icon">➕</div>
              </div>
              <p className="wai-card-description">
                You have not link Whatsapp please click at create session to
                link the Whatsapp. Scan the QR code then your whatsapp will be
                link.
              </p>

              <div className="wai-action-buttons">
                <button
                  className="wai-primary-btn"
                  onClick={createSession}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Session"}
                </button>
                <button
                  className="wai-secondary-btn"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>

              {error && <div className="wai-error-message">{error}</div>}
            </div>
          )}

          {/* Step 3: QR Code */}
          {step === 3 && (
            <div className="wai-qr-card">
              <div className="wai-card-header">
                <h2>Scan QR Code</h2>
                <div className="wai-qr-icon">📱</div>
              </div>
              <p className="wai-card-description">
                Open WhatsApp on your phone and scan this code
              </p>

              <div className="wai-qr-code-container">
                {isLoading ? (
                  <div className="wai-spinner-container">
                    <div className="wai-spinner"></div>
                    <p>Generating QR code...</p>
                  </div>
                ) : error ? (
                  <div className="wai-error-message">
                    {error}
                    <button className="wai-retry-btn" onClick={getQRCode}>
                      Retry
                    </button>
                  </div>
                ) : (
                  renderQRCode()
                )}
              </div>

              <div className="wai-status-indicator">
                Status:{" "}
                {sessionStatus === "connected"
                  ? "✅ Connected"
                  : "⌛ Waiting for scan..."}
              </div>

              <div className="wai-action-buttons">
                <button
                  className="wai-secondary-btn"
                  onClick={stopSession}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="wai-secondary-btn"
                  onClick={getQRCode}
                  disabled={isLoading}
                >
                  Refresh QR Code
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Connected */}
          {step === 4 && (
            <div className="wai-success-card">
              <div className="wai-card-header">
                <h2>Connected Successfully</h2>
                <div className="wai-success-icon">✅</div>
              </div>

              {profileInfo && (
                <div className="wai-profile-info">
                  <div className="wai-info-row">
                    <span>Session:</span>
                    <span>{currentSession}</span>
                  </div>
                  <div className="wai-info-row">
                    <span>Name:</span>
                    <span>{profileInfo.pushname || "Not available"}</span>
                  </div>
                  <div className="wai-info-row">
                    <span>Phone:</span>
                    <span>{profileInfo?.wid?.user || "Not available"}</span>
                  </div>
                </div>
              )}

              <div className="wai-status-indicator wai-connected">
                WhatsApp is connected and ready to use
              </div>

              <div className="wai-action-buttons">
                <button
                  className="wai-secondary-btn"
                  onClick={stopSession}
                  disabled={isLoading}
                >
                  Disconnect
                </button>
                <button
                  className="wai-danger-btn"
                  onClick={deleteSession}
                  disabled={isLoading}
                >
                  Delete Session
                </button>
              </div>

              {error && <div className="wai-error-message">{error}</div>}
            </div>
          )}

          {/* Step 5: Stopped */}
          {step === 5 && (
            <div className="wai-stopped-card">
              <div className="wai-card-header">
                <h2>Session Stopped</h2>
                <div className="wai-stopped-icon">⏹️</div>
              </div>

              <p className="wai-card-description">
                Your WhatsApp session has been stopped. You can start a new
                session whenever you're ready.
              </p>

              <div className="wai-action-buttons">
                <button
                  className="wai-danger-btn"
                  onClick={deleteSession}
                  disabled={isLoading}
                >
                  Delete Session
                </button>
              </div>

              {error && <div className="wai-error-message">{error}</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupAdminWhatsapp;