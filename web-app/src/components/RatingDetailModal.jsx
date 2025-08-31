import React, { useState } from "react";

const RatingDetailModal = ({ isOpen, onClose, rating }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!isOpen || !rating) return null;
  const pics = Array.isArray(rating.pictures) ? rating.pictures : [];

  return (
    <div className={`proof-payment-modal-container ${isOpen ? "active" : ""}`}>
      <div
        className={`modal-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />
      <div className={`proof-payment-modal-content ${isOpen ? "active" : ""}`}>
        <div className="proof-payment-modal-header">
          <div className="header-content">
            <h2>Rating Details</h2>
            <p className="modal-subtitle">Full review information</p>
          </div>
          <button className="close-button" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="proof-payment-modal-body">
          <div className="proof-details-section">
            <div className="detail-item">
              <span className="detail-label">User</span>
              <span className="detail-value">
                {rating.userId
                  ? `${rating.userId.firstname} ${rating.userId.lastname}`
                  : "—"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Order</span>
              <span className="detail-value">
                {rating.orderId
                  ? rating.orderId.orderId || rating.orderId._id?.slice(-8)
                  : "—"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Rating</span>
              <span className="detail-value">{rating.rating} / 5</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Comment</span>
              <span className="detail-value">{rating.comment || "—"}</span>
            </div>
            {rating.adminResponse && (
              <div className="detail-item">
                <span className="detail-label">Admin Response</span>
                <span className="detail-value">{rating.adminResponse}</span>
              </div>
            )}
            {rating.respondedAt && (
              <div className="detail-item">
                <span className="detail-label">Responded At</span>
                <span className="detail-value">
                  {new Date(rating.respondedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="proof-image-section">
            <div className="image-header">
              <h3>Pictures</h3>
            </div>
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
      </div>
    </div>
  );
};

export default RatingDetailModal;
