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

  // Log when color selection changes
  useEffect(() => {
    if (eyeglass && eyeglass.colorOptions) {
      console.log("=== COLOR SELECTION CHANGED ===");
      console.log("Selected color index:", selectedColor);
      console.log(
        "Selected color option:",
        eyeglass.colorOptions[selectedColor]
      );
      console.log(
        "New first image URL:",
        eyeglass.colorOptions[selectedColor]?.imageUrl
      );
      console.log("================================");
    }
  }, [selectedColor, eyeglass]);

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
        console.log("Eyeglass API response:", response.data);
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

  // Prepare images and color options
  const colorOptions = eyeglass.colorOptions || [];

  // First image should be from selected color option, fallback to first imageUrl or placeholder
  let firstImage = placeholder;
  if (colorOptions.length > 0 && colorOptions[selectedColor]?.imageUrl) {
    firstImage = colorOptions[selectedColor].imageUrl;
    console.log(
      `First image set from color option ${selectedColor}:`,
      firstImage
    );
    console.log("Selected color option:", colorOptions[selectedColor]);
  } else if (eyeglass.imageUrls && eyeglass.imageUrls.length > 0) {
    // Fallback to first image from imageUrls if color option doesn't have imageUrl
    firstImage = eyeglass.imageUrls[0];
    console.log("First image using fallback from imageUrls[0]:", firstImage);
  } else {
    console.log("First image using placeholder:", firstImage);
    console.log("Color options available:", colorOptions.length);
    console.log("Selected color index:", selectedColor);
    if (colorOptions.length > 0) {
      console.log("First color option object:", colorOptions[selectedColor]);
      console.log(
        "Available properties in color option:",
        Object.keys(colorOptions[selectedColor] || {})
      );
      console.log("imageurl property:", colorOptions[selectedColor]?.imageurl);
      console.log("imageUrl property:", colorOptions[selectedColor]?.imageUrl);
      console.log(
        "image_url property:",
        colorOptions[selectedColor]?.image_url
      );
      console.log("image property:", colorOptions[selectedColor]?.image);
    }
  }

  // Rest of images from data.imageUrls
  const restImages = eyeglass.imageUrls || [];
  console.log("Rest images from imageUrls:", restImages);

  // Combine: first image + rest of images
  const allImages = [firstImage, ...restImages];
  console.log("All images combined:", allImages);
  const lensOptions = eyeglass.lensOptions || [
    { label: "Built-in UV400 Lenses (FREE)", price: 0, type: "builtin" },
  ];

  // Main image logic: if first image and color selected, tint it
  let mainImage = allImages[selectedImageIndex] || placeholder;

  // If the first image is selected and a color is selected, apply a color overlay
  const isFirstImage = selectedImageIndex === 0 && colorOptions[selectedColor];

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
                <div
                  className="main-image-container"
                  style={{ position: "relative" }}
                >
                  <img
                    className="main-product-image"
                    src={mainImage}
                    alt={eyeglass.name}
                    style={
                      isFirstImage
                        ? {
                            boxShadow: `0 0 0 6px ${
                              colorOptions[selectedColor]?.colors?.[0] || "#ccc"
                            }44`,
                            background:
                              colorOptions[selectedColor]?.colors?.[0] ||
                              undefined,
                            borderRadius: "12px",
                            transition: "box-shadow 0.3s, background 0.3s",
                          }
                        : {}
                    }
                  />
                </div>

                <div className="thumbnail-gallery">
                  {allImages.map((img, idx) => (
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
                        onClick={() => {
                          setSelectedColor(idx);
                          setSelectedImageIndex(0); // Reset to first image when color changes
                        }}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EyeglassPage;
