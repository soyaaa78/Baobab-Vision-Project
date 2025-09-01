import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import baobablogo from "../assets/bvfull.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUser,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import "../styles/LoginPage.css";
import axios from "axios";
import Cookies from "js-cookie";

function LoginPage() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [passVisibility, setPassVisibility] = useState(true);

  const togglePasswordVisibility = () => {
    setPassVisibility((prev) => !prev);
  };

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/admin/login`,
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res?.data?.isDisabled) {
        setError("Your account is disabled. Please contact support.");
        return;
      }
      const { token, role } = res.data;
      login(token, role);
      navigate("/dashboard");
    } catch (err) {
      const res = err.response;
      if (res?.data?.requiresVerification) {
        setStep("verify");
        setEmail(res.data.email);
        Cookies.set("pendingEmail", res.data.email, { expires: 1 / 24 });
        return;
      }
      setError(res?.data?.message || "Login failed");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${SERVER_URL}/api/admin/verify-otp`, {
        email,
        otp,
      });
      login(res.data.token, res.data.role);
      Cookies.remove("pendingEmail");
      setSuccess("Account successfully verified!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    try {
      await axios.post(`${SERVER_URL}/api/admin/resend-otp`, {
        email,
      });
      setSuccess("Verification code resent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Gradient Background */}
      <div className="login-left">
        <div className="gradient-overlay">
          <div className="logo-section">
            <img
              src={baobablogo}
              alt="Baobab Vision Logo"
              className="logo-image"
            />
            <p className="logo-description">
              Heya, bud. Ready to take on the world?
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="login-right">
        <div className="form-container">
          <h2 className="form-title">SIGN IN</h2>

          {step === "login" ? (
            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  type={passVisibility ? "password" : "text"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <div
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={passVisibility ? faEye : faEyeSlash} />
                </div>
              </div>

              <button type="submit" className="login-btn">
                LOGIN
              </button>

              {(error || success) && (
                <div className="form-message-box">
                  {error && <p className="form-error">{error}</p>}
                  {success && <p className="form-success">{success}</p>}
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerify} className="login-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" className="login-btn">
                VERIFY
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="resend-btn"
              >
                Resend Verification Code
              </button>

              {(error || success) && (
                <div className="form-message-box">
                  {error && <p className="form-error">{error}</p>}
                  {success && <p className="form-success">{success}</p>}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
