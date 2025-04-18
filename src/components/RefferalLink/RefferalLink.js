import React, { useState } from "react";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaEnvelope,
  FaCopy,
} from "react-icons/fa";
import "./RefferalLink.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

const RefferalLink = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${config.BASE_URL}/api/agent/referral-url`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate referral link");
      }

      const data = await response.json();
      setGeneratedLink(data.referral_url);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;

    navigator.clipboard.writeText(generatedLink);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus(""), 2000);
  };

  return (
    <div className="submission-container">
      {!isSubmitted ? (
        <div className="submission-card">
          <div className="card-header">
            <FaEnvelope className="email-icon" />
            <h2>Get Referral Link</h2>
            <p>
              Click the button below to generate your unique referral link.
              Share this link with others to invite them to join.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="submit-btn text-white"
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <FaPaperPlane className="send-icon" />
                Generate Link
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="success-card">
          <div className="success-content">
            <FaCheckCircle className="success-icon" />
            <h2>Link Generated Successfully!</h2>
            <p>Your unique referral link is ready to share:</p>

            <div className="generated-link-container">
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
                  {copyStatus && (
                    <span className="copy-status">{copyStatus}</span>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setGeneratedLink("");
              }}
              className="back-btn mt-3"
            >
              Generate New Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefferalLink;
