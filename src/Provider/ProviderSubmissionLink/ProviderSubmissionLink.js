import React, { useState } from 'react';
import { FaPaperPlane, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import "./ProviderSubmissionLink.css";

const ProviderSubmissionLink = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      console.log('Link sent to:', email);
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="submission-container">
      {!isSubmitted ? (
        <div className="submission-card">
          <div className="card-header">
            <FaEnvelope className="email-icon" />
            <h2>Send Submission Link</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="email-form">
            <div className="form-group">
              <label htmlFor="email">Recipient Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter recipient email"
                required
              />
            </div>
            
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <FaPaperPlane className="send-icon" />
                  Send Link
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="success-card">
          <div className="success-content">
            <FaCheckCircle className="success-icon" />
            <h2>Link Sent Successfully!</h2>
            <p>The submission link has been sent to <strong>{email}</strong></p>
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }} 
              className="back-btn"
            >
              Send Another Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSubmissionLink;