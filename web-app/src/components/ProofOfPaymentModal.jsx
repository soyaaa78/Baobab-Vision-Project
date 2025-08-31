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
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [reasonError, setReasonError] = useState("");

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
    setShowDeclineForm(false);
    setDeclineReason("");
    setReasonError("");
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

  const handleDeclinePayment = () => {
    // Show decline reason form instead of immediately cancelling
    setShowDeclineForm(true);
  };

  const handleSubmitCancellation = async () => {
    if (!order || isProcessing) return;
    if (!declineReason.trim()) {
      setReasonError("Please provide a reason for declining the payment.");
      return;
    }
    setReasonError("");

    setIsProcessing(true);
    try {
      await onUpdateStatus(order._id, "cancelled", {
        declineReason: declineReason.trim(),
      });
      handleClose();
    } catch (error) {
      console.error("Error submitting cancellation:", error);
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
            {!showDeclineForm ? (
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
                  Decline Payment
                </button>
              </div>
            ) : (
              <div className="decline-form">
                <div className="decline-form-header">
                  <h4>Decline Payment</h4>
                  <p>
                    Please provide a clear reason for declining this payment.
                    This will be visible to the customer.
                  </p>
                </div>
                <div className="form-field">
                  <label htmlFor="decline-reason" className="form-label">
                    Reason for Declining Payment{" "}
                    <span className="required">*</span>
                  </label>
                  <textarea
                    id="decline-reason"
                    className={`form-textarea ${reasonError ? "error" : ""}`}
                    placeholder="e.g., Payment amount doesn't match, invalid receipt, suspicious transaction..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <div className="form-helper">
                    <span
                      className={`char-count ${
                        declineReason.length > 450 ? "warning" : ""
                      }`}
                    >
                      {declineReason.length}/500
                    </span>
                  </div>
                  {reasonError && (
                    <div className="form-error" role="alert">
                      <span className="error-icon">⚠️</span>
                      {reasonError}
                    </div>
                  )}
                </div>
                <div className="decline-form-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDeclineForm(false);
                      setDeclineReason("");
                      setReasonError("");
                    }}
                    disabled={isProcessing}
                    type="button"
                  >
                    <span className="btn-icon">←</span>
                    Back
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleSubmitCancellation}
                    disabled={isProcessing || !declineReason.trim()}
                    type="button"
                  >
                    {isProcessing ? (
                      <>
                        <span className="btn-spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">✕</span>
                        Submit Cancellation
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProofOfPaymentModal;
