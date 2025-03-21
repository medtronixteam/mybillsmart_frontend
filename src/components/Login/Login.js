import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";
import config from "../../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, token, role } = useAuth(); // Add token and role from AuthContext
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    console.log("Token:", token); // Debug token
    console.log("Role:", role); // Debug role
    if (token && role) {
      const redirectUrl = localStorage.getItem("redirectUrl") || `/${role}/dashboard`;
      localStorage.removeItem("redirectUrl");
      navigate(redirectUrl);
    }
  }, [token, role, navigate]);

  // Check if there's an email in localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${config.BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("API Response:", data); // Debug API response

      if (response.ok) {
        login(data.token, data.user.role, data.user.id); // Update AuthContext

        localStorage.setItem("authToken", data.token);
        localStorage.setItem("role", data.user.role);

        if (rememberMe) {
          localStorage.setItem("email", email);
        } else {
          localStorage.removeItem("email");
        }

        console.log("AuthContext updated. Waiting for redirect..."); // Debug
      } else {
        setError(data.message || "Login failed!");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-login">
      <div className="sign-up">
        <h1 className="heading">Login</h1>

        {error && <p className="error-message">{error}</p>}

        <div className="text">
          <img
            src="https://i.postimg.cc/DZBPRgvC/email.png"
            alt="icon"
            height={12}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="text">
          <img
            src="https://i.postimg.cc/Nj5SDK4q/password.png"
            alt="icon"
            height={20}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="remember-me-container">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            id="rememberMe"
            disabled={loading}
          />
          <label htmlFor="rememberMe">Remember Me</label>
        </div>

        <button onClick={handleSubmit} type="submit" className="mt-3" disabled={loading}>
          {loading ? "Logging in..." : "LOGIN"}
        </button>

        <p className="conditions pt-3">
          If You Forgot Your Password / <a href="/forget-password">Forgot Password?</a>
        </p>
      </div>
      <div className="text-container">
        <h1>Glad to see you!</h1>
        <p>Welcome, please enter your details to log in</p>
      </div>
    </div>
  );
};

export default Login;