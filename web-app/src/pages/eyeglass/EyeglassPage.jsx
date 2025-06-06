import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import "../../styles/eyeglass/EyeglassPage.css";
import placeholder from "../../assets/placeholder.png";
import axios from "axios";

const EyeglassPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [eyeglass, setEyeglass] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedLens, setSelectedLens] = useState(0);

  React.useEffect(() => {
    const fetchEyeglass = async () => {
      try {
        const response = await axios.get(
          `${SERVER_URL}/api/productRoutes?id=${id}`
        );
        setEyeglass(response.data);
      } catch (error) {
        setEyeglass(null);
      }
    };
    if (id) fetchEyeglass();
  }, [id, SERVER_URL]);

  if (!eyeglass) {
    return <div>Loading...</div>;
  }

  const mainImage = eyeglass.imageUrls?.[0] || placeholder;
  const tertiaryImages = eyeglass.imageUrls?.slice(1, 4) || [
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
      <div className="page" id="edit-eyeglass">
        <div className="edit-eyeglass-content">
          <Button
            className="eec-back-btn"
            onClick={() => navigate("../catalogue")}
            children={<p>Back</p>}
          />
          <div className="edit-eyeglass-bulk">
            <div className="ee-image-section">
              <div className="ee-product-image-wrapper">
                <div className="ee-product-main-img">
                  <img id="product-img" src={mainImage} alt={eyeglass.name} />
                </div>
                <div className="ee-product-tertiary-imgs">
                  {tertiaryImages.map((img, idx) => (
                    <img
                      className="tertiary-img"
                      key={idx}
                      id={`ti-${idx + 1}`}
                      src={img}
                      alt=""
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="ee-details-section">
              <div className="ee-header-wrapper">
                <div className="ee-header-text">
                  <h2>{eyeglass.name}</h2>
                </div>
                <div className="edit-eyeglass-button" id="top-edit">
                  <input
                    type="button"
                    value="EDIT"
                    className="submit-button"
                    onClick={() =>
                      navigate(`/dashboard/editeyeglasses/${eyeglass._id}`)
                    }
                  />
                </div>
              </div>
              <div className="ee-details-body-text">
                <p>{eyeglass.description}</p>
              </div>
              <div className="ee-details-color-selection">
                <div className="color-text">
                  <p>color: {colorOptions[selectedColor]?.name || "N/A"}</p>
                </div>
                <div className="color-indicators">
                  {colorOptions.map((opt, idx) => (
                    <div
                      className="colorcircle-border"
                      key={idx}
                      onClick={() => setSelectedColor(idx)}
                      style={{
                        border:
                          selectedColor === idx ? "2px solid #333" : undefined,
                      }}
                    >
                      <div
                        className="colorcircle"
                        style={{
                          background: (opt.colors && opt.colors[0]) || "#ccc",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="blackline" />
              <div className="customer-section">
                <div className="price-section">
                  <p>₱{eyeglass.price?.toLocaleString() || "0.00"} PHP</p>
                </div>
                <div className="lens-type-section">
                  <div className="required-text-container">
                    <p>SELECT LENS TYPE</p>
                    <p id="red">&nbsp;*</p>
                  </div>
                </div>
                <div className="ee-dropdown-section">
                  <div className="dropdown-container">
                    <form>
                      <select
                        name="lens"
                        id="dropdown"
                        value={selectedLens}
                        onChange={(e) =>
                          setSelectedLens(Number(e.target.value))
                        }
                      >
                        {lensOptions.map((opt, idx) => (
                          <option key={idx} value={idx}>
                            {opt.label} {opt.price ? `(₱${opt.price})` : ""}
                          </option>
                        ))}
                      </select>
                    </form>
                  </div>
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
