import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import techBackground from "../assets/background5.jpg"; // صورة الإيد الصناعية
import logo from "../assets/logo.png";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

import "./Account.css";

const SignUp = () => {
  const navigate = useNavigate();
  const baseURL = "https://ecoshid-apis-production-0757.up.railway.app/api/auth/signup";

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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.username.trim()) tempErrors.username = "Username is required";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) tempErrors.email = "Invalid email";
    if (!formData.address.trim()) tempErrors.address = "Address is required";
    if (!formData.date_of_birth) tempErrors.date_of_birth = "Date of birth is required";
    if (!formData.phone.match(/^\d{10,11}$/)) tempErrors.phone = "Phone must be 10-11 digits";
    if (formData.password.length < 6) tempErrors.password = "Password must be at least 6 chars";
    if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = "Passwords do not match";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") checkStrength(value);
  };

  const checkStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {...formData, phone: formData.phone.toString()};
      const res = await axios.post(`${baseURL}/auth/signup`, payload);
      if (res.data.status === "success") {
        setSuccess("Account created successfully!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Something went wrong" });
    }
    setLoading(false);
  };

  const togglePassword = () => setShowPassword(!showPassword);

  // const strengthColor = () => {
  //   switch (passwordStrength) {
  //     case 0: case 1: return "red";
  //     case 2: return "orange";
  //     case 3: return "yellow";
  //     case 4: return "#00ff9c"; 
  //     default: return "red";
  //   }
  // };

  return (
    <div className="signup-page">
      <img src={techBackground} className="tech-bg" alt="background" />
      <div className="signup-card">
        {/* RIGHT PART */}
        <div className="card-right">
          <img src={logo} className="logo" />
          <h2>Create <span>Account</span></h2>
          <p className="subtitle">Join the platform & make the world greener</p>

          {errors.api && <p className="error-msg">{errors.api}</p>}
          {success && <p className="success-msg">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-icon"><FaUser /> <input type="text" name="name" placeholder="Full Name" onChange={handleChange} /></div>
              <div className="input-icon"><FaCalendarAlt /> <input type="date" name="date_of_birth" onChange={handleChange} /></div>
              <div className="input-icon"><FaUser /> <input type="text" name="username" placeholder="Username" onChange={handleChange} /></div>
              <div className="input-icon"><FaEnvelope /> <input type="email" name="email" placeholder="Email" onChange={handleChange} /></div>
              <div className="input-icon"><FaMapMarkerAlt /> <input type="text" name="address" placeholder="Address" onChange={handleChange} /></div>
              <div className="input-icon"><FaPhone /> <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} /></div>
              <div className="input-icon">
                <FaUser /> 
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
              <div className="input-icon"><FaLock /> <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" onChange={handleChange} /></div>
              <div className="input-icon"><FaLock /> <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} /></div>
            </div>

            <div className="password-bar"><div className="strength" style={{width:`${passwordStrength*25}%`}}></div></div>
            <button className="create-btn">{loading ? "Creating..." : "Create Account →"}</button>
            <div className="login-link">Already have an account? <Link to="/login">Login</Link></div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SignUp;