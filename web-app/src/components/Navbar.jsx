import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
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
