import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Navbar.css";
import baobablogo from "../assets/bvfull.png";
import Button from "./Button";
import Cookies from "js-cookie";

function Navbar() {
  const { logout } = useAuth();
  const role = Cookies.get("role");

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
              <li>
                <Link to="allorders" className="nav-button">
                  Manage Orders
                </Link>
              </li>
              <li>
                <Link to="reviews" className="nav-button">
                  Manage Reviews
                </Link>
              </li>
            </>
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
