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
    } catch (_) {
      // handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`proof-payment-modal-container respond-review-modal ${
        isOpen ? "active" : ""
      }`}
    >
      <div
        className={`modal-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />
      <div className={`proof-payment-modal-content ${isOpen ? "active" : ""}`}>
        <div className="modal-header">
          <div className="header-content">
            <h2>Respond to Review</h2>
            <p className="modal-subtitle">
              Your reply will be visible to the customer
            </p>
          </div>
          <button className="close-button" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="rating-details">
            <div className="detail-item">
              <span className="detail-label">Rating</span>
              <span className="detail-value">⭐ {rating.rating} / 5</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Comment</span>
              <span className="detail-value">
                {rating.comment || "No comment provided"}
              </span>
            </div>
          </div>

          <div className="response-section">
            <div className="response-section-header">
              <h4>Admin Response</h4>
              <p>
                Add a polite and helpful response to address the customer's
                feedback.
              </p>
            </div>
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
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                type="button"
              >
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
      </div>
    </div>
  );
};

export default RespondReviewModal;
