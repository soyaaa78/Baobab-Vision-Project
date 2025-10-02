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

  // Derive active scope from current URL query
  const params = new URLSearchParams(location.search);
  const scope = params.get("scope");
  const onAllOrders = location.pathname.includes("allorders");

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-logo-wrapper">
          <img src={baobablogo} className="logo" alt="Baobab Vision" />
        </div>

        <ul className="links">
          <li>
            <Link to="/dashboard" className="nav-button">
              Home
            </Link>
          </li>

          {role !== "staff_order" && (
            <>
              <li>
                <Link to="catalogue" className="nav-button">
                  Manage Eyeglass Selections
                </Link>
              </li>
              <li>
                <Link to="statistics" className="nav-button">
                  Statistics
                </Link>
              </li>
            </>
          )}

          {role !== "staff_product" && (
            <>
              <li>
                <Link to="manageusers" className="nav-button">
                  Manage Users
                </Link>
              </li>
              <li className="dropdown">
                <span
                  className={`nav-button dropdown-toggle ${
                    onAllOrders ? "active" : ""
                  }`}
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
                    >
                      Third Party Orders
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="reviews" className="nav-button">
                  Manage Reviews
                </Link>
              </li>
            </>
          )}

          {role === "system_admin" && (
            <li>
              <Link to="audit-logs" className="nav-button">
                Audit Logs
              </Link>
            </li>
          )}

          <li>
            <Link to="profile" className="nav-button">
              Profile
            </Link>
          </li>

          <Button
            onClick={handleLogout}
            children={
              <div>
                <p>Log Out</p>
              </div>
            }
          />
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
