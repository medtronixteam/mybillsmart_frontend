import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";
import config from "../../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [tempToken, setTempToken] = useState(null);
  const [tempUserData, setTempUserData] = useState(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (!email || !password) {
      setError("Email and password are required!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

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

      if (!data?.user) {
        throw new Error("Invalid user data received from server");
      }

      setTempUserData(data.user);

      if (data.user.google2fa_secret) {
        setTempToken(data.token);
        setShow2FA(true);
        setSuccess("Please enter your 2FA code");
      } else {
        completeLogin({
          token: data.token,
          user: data.user
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    
    if (!twoFACode) {
      setError("Please enter your 2FA code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${config.BASE_URL}/api/auth/verify-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ code: twoFACode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "2FA verification failed!");
      }

      completeLogin({
        token: tempToken,
        user: tempUserData
      });
    } catch (err) {
      setError(err.message || "Invalid 2FA code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data) => {
    if (!data?.token || !data?.user) {
      setError("Invalid login data received");
      return;
    }

    const { token, user } = data;
    const role = user.role || "user";

    if (rememberMe) {
      localStorage.setItem("email", email);
    } else {
      localStorage.removeItem("email");
    }

    login(
      token,
      role,
      user.id,
      user.group_id,
      user.name,
      user.email,
      !!user.google2fa_secret,
      user.subscription_id,
      user.growth_subscription_id,
      user.plan_name
    );
    
    setSuccess("Login successful! Redirecting...");
    
    setTimeout(() => {
      const redirectUrl = localStorage.getItem("redirectUrl") || `/${role}/dashboard`;
      localStorage.removeItem("redirectUrl");
      navigate(redirectUrl);
    }, 1000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const role = localStorage.getItem("role") || "user";
      navigate(`/${role}/dashboard`);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container-login">
      <div className="sign-up">
        <h1 className="heading">Login</h1>

        {error && (
          <div className="alert error">
            <span>{error}</span>
            <button onClick={() => setError("")} className="close-btn">
              &times;
            </button>
          </div>
        )}

        {success && (
          <div className="alert success">
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="close-btn">
              &times;
            </button>
          </div>
        )}

        {!show2FA ? (
          <form onSubmit={handleLoginSubmit}>
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : "LOGIN"}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit}>
            <div className="text">
              <img
                src="https://i.postimg.cc/Nj5SDK4q/password.png"
                alt="icon"
                height={20}
              />
              <input
                type="text"
                placeholder="Enter 2FA Code"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Verify Code"}
            </button>

            <button
              type="button"
              className="btn btn-secondary mt-2"
              onClick={() => {
                setShow2FA(false);
                setTempToken(null);
                setTwoFACode("");
              }}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        )}

        {!show2FA && (
          <p className="conditions pt-3">
            If You Forgot Your Password / <a href="/forget-password">Forgot Password?</a>
          </p>
        )}
      </div>
      <div className="text-container">
        <h1>Glad to see you!</h1>
        <p>Welcome, please enter your details to log in</p>
      </div>
    </div>
  );
};

export default Login;