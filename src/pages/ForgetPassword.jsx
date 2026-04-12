import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import techBackground from "../assets/background4.jpg";
import logo from "../assets/logo.png";
import { authService } from "../api/services";
import "./login.css";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authService.forgotPassword({ email });
      
      // Simple check for success from mock or real API
      if (response && (response.data?.status === "success" || response.status === 200)) {
        setMessage("✅ Reset code sent! Check your email.");
        setTimeout(() => {
          navigate("/verify-code", { state: { email } });
        }, 2000);
      } else {
        setError("Failed to send code. Please verify your email and try again.");
      }
    } catch (err) {
      // Improved error handling for 500 and other errors
      const serverMsg = err.response?.data?.message;
      const statusCode = err.response?.status;

      if (statusCode === 500) {
        setError("❌ Server Error (500). We're working on it! Please try again in a moment.");
      } else if (serverMsg) {
        setError(`❌ ${serverMsg}`);
      } else {
        setError("❌ Connection error. Please check your internet or try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={techBackground} className="tech-bg" alt="background" />
      <img src={logo} className="brand-logo" alt="logo" />

      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your email to receive a reset code</p>

        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <label>EMAIL</label>
            <div className="field-wrapper">
              <Mail className="icon-left" size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="glow-icon-right">
                <Mail size={14} />
              </div>
            </div>
          </div>

          <div className="form-footer">
            <Link to="/">← Back to Login</Link>
            <Link to="/signup">Create Account</Link>
          </div>

          <button
            type="submit"
            className="submit-btn reset-btn"
            disabled={loading}
          >
            {loading ? "Sending..." : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;