import React from "react";
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  X,
  Trash2,
  Ban,
  UserCheck,
} from "lucide-react";
import Button from "./Button";
import "../styles/ConfirmationModal.css";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  itemType,
  itemName,
  userDetails, // New prop for user object with firstname, lastname, username
  loading = false,
}) => {
  if (!isOpen) return null;

  // Helper function to get display name
  const getDisplayName = () => {
    if (userDetails) {
      const { firstname, lastname, username } = userDetails;
      if (firstname && lastname) {
        return `${firstname} ${lastname} (${username})`;
      }
      return username;
    }
    return itemName;
  };

  const getActionConfig = () => {
    switch (action) {
      case "Delete":
        return {
          icon: <Trash2 size={24} />,
          iconClass: "delete",
          title: `Delete ${itemType}`,
          description: `You are about to permanently delete this ${itemType.toLowerCase()}.`,
          warning:
            "This action cannot be undone. All data associated with this account will be permanently removed.",
          buttonText: "Delete",
          buttonClass: "delete",
          severity: "high",
        };
      case "Disable":
        return {
          icon: <Ban size={24} />,
          iconClass: "disable",
          title: `Disable ${itemType}`,
          description: `You are about to disable this ${itemType.toLowerCase()}.`,
          warning:
            "The account will be inaccessible until re-enabled. This action is reversible.",
          buttonText: "Disable",
          buttonClass: "disable",
          severity: "medium",
        };
      case "Enable":
        return {
          icon: <UserCheck size={24} />,
          iconClass: "enable",
          title: `Enable ${itemType}`,
          description: `You are about to enable this ${itemType.toLowerCase()}.`,
          warning:
            "The account will regain access to the system. This action is reversible.",
          buttonText: "Enable",
          buttonClass: "enable",
          severity: "low",
        };
      default:
        return {
          icon: <AlertTriangle size={24} />,
          iconClass: "default",
          title: `${action} ${itemType}`,
          description: `You are about to ${action.toLowerCase()} this ${itemType.toLowerCase()}.`,
          warning: "Please confirm this action.",
          buttonText: action,
          buttonClass: "default",
          severity: "medium",
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = () => {
    onConfirm();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleOverlayClick}>
      <div className={`confirmation-modal ${config.severity}`}>
        <div className="confirmation-modal-header">
          <div className={`modal-icon ${config.iconClass}`}>{config.icon}</div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="confirmation-modal-content">
          <h2 className="modal-title">{config.title}</h2>

          {(itemName || userDetails) && (
            <div className="item-info">
              <p className="item-name">"{getDisplayName()}"</p>
            </div>
          )}

          <p className="modal-description">{config.description}</p>

          <div className={`modal-warning ${config.severity}`}>
            <div className="warning-icon">
              {config.severity === "high" ? (
                <AlertTriangle size={16} />
              ) : config.severity === "medium" ? (
                <Shield size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
            </div>
            <p className="warning-text">{config.warning}</p>
          </div>
        </div>

        <div className="confirmation-modal-actions">
          <Button onClick={onClose} className="cancel-btn" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={`confirm-btn ${config.buttonClass}`}
            disabled={loading}
          >
            {loading ? "Processing..." : config.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
