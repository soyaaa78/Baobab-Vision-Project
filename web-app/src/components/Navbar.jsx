import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import baobablogo from "../assets/bvfull.png";
import Button from "./Button";

function Navbar() {
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
          <li>
            <Link to="manageusers" className="nav-button">
              Manage Users
            </Link>
          </li>
          <Button /* onClick={} */ children={(<div>
            <p>Log Out</p>
          </div>)} />
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
