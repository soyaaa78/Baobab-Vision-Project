import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUser,
  faCalendar,
  faGlobe,
  faDesktop,
  faTags,
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/AuditLogDetailModal.css";

const AuditLogDetailModal = ({ isOpen, onClose, log, getActorDisplayName }) => {
  if (!isOpen || !log) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  const formatJson = (obj) => {
    if (!obj || Object.keys(obj).length === 0) return "None";
    return JSON.stringify(obj, null, 2);
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      auth: "#3b82f6",
      product: "#10b981",
      user: "#8b5cf6",
      staff: "#f59e0b",
      order: "#ef4444",
      payment: "#06b6d4",
      admin: "#6b7280",
    };
    return colors[eventType] || "#6b7280";
  };

  const getActionColor = (action) => {
    const actionLower = action.toLowerCase();
    const colors = {
      create: "#10b981",
      update: "#f59e0b",
      delete: "#ef4444",
      login: "#3b82f6",
      logout: "#6b7280",
      approve: "#10b981",
      decline: "#ef4444",
      enable: "#10b981",
      disable: "#ef4444",
      status: "#3b82f6",
      ready: "#10b981",
      pickup: "#f59e0b",
      complete: "#10b981",
      cancel: "#ef4444",
    };

    // Check for keyword matches in the action text
    for (const [keyword, color] of Object.entries(colors)) {
      if (actionLower.includes(keyword)) {
        return color;
      }
    }

    return "#6b7280"; // Default gray
  };

  const hasChanges = log.oldValues || log.newValues;
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

  return (
    <div className="audit-modal-overlay" onClick={onClose}>
      <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="audit-modal-header">
          <h2>Audit Log Details</h2>
          <button onClick={onClose} className="audit-modal-close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="audit-modal-content">
          {/* Basic Information */}
          <div className="audit-section">
            <h3>Basic Information</h3>
            <div className="audit-info-grid">
              <div className="audit-info-item">
                <FontAwesomeIcon icon={faCalendar} className="info-icon" />
                <div>
                  <label>Timestamp</label>
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>

              <div className="audit-info-item">
                <FontAwesomeIcon icon={faUser} className="info-icon" />
                <div>
                  <label>Actor</label>
                  <span>{getActorDisplayName(log)}</span>
                  {log.actorRole && (
                    <span className="actor-role-detail">({log.actorRole})</span>
                  )}
                </div>
              </div>

              <div className="audit-info-item">
                <FontAwesomeIcon icon={faTags} className="info-icon" />
                <div>
                  <label>Event Type</label>
                  <span
                    className="event-type-badge-detail"
                    style={{
                      backgroundColor: getEventTypeColor(log.eventType),
                    }}
                  >
                    {log.eventType}
                  </span>
                </div>
              </div>

              <div className="audit-info-item">
                <FontAwesomeIcon icon={faExchangeAlt} className="info-icon" />
                <div>
                  <label>Action</label>
                  <span
                    className="action-badge-detail"
                    style={{ backgroundColor: getActionColor(log.action) }}
                  >
                    {log.action}
                  </span>
                </div>
              </div>

              {log.targetModel && (
                <div className="audit-info-item">
                  <div>
                    <label>Target Model</label>
                    <span>{log.targetModel}</span>
                  </div>
                </div>
              )}

              {log.targetId && (
                <div className="audit-info-item">
                  <div>
                    <label>Target ID</label>
                    <span className="target-id-detail">{log.targetId}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Session Information */}
          <div className="audit-section">
            <h3>Session Information</h3>
            <div className="audit-info-grid">
              <div className="audit-info-item">
                <FontAwesomeIcon icon={faGlobe} className="info-icon" />
                <div>
                  <label>IP Address</label>
                  <span>{log.ip || "N/A"}</span>
                </div>
              </div>

              <div className="audit-info-item">
                <FontAwesomeIcon icon={faDesktop} className="info-icon" />
                <div>
                  <label>User Agent</label>
                  <span className="user-agent-text">
                    {log.userAgent || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Changes Section */}
          {hasChanges && (
            <div className="audit-section">
              <h3>Changes</h3>
              <div className="changes-container">
                {log.oldValues && (
                  <div className="change-block">
                    <h4>Previous Values</h4>
                    <pre className="json-display old-values">
                      {formatJson(log.oldValues)}
                    </pre>
                  </div>
                )}

                {log.newValues && (
                  <div className="change-block">
                    <h4>New Values</h4>
                    <pre className="json-display new-values">
                      {formatJson(log.newValues)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata Section */}
          {hasMetadata && (
            <div className="audit-section">
              <h3>Additional Information</h3>
              <div className="metadata-container">
                <pre className="json-display metadata">
                  {formatJson(log.metadata)}
                </pre>
              </div>
            </div>
          )}

          {/* Actor Details if available */}
          {log.actor && (
            <div className="audit-section">
              <h3>Actor Details</h3>
              <div className="audit-info-grid">
                {log.actor.firstname && (
                  <div className="audit-info-item">
                    <div>
                      <label>First Name</label>
                      <span>{log.actor.firstname}</span>
                    </div>
                  </div>
                )}

                {log.actor.lastname && (
                  <div className="audit-info-item">
                    <div>
                      <label>Last Name</label>
                      <span>{log.actor.lastname}</span>
                    </div>
                  </div>
                )}

                {log.actor.username && (
                  <div className="audit-info-item">
                    <div>
                      <label>Username</label>
                      <span>{log.actor.username}</span>
                    </div>
                  </div>
                )}

                {log.actor.email && (
                  <div className="audit-info-item">
                    <div>
                      <label>Email</label>
                      <span>{log.actor.email}</span>
                    </div>
                  </div>
                )}

                {log.actor.role && (
                  <div className="audit-info-item">
                    <div>
                      <label>Role</label>
                      <span>{log.actor.role}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="audit-modal-footer">
          <button onClick={onClose} className="audit-modal-close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal;
