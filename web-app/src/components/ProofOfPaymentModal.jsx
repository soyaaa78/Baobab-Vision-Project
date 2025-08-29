import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const ProofOfPaymentModal = ({
  isOpen,
  onClose,
  proofOfPayment,
  order,
  onUpdateStatus,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleClose = () => {
    setImageLoading(true);
    setImageError(false);
    onClose();
  };

  const handleAcceptPayment = async () => {
    if (!order || isProcessing) return;

    setIsProcessing(true);
    try {
      await onUpdateStatus(order._id, "processing");
      handleClose();
    } catch (error) {
      console.error("Error accepting payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclinePayment = async () => {
    if (!order || isProcessing) return;

    setIsProcessing(true);
    try {
      await onUpdateStatus(order._id, "cancelled");
      handleClose();
    } catch (error) {
      console.error("Error declining payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !proofOfPayment) return null;

  return (
    <div className={`proof-payment-modal-container ${isOpen ? "active" : ""}`}>
      <div
        className={`modal-overlay ${isOpen ? "active" : ""}`}
        onClick={handleClose}
      />
      <div className={`proof-payment-modal-content ${isOpen ? "active" : ""}`}>
        <div className="proof-payment-modal-header">
          <div className="header-content">
            <h2>Proof of Payment</h2>
            <p className="modal-subtitle">Transaction Verification Document</p>
          </div>
          <button className="close-button" onClick={handleClose} type="button">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="proof-payment-modal-body">
          <div className="proof-details-section">
            <div className="detail-item">
              <span className="detail-label">Reference Number</span>
              <span className="detail-value">
                {proofOfPayment.referenceNumber || "N/A"}
              </span>
            </div>
          </div>

          <div className="proof-image-section">
            <div className="image-header">
              <h3>Payment Document</h3>
            </div>
            <div className="proof-image-container">
              {imageLoading && (
                <div className="image-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading payment document...</p>
                </div>
              )}
              {imageError && (
                <div className="image-error">
                  <div className="error-icon">⚠️</div>
                  <p>Unable to load payment document</p>
                  <button
                    className="retry-button"
                    onClick={() => {
                      setImageError(false);
                      setImageLoading(true);
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
              <img
                src={proofOfPayment.proofOfPaymentImage}
                alt="Proof of Payment Document"
                className={`proof-image ${
                  imageLoading || imageError ? "hidden" : ""
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          </div>
        </div>

        {order?.status === "pending" && (
          <div className="payment-action-section">
            <div className="action-header">
              <h3>Payment Verification</h3>
              <p>Review the payment proof and take action</p>
            </div>
            <div className="action-buttons-group">
              <button
                className="accept-payment-btn"
                onClick={handleAcceptPayment}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Accept Payment"}
              </button>
              <button
                className="decline-payment-btn"
                onClick={handleDeclinePayment}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Decline Payment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProofOfPaymentModal;
