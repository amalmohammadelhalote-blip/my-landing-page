import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService, homeService } from "../api/services";
import techBackground from "../assets/background3.jpg";
import roboticHand from "../assets/hand.png";
import logo from "../assets/logo.png";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const extractToken = (payload) => {
    return (
      payload?.token ||
      payload?.accessToken ||
      payload?.data?.token ||
      payload?.data?.accessToken ||
      payload?.user?.token ||
      payload?.result?.token
    );
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Password is required.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await authService.login({ email, password });
      const token = extractToken(response?.data);

      if (!token) {
        setError("⛔ You are not authorized to access this dashboard.");
        return;
      }

      // Temporarily set token to verify dashboard access
      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);

      // Verify the user actually has access to the dashboard
      try {
        await homeService.getDashboard();
        // Access confirmed — proceed to dashboard
        navigate("/dashboard");
      } catch (verifyErr) {
        // Access denied — clear token and show error
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        setError("⛔ You are not authorized to access this dashboard.");
      }

    } catch (err) {
      console.log(err);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;

      if (status === 401 || status === 403) {
        setError("⛔ You are not authorized to access this dashboard.");
      } else if (serverMsg) {
        setError(serverMsg);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={techBackground} className="tech-bg" alt="background" />
      <img src={roboticHand} className="robotic-hand" alt="robot hand" />

      <button className="back-to-home" onClick={() => navigate("/")} aria-label="Back to home">
        <ArrowLeft size={22} />
      </button>

      <div className="auth-card">
        <img src={logo} className="brand-logo-inner" alt="logo" />
        <h2>Sign In</h2>
        <p>Streamline your industrial monitoring in real time.</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-box">
            <label>EMAIL</label>
            <div className="field-wrapper">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
              />
              <Mail className="icon-right" size={18} />
            </div>
          </div>

          <div className="input-box">
            <label>PASSWORD</label>
            <div className="field-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
              />
              <button
                type="button"
                className="toggle-pass-btn"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-footer">
            <a href="/forget-password">Forgot Password?</a>
            <a href="/signup">Create Account ›</a>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;