import React, { useState } from 'react';
import './ForgetPassword.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useAuth();

  const handleRequestOtp = async () => {
    if (!email) {
      toast.error('Please enter your email!');
      return;
    }

    try {
      const response = await axios.post(
        'http://34.142.252.64:8080/api/forgot-password',
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setStep(2);
        toast.success(response.data.message || 'OTP has been sent to your email!');
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('OTP is required!');
      return;
    }

    try {
      const response = await axios.post(
        'http://34.142.252.64:8080/api/verify-otp',
        { email, otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setStep(3);
        toast.success(response.data.message || 'OTP verified successfully! Please reset your password.');
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post(
        'http://34.142.252.64:8080/api/resend-otp',
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message || 'New OTP has been sent to your email!');
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error('Password and confirm password are required!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post(
        'http://34.142.252.64:8080/api/reset-password',
        { email, otp, password }, // Changed from newPassword to password
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message || 'Password reset successfully! Please log in.');
        setTimeout(() => {
          setStep(1);
          setEmail('');
          setOtp('');
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="forget-password-page">
      <div className="forget-password-card">
        <h1>{step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}</h1>

        {step === 1 ? (
          <>
            <p className="step-description">
              Enter your email address below, and we'll send you an OTP to reset your password.
            </p>
            <div className="input-container">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
            <button onClick={handleRequestOtp} className="submit-button">
              Send OTP
            </button>
          </>
        ) : step === 2 ? (
          <>
            <p className="step-description">
              We've sent you an OTP. Please enter it below to verify your identity.
            </p>
            <div className="input-container">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field"
              />
            </div>
            <button onClick={handleVerifyOtp} className="submit-button">
              Verify OTP
            </button>
            <p className="resend-otp-link" onClick={handleResendOtp}>
              Resend OTP
            </p>
          </>
        ) : (
          <>
            <p className="step-description">
              Please set your new password and confirm it to complete the reset.
            </p>
            <div className="input-container">
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="input-container">
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </div>
            <button onClick={handleResetPassword} className="submit-button">
              Reset Password
            </button>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;