import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Signup.css"; 
import config from "../../config";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [role, setRole] = useState("agent"); // Set default role to 'agent'
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [referralId, setReferralId] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralId(ref);
    }
  }, [searchParams]);

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setCity(cityName);

    const postalCodeMap = {
      "New York": "10001",
      "Los Angeles": "90001",
      Chicago: "60601",
      London: "E1 6AN",
      Paris: "75001",
    };

    if (postalCodeMap[cityName]) {
      setPostalCode(postalCodeMap[cityName]);
    } else {
      setPostalCode("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!postalCode || postalCode.trim() === "") {
      setError("Postal code is required!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("country", country);
    formData.append("city", city);
    formData.append("postal_code", postalCode);
    
    if (referralId) {
      formData.append("referal_code", referralId);
    }

    try {
      const response = await fetch(`${config.BASE_URL}/api/signup`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        setError(responseData.message || "Signup failed!");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <h2 id="welcome">Welcome!</h2>
        <p>Join our community and start your journey with us.</p>
      </div>
      <div className="auth-main">
        <div className="auth-form">
          <div className="form-header">
            <h1>Sign Up</h1>
            {error && <div className="error-message">{error}</div>}
          </div>
          <form onSubmit={handleSubmit} className="row">
            <div className="mb-3 col-md-6">
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="mb-3 col-md-6">
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-3 col-md-6">
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="mb-3 col-md-6">
              <input
                type="password"
                className="form-control"
                id="repeatPassword"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Repeat your password"
                required
              />
            </div>
            <div className="mb-3 col-md-6">
              <input
                type="number"
                className="form-control"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone"
                required
              />
            </div>
            <div className="mb-3 col-md-6">
              <input
                type="text"
                className="form-control"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                required
              />
            </div>
            <div className="mb-3 col-md-6">
              <input
                type="text"
                className="form-control"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter your country"
                required
              />
            </div>
            <div className="mb-3 col-md-6">
              <input
                type="text"
                className="form-control"
                id="city"
                value={city}
                onChange={handleCityChange}
                placeholder="Enter your city"
                required
              />
            </div>
            <div className="mb-3 col-md-6">
              <input
                type="text"
                className="form-control"
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter your postal code"
                required
              />
            </div>
            {/* Hidden role field since it's always 'agent' */}
            <input type="hidden" value={role} />
            
            <button type="submit" className="submit-btn">
              Sign Up
            </button>
            <div className="switch-form">
              Already have an account?{" "}
              <a href="/login">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;