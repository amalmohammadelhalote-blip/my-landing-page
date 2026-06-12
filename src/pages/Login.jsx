import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { authService, homeService } from "../api/services";
import techBackground from "../assets/background3.jpg";
import roboticHand from "../assets/hand.png";
import logo from "../assets/logo.png";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
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
    const e = {};
    if (!email.trim()) {
      e.email = "Email is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters long.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setApiError("");
    try {
      const response = await authService.login({ email, password });
      const token = extractToken(response?.data);

      if (!token) {
        setApiError("⛔ You are not authorized to access this dashboard.");
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
        setApiError("⛔ You are not authorized to access this dashboard.");
      }

    } catch (err) {
      console.log('Login error:', err?.response?.data);
      const data = err?.response?.data;
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        setApiError("⛔ You are not authorized to access this dashboard.");
      } else if (data?.errors) {
        if (Array.isArray(data.errors)) {
          const msgs = data.errors.map(e => e?.msg || e?.message || e).filter(Boolean);
          setApiError(msgs.map(m => `* ${m}`).join('\n'));
        } else if (data?.message) {
          setApiError(data.message);
        } else {
          setApiError("Something went wrong. Please try again.");
        }
      } else {
        setApiError(data?.message || data?.error || data?.msg || data?.detail || "Something went wrong. Please try again.");
      }
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
        <h2>Sign In</h2>
        <p>Streamline your industrial monitoring in real time.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-box">
            <label>Email</label>
            <div className="field-wrapper">
              <input
                type="email"
                className={errors.email ? "input-error" : ""}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                  if (apiError) setApiError("");
                }}
              />
              <Mail className="icon-right" size={18} />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="input-box">
            <label>Password</label>
            <div className="field-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className={errors.password ? "input-error" : ""}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                  if (apiError) setApiError("");
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
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-footer" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Link to="/forget-password">Forgot Password?</Link>
              <Link to="/signup">Create Account ›</Link>
            </div>
            <Link to="/" className="back-landing-link">← Back Landing</Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          {apiError && <p className="api-error-msg">{apiError}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;