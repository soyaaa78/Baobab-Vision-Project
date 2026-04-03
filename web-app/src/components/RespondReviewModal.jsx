import React, { useEffect, useState } from "react";
import "../styles/RespondReviewModal.css";

const RespondReviewModal = ({ isOpen, onClose, rating, onSubmit }) => {
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rating) setResponse(rating.adminResponse || "");
  }, [rating]);

  if (!isOpen || !rating) return null;

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit(rating._id, response.trim());
      onClose();
    } catch {
      // handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="audit-modal-overlay" onClick={onClose}>
      <div
        className="audit-modal respond-review-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="audit-modal-header">
          <h2>Respond to Review</h2>
          <button className="audit-modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="audit-modal-content">
          <div className="audit-section">
            <div className="audit-info-grid">
              <div className="audit-info-item">
                <div>
                  <label>Rating</label>
                  <span>⭐ {rating.rating} / 5</span>
                </div>
              </div>
              <div className="audit-info-item" style={{ gridColumn: "1 / -1" }}>
                <div>
                  <label>Comment</label>
                  <span>{rating.comment || "No comment provided"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="audit-section">
            <h3>Admin Response</h3>
            <p style={{ marginTop: -4, color: "#6b7280" }}>
              Add a polite and helpful response to address the customer's
              feedback.
            </p>
            <div className="form-field">
              <textarea
                className="form-textarea"
                placeholder="Thank you for your feedback! We appreciate you taking the time to share your experience..."
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                maxLength={1000}
              />
              <div className="form-helper">
                <span
                  className={`char-count ${
                    response.length > 800 ? "warning" : ""
                  }`}
                >
                  {response.length}/1000
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="audit-modal-footer" style={{ gap: 12 }}>
          <button className="btn btn-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className={`btn btn-primary ${saving ? "saving" : ""}`}
            onClick={handleSubmit}
            disabled={saving}
            type="button"
          >
            {saving
              ? "Saving..."
              : rating.adminResponse
              ? "Update Response"
              : "Post Response"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RespondReviewModal;
