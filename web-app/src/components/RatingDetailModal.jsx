import React, { useState } from "react";

const RatingDetailModal = ({ isOpen, onClose, rating }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!isOpen || !rating) return null;
  const pics = Array.isArray(rating.pictures) ? rating.pictures : [];

  return (
    <div className="audit-modal-overlay" onClick={onClose}>
      <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="audit-modal-header">
          <h2>Rating Details</h2>
          <button className="audit-modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="audit-modal-content">
          <div className="audit-section">
            <div className="audit-info-grid">
              <div className="audit-info-item">
                <div>
                  <label>User</label>
                  <span>
                    {rating.userId
                      ? `${rating.userId.firstname} ${rating.userId.lastname}`
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="audit-info-item">
                <div>
                  <label>Order</label>
                  <span>
                    {rating.orderId
                      ? rating.orderId.orderId || rating.orderId._id?.slice(-8)
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="audit-info-item">
                <div>
                  <label>Rating</label>
                  <span>{rating.rating} / 5</span>
                </div>
              </div>
              <div className="audit-info-item" style={{ gridColumn: "1 / -1" }}>
                <div>
                  <label>Comment</label>
                  <span>{rating.comment || "—"}</span>
                </div>
              </div>
              {rating.adminResponse && (
                <div
                  className="audit-info-item"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <div>
                    <label>Admin Response</label>
                    <span>{rating.adminResponse}</span>
                  </div>
                </div>
              )}
              {rating.respondedAt && (
                <div className="audit-info-item">
                  <div>
                    <label>Responded At</label>
                    <span>{new Date(rating.respondedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="audit-section">
            <h3>Pictures</h3>
            {pics.length === 0 ? (
              <div className="image-loading">
                <p>No pictures attached.</p>
              </div>
            ) : (
              <>
                <div className="proof-image-container">
                  <img
                    src={pics[Math.min(activeIdx, pics.length - 1)]}
                    alt="Rating attachment"
                    className="proof-image"
                  />
                </div>
                {pics.length > 1 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 12,
                    }}
                  >
                    {pics.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt={`Attachment ${i + 1}`}
                        onClick={() => setActiveIdx(i)}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 6,
                          cursor: "pointer",
                          outline:
                            i === activeIdx
                              ? "2px solid #2a6dff"
                              : "1px solid #ccc",
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="audit-modal-footer">
          <button
            className="audit-modal-close-btn"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingDetailModal;
