import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import techBackground from "../assets/background4.jpg";
import logo from "../assets/logo.png";
import "./login.css";

const ResetPassword = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "https://ecoshid-apis-production-0757.up.railway.app";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Reset password failed");
      }

      alert("Password reset successfully");

      navigate("/login");

    } catch (error) {

      alert(error.message);

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
        <p className="subtitle">Create a new password</p>

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