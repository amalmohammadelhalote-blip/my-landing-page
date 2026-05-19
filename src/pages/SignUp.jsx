import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import techBackground from "../assets/background5.jpg";
import logo from "../assets/logo.png";
import { User, Mail, Phone, Lock, MapPin, Calendar, Eye, EyeOff } from "lucide-react";
import { authService } from "../api/services";
import "./Account.css";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    address: "",
    gender: "male",
    date_of_birth: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Full name is required.";
    if (!formData.username.trim()) e.username = "Username is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(formData.email)) e.email = "Please enter a valid email.";
    if (!formData.address.trim()) e.address = "Address is required.";
    if (!formData.date_of_birth) e.date_of_birth = "Date of birth is required.";
    if (!formData.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^\d{10,11}$/.test(formData.phone)) e.phone = "Phone must be 10–11 digits.";
    if (!formData.password) e.password = "Password is required.";
    else if (formData.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (!formData.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the field error as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
    if (name === "password") checkStrength(value);
  };

  const checkStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 6) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    setPasswordStrength(s);
  };

  const strengthColor = () => {
    if (passwordStrength <= 1) return "#ef4444";
    if (passwordStrength === 2) return "#f97316";
    if (passwordStrength === 3) return "#eab308";
    return "#22c55e";
  };

  const strengthLabel = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccess("");
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const res = await authService.register(payload);
      if (res.data?.status === "success" || res.status === 201 || res.status === 200) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 409) {
        setApiError("This email or username is already registered. Please try a different one.");
      } else if (msg) {
        setApiError(msg);
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <img src={techBackground} className="tech-bg" alt="background" />
      <div className="signup-card">
        <div className="card-right">
          <img src={logo} className="logo" alt="logo" />
          <h2>Create <span>Account</span></h2>
          <p className="subtitle">Join the platform &amp; make the world greener</p>

          {apiError && <p className="error-msg" style={{ width: '100%', marginBottom: '12px' }}>{apiError}</p>}
          {success && <p className="success-msg" style={{ width: '100%', marginBottom: '12px' }}>{success}</p>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">

              {/* Full Name */}
              <div>
                <div className={`input-icon ${errors.name ? 'input-error' : ''}`}>
                  <User size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                </div>
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              {/* Date of Birth */}
              <div>
                <div className={`input-icon ${errors.date_of_birth ? 'input-error' : ''}`}>
                  <Calendar size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                </div>
                {errors.date_of_birth && <span className="field-error">{errors.date_of_birth}</span>}
              </div>

              {/* Username */}
              <div>
                <div className={`input-icon ${errors.username ? 'input-error' : ''}`}>
                  <User size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
                </div>
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              {/* Email */}
              <div>
                <div className={`input-icon ${errors.email ? 'input-error' : ''}`}>
                  <Mail size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {/* Address */}
              <div>
                <div className={`input-icon ${errors.address ? 'input-error' : ''}`}>
                  <MapPin size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                </div>
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              {/* Phone */}
              <div>
                <div className={`input-icon ${errors.phone ? 'input-error' : ''}`}>
                  <Phone size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                </div>
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              {/* Gender */}
              <div>
                <div className="input-icon">
                  <User size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className={`input-icon ${errors.password ? 'input-error' : ''}`}>
                  <Lock size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div>
                <div className={`input-icon ${errors.confirmPassword ? 'input-error' : ''}`}>
                  <Lock size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(p => !p)}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>

            </div>

            {/* Password Strength */}
            {formData.password && (
              <div style={{ width: '100%', marginTop: 10 }}>
                <div className="password-bar">
                  <div className="strength" style={{ width: `${passwordStrength * 25}%`, background: strengthColor() }}></div>
                </div>
                <span style={{ fontSize: 11, color: strengthColor(), marginTop: 4, display: 'block' }}>
                  Password strength: {strengthLabel()}
                </span>
              </div>
            )}

            <button className="create-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account →"}
            </button>
            <div className="login-link">Already have an account? <Link to="/login">Login</Link></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;