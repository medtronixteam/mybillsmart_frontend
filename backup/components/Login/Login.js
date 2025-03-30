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
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check for saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
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

      if (!response.ok) {
        throw new Error(data.message || "Login failed!");
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("email", email);
      } else {
        localStorage.removeItem("email");
      }

      // Update auth context and store tokens
      login(data.token, data.user.role, data.user.id);

      // Immediate navigation
      const redirectUrl = localStorage.getItem("redirectUrl") || `/${data.user.role}/dashboard`;
      localStorage.removeItem("redirectUrl");
      navigate(redirectUrl);

    } catch (err) {
      setError(err.message || "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const role = localStorage.getItem("role");
      navigate(`/${role}/dashboard`);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container-login">
      <div className="sign-up">
        <h1 className="heading">Login</h1>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
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
              required
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
              required
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

          <button type="submit" className="mt-3" disabled={loading}>
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

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