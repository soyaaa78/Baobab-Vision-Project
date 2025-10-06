import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Derive active scope from current URL query
  const params = new URLSearchParams(location.search);
  const scope = params.get("scope");
  const onAllOrders = location.pathname.includes("allorders");

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
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
            <Link
              to="/dashboard"
              className="nav-button"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
          </li>

          {role !== "staff_order" && (
            <>
              <li>
                <Link
                  to="catalogue"
                  className="nav-button"
                  onClick={closeMobileMenu}
                >
                  Manage Eyeglass Selections
                </Link>
              </li>
              <li>
                <Link
                  to="statistics"
                  className="nav-button"
                  onClick={closeMobileMenu}
                >
                  Statistics
                </Link>
              </li>
            </>
          )}

          {role !== "staff_product" && (
            <>
              <li>
                <Link
                  to="manageusers"
                  className="nav-button"
                  onClick={closeMobileMenu}
                >
                  Manage Users
                </Link>
              </li>
              <li
                className={`dropdown ${isDropdownOpen ? "dropdown-open" : ""}`}
              >
                <span
                  className={`nav-button dropdown-toggle ${
                    onAllOrders ? "active" : ""
                  }`}
                  onClick={toggleDropdown}
                >
                  Manage Orders <span className="caret">▾</span>
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      to="allorders?scope=pickup"
                      className={
                        onAllOrders && scope === "pickup" ? "active" : ""
                      }
                      onClick={closeMobileMenu}
                    >
                      Pickup Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="allorders?scope=third"
                      className={
                        onAllOrders && scope === "third" ? "active" : ""
                      }
                      onClick={closeMobileMenu}
                    >
                      Third Party Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="allorders?scope=cancelled"
                      className={
                        onAllOrders && scope === "cancelled" ? "active" : ""
                      }
                      onClick={closeMobileMenu}
                    >
                      Cancelled Orders
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link
                  to="reviews"
                  className="nav-button"
                  onClick={closeMobileMenu}
                >
                  Manage Reviews
                </Link>
              </li>
            </>
          )}

          {role === "system_admin" && (
            <li>
              <Link
                to="audit-logs"
                className="nav-button"
                onClick={closeMobileMenu}
              >
                Audit Logs
              </Link>
            </li>
          )}

          <li>
            <Link to="profile" className="nav-button" onClick={closeMobileMenu}>
              Profile
            </Link>
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
