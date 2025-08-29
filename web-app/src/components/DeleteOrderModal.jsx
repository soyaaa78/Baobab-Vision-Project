import React, { useState } from "react";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const DeleteOrderModal = ({ isOpen, onClose, order, onDelete }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !order) return null;

  const handleClose = () => {
    if (isProcessing) return;
    onClose();
  };

  const handleDelete = async () => {
    if (!order || isProcessing) return;
    setIsProcessing(true);
    try {
      await onDelete(order._id);
      onClose();
    } catch (err) {
      console.error("Error deleting order:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`proof-payment-modal-container ${isOpen ? "active" : ""}`}>
      <div
        className={`modal-overlay ${isOpen ? "active" : ""}`}
        onClick={handleClose}
      />
      <div
        className={`proof-payment-modal-content ${isOpen ? "active" : ""}`}
        style={{ maxHeight: "60vh", height: "auto" }}
      >
        <div className="proof-payment-modal-header">
          <div className="header-content">
            <h2>Delete Order</h2>
            <p className="modal-subtitle">This action cannot be undone</p>
          </div>
          <button className="close-button" onClick={handleClose} type="button">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="proof-payment-modal-body" style={{ overflowY: "auto" }}>
          <div className="proof-details-section">
            <div className="detail-item">
              <span className="detail-label">Order ID</span>
              <span className="detail-value">
                {order.orderId || `${order._id?.slice(-8)}...`}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Customer</span>
              <span className="detail-value">
                {order.customer
                  ? `${order.customer.firstname} ${order.customer.lastname}`
                  : "N/A"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Amount</span>
              <span className="detail-value">₱{order.totalAmount}</span>
            </div>
          </div>

          <div className="payment-action-section">
            <div className="action-header">
              <h3>Confirm Deletion</h3>
              <p>Permanently delete this order record</p>
            </div>
            <div className="action-buttons-group">
              <button
                className="decline-payment-btn" // reuse red styling
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? "Deleting..." : "Delete Order"}
              </button>
              <button
                className="accept-payment-btn"
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal;
