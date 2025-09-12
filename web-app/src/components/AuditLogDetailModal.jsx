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

  // Format date as: Sep 11, 2025, 2:30 PM
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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

  // User-friendly labels for event type and action
  const eventTypeLabels = {
    auth: "Login/Logout",
    product: "Product",
    user: "User",
    staff: "Staff",
    order: "Order",
    payment: "Payment",
    admin: "Admin",
    rating: "Rating",
  };
  const actionLabels = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    login: "Logged In",
    logout: "Logged Out",
    approve: "Approved",
    decline: "Declined",
    enable: "Enabled",
    disable: "Disabled",
    status: "Status Changed",
    ready: "Ready",
    pickup: "Picked Up",
    complete: "Completed",
    cancel: "Cancelled",
  };

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
                  <label>Date & Time</label>
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>

              <div className="audit-info-item">
                <FontAwesomeIcon icon={faUser} className="info-icon" />
                <div>
                  <label>User</label>
                  <span>{getActorDisplayName(log)}</span>
                  {log.actorRole && (
                    <span className="actor-role-detail">
                      (
                      {log.actorRole
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                      )
                    </span>
                  )}
                </div>
              </div>

              <div className="audit-info-item">
                <FontAwesomeIcon icon={faTags} className="info-icon" />
                <div>
                  <label>Activity Type</label>
                  <span
                    className="event-type-badge-detail"
                    style={{
                      backgroundColor: getEventTypeColor(log.eventType),
                    }}
                  >
                    {eventTypeLabels[log.eventType] || log.eventType}
                  </span>
                </div>
              </div>

              <div className="audit-info-item">
                <FontAwesomeIcon icon={faExchangeAlt} className="info-icon" />
                <div>
                  <label>Activity</label>
                  <span
                    className="action-badge-detail"
                    style={{ backgroundColor: getActionColor(log.action) }}
                  >
                    {actionLabels[log.action] ||
                      log.action
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>
              </div>
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
                  <label>Staff's Device</label>
                  <span className="user-agent-text">
                    {log.userAgent || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Changes Section - show only fields that changed in a table, hide columns if all values are None */}
          {hasChanges &&
            (() => {
              const oldVals = log.oldValues || {};
              const newVals = log.newValues || {};

              const excludeFields = ["createdAt", "updatedAt", "__v"];
              const allKeys = Array.from(
                new Set([...Object.keys(oldVals), ...Object.keys(newVals)])
              );

              // Deep equality check for objects/arrays
              function isDeepEqual(a, b) {
                if (a === b) return true;
                if (typeof a !== typeof b) return false;
                if (typeof a === "object" && a !== null && b !== null) {
                  // Array
                  if (Array.isArray(a) && Array.isArray(b)) {
                    if (a.length !== b.length) return false;
                    for (let i = 0; i < a.length; i++) {
                      if (!isDeepEqual(a[i], b[i])) return false;
                    }
                    return true;
                  }
                  // Object
                  const aKeys = Object.keys(a);
                  const bKeys = Object.keys(b);
                  if (aKeys.length !== bKeys.length) return false;
                  for (let k of aKeys) {
                    if (!isDeepEqual(a[k], b[k])) return false;
                  }
                  return true;
                }
                // Fallback for primitives
                return String(a) === String(b);
              }

              // Only show fields that have changed and are not excluded
              const changedRows = allKeys
                .filter((key) => {
                  if (excludeFields.includes(key)) return false;
                  if (oldVals[key] === undefined && newVals[key] === undefined)
                    return false;
                  if (isDeepEqual(oldVals[key], newVals[key])) return false;
                  return true;
                })
                .map((key) => ({
                  key,
                  oldValue:
                    oldVals[key] === undefined
                      ? "None"
                      : typeof oldVals[key] === "object"
                      ? formatJson(oldVals[key])
                      : String(oldVals[key]),
                  newValue:
                    newVals[key] === undefined
                      ? "None"
                      : typeof newVals[key] === "object"
                      ? formatJson(newVals[key])
                      : String(newVals[key]),
                }));

              // Determine if all old or new values are 'None'
              const allOldNone =
                changedRows.length > 0 &&
                changedRows.every((row) => row.oldValue === "None");
              const allNewNone =
                changedRows.length > 0 &&
                changedRows.every((row) => row.newValue === "None");

              if (changedRows.length === 0) return null;

              return (
                <div className="audit-section">
                  <h3>Changes</h3>
                  <div className="changes-table-container">
                    <table className="changes-table">
                      <thead>
                        <tr>
                          <th>Field</th>
                          {!allOldNone && <th>Old Value</th>}
                          {!allNewNone && <th>New Value</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {changedRows.map((row) => (
                          <tr key={row.key}>
                            <td>{row.key}</td>
                            {!allOldNone && <td>{row.oldValue}</td>}
                            {!allNewNone && <td>{row.newValue}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

          {/* Metadata Section - show as table */}
          {hasMetadata && (
            <div className="audit-section">
              <h3>Additional Information</h3>
              <div className="metadata-table-container">
                <table className="metadata-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(log.metadata).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>
                          {typeof value === "object"
                            ? formatJson(value)
                            : String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actor Details if available */}
          {log.actor && (
            <div className="audit-section">
              <h3>Staff Details</h3>
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
