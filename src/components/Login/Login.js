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
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
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

      // Check if 2FA is required
      if (data.status === "2fa") {
        setSuccess("Code has been sent to your email for verification.");
        setShow2FA(true);
      } else {
        // Handle regular login
        if (!data?.user) {
          throw new Error("Invalid user data received from server");
        }
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
      const response = await fetch(`${config.BASE_URL}/api/2fa/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          two_factor_code: twoFACode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "2FA verification failed!");
      }

      if (!data?.user) {
        throw new Error("Invalid user data received from server");
      }

      completeLogin({
        token: data.token,
        user: data.user
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
      user.twoFA_enable === 1,
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
          </div>
        )}

        {success && (
          <div className="alert success">
            <span>{success}</span>
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
            <div className="text password-input-container">
              <img
                src="https://i.postimg.cc/Nj5SDK4q/password.png"
                alt="icon"
                height={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <span 
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709z"/>
                    <path fillRule="evenodd" d="M13.646 14.354l-12-12 .708-.708 12 12-.708.708z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                )}
              </span>
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

            <button type="submit" className="login-btn w-100" disabled={loading}>
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

            <button type="submit" className="login-btn w-100 mt-2" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Verify Code"}
            </button>

            <button
              type="button"
              className="btn btn-secondary mt-2 w-100"
              onClick={() => {
                setShow2FA(false);
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