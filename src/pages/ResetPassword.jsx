import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import techBackground from "../assets/background4.jpg";
import logo from "../assets/logo.png";
import { authService } from "../api/services";
import "./login.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        email: email,
        password: password
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset password failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <img src={techBackground} className="tech-bg" alt="background" />
      <img src={logo} className="brand-logo" alt="logo" />

      <div className="auth-card">

        <h2>Reset Password</h2>
        <p className="subtitle">Create a new password for <strong>{email}</strong></p>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-banner" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>Password reset successfully! Redirecting to login...</p>}

        <form onSubmit={handleSubmit}>

          <div className="input-box">
            <label>New Password</label>
            <div className="field-wrapper">
              <Lock className="icon-left" size={18} />
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-box">
            <label>Confirm Password</label>
            <div className="field-wrapper">
              <Lock className="icon-left" size={18} />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="form-footer">
            <Link to="/login">Back to Login</Link>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ResetPassword;