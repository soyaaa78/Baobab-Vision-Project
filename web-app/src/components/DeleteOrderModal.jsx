import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import "../styles/DeleteOrderModal.css";

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
    <div className={`delete-order-modal-container ${isOpen ? "active" : ""}`}>
      <div
        className={`modal-overlay ${isOpen ? "active" : ""}`}
        onClick={handleClose}
      />
      <div className={`delete-order-modal-content ${isOpen ? "active" : ""}`}>
        <div className="delete-modal-header">
          <div>
            <h2>Delete Order</h2>
            <p className="delete-modal-subtitle">
              This action cannot be undone
            </p>
          </div>
          <button
            className="delete-modal-close"
            onClick={handleClose}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="delete-modal-body">
          <div className="delete-order-details">
            <div className="delete-detail-item">
              <span className="delete-detail-label">Order ID</span>
              <span className="delete-detail-value">
                {order.orderId || `${order._id?.slice(-8)}...`}
              </span>
            </div>
            <div className="delete-detail-item">
              <span className="delete-detail-label">Customer</span>
              <span className="delete-detail-value">
                {order.customer
                  ? `${order.customer.firstname} ${order.customer.lastname}`
                  : "N/A"}
              </span>
            </div>
            <div className="delete-detail-item">
              <span className="delete-detail-label">Total Amount</span>
              <span className="delete-detail-value">₱{order.totalAmount}</span>
            </div>
          </div>

          <div className="delete-confirmation">
            <h3>Confirm Deletion</h3>
            <p>Permanently delete this order record</p>
          </div>

          <div className="delete-action-buttons">
            <button
              className="delete-btn-secondary"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              className="delete-btn-primary"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal;
