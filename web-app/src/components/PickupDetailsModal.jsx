import React, { useEffect, useState } from "react";
import "../styles/PickupDetailsModal.css";

const PickupDetailsModal = ({ isOpen, onClose, onConfirm }) => {
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLocation("");
      setDateTime("");
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!location.trim() || !dateTime) return;
    try {
      setSubmitting(true);
      await onConfirm({
        pickupLocation: location.trim(),
        pickupDateTime: dateTime,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const minDateTimeLocal = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  };

  return (
    <div className="pickup-modal-overlay" onClick={onClose}>
      <div className="pickup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pickup-modal-header">
          <h3>Set Pickup Details</h3>
          <button className="pickup-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="pickup-modal-body">
          <div className="pickup-field">
            <label htmlFor="pickupLocation">Pickup Location</label>
            <input
              id="pickupLocation"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter pickup location"
              required
            />
          </div>

          <div className="pickup-field">
            <label htmlFor="pickupDateTime">Pickup Date & Time</label>
            <input
              id="pickupDateTime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              min={minDateTimeLocal()}
              required
            />
          </div>
        </div>

        <div className="pickup-modal-footer">
          <button
            className="pickup-btn secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="pickup-btn primary"
            onClick={handleConfirm}
            disabled={!location.trim() || !dateTime || submitting}
          >
            {submitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupDetailsModal;
