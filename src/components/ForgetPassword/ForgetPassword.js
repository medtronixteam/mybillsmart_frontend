import React, { useState } from 'react';
import './ForgetPassword.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Track the current step (1: Email, 2: OTP, 3: Reset Password)
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = () => {
    if (!email) {
      setError('Please enter your email!');
    } else {
      setError('');
      setStep(2);
      toast.success('OTP has been sent to your email!');
    }
  };

  const handleVerifyOtp = () => {
    if (!otp) {
      setError('OTP is required!');
    } else {
      setError('');
      setStep(3);
      toast.success('OTP verified successfully! Please reset your password.');
    }
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      setError('New password and confirm password are required!');
    } else if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
    } else {
      setError('');
      toast.success('Password reset successfully! Please log in.');
      setTimeout(() => {
        setStep(1); // Reset to step 1 after successful password reset
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    }
  };

  return (
    <div className="forget-password-page">
      <div className="forget-password-card">
        <h1>{step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}</h1>

        {error && <p className="error-message">{error}</p>}

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

            <p className="resend-otp-link" onClick={() => setStep(1)}>
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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

      <ToastContainer /> {/* ToastContainer for notifications */}
    </div>
  );
};

export default ForgotPassword;
