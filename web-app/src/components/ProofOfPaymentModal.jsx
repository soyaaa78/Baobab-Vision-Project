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
          {!showDeclineForm ? (
            <>
              <div className="proof-details-section">
                <div className="section-label">Reference Number</div>
                <div className="section-value">
                  {proofOfPayment.referenceNumber || "N/A"}
                </div>
              </div>

              <div className="proof-image-section">
                <div className="section-label">Payment Document</div>
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
            </>
          ) : (
            <div className="decline-form-section">
              <div className="section-label">Reason for Declining Payment</div>
              <div className="section-description">
                Please provide a clear reason for declining this payment. This
                will be visible to the customer.
              </div>
              <textarea
                id="decline-reason"
                className={`form-textarea ${reasonError ? "error" : ""}`}
                placeholder="e.g., Payment amount doesn't match, invalid receipt, suspicious transaction..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <div className="char-counter">{declineReason.length}/1000</div>
              {reasonError && <div className="form-error">{reasonError}</div>}
            </div>
          )}
        </div>

        {order?.status === "pending" && (
          <div className="modal-footer">
            {showDeclineForm ? (
              <>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowDeclineForm(false);
                    setDeclineReason("");
                    setReasonError("");
                  }}
                  disabled={isProcessing}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubmitCancellation}
                  disabled={isProcessing || !declineReason.trim()}
                  type="button"
                >
                  {isProcessing ? "Submitting..." : "Submit Cancellation"}
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-cancel"
                  onClick={handleDeclinePayment}
                  disabled={isProcessing}
                >
                  Decline Payment
                </button>
                <button
                  className="btn-primary"
                  onClick={handleAcceptPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Accept Payment"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProofOfPaymentModal;
