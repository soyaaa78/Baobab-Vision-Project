import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import baobablogo from "../assets/bvfull.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faKey,
  faUser,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import {
  ADMIN_PASSWORD_POLICY_HINT,
  getAdminPasswordPolicyErrors,
} from "../utils/adminPasswordPolicy";
import "../styles/LoginPage.css";
import axios from "axios";
import Cookies from "js-cookie";

function LoginPage() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [passVisibility, setPassVisibility] = useState(true);
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const slideIntervalRef = useRef(null);

  const togglePasswordVisibility = () => {
    setPassVisibility((prev) => !prev);
  };

  const formTitle =
    {
      login: "SIGN IN",
      verify: "VERIFY ACCOUNT",
      forgot: "RESET PASSWORD",
      resetOtp: "RESET CODE",
      newPassword: "NEW PASSWORD",
    }[step] || "SIGN IN";

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const clearResetState = () => {
    setEmail("");
    setOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setPassVisibility(true);
  };

  const goToForgotPassword = () => {
    clearMessages();
    clearResetState();
    if (username.trim().includes("@")) {
      setEmail(username.trim());
    }
    setStep("forgot");
  };

  const returnToLogin = () => {
    clearMessages();
    clearResetState();
    setStep("login");
  };

  const renderMessage = () =>
    (error || success) && (
      <div className="form-message-box">
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}
      </div>
    );

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
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      await axios.post(`${SERVER_URL}/api/admin/resend-otp`, {
        email,
      });
      setSuccess("Verification code resent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    clearMessages();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your admin email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${SERVER_URL}/api/admin/request-password-reset-otp`, {
        email: trimmedEmail,
      });
      setEmail(trimmedEmail);
      setOtp("");
      setStep("resetOtp");
      setSuccess(
        "If an admin account exists, a reset code has been sent to that email."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send reset code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();
    if (!trimmedEmail) {
      setError("Start again with your admin email address.");
      setStep("forgot");
      return;
    }

    if (!trimmedOtp) {
      setError("Enter the reset code from your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/admin/verify-password-reset-otp`,
        {
          email: trimmedEmail,
          otp: trimmedOtp,
        }
      );
      const token = res.data?.resetToken;
      if (!token) {
        setError("Reset code could not be verified. Request a new code.");
        return;
      }
      setResetToken(token);
      setOtp("");
      setStep("newPassword");
      setSuccess("Code verified. Create a new admin password.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired reset code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!resetToken) {
      setError("Reset session expired. Request a new code.");
      setStep("forgot");
      return;
    }

    const policyErrors = getAdminPasswordPolicyErrors(newPassword);
    if (policyErrors.length) {
      setError(policyErrors[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${SERVER_URL}/api/admin/reset-password`, {
        token: resetToken,
        newPassword,
      });
      clearResetState();
      setPassword("");
      setStep("login");
      setSuccess("Password reset successfully. Sign in with your new password.");
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed.");
    } finally {
      setIsSubmitting(false);
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
            <h2 className="form-title">{formTitle}</h2>

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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      passVisibility ? "Show password" : "Hide password"
                    }
                  >
                    <FontAwesomeIcon
                      icon={passVisibility ? faEye : faEyeSlash}
                    />
                  </button>
                </div>

                <div className="form-secondary-row">
                  <button
                    type="button"
                    className="secondary-action-btn"
                    onClick={goToForgotPassword}
                    disabled={isSubmitting}
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="login-btn" disabled={isSubmitting}>
                  {isSubmitting ? "LOGGING IN..." : "LOGIN"}
                </button>

                {renderMessage()}
              </form>
            ) : step === "verify" ? (
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
                    disabled={isSubmitting}
                  />
                </div>

                <button type="submit" className="login-btn" disabled={isSubmitting}>
                  {isSubmitting ? "VERIFYING..." : "VERIFY"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="resend-btn"
                  disabled={isSubmitting}
                >
                  Resend Verification Code
                </button>

                {renderMessage()}
              </form>
            ) : step === "forgot" ? (
              <form onSubmit={handleRequestPasswordReset} className="login-form">
                <p className="reset-step-intro">
                  Enter the email for your admin account. If it exists, we will
                  send a reset code.
                </p>

                <div className="input-group">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>

                <button type="submit" className="login-btn" disabled={isSubmitting}>
                  {isSubmitting ? "SENDING..." : "SEND RESET CODE"}
                </button>

                <div className="form-secondary-row centered">
                  <button
                    type="button"
                    className="secondary-action-btn"
                    onClick={returnToLogin}
                    disabled={isSubmitting}
                  >
                    Back to login
                  </button>
                </div>

                {renderMessage()}
              </form>
            ) : step === "resetOtp" ? (
              <form onSubmit={handleVerifyResetOtp} className="login-form">
                <p className="reset-step-intro">
                  Enter the reset code sent to your admin email.
                </p>

                <div className="input-group">
                  <FontAwesomeIcon icon={faKey} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit reset code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>

                <button type="submit" className="login-btn" disabled={isSubmitting}>
                  {isSubmitting ? "VERIFYING..." : "VERIFY CODE"}
                </button>

                <div className="form-secondary-row centered">
                  <button
                    type="button"
                    className="secondary-action-btn"
                    onClick={returnToLogin}
                    disabled={isSubmitting}
                  >
                    Back to login
                  </button>
                </div>

                {renderMessage()}
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="login-form">
                <div className="field-stack">
                  <div className="input-group">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                      type={passVisibility ? "password" : "text"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="form-input"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        passVisibility ? "Show password" : "Hide password"
                      }
                    >
                      <FontAwesomeIcon
                        icon={passVisibility ? faEye : faEyeSlash}
                      />
                    </button>
                  </div>
                  <p className="password-policy-hint">
                    {ADMIN_PASSWORD_POLICY_HINT}
                  </p>
                </div>

                <div className="input-group">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input
                    type={passVisibility ? "password" : "text"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>

                <button type="submit" className="login-btn" disabled={isSubmitting}>
                  {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
                </button>

                <div className="form-secondary-row centered">
                  <button
                    type="button"
                    className="secondary-action-btn"
                    onClick={returnToLogin}
                    disabled={isSubmitting}
                  >
                    Back to login
                  </button>
                </div>

                {renderMessage()}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
