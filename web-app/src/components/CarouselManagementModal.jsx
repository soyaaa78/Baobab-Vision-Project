import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/CarouselManagementModal.css";
import Cookies from "js-cookie";

const CarouselManagementModal = ({ isOpen, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const token = Cookies.get("token");

  // Fetch all images from backend
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${SERVER_URL}/api/slideshow/all-images`
      );
      const imageData = response.data.map((doc) => {
        const imagePath =
          typeof doc.imagePath === "string" ? doc.imagePath : "";
        let url;
        if (!imagePath.startsWith("http")) {
          url = `${SERVER_URL}/${imagePath.replace(/^\/+/, "")}`;
        } else if (/https?:\/\/localhost(:\d+)?\//.test(imagePath)) {
          const pathPart = imagePath.replace(/https?:\/\/localhost(:\d+)?\//, "");
          url = `${SERVER_URL}/${pathPart}`;
        } else {
          url = imagePath;
        }
        return {
          id: doc._id,
          url,
          name: imagePath.split("/").pop(),
          isNew: false,
          position: doc.position ?? 0,
        };
      });
      setImages(imageData);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  }, [SERVER_URL]);

  // Fetch images when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen, fetchImages]);

  if (!isOpen) return null;

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("image", file);

        const response = await axios.post(
          `${SERVER_URL}/api/slideshow/upload-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                ((i + progressEvent.loaded / progressEvent.total) /
                  files.length) *
                  100
              );
              setUploadProgress(progress);
            },
          }
        );

        if (response.status === 201) {
          console.log(`Image ${i + 1} uploaded successfully`);
        }
      }

      // Refresh the images list after upload
      await fetchImages();
      setUploadProgress(100);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Failed to upload some images. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (id) => {
    if (!id) return;
    if (!confirm("Delete this image?")) return;
    setLoading(true);
    try {
      await axios.delete(`${SERVER_URL}/api/slideshow/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchImages();
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert("Failed to delete image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`carousel-modal-container ${isOpen ? "active" : ""}`}>
      <div className="modal-overlay" onClick={onClose} />
      <div className={`carousel-modal-content ${isOpen ? "active" : ""}`}>
        <div className="modal-header">
          <h2>Manage Gallery Images</h2>
          <button className="close-button" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Actions Section */}
          <div className="section-card">
            <h3 className="section-title">Actions</h3>
            <div className="carousel-actions">
              <button
                className="btn btn-primary"
                id="add-images-btn"
                onClick={() => fileInputRef.current?.click()}
                type="button"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Add Images"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                disabled={loading}
              />
            </div>
            {loading && uploadProgress > 0 ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {`${uploadProgress}% uploaded`}
                </span>
              </div>
            ) : null}
          </div>

          {/* Gallery Section */}
          <div className="section-card">
            <h3 className="section-title">Gallery Images</h3>
            <div className="images-grid">
              {loading && images.length === 0 ? (
                <div className="loading-state">
                  <p>Loading images...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="empty-state">
                  <p>No images uploaded yet</p>
                  <p className="empty-subtitle">
                    Click "Add Images" to get started
                  </p>
                </div>
              ) : (
                images.map((image, index) => (
                  <div key={image.id} className={`image-item`}>
                    <div className="image-container hover-controls">
                      <img
                        src={image.url}
                        alt={`Gallery ${index + 1}`}
                        onError={(e) => {
                          // Prevent infinite onError loop if fallback also fails
                          const fallback = "/placeholder-image.svg";
                          if (
                            e.currentTarget.getAttribute("data-fallback") ===
                            "1"
                          ) {
                            e.currentTarget.onerror = null; // stop further retries
                            return;
                          }
                          e.currentTarget.setAttribute("data-fallback", "1");
                          e.currentTarget.src = fallback;
                        }}
                      />
                      <div className="image-overlay">
                        <button
                          type="button"
                          className="image-delete-button"
                          onClick={() => handleDeleteImage(image.id)}
                          disabled={loading}
                          title="Delete image"
                          aria-label="Delete image"
                        >
                          {/* Trash icon (inline SVG) */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M9 3a1 1 0 0 0-1 1v1H5.5a1 1 0 1 0 0 2H6v11a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7h.5a1 1 0 1 0 0-2H16V4a1 1 0 0 0-1-1H9zm2 2h2V4h-2v1zm-2 5a1 1 0 1 1 2 0v8a1 1 0 1 1-2 0V10zm6-1a1 1 0 0 0-1 1v8a1 1 0 1 0 2 0v-8a1 1 0 0 0-1-1z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="image-info">
                      <span className="image-name">
                        {image.name || `Image ${index + 1}`}
                      </span>
                      {image.isNew && <span className="new-badge">New</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="section-card">
            <h3 className="section-title">Instructions</h3>
            <p className="help-text">
              Add images or delete an image using the button on each card.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarouselManagementModal;
