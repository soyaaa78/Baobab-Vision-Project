import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import "../../styles/eyeglass/EyeglassPage.css";
import placeholder from "../../assets/placeholder.png";
import { Edit3, ArrowLeft, Star } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const EyeglassPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [eyeglass, setEyeglass] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedLens, setSelectedLens] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [TOKEN, setToken] = useState();
  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);
  React.useEffect(() => {
    const fetchEyeglass = async () => {
      try {
        const response = await axios.get(
          `${SERVER_URL}/api/products?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        );
        setEyeglass(response.data);
      } catch (error) {
        setEyeglass(null);
      }
    };
    if (id) fetchEyeglass();
  }, [id, SERVER_URL]);

  if (!eyeglass) {
    return (
      <div className="page" id="eyeglass-page">
        <div className="eyeglass-page-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <div className="loading-text">
              <h3>Loading Product Details</h3>
              <p>Please wait while we fetch the eyeglass information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mainImage = eyeglass.imageUrls?.[selectedImageIndex] || placeholder;
  const allImages = eyeglass.imageUrls || [
    placeholder,
    placeholder,
    placeholder,
    placeholder,
  ];
  const colorOptions = eyeglass.colorOptions || [];
  const lensOptions = eyeglass.lensOptions || [
    { label: "Built-in UV400 Lenses (FREE)", price: 0, type: "builtin" },
  ];

  return (
    <>
      <div className="page" id="eyeglass-page">
        <div className="eyeglass-page-content">
          <Button className="back-btn" onClick={() => navigate("../catalogue")}>
            <ArrowLeft size={16} />
            <span>Back to Catalogue</span>
          </Button>

          <div className="eyeglass-card">
            <div className="card-header">
              <div className="card-actions">
                <button
                  className="action-btn edit"
                  onClick={() =>
                    navigate(`/dashboard/editeyeglasses/${eyeglass._id}`)
                  }
                >
                  <p>Edit</p>
                  {/* <Edit3 size={20} /> */}
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="image-section">
                <div className="main-image-container">
                  <img
                    className="main-product-image"
                    src={mainImage}
                    alt={eyeglass.name}
                  />
                  {/* <div className="image-overlay">
                    <div className="rating">
                      <Star size={16} fill="currentColor" />
                      <span>4.8</span>
                    </div>
                  </div> */}
                </div>

                <div className="thumbnail-gallery">
                  {allImages.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className={`thumbnail-item ${
                        selectedImageIndex === idx ? "active" : ""
                      }`}
                      onClick={() => setSelectedImageIndex(idx)}
                    >
                      <img src={img} alt={`View ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="details-section">
                <div className="product-header">
                  <h1 className="product-name">{eyeglass.name}</h1>
                  <div className="product-badge">Premium</div>
                </div>

                <p className="product-description">{eyeglass.description}</p>

                <div className="color-selection">
                  <h3 className="selection-title">Available Colors</h3>
                  <div className="color-options">
                    {colorOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`color-option ${
                          selectedColor === idx ? "selected" : ""
                        }`}
                        onClick={() => setSelectedColor(idx)}
                        title={opt.name}
                      >
                        <div
                          className="color-swatch"
                          style={{
                            background: (opt.colors && opt.colors[0]) || "#ccc",
                          }}
                        />
                        <span className="color-name">{opt.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lens-selection">
                  <h3 className="selection-title">
                    Lens Options <span className="required">*</span>
                  </h3>
                  <div className="lens-dropdown">
                    <select
                      value={selectedLens}
                      onChange={(e) => setSelectedLens(Number(e.target.value))}
                      className="modern-select"
                    >
                      {lensOptions.map((opt, idx) => (
                        <option key={idx} value={idx}>
                          {opt.label} {opt.price ? `(₱${opt.price})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="price-section">
                  <div className="price-container">
                    <span className="currency">₱</span>
                    <span className="price">
                      {eyeglass.price?.toLocaleString() || "0.00"}
                    </span>
                    <span className="price-label">PHP</span>
                  </div>
                  <div className="price-subtitle">Inclusive of all taxes</div>
                </div>

                <div className="action-buttons">
                  <button className="btn-primary">Add to Cart</button>
                  <button className="btn-secondary">Buy Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EyeglassPage;
