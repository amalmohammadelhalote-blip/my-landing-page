import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/services";
import techBackground from "../assets/background3.jpg";
import roboticHand from "../assets/hand.png";
import logo from "../assets/logo.png";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authService.login({ email, password });
      const token = extractToken(response?.data);

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("accessToken", token);
      } else {
        setError("Login succeeded but no token was returned by the server.");
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
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

      <div className="auth-card">
        <img src={logo} className="brand-logo-inner" alt="logo" />
        <h2>Sign In</h2>
        <p>Streamline your industrial monitoring in real time.</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <label>EMAIL</label>
            <div className="field-wrapper">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="icon-right" size={18} />
            </div>
          </div>

          <div className="input-box">
            <label>PASSWORD</label>
            <div className="field-wrapper">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="icon-right" size={18} />
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