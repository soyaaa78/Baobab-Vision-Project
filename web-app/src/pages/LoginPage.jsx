import React, { useState, useEffect, useRef } from "react";
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
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [passVisibility, setPassVisibility] = useState(true);
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const slideIntervalRef = useRef(null);

  const togglePasswordVisibility = () => {
    setPassVisibility((prev) => !prev);
  };

  // Fetch slideshow images for background left panel
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/slideshow/all-images`);
        if (Array.isArray(res.data) && res.data.length) {
          const ordered = res.data
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map((img) => img.imagePath);
          setSlides(ordered);
        }
      } catch {
        // silent fail; keep default static background color
      }
    };
    fetchSlides();
  }, [SERVER_URL]);

  // Cycle slides every 7 seconds
  useEffect(() => {
    if (!slides.length) return;
    slideIntervalRef.current && clearInterval(slideIntervalRef.current);
    slideIntervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(slideIntervalRef.current);
  }, [slides]);

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
        {slides.length > 0 && (
          <div className="login-left-slideshow" aria-hidden="true">
            {slides.map((url, idx) => (
              <div
                key={idx}
                className={`login-bg-slide ${
                  idx === activeSlide ? "active" : ""
                }`}
                style={{ backgroundImage: `url(${url})` }}
              />
            ))}
            <div className="login-left-overlay" />
          </div>
        )}
        {/* Decorative diagonal stripes with pure CSS infinite marquees */}
        <div className="hero-stripes">
          <div className="stripe stripe-main single">
            <div className="stripe-marquee" aria-hidden="true">
              <div className="stripe-marquee-track">
                <span className="stripe-marquee-text">BAOBAB VISION</span>
                <span className="stripe-marquee-text">BAOBAB VISION</span>
                <span className="stripe-marquee-text">BAOBAB VISION</span>
                <span className="stripe-marquee-text">BAOBAB VISION</span>
              </div>
            </div>
          </div>
          <div className="stripe stripe-bottom single">
            <div className="stripe-marquee" aria-hidden="true">
              <div className="stripe-marquee-track reverse">
                <span className="stripe-marquee-text">
                  READY TO TAKE ON THE WORLD
                </span>
                <span className="stripe-marquee-text">
                  READY TO TAKE ON THE WORLD
                </span>
                <span className="stripe-marquee-text">
                  READY TO TAKE ON THE WORLD
                </span>
                <span className="stripe-marquee-text">
                  READY TO TAKE ON THE WORLD
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="gradient-overlay" />
      </div>

      {/* Right Side - Sign In Form */}
      <div className="login-right">
        <div className="auth-card-group">
          <div className="brand-floating" aria-hidden="false">
            <img
              src={baobablogo}
              alt="Baobab Vision"
              className="brand-floating-logo"
            />
            <p className="brand-floating-tagline">
              Heya, bud. Ready to take on the world?
            </p>
          </div>
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
                    <FontAwesomeIcon
                      icon={passVisibility ? faEye : faEyeSlash}
                    />
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
    </div>
  );
}

export default LoginPage;
