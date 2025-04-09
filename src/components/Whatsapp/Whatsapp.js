import React, { useState, useEffect } from 'react';
import "./Whatsapp.css";
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const WhatsappIntegration = () => {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [sessionStatus, setSessionStatus] = useState('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  // WAHA API configuration
  const API_BASE_URL = 'http://34.142.252.64:3000';
  const SESSION_NAME = 'default';

  // Handle session errors
  const handleSessionError = (err) => {
    if (err.response?.status === 422 && err.response.data.message.includes('already started')) {
      // Session is already started, proceed with connection
      startSessionStatusPolling();
    } else {
      setError(err.response?.data?.message || 'Failed to initialize WhatsApp session');
      console.error('WAHA API error:', err);
    }
  };

  // 1. First API call - Start or get session
  const startOrGetSession = async () => {
    try {
      // Try to get existing session first
      const response = await axios.get(`${API_BASE_URL}/api/sessions/${SESSION_NAME}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // Session doesn't exist, create new one
        const createResponse = await axios.post(`${API_BASE_URL}/api/sessions/start`, {
          name: SESSION_NAME,
          config: {
            proxy: null,
            webhooks: [],
            plugins: []
          }
        });
        return createResponse.data;
      }
      throw err;
    }
  };

  // 2. Second API call - Get session details
  const getSessionDetails = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/sessions/${SESSION_NAME}/me`);
    return response.data;
  };

  // 3. Third API call - Get QR code
  const getQRCode = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/${SESSION_NAME}/auth/qr`);
    return response.data.qr;
  };

  // 4. Fourth API call - Get profile info after connection
  const getProfileInfo = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/${SESSION_NAME}/profile`);
    return response.data;
  };

  // Start session
  const startSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/sessions/${SESSION_NAME}/start`);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Stop session
  const stopSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/sessions/${SESSION_NAME}/stop`);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Restart session
  const restartSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/sessions/${SESSION_NAME}/restart`);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize WhatsApp session
  const initWhatsAppSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Start or get session
      const sessionData = await startOrGetSession();
      setSessionInfo(sessionData);
      
      if (sessionData.status === 'WORKING') {
        // Already connected - skip to profile info
        const profile = await getProfileInfo();
        setProfileInfo(profile);
        setSessionStatus('connected');
        setStep(4);
      } else if (sessionData.status === 'SCAN_QR_CODE') {
        // Step 2: Get session details (optional, can skip if not needed)
        await getSessionDetails();
        
        // Step 3: Get QR code
        const qr = await getQRCode();
        setQrCode(qr);
        setStep(2);
        startSessionStatusPolling();
      } else if (sessionData.status === 'STOPPED') {
        // Session exists but stopped
        setStep(3); // Show session control panel
      }
    } catch (err) {
      handleSessionError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll session status
  const startSessionStatusPolling = () => {
    clearInterval(pollingInterval);

    const interval = setInterval(async () => {
      try {
        const statusRes = await axios.get(`${API_BASE_URL}/api/sessions/${SESSION_NAME}`);
        setSessionInfo(statusRes.data);
        
        if (statusRes.data.status === 'WORKING') {
          // Step 4: Get profile info
          const profile = await getProfileInfo();
          setProfileInfo(profile);
          setSessionStatus('connected');
          setStep(4);
          clearInterval(interval);
        } else if (statusRes.data.status === 'FAILED' || statusRes.data.status === 'STOPPED') {
          clearInterval(interval);
          setStep(3); // Show session control panel
        } else if (statusRes.data.status === 'SCAN_QR_CODE') {
          // Refresh QR code if needed
          const qr = await getQRCode();
          setQrCode(qr);
        }
      } catch (err) {
        console.error('Status check error:', err);
        clearInterval(interval);
      }
    }, 3000);

    setPollingInterval(interval);
  };

  // Handle start session
  const handleStartSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await startSession();
      
      // Wait 5-6 seconds before checking status
      await new Promise(resolve => setTimeout(resolve, 5500));
      
      const statusRes = await axios.get(`${API_BASE_URL}/api/sessions/${SESSION_NAME}`);
      setSessionInfo(statusRes.data);
      
      if (statusRes.data.status === 'SCAN_QR_CODE') {
        const qr = await getQRCode();
        setQrCode(qr);
        setStep(2);
        startSessionStatusPolling();
      } else if (statusRes.data.status === 'WORKING') {
        const profile = await getProfileInfo();
        setProfileInfo(profile);
        setSessionStatus('connected');
        setStep(4);
      } else {
        startSessionStatusPolling();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle stop session
  const handleStopSession = async () => {
    setIsLoading(true);
    try {
      await stopSession();
      setStep(3); // Show session control panel
      setSessionStatus('stopped');
      setProfileInfo(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to stop session');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle restart session
  const handleRestartSession = async () => {
    setIsLoading(true);
    try {
      await restartSession();
      await initWhatsAppSession(); // Refresh session status
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restart session');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect session
  const disconnectSession = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/sessions/${SESSION_NAME}`);
      setStep(1);
      setSessionStatus('disconnected');
      setProfileInfo(null);
      setSessionInfo(null);
      setError(null);
      clearInterval(pollingInterval);
    } catch (err) {
      setError('Failed to disconnect session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const sessionData = await startOrGetSession();
        setSessionInfo(sessionData);
        
        if (sessionData.status === 'WORKING') {
          const profile = await getProfileInfo();
          setProfileInfo(profile);
          setSessionStatus('connected');
          setStep(4);
        } else if (sessionData.status === 'STOPPED') {
          setStep(3); // Show session control panel
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    initialize();

    return () => clearInterval(pollingInterval);
  }, []);

  return (
    <div className="whatsapp-integration-container">
      {step === 1 && (
        <div 
          className={`waha-card ${isLoading ? 'disabled' : ''}`} 
          onClick={!isLoading ? initWhatsAppSession : null}
        >
          <h3>Link Your WhatsApp Business</h3>
          <p>Click to start the linking process</p>
          <div className="waha-icon">
            {isLoading ? <div className="spinner"></div> : '💬'}
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      {step === 2 && (
        <div className="qr-code-container">
          <h3>Scan WhatsApp QR Code</h3>
          <p>Open WhatsApp on your phone and scan this code</p>
          
          <div className="qr-code-wrapper">
            {qrCode ? (
              <QRCodeSVG 
                value={qrCode} 
                size={256}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="spinner"></div>
            )}
          </div>
          
          <div className="status-indicator">
            Status: {sessionStatus === 'connected' ? '✅ Connected' : '⌛ Connecting...'}
          </div>
          
          <button 
            className="session-control-btn stop"
            onClick={handleStopSession}
            disabled={isLoading}
          >
            {isLoading ? 'Stopping...' : 'Stop Session'}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      {step === 3 && (
        <div className="session-control-container">
          <h3>Session Control</h3>
          <p>Manage your WhatsApp session</p>
          
          <div className="session-info">
            {sessionInfo && (
              <>
                <p><strong>Session Name:</strong> {sessionInfo.name}</p>
                <p><strong>Status:</strong> {sessionInfo.status}</p>
                <p><strong>Platform:</strong> {sessionInfo.platform}</p>
              </>
            )}
          </div>
          
          <div className="session-control-buttons">
            <button 
              className="session-control-btn start"
              onClick={handleStartSession}
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Start Session'}
            </button>
            
            <button 
              className="session-control-btn restart"
              onClick={handleRestartSession}
              disabled={isLoading}
            >
              {isLoading ? 'Restarting...' : 'Restart Session'}
            </button>
            
            <button 
              className="session-control-btn disconnect"
              onClick={disconnectSession}
              disabled={isLoading}
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      )}

{step === 4 && (
  <div className="success-container">
    <div className="success-icon">✅</div>
    <h3>WhatsApp Business Connected!</h3>
    <p>Your WhatsApp is now successfully linked.</p>
    
    {profileInfo && (
      <div className="connection-details">
        <p><strong>Name:</strong> {profileInfo.pushname || 'Not available'}</p>
        <p><strong>Phone:</strong> {profileInfo?.wid?.user || 'Not available'}</p>
        <p><strong>Status:</strong> {profileInfo.status || 'Active'}</p>
      </div>
    )}
    
    <div className="session-control-buttons">
      <button 
        className="session-control-btn stop"
        onClick={handleStopSession}
        disabled={isLoading}
      >
        {isLoading ? 'Stopping...' : 'Stop Session'}
      </button>
      
      <button 
        className="session-control-btn restart"
        onClick={handleRestartSession}
        disabled={isLoading}
      >
        {isLoading ? 'Restarting...' : 'Restart Session'}
      </button>
      
      <button 
        className="disconnect-btn"
        onClick={disconnectSession}
        disabled={isLoading}
      >
        {isLoading ? 'Disconnecting...' : 'Disconnect'}
      </button>
    </div>
    
    {error && <div className="error-message">{error}</div>}
  </div>
)}
    </div>
  );
};

export default WhatsappIntegration;