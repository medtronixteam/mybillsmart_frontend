import React, { useState } from "react";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaEnvelope,
  FaCopy,
} from "react-icons/fa";
import "./ProviderSubmissionLink.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

const ProviderSubmissionLink = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copyStatus, setCopyStatus] = useState();
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${config.BASE_URL}/api/generate-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate link");
      }

      const data = await response.json();
      setGeneratedLink(data.url);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus(), 2000);
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

            <button type="submit" disabled={isLoading} className="submit-btn text-white">
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
            <p>
              The submission link has been sent to <strong>{email}</strong>
            </p>

            <div className="generated-link-container">
              {/* <p className="link-label">Generated Link:</p> */}
              <div className="link-box">
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="generated-link"
                >
                  {generatedLink}
                </a>
                <button onClick={copyToClipboard} className="copy-btn">
                  <FaCopy className="copy-icon" />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
                setGeneratedLink("");
              }}
              className="back-btn mt-3"
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
