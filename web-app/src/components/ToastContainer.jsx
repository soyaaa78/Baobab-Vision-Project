import React, { useEffect, useState } from "react";
import { subscribe } from "../services/toastService";
import "../styles/Toast.css";

const Toast = ({ toast, index, onClose }) => {
  const [show, setShow] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    // trigger fade-in
    const t = setTimeout(() => setShow(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast.duration) return;
    // Stagger closes slightly when multiple toasts exist
    const stagger = Math.min(index, 5) * 120; // ms
    const t = setTimeout(() => {
      setHiding(true);
      // wait for fade-out transition before removing
      const rm = setTimeout(() => onClose(toast.id), 240);
      return () => clearTimeout(rm);
    }, toast.duration + stagger);
    return () => clearTimeout(t);
  }, [toast.duration, toast.id, index, onClose]);

  const handleManualClose = () => {
    setHiding(true);
    setTimeout(() => onClose(toast.id), 240);
  };

  return (
    <div
      className={`toast toast-${toast.type} ${show ? "toast-show" : ""} ${
        hiding ? "toast-hide" : ""
      }`}
      role="status"
    >
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={handleManualClose} aria-label="Close">
        ×
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribe((evt) => {
      if (evt.clear) {
        setToasts([]);
        return;
      }
      setToasts((prev) => [...prev, evt]);
    });
  }, []);

  const handleClose = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="toast-container toast-bottom-right">
      {toasts.map((t, idx) => (
        <Toast key={t.id} toast={t} index={idx} onClose={handleClose} />
      ))}
    </div>
  );
};

export default ToastContainer;
