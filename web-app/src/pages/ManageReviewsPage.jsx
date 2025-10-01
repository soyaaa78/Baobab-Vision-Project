import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { showToast } from "../services/toastService";
import "../styles/AllOrdersPage.css";
import RatingDetailModal from "../components/RatingDetailModal";
import RespondReviewModal from "../components/RespondReviewModal";

// moved RatingDetailModal to ../components/RatingDetailModal.jsx

const ManageReviewsPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [token, setToken] = useState("");
  const [ratings, setRatings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSelected, setDetailSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setToken(Cookies.get("token") || "");
  }, []);

  const fetchRatings = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${SERVER_URL}/api/ratings?index=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data.rating || res.data || [];
      setRatings(Array.isArray(list) ? list : [list]);
    } catch (e) {
      if (e.response && e.response.status === 404) {
        setRatings([]);
        showToast({ type: "info", message: "No reviews available yet." });
      } else {
        console.error("Failed to load ratings", e);
        showToast({
          type: "error",
          message: "Unable to fetch reviews. Please try again later.",
        });
      }
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [token]);

  const filtered = useMemo(() => {
    if (filter === "all") return ratings;
    if (filter === "unresponded")
      return ratings.filter((r) => !r.adminResponse);
    if (filter === "responded") return ratings.filter((r) => !!r.adminResponse);
    return ratings;
  }, [ratings, filter]);

  const openRespond = (r) => {
    setSelected(r);
    setModalOpen(true);
  };

  const openDetails = (r) => {
    setDetailSelected(r);
    setDetailOpen(true);
  };

  const submitResponse = async (id, adminResponse) => {
    try {
      await axios.patch(
        `${SERVER_URL}/api/ratings?id=${id}`,
        { adminResponse },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast({ type: "success", message: "Response saved" });
      await fetchRatings();
    } catch (e) {
      console.error("Failed to save response", e);
      showToast({ type: "error", message: "Failed to save response" });
      throw e;
    }
  };

  return (
    <div className="page" id="allorders">
      <div className="allorders-header">
        <h1>Manage Reviews</h1>
        <p>Review customer feedback and post responses</p>
      </div>

      <div className="allorders-filter-section">
        <span className="filter-label">Filter:</span>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "unresponded" ? "active" : ""}`}
            onClick={() => setFilter("unresponded")}
          >
            Unresponded
          </button>
          <button
            className={`filter-btn ${filter === "responded" ? "active" : ""}`}
            onClick={() => setFilter("responded")}
          >
            Responded
          </button>
        </div>
      </div>

      <div className="allorders-table-container">
        <table className="allorders-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Order</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Admin Response</th>
              <th>Responded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No reviews found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r._id}>
                  <td>
                    {r.userId
                      ? `${r.userId.firstname} ${r.userId.lastname}`
                      : "—"}
                  </td>
                  <td>
                    {r.orderId
                      ? r.orderId.orderId || r.orderId._id?.slice(-8)
                      : "—"}
                  </td>
                  <td>{r.rating} / 5</td>
                  <td style={{ maxWidth: 300 }}>{r.comment || "—"}</td>
                  <td style={{ maxWidth: 300 }}>{r.adminResponse || "—"}</td>
                  <td>
                    {r.respondedAt
                      ? new Date(r.respondedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    <div className="table-actions ">
                      <button
                        className="filter-btn"
                        style={{ marginRight: 8 }}
                        onClick={() => openDetails(r)}
                      >
                        View
                      </button>
                      <button
                        className="filter-btn"
                        style={{ flex: 1 }}
                        onClick={() => openRespond(r)}
                      >
                        {r.adminResponse ? "Edit Response" : "Respond"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RespondReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        rating={selected}
        onSubmit={submitResponse}
      />

      <RatingDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        rating={detailSelected}
      />
    </div>
  );
};

export default ManageReviewsPage;
