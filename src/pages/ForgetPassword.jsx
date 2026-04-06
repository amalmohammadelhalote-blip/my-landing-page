import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import techBackground from "../assets/background4.jpg";
import logo from "../assets/logo.png";
import "./login.css";
import axios from "axios";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 1. الـ baseURL الصحيح
  const baseURL = "https://ecoshid-apis-production-0757.up.railway.app"; 
  const API_URL =` ${baseURL}/auth/forgot-password`; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    console.log("Sending request to:", API_URL, "with email:", email);

    try {
      const response = await axios.post(` ${baseURL}/auth/forgot-password`, { email });
      
      console.log("Full Response:", response);

      // Response.status مش status code، ده object من السيرفر
      if (response.data.status === "success") {
        setMessage("✅ Reset code sent! Check your email.");
        console.log("Success! Navigating to confirm-email page with email:", email);

        // تحويل لصفحة التأكيد مع إرسال الإيميل
        navigate("/verify-code", { state: { email } });
      } else {
        // لو السيرفر رجع رسالة خطأ
        const serverMsg = response.data.message || "Unknown server response";
        setError(`❌ Server responded: ${serverMsg}`);
        console.error("Server Error:", serverMsg);
      }

    } catch (err) {
      console.error("Request Failed:", err);

      if (err.response) {
        console.error("Response Data:", err.response.data);
        setError(err.response.data?.message || "❌ Something went wrong with the request");
      } else if (err.request) {
        // Request was made but no response
        console.error("No Response received. Request object:", err.request);
        setError("❌ No response from server. Check your connection or server status.");
      } else {
        // Other errors
        setError(`❌ Error: ${err.message}`);
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