import React, { useState, useEffect, useMemo } from "react";
import ToastContainer from "../components/ToastContainer";
import { showToast } from "../services/toastService";
import AuditLogDetailModal from "../components/AuditLogDetailModal";
import "../styles/AuditLogsPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEye, faFilter } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Cookies from "js-cookie";

const AuditLogsPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEventType, setFilterEventType] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [token, setToken] = useState("");

  // Event type options for filtering
  const eventTypes = [
    "all",
    "auth",
    "product",
    "user",
    "staff",
    "order",
    "payment",
    "admin",
    "rating",
  ];

  // Common actions for filtering
  const actions = [
    "all",
    "login",
    "logout",
    "create",
    "update",
    "delete",
    "enable",
    "disable",
    "approve",
    "decline",
    "update_status",
    "verify_otp",
  ];

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchAuditLogs();
  }, [token]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URL}/api/audit-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 100, // Get more logs for better search experience
        },
      });

      setAuditLogs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      showToast({
        type: "error",
        message: "Failed to fetch audit logs. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get display name for actor
  const getActorDisplayName = (log) => {
    if (!log.actor) return "System";

    const actor = log.actor;
    if (actor.firstname && actor.lastname) {
      return `${actor.firstname} ${actor.lastname}`;
    }
    if (actor.username) {
      return actor.username;
    }
    if (actor.email) {
      return actor.email;
    }
    return "User";
  };

  // Client-side search and filtering
  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    // Filter by event type
    if (filterEventType !== "all") {
      filtered = filtered.filter((log) => log.eventType === filterEventType);
    }

    // Filter by action
    if (filterAction !== "all") {
      filtered = filtered.filter((log) => log.action === filterAction);
    }

    // Filter by date range
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0); // Start of day
      filtered = filtered.filter((log) => new Date(log.createdAt) >= fromDate);
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((log) => new Date(log.createdAt) <= toDate);
    }

    // Search functionality - search across all relevant fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((log) => {
        const actorName = getActorDisplayName(log).toLowerCase();
        const eventType = log.eventType?.toLowerCase() || "";
        const action = log.action?.toLowerCase() || "";
        const targetModel = log.targetModel?.toLowerCase() || "";
        const targetId = log.targetId?.toString().toLowerCase() || "";
        const actorRole = log.actorRole?.toLowerCase() || "";
        const ip = log.ip?.toLowerCase() || "";
        const userAgent = log.userAgent?.toLowerCase() || "";
        const createdAt = new Date(log.createdAt)
          .toLocaleString()
          .toLowerCase();

        // Search in metadata and old/new values
        const metadataStr = JSON.stringify(log.metadata || {}).toLowerCase();
        const oldValuesStr = JSON.stringify(log.oldValues || {}).toLowerCase();
        const newValuesStr = JSON.stringify(log.newValues || {}).toLowerCase();

        return (
          actorName.includes(query) ||
          eventType.includes(query) ||
          action.includes(query) ||
          targetModel.includes(query) ||
          targetId.includes(query) ||
          actorRole.includes(query) ||
          ip.includes(query) ||
          userAgent.includes(query) ||
          createdAt.includes(query) ||
          metadataStr.includes(query) ||
          oldValuesStr.includes(query) ||
          newValuesStr.includes(query)
        );
      });
    }

    return filtered;
  }, [
    auditLogs,
    searchQuery,
    filterEventType,
    filterAction,
    filterDateFrom,
    filterDateTo,
  ]);

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

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

  // Map event types to user-friendly names
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
  const getEventTypeColor = (eventType) => {
    const colors = {
      auth: "#3b82f6",
      product: "#10b981",
      user: "#8b5cf6",
      staff: "#f59e0b",
      order: "#ef4444",
      payment: "#06b6d4",
      admin: "#6b7280",
      rating: "#8b5a3c",
    };
    return colors[eventType] || "#6b7280";
  };

  // Map actions to user-friendly names
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
    update_status: "Status Changed",
    verify_otp: "OTP Verified",
  };
  const getActionColor = (action) => {
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
      update_status: "#3b82f6",
      verify_otp: "#10b981",
    };
    return colors[action] || "#6b7280";
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterEventType("all");
    setFilterAction("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const hasActiveFilters =
    searchQuery ||
    filterEventType !== "all" ||
    filterAction !== "all" ||
    filterDateFrom ||
    filterDateTo;

  if (loading) {
    return (
      <div className="page" id="auditlogs">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page" id="auditlogs">
      <ToastContainer />

      <div className="auditlogs-header">
        <h1>Audit Logs</h1>
        <p>Monitor and track all system activities and user actions</p>
      </div>

      {/* Search and Filter Section */}
      <div className="auditlogs-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search audit logs (staff, event, activity, target, IP, etc.)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="eventTypeFilter">
              <FontAwesomeIcon icon={faFilter} />
              Event Type
            </label>
            <select
              id="eventTypeFilter"
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="filter-select"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all"
                    ? "All Types"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="actionFilter">
              <FontAwesomeIcon icon={faFilter} />
              Action
            </label>
            <select
              id="actionFilter"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="filter-select"
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action === "all"
                    ? "All Actions"
                    : action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="dateFromFilter">
              <FontAwesomeIcon icon={faFilter} />
              From Date
            </label>
            <input
              id="dateFromFilter"
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="dateToFilter">
              <FontAwesomeIcon icon={faFilter} />
              To Date
            </label>
            <input
              id="dateToFilter"
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="filter-select"
            />
          </div>

          {hasActiveFilters && (
            <div className="filter-group">
              <label>&nbsp;</label>
              <button onClick={resetFilters} className="reset-filters-btn">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {filteredLogs.length} of {auditLogs.length} audit logs
          {searchQuery && ` for "${searchQuery}"`}
          {(filterEventType !== "all" ||
            filterAction !== "all" ||
            filterDateFrom ||
            filterDateTo) &&
            ` with applied filters`}
        </p>
      </div>

      {/* Audit Logs Table */}
      <div className="auditlogs-table-container">
        <table className="auditlogs-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Staff</th>
              <th>Activity Type</th>
              <th>Activity</th>
              <th>IP Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {hasActiveFilters
                    ? "No audit logs match your search criteria"
                    : "No audit logs found"}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log._id} className="log-row">
                  <td className="date-cell">{formatDate(log.createdAt)}</td>
                  <td className="actor-cell">
                    <div className="actor-info">
                      <span className="actor-name">
                        {getActorDisplayName(log)}
                      </span>
                      {log.actorRole && (
                        <span className="actor-role">
                          {log.actorRole
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="event-type-cell">
                    <span
                      className="event-type-badge"
                      style={{
                        backgroundColor: getEventTypeColor(log.eventType),
                      }}
                    >
                      {eventTypeLabels[log.eventType] || log.eventType}
                    </span>
                  </td>
                  <td className="action-cell">
                    <span
                      className="action-badge"
                      style={{ backgroundColor: getActionColor(log.action) }}
                    >
                      {actionLabels[log.action] ||
                        log.action
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="ip-cell">{log.ip || "N/A"}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="view-btn"
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Log Detail Modal */}
      <AuditLogDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        log={selectedLog}
        getActorDisplayName={getActorDisplayName}
      />
    </div>
  );
};

export default AuditLogsPage;
