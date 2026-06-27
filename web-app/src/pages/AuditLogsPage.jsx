import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ToastContainer from "../components/ToastContainer";
import { showToast } from "../services/toastService";
import AuditLogDetailModal from "../components/AuditLogDetailModal";
import "../styles/AuditLogsPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faFilter,
  faPrint,
  faFilePdf,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Cookies from "js-cookie";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import baobablogo from "../assets/bvfull.png";
import {
  buildAuditChangeExportText,
  buildAuditMetadataExportText,
  buildAuditTargetExportText,
} from "../utils/auditExportFormat";
import {
  getActionCategoriesForEventType,
  getActionCategoryLabel,
} from "../utils/auditActionTaxonomy";
import { getPdfExportButtonLabel } from "../utils/pdfExportUi";

const AuditLogsPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filterEventType, setFilterEventType] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [token, setToken] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printRef = useRef(null);
  const contentRef = useRef(null);

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

  // Action category options derived from the taxonomy for the selected event type.
  const actionCategoryOptions = useMemo(
    () => getActionCategoriesForEventType(filterEventType),
    [filterEventType]
  );

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  const fetchAuditLogs = useCallback(async () => {
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
      if (error.response && error.response.status === 404) {
        setAuditLogs([]);
        showToast({ type: "info", message: "No audit logs available yet." });
      } else {
        console.error("Error fetching audit logs:", error);
        showToast({
          type: "error",
          message: "Unable to fetch audit logs. Please try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [SERVER_URL, token]);

  useEffect(() => {
    if (!token) return;
    fetchAuditLogs();
  }, [token, fetchAuditLogs]);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterEventType, filterAction, filterDateFrom, filterDateTo]);

  // Client-side search and filtering
  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    // Filter by event type
    if (filterEventType !== "all") {
      filtered = filtered.filter((log) => log.eventType === filterEventType);
    }

    // Filter by action category (canonical token provided by the backend)
    if (filterAction !== "all") {
      filtered = filtered.filter((log) => log.actionCategory === filterAction);
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
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
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
    debouncedSearchQuery,
    filterEventType,
    filterAction,
    filterDateFrom,
    filterDateTo,
  ]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;

  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const getActorRoleDisplay = (role) => {
    if (!role) return "N/A";
    if (role === "staff_order") return "Order Staff";
    if (role === "staff_product") return "Product Staff";
    return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

  const handlePrint = () => window.print();

  const loadImageAsBase64 = (url) =>
    fetch(url)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          })
      );

  // Descriptive action text shown in the table/export "Action" column.
  const getActionDisplayText = (log) =>
    actionLabels[log.action] ||
    (log.action
      ? log.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "N/A");

  const handleExportPDF = async () => {
    if (isExportingPdf) return;

    setIsExportingPdf(true);
    try {
      const logoBase64 = await loadImageAsBase64(baobablogo);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const generatedAt = new Date().toLocaleString();

      const filterParts = [];
      if (filterEventType !== "all") filterParts.push(`Event: ${filterEventType}`);
      if (filterAction !== "all")
        filterParts.push(`Action: ${getActionCategoryLabel(filterAction)}`);
      if (filterDateFrom) filterParts.push(`From: ${filterDateFrom}`);
      if (filterDateTo) filterParts.push(`To: ${filterDateTo}`);
      const filterText = filterParts.length ? `Filters: ${filterParts.join(" | ")}` : "";

      const head = [
        [
          "Date & Time",
          "Staff",
          "Role",
          "Type",
          "Action",
          "Target",
          "IP",
          "Device",
          "Metadata",
          "Changes",
        ],
      ];

      const body =
        filteredLogs.length === 0
          ? [
              [
                {
                  content: "No audit logs found",
                  colSpan: 10,
                  styles: { halign: "center" },
                },
              ],
            ]
          : filteredLogs.map((log) => [
              formatDate(log.createdAt),
              getActorDisplayName(log),
              getActorRoleDisplay(log.actorRole),
              eventTypeLabels[log.eventType] || log.eventType || "N/A",
              getActionDisplayText(log),
              buildAuditTargetExportText(log),
              log.ip || "N/A",
              log.userAgent || "N/A",
              buildAuditMetadataExportText(log),
              buildAuditChangeExportText(log),
            ]);

      const drawPageDecorators = () => {
        // Header band
        pdf.setFillColor(252, 247, 242);
        pdf.rect(0, 0, pageWidth, 30, "F");

        pdf.addImage(logoBase64, "PNG", 8, 6, 58, 19);

        pdf.setTextColor(139, 90, 60);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);
        pdf.text("AUDIT LOG REPORT", pageWidth - 8, 14, { align: "right" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Generated: ${generatedAt}`, pageWidth - 8, 21, { align: "right" });
        if (filterText) {
          pdf.text(filterText, pageWidth - 8, 27, { align: "right" });
        }

        pdf.setFillColor(139, 90, 60);
        pdf.rect(0, 30, pageWidth, 1.5, "F");
        pdf.setFillColor(234, 182, 118);
        pdf.rect(0, 31.5, pageWidth, 0.8, "F");

        // Footer band
        pdf.setFillColor(252, 247, 242);
        pdf.rect(0, pageHeight - 12, pageWidth, 12, "F");
        pdf.setFillColor(139, 90, 60);
        pdf.rect(0, pageHeight - 12, pageWidth, 0.8, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(139, 90, 60);
        pdf.text(
          "Baobab Vision Eyewear - CONFIDENTIAL - FOR INTERNAL USE ONLY",
          8,
          pageHeight - 4.5
        );

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          `Records: ${filteredLogs.length} shown of ${auditLogs.length} total`,
          pageWidth / 2,
          pageHeight - 4.5,
          { align: "center" }
        );
        const pageNumber = pdf.internal.getNumberOfPages();
        pdf.text(`Page ${pageNumber}`, pageWidth - 8, pageHeight - 4.5, {
          align: "right",
        });
      };

      autoTable(pdf, {
        head,
        body,
        margin: { top: 34, bottom: 14, left: 8, right: 8 },
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          overflow: "linebreak",
          valign: "top",
        },
        headStyles: {
          fillColor: [139, 90, 60],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        // Relative widths summing to ~281mm usable width (A4 landscape - 16mm margins).
        columnStyles: {
          0: { cellWidth: 26 }, // Date & Time
          1: { cellWidth: 26 }, // Staff
          2: { cellWidth: 20 }, // Role
          3: { cellWidth: 16 }, // Type
          4: { cellWidth: 24 }, // Action
          5: { cellWidth: 28 }, // Target
          6: { cellWidth: 22 }, // IP
          7: { cellWidth: 40 }, // Device (user-agent, capped + wraps)
          8: { cellWidth: 39 }, // Metadata
          9: { cellWidth: 40 }, // Changes
        },
        didDrawPage: drawPageDecorators,
      });

      // Backfill "Page N of M" now that the total page count is known.
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i += 1) {
        pdf.setPage(i);
        pdf.setFillColor(252, 247, 242);
        pdf.rect(pageWidth - 40, pageHeight - 9, 32, 6, "F");
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 8, pageHeight - 4.5, {
          align: "right",
        });
      }

      const dateStr = new Date().toISOString().split("T")[0];
      pdf.save(`audit-log-${dateStr}.pdf`);
    } catch {
      showToast({ type: "error", message: "Failed to export PDF. Please try again." });
    } finally {
      setIsExportingPdf(false);
    }
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
        <div className="auditlogs-header">
          <div>
            <h1>Audit Logs</h1>
            <p>Monitor and track all system activities and user actions</p>
          </div>
        </div>
        <div className="auditlogs-table-container">
          <table className="auditlogs-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Actor</th>
                <th>Event Type</th>
                <th>Action</th>
                <th>Target</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="log-row">
                  <td className="date-cell"><div className="skeleton" style={{ width: '140px', height: '16px' }} /></td>
                  <td className="actor-cell">
                    <div className="actor-info">
                      <div className="skeleton" style={{ width: '100px', height: '16px' }} />
                      <div className="skeleton" style={{ width: '60px', height: '14px', marginTop: '4px' }} />
                    </div>
                  </td>
                  <td className="event-type-cell"><div className="skeleton" style={{ width: '70px', height: '24px', borderRadius: '20px' }} /></td>
                  <td className="action-cell"><div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '20px' }} /></td>
                  <td className="target-cell">
                    <div className="skeleton" style={{ width: '80px', height: '16px' }} />
                    <div className="skeleton" style={{ width: '100px', height: '14px', marginTop: '4px' }} />
                  </td>
                  <td className="ip-cell"><div className="skeleton" style={{ width: '90px', height: '16px' }} /></td>
                  <td className="actions-cell"><div className="skeleton" style={{ width: '70px', height: '32px', borderRadius: '6px' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="page" id="auditlogs">
      <ToastContainer />

      <div ref={printRef}>
        <div className="print-header">
          <div className="print-header-top">
            <img src={baobablogo} alt="Baobab Vision" className="print-logo" />
            <div className="print-header-info">
              <h2>Audit Log Report</h2>
              <p className="print-generated">Generated: {new Date().toLocaleString()}</p>
              {hasActiveFilters && (
                <p className="print-filters">
                  Filters:{filterEventType !== "all" ? ` Event: ${filterEventType}` : ""}
                  {filterAction !== "all" ? ` | Action: ${filterAction}` : ""}
                  {filterDateFrom ? ` | From: ${filterDateFrom}` : ""}
                  {filterDateTo ? ` | To: ${filterDateTo}` : ""}
                </p>
              )}
            </div>
          </div>
          <div className="print-meta-bar">
            <span>Records shown: {filteredLogs.length} of {auditLogs.length}</span>
            <span>CONFIDENTIAL - FOR INTERNAL USE ONLY</span>
          </div>
        </div>

      <div className="auditlogs-header">
        <div>
          <h1>Audit Logs</h1>
          <p>Monitor and track all system activities and user actions</p>
        </div>
        <div className="auditlogs-header-actions">
          <button onClick={handlePrint} className="export-btn print-btn-action">
            <FontAwesomeIcon icon={faPrint} /> Print
          </button>
          <button
            onClick={handleExportPDF}
            className="export-btn pdf-btn-action"
            disabled={isExportingPdf}
          >
            <FontAwesomeIcon icon={isExportingPdf ? faSpinner : faFilePdf} spin={isExportingPdf} />
            {getPdfExportButtonLabel(isExportingPdf)}
          </button>
        </div>
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
              onChange={(e) => {
                const nextEventType = e.target.value;
                setFilterEventType(nextEventType);
                // Smart-preserve the selected action if the new event type still
                // offers it; otherwise reset to "all".
                const nextCategories =
                  getActionCategoriesForEventType(nextEventType);
                if (
                  filterAction !== "all" &&
                  !nextCategories.includes(filterAction)
                ) {
                  setFilterAction("all");
                }
              }}
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
              <option value="all">All Actions</option>
              {actionCategoryOptions.map((token) => (
                <option key={token} value={token}>
                  {getActionCategoryLabel(token)}
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
          Showing {currentLogs.length} of {filteredLogs.length} matching logs
          {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
          {(filterEventType !== "all" ||
            filterAction !== "all" ||
            filterDateFrom ||
            filterDateTo) &&
            ` with applied filters`}
        </p>
      </div>

      {/* Audit Logs Table */}
      <div className="auditlogs-table-container" ref={contentRef}>
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
            {currentLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {hasActiveFilters
                    ? "No audit logs match your search criteria"
                    : "No audit logs found"}
                </td>
              </tr>
            ) : (
              currentLogs.map((log) => (
                <tr key={log._id} className="log-row">
                  <td className="date-cell">{formatDate(log.createdAt)}</td>
                  <td className="actor-cell">
                    <div className="actor-info">
                      <span className="actor-name">
                        {getActorDisplayName(log)}
                      </span>
                      {log.actorRole && (
                        <span className="actor-role">
                          {getActorRoleDisplay(log.actorRole)}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="items-per-page-select"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      )}

      </div>{/* end printRef */}

      {/* Audit Log Detail Modal */}
      <AuditLogDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        log={selectedLog}
        getActorDisplayName={getActorDisplayName}
        getActorRoleDisplay={getActorRoleDisplay}
      />
    </div>
  );
};

export default AuditLogsPage;
