import React from "react";
import { Link } from "react-router-dom";
import "../styles/NotFoundPage.css";

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="eyeglass-container">
          <div className="eyeglass">
            <div className="lens left-lens"></div>
            <div className="bridge"></div>
            <div className="lens right-lens"></div>
            <div className="temple left-temple"></div>
            <div className="temple right-temple"></div>
          </div>
        </div>
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-message">
          Looks like you need better vision! The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <div className="error-actions">
          <Link to="/dashboard" className="back-home-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
