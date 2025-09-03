import React, { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import Button from "../components/Button";
import { showToast } from "../services/toastService";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    role: "",
    isVerified: false,
    isDisabled: false,
    createdAt: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToast({ message: "Failed to load profile data", type: "error" });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast({ message: "New passwords do not match", type: "error" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast({
        message: "New password must be at least 6 characters long",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${SERVER_URL}/api/admin/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast({ message: "Password changed successfully", type: "success" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password";
      showToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "system_admin":
        return "System Administrator";
      case "staff_product":
        return "Product Staff";
      case "staff_order":
        return "Order Staff";
      default:
        return role;
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="page" id="profile">
      <div className="profile-content">
        <div className="page-header">
          <h1>Profile Settings</h1>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <div className="tab-navigation">
            <button
              className={`tab-button ${
                activeTab === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={16} />
              Profile Information
            </button>
            <button
              className={`tab-button ${
                activeTab === "password" ? "active" : ""
              }`}
              onClick={() => setActiveTab("password")}
            >
              <Lock size={16} />
              Change Password
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "profile" && (
            <div className="profile-info-section">
              <div className="info-card">
                <div className="card-header">
                  <h2>Personal Information</h2>
                  <div
                    className={`status-badge ${
                      profileData.isDisabled ? "disabled" : "active"
                    }`}
                  >
                    {profileData.isDisabled ? "Disabled" : "Active"}
                  </div>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <label>First Name</label>
                    <div className="info-value">{profileData.firstname}</div>
                  </div>

                  <div className="info-item">
                    <label>Last Name</label>
                    <div className="info-value">{profileData.lastname}</div>
                  </div>

                  <div className="info-item">
                    <label>Username</label>
                    <div className="info-value">{profileData.username}</div>
                  </div>

                  <div className="info-item">
                    <label>Email Address</label>
                    <div className="info-value">
                      {profileData.email}
                      <span
                        className={`verification-badge ${
                          profileData.isVerified ? "verified" : "unverified"
                        }`}
                      >
                        {profileData.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <label>Role</label>
                    <div className="info-value role-badge">
                      {getRoleDisplayName(profileData.role)}
                    </div>
                  </div>

                  <div className="info-item">
                    <label>Member Since</label>
                    <div className="info-value">
                      {formatDate(profileData.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="password-section">
              <div className="password-card">
                <div className="card-header">
                  <h2>Change Password</h2>
                  <p>
                    Ensure your account stays secure by updating your password
                    regularly
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                        className="password-input"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        className="password-input"
                        placeholder="Enter your new password"
                        minLength="6"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPasswords.new ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <div className="password-hint">
                      Password must be at least 6 characters long
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        className="password-input"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`change-password-btn ${
                        loading ? "loading" : ""
                      }`}
                    >
                      {loading ? "Changing Password..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
