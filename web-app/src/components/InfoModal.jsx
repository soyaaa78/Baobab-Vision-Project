import Button from "./Button";
// Minimal icons without external deps

const variantConfig = {
  success: {
    icon: "✓",
    iconClass: "success",
    titleClass: "success",
    severity: "low",
  },
  error: {
    icon: "!",
    iconClass: "danger",
    titleClass: "error",
    severity: "high",
  },
  info: {
    icon: "i",
    iconClass: "default",
    titleClass: "info",
    severity: "medium",
  },
};

const InfoModal = ({
  isOpen,
  title = "",
  message = "",
  variant = "info",
  primaryText = "OK",
  onClose,
  onPrimary,
  loading = false,
}) => {
  if (!isOpen) return null;
  const cfg = variantConfig[variant] || variantConfig.info;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleOverlayClick}>
      <div className={`confirmation-modal ${cfg.severity}`}>
        <div className="confirmation-modal-header">
          <div className={`modal-icon ${cfg.iconClass}`}>{cfg.icon}</div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="confirmation-modal-content">
          {title && <h2 className="modal-title">{title}</h2>}
          {message && <p className="modal-description">{message}</p>}
        </div>

        <div className="confirmation-modal-actions">
          <Button onClick={onClose} className="cancel-btn" disabled={loading}>
            Close
          </Button>
          {onPrimary && (
            <Button
              onClick={onPrimary}
              className={`confirm-btn ${cfg.iconClass}`}
              disabled={loading}
            >
              {loading ? "Processing..." : primaryText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
