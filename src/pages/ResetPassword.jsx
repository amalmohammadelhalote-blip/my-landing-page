import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import techBackground from "../assets/background3.jpg";
import roboticHand from "../assets/hand.png";
import logo from "../assets/logo.png";
import { authService } from "../api/services";
import "./login.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!password) {
      setError("Password is required.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    if (!confirmPassword) {
      setError("Please confirm your password.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError("");

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
      <img src={roboticHand} className="robotic-hand" alt="robot hand" />

      <div className="auth-card">

        <img src={logo} className="brand-logo-inner" alt="logo" />
        <h2>Reset Password</h2>
        <p className="subtitle">Create a new password for <strong>{email}</strong></p>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">Password reset successfully! Redirecting to login...</p>}

        <form onSubmit={handleSubmit} noValidate>

          <div className="input-box">
            <label>NEW PASSWORD</label>
            <div className="field-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
              />
              <button type="button" className="toggle-pass-btn" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-box">
            <label>CONFIRM PASSWORD</label>
            <div className="field-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(""); }}
              />
              <button type="button" className="toggle-pass-btn" onClick={() => setShowConfirmPassword(p => !p)}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
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