import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import techBackground from "../assets/background4.jpg";
import logo from "../assets/logo.png";
import { authService } from "../api/services";
import "./login.css";

const VerifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const inputs = useRef([]);

  /* ================= OTP INPUT ================= */
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (error) setError("");
    if (successMsg) setSuccessMsg("");

    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!isNaN(paste)) {
      const newOtp = paste.split("");
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")].slice(0, 6));
      newOtp.forEach((num, i) => {
        if (inputs.current[i]) {
          inputs.current[i].value = num;
        }
      });
      if (error) setError("");
    }
  };

  /* ================= VERIFY CODE ================= */
  const validateForm = () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const code = otp.join("");
      const res = await authService.verifyResetCode({ resetCode: code });
      // The API returns status success if valid
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /* ================= RESEND ================= */
  const resendCode = async () => {
    try {
      setError("");
      setSuccessMsg("");
      await authService.forgotPassword({ email });
      setTimer(60);
      setSuccessMsg("Verification code resent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    }
  };

return(

<div className="login-container">

<img src={techBackground} className="tech-bg" alt="background"/>

<div className="auth-card">
<img src={logo} className="brand-logo-inner" alt="logo"/>
<h2>Email Verification</h2>
<p className="subtitle">Enter the 6-digit code sent to <strong>{email}</strong></p>

{error && <p className="error-msg">{error}</p>}
{successMsg && <p className="success-msg">{successMsg}</p>}

<form onSubmit={handleSubmit} onPaste={handlePaste}>

<div className="otp-container">

{otp.map((data,index)=>(
<input
key={index}
type="text"
maxLength="1"
value={data}
ref={(el)=>inputs.current[index]=el}
onChange={(e)=>handleChange(e.target,index)}
onKeyDown={(e)=>handleKeyDown(e,index)}
className="otp-input"
/>
))}

</div>

<button
type="submit"
className="submit-btn"
disabled={loading}
>

{loading ? "Verifying..." : "Verify Code"}

</button>

<div className="form-footer">

{timer>0 ? (

<p className="timer">
Resend code in {timer}s
</p>

):(

<button
type="button"
onClick={resendCode}
className="resend-btn"
>

Resend Code

</button>

)}

</div>

<div className="form-footer">

<Link to="/login">Back to Login</Link>

</div>

</form>

</div>

</div>

);

};

export default VerifyCode;