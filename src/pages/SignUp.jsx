import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import techBackground from "../assets/background3.jpg";
import roboticHand from "../assets/hand.png";
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
  const [showGender, setShowGender] = useState(false);

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
    // focus first invalid field for better UX
    if (Object.keys(e).length > 0) {
      const first = Object.keys(e)[0];
      setTimeout(() => {
        const el = document.querySelector(`[name="${first}"]`);
        if (el && el.focus) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
    return Object.keys(e).length === 0;
  };

  const handleBlur = (ev) => {
    const { name, value } = ev.target;
    const fieldErrors = { ...errors };
    // simple per-field validation
    if (name === 'name' && !value.trim()) fieldErrors.name = 'Full name is required.';
    if (name === 'username' && !value.trim()) fieldErrors.username = 'Username is required.';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) fieldErrors.email = 'Email is required.';
      else if (!emailRegex.test(value)) fieldErrors.email = 'Please enter a valid email.';
    }
    if (name === 'address' && !value.trim()) fieldErrors.address = 'Address is required.';
    if (name === 'date_of_birth' && !value) fieldErrors.date_of_birth = 'Date of birth is required.';
    if (name === 'phone') {
      if (!value.trim()) fieldErrors.phone = 'Phone number is required.';
      else if (!/^\d{10,11}$/.test(value)) fieldErrors.phone = 'Phone must be 10–11 digits.';
    }
    if (name === 'password') {
      if (!value) fieldErrors.password = 'Password is required.';
      else if (value.length < 6) fieldErrors.password = 'Password must be at least 6 characters.';
      else delete fieldErrors.password;
    }
    if (name === 'confirmPassword') {
      if (!value) fieldErrors.confirmPassword = 'Please confirm your password.';
      else if (value !== formData.password) fieldErrors.confirmPassword = 'Passwords do not match.';
      else delete fieldErrors.confirmPassword;
    }
    setErrors(fieldErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the field error as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccess("");
    if (!validate()) return;
    setLoading(true);
    try {
      const { ...payload } = formData;
      if (payload.phone) payload.phone = String(payload.phone);
      const res = await authService.register(payload);
      if (res.data?.status === "success" || res.status === 201 || res.status === 200) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      console.log('Signup error full:', err?.response?.data);
      const status = err?.response?.status;
      const data = err?.response?.data;
      // Map server validation errors to fields if provided
      if (data && typeof data === 'object' && data.errors) {
        // assume errors is an object like { field: ['msg'] }
        const mapped = {};
        Object.keys(data.errors).forEach(k => {
          const v = data.errors[k];
          mapped[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(prev => ({ ...prev, ...mapped }));
      } else if (status === 409) {
        // conflict - map to email/username if message contains text
        if (data?.message && /email/i.test(data.message)) setErrors(prev => ({ ...prev, email: data.message }));
        else setApiError("This email or username is already registered. Please try a different one.");
      } else if (data?.message) {
        setApiError(data.message);
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
      <img src={roboticHand} className="robotic-hand" alt="robot hand" />
      <div className="signup-card">
        <div className="card-right">
          <img src={logo} className="brand-logo-inner" alt="logo" />
          <h2>Create <span>Account</span></h2>
          <p className="subtitle">Join the platform &amp; make the world greener</p>

          {success && <p className="success-msg" style={{ width: '100%', marginBottom: '12px' }}>{success}</p>}

          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className="form-grid">

              {/* Full Name */}
              <div>
                <div className={`input-icon ${errors.name ? 'input-error' : ''}`}>
                  <User size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input autoComplete="off" type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} onBlur={handleBlur} aria-invalid={errors.name ? true : false} aria-describedby={errors.name ? 'name-error' : undefined} />
                </div>
                {errors.name && <span id="name-error" className="field-error">{errors.name}</span>}
              </div>

              {/* Date of Birth */}
              <div>
                <div className={`input-icon ${errors.date_of_birth ? 'input-error' : ''}`}>
                  <Calendar size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input autoComplete="off" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} onBlur={handleBlur} aria-invalid={errors.date_of_birth ? true : false} aria-describedby={errors.date_of_birth ? 'date_of_birth-error' : undefined} />
                </div>
                {errors.date_of_birth && <span id="date_of_birth-error" className="field-error">{errors.date_of_birth}</span>}
              </div>

              {/* Username */}
              <div>
                <div className={`input-icon ${errors.username ? 'input-error' : ''}`}>
                  <User size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input autoComplete="off" type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} onBlur={handleBlur} aria-invalid={errors.username ? true : false} aria-describedby={errors.username ? 'username-error' : undefined} />
                </div>
                {errors.username && <span id="username-error" className="field-error">{errors.username}</span>}
              </div>

              {/* Email */}
              <div>
                <div className={`input-icon ${errors.email ? 'input-error' : ''}`}>
                  <Mail size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input autoComplete="off" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} onBlur={handleBlur} aria-invalid={errors.email ? true : false} aria-describedby={errors.email ? 'email-error' : undefined} />
                </div>
                {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
              </div>

              {/* Address */}
              <div>
                <div className={`input-icon ${errors.address ? 'input-error' : ''}`}>
                  <MapPin size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input autoComplete="off" type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} onBlur={handleBlur} aria-invalid={errors.address ? true : false} aria-describedby={errors.address ? 'address-error' : undefined} />
                </div>
                {errors.address && <span id="address-error" className="field-error">{errors.address}</span>}
              </div>

              {/* Phone */}
              <div>
                <div className={`input-icon ${errors.phone ? 'input-error' : ''}`}>
                  <Phone size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input autoComplete="off" type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} onBlur={handleBlur} aria-invalid={errors.phone ? true : false} aria-describedby={errors.phone ? 'phone-error' : undefined} />
                </div>
                {errors.phone && <span id="phone-error" className="field-error">{errors.phone}</span>}
              </div>

              {/* Gender (collapsed until clicked) */}
              <div>
                <div className="input-icon" style={{ padding: 8, gap: 8 }}>
                  <User size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />

                  <div className="gender-wrapper">
                    <div
                      className="gender-selected"
                      role="button"
                      tabIndex={0}
                      aria-haspopup="listbox"
                      onClick={() => setShowGender(s => !s)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowGender(s => !s); }}
                    >
                      <span className="label-text">{formData.gender === 'male' ? 'Male' : 'Female'}</span>
                      <span className={`chev ${showGender ? 'open' : ''}`}></span>
                    </div>

                    {showGender && (
                      <div className="gender-toggle" role="listbox" aria-label="Gender options">
                        <label className={`gender-option ${formData.gender === 'male' ? 'selected' : ''}`}>
                          <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={(e) => { setFormData(prev => ({ ...prev, gender: e.target.value })); setShowGender(false); }} />
                          <span className="label-text">Male</span>
                          <span className="radio-indicator" aria-hidden></span>
                        </label>

                        <label className={`gender-option ${formData.gender === 'female' ? 'selected' : ''}`}>
                          <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={(e) => { setFormData(prev => ({ ...prev, gender: e.target.value })); setShowGender(false); }} />
                          <span className="label-text">Female</span>
                          <span className="radio-indicator" aria-hidden></span>
                        </label>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Password */}
              <div>
                <div className={`input-icon ${errors.password ? 'input-error' : ''}`}>
                  <Lock size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input autoComplete="new-password" type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} onBlur={handleBlur} aria-invalid={errors.password ? true : false} aria-describedby={errors.password ? 'password-error' : undefined} />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span id="password-error" className="field-error">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div>
                <div className={`input-icon ${errors.confirmPassword ? 'input-error' : ''}`}>
                  <Lock size={16} style={{ marginLeft: 12, color: '#0cdf3b', flexShrink: 0 }} />
                  <input autoComplete="new-password" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} aria-invalid={errors.confirmPassword ? true : false} aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined} />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(p => !p)}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span id="confirmPassword-error" className="field-error">{errors.confirmPassword}</span>}
              </div>

            </div>

            {apiError && <p className="field-error" style={{ textAlign: 'center', marginBottom: '12px' }}>{apiError}</p>}

            {/* Password Strength removed per request */}

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