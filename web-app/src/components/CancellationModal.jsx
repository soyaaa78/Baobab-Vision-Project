import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCommentDots,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

const CancellationModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleAcceptCancellation = async () => {
    if (!order || isProcessing) return;

    setIsProcessing(true);
    try {
      await onUpdateStatus(order._id, "cancelled");
      handleClose();
    } catch (error) {
      console.error("Error accepting cancellation:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineCancellation = async () => {
    if (!order || isProcessing) return;

    setIsProcessing(true);
    try {
      await onUpdateStatus(order._id, "processing");
      handleClose();
    } catch (error) {
      console.error("Error declining cancellation:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className={`cancellation-modal-container ${isOpen ? "active" : ""}`}>
      <div
        className={`modal-overlay ${isOpen ? "active" : ""}`}
        onClick={handleClose}
      />
      <div className={`cancellation-modal-content ${isOpen ? "active" : ""}`}>
        <div className="cancellation-modal-header">
          <div className="header-content">
            <h2>Cancellation Request</h2>
            <p className="modal-subtitle">Order Cancellation Details</p>
          </div>
          <button className="close-button" onClick={handleClose} type="button">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="cancellation-modal-body">
          <div className="cancellation-details-section">
            <div
              className="detail-item"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span
                className="detail-label"
                style={{ flex: "0 0 140px", whiteSpace: "nowrap" }}
              >
                Order ID
              </span>
              <span
                className="detail-value"
                style={{
                  flex: "1 1 auto",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {order.orderId || `${order._id?.slice(-8)}...`}
              </span>
            </div>
            <div
              className="detail-item"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span
                className="detail-label"
                style={{ flex: "0 0 140px", whiteSpace: "nowrap" }}
              >
                Customer
              </span>
              <span
                className="detail-value"
                style={{
                  flex: "1 1 auto",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {order.customer
                  ? `${order.customer.firstname} ${order.customer.lastname}`
                  : "N/A"}
              </span>
            </div>
            <div
              className="detail-item"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span
                className="detail-label"
                style={{ flex: "0 0 140px", whiteSpace: "nowrap" }}
              >
                Total Amount
              </span>
              <span
                className="detail-value"
                style={{
                  flex: "1 1 auto",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                ₱{order.totalAmount}
              </span>
            </div>
            <div
              className="detail-item"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span
                className="detail-label"
                style={{ flex: "0 0 140px", whiteSpace: "nowrap" }}
              >
                Status
              </span>
              <span
                className="detail-value status-pending"
                style={{
                  flex: "0 0 auto",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                Cancellation Pending
              </span>
            </div>
          </div>

          <div className="cancellation-reason-section">
            <div className="reason-header">
              <h3>
                <FontAwesomeIcon
                  icon={faCommentDots}
                  className="section-leading-icon"
                />
                Cancellation Reason
              </h3>
            </div>
            <div className="reason-content">
              {order.cancellationReason ? (
                <p className="reason-text">{order.cancellationReason}</p>
              ) : (
                <p className="no-reason">No reason provided</p>
              )}
            </div>
          </div>

          <div className="order-summary-section">
            <div className="summary-header">
              <h3>
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  className="section-leading-icon"
                />
                Order Summary
              </h3>
            </div>
            <div className="products-list">
              {order.products?.map((product, idx) => {
                const selectedColor = product.productId?.colorOptions?.find(
                  (color) => color._id === product.color
                );
                const selectedLens = product.productId?.lensOptions?.find(
                  (lens) => lens._id === product.lens
                );

                return (
                  <div key={idx} className="product-item">
                    <div className="product-info">
                      <span className="product-name">
                        {product.productId?.name || "Unknown Product"}
                      </span>
                      <span className="product-details">
                        Color: {selectedColor?.name || "Unknown"} | Lens:{" "}
                        {selectedLens?.label || "Unknown"} | Qty:{" "}
                        {product.quantity}
                      </span>
                    </div>
                    <span className="product-price">₱{product.price}</span>
                  </div>
                );
              }) || <p className="no-products">No products found</p>}
            </div>
          </div>

          {order?.status === "cancelled_pending" && (
            <div className="cancellation-action-section">
              <div className="action-header">
                <h3>Cancellation Review</h3>
                <p>Review the cancellation request and take action</p>
              </div>
              <div className="action-buttons-group">
                <button
                  className="accept-cancellation-btn"
                  onClick={handleAcceptCancellation}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Accept Cancellation"}
                </button>
                <button
                  className="decline-cancellation-btn"
                  onClick={handleDeclineCancellation}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Decline Cancellation"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
