import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Navbar.css";
import baobablogo from "../assets/bvfull.png";
import Button from "./Button";
import Cookies from "js-cookie";

function Navbar() {
  const { logout } = useAuth();
  const role = Cookies.get("role");
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-logo-wrapper">
          <img src={baobablogo} className="logo" alt="Baobab Vision" />
        </div>

        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <ul className={`links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <li>
            <NavLink to="/dashboard" className="nav-button" end>
              Home
            </NavLink>
          </li>

          {role !== "staff_order" && (
            <>
              <li>
                <NavLink to="catalogue" className="nav-button">
                  Manage Eyeglass Selections
                </NavLink>
              </li>
              <li>
                <NavLink to="statistics" className="nav-button">
                  Statistics
                </NavLink>
              </li>
            </>
          )}

          {role !== "staff_product" && (
            <>
              <li>
                <NavLink to="manageusers" className="nav-button">
                  Manage Users
                </NavLink>
              </li>
              <li>
                <NavLink to="allorders" className="nav-button">
                  Manage Orders
                </NavLink>
              </li>
              <li>
                <NavLink to="reviews" className="nav-button">
                  Manage Reviews
                </NavLink>
              </li>
            </>
          )}

          {role === "system_admin" && (
            <li>
              <NavLink to="audit-logs" className="nav-button">
                Audit Logs
              </NavLink>
            </li>
          )}

          <li>
            <NavLink to="profile" className="nav-button">
              Profile
            </NavLink>
          </li>

          <li className="nav-logout-btn">
            <Button
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
              children={
                <div>
                  <p>Log Out</p>
                </div>
              }
            />
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
