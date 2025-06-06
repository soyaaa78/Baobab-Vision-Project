import { useState, useRef } from "react";
import "../../styles/eyeglass/AddEyeglassPage.css";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const AddEyeglassPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const handleBack = () => navigate("../catalogue");
  const [productImages, setProductImages] = useState([]);
  const [colorwayImages, setColorwayImages] = useState([]);
  const [model3dFile, setModel3dFile] = useState(null);
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [colorwayImageFiles, setColorwayImageFiles] = useState([]);

  const tintedRef = useRef(null);
  const sunAdaptiveRef = useRef(null);

  const handleToggle = (ref, shouldCheck) => {
    const checkboxes = ref.current.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      cb.checked = shouldCheck;
    });
  };
  const handleProductImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      id: URL.createObjectURL(file),
      url: URL.createObjectURL(file),
      file: file,
    }));
    setProductImages((prev) => [...prev, ...newPreviews]);
    setProductImageFiles((prev) => [...prev, ...files]);
  };

  const handleColorwayImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      id: URL.createObjectURL(file),
      url: URL.createObjectURL(file),
      file: file,
    }));
    setColorwayImages((prev) => [...prev, ...newPreviews]);
    setColorwayImageFiles((prev) => [...prev, ...files]);
  };

  const handleModel3dChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModel3dFile(file);
    }
  };

  const handleDeleteProductImage = (idToRemove) => {
    const imageToRemove = productImages.find((img) => img.id === idToRemove);
    setProductImages((prev) => prev.filter((img) => img.id !== idToRemove));
    if (imageToRemove && imageToRemove.file) {
      setProductImageFiles((prev) =>
        prev.filter((file) => file !== imageToRemove.file)
      );
    }
  };
  const handleDeleteColorwayImage = (idToRemove) => {
    const imageToRemove = colorwayImages.find((img) => img.id === idToRemove);
    setColorwayImages((prev) => prev.filter((img) => img.id !== idToRemove));
    if (imageToRemove && imageToRemove.file) {
      setColorwayImageFiles((prev) =>
        prev.filter((file) => file !== imageToRemove.file)
      );
    }
  };

  const [product, setProduct] = useState("");
  /* const addProduct = () => {
        setProduct(userdata);
    } */ /* raph eto yung iibahin para sa adding */
  // --- Add product form state ---
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    specs: [],
    lensOptions: [],
  });

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // --- Handlers for form fields ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSpecsChange = (spec) => {
    setForm((prev) => {
      const specs = new Set(prev.specs);
      if (specs.has(spec)) {
        specs.delete(spec);
      } else {
        specs.add(spec);
      }
      return {
        ...prev,
        specs: Array.from(specs),
      };
    });
  };

  const handleFrameShapeChange = (frameShape) => {
    setForm((prev) => {
      const specs = new Set(prev.specs);
      const frameSpec = `frame_${frameShape.toLowerCase().replace(" ", "_")}`;
      if (specs.has(frameSpec)) {
        specs.delete(frameSpec);
      } else {
        specs.add(frameSpec);
      }
      return {
        ...prev,
        specs: Array.from(specs),
      };
    });
  };

  const handleLensOptionsChange = (label, type, price) => {
    setForm((prev) => {
      const lensOptions = prev.lensOptions ? [...prev.lensOptions] : [];
      const optionIndex = lensOptions.findIndex(
        (opt) => opt.label === label && opt.type === type
      );
      if (optionIndex > -1) {
        // Remove the option if it already exists
        return {
          ...prev,
          lensOptions: lensOptions.filter((_, i) => i !== optionIndex),
        };
      } else {
        // Add the new option
        return {
          ...prev,
          lensOptions: [...lensOptions, { label, type, price }],
        };
      }
    });
  }; // --- Submit handler ---
  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Reset error state
    setSubmitError(null);

    // Validation
    if (productImageFiles.length === 0) {
      setSubmitError("Please upload at least one product image.");
      return;
    }

    if (form.specs.length === 0) {
      setSubmitError("Please select at least one face shape specification.");
      return;
    }

    if (!form.name.trim()) {
      setSubmitError("Product name is required.");
      return;
    }

    if (!form.description.trim()) {
      setSubmitError("Product description is required.");
      return;
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      setSubmitError("Please enter a valid price.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add form fields
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      formData.append("specs", JSON.stringify(form.specs));
      formData.append("lensOptions", JSON.stringify(form.lensOptions));

      // Add product images
      productImageFiles.forEach((file) => {
        formData.append("productImages", file);
      });

      // Add colorway images if any
      colorwayImageFiles.forEach((file) => {
        formData.append("colorwayImages", file);
      });

      // Add 3D model if uploaded
      if (model3dFile) {
        formData.append("model3d", model3dFile);
      }

      const res = await axios.post(
        `${SERVER_URL}/api/productRoutes/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Success notification
      alert("Product added successfully!");
      navigate("../catalogue");
    } catch (error) {
      console.error("Error adding product:", error);

      // Better error handling
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error.response?.status === 413) {
        setSubmitError("Files are too large. Please upload smaller files.");
      } else if (error.response?.status >= 500) {
        setSubmitError("Server error. Please try again later.");
      } else {
        setSubmitError(
          "Failed to add product. Please check your files and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page" id="add-eyeglass">
        <div className="add-eyeglass-content">
          <div className="ae-header">
            <div className="ae-header-text">
              <h1>Add Product</h1>
              <p style={{ color: "#666666" }}>Time to hash out the details.</p>
            </div>
            <Button className="" onClick={handleBack} children={<p>Back</p>} />
          </div>

          <div className="add-eyeglass-form-container">
            <form className="add-eyeglass-form" onSubmit={handleAddProduct}>
              <div className="aef-section aef-basic-sect">
                <div className="section-details bsd">
                  <div className="bsd-header">
                    <h2>Basic Info</h2>
                  </div>
                  <div className="aef-sect-fields bsd-upper">
                    <div className="bsdf-input bsdfu-name">
                      <label for="title">Product Name</label>
                      <input
                        type="text"
                        id="title"
                        name="name"
                        placeholder="Eyewear Name"
                        required
                        value={form.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="bsdf-input bsdfu-desc">
                      <label for="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Enter Product Details"
                        required
                        value={form.description}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>

                  <div className="bsd-price-header">
                    <h2>Product Price</h2>
                  </div>

                  <div className="aef-sect-fields bsd-lower">
                    <div className="bsdf-input bsdfl-price">
                      <label for="title">Price</label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        placeholder="-1 PHP"
                        required
                        name="price"
                        value={form.price}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="aef-section aef-image-sect">
                <div className="section-details isd">
                  <div className="isd-header">
                    <h2>Product Media</h2>
                  </div>
                  <div className="aef-sect-fields isd-content">
                    <div>
                      <label>Product Images</label>
                      <div className="isdc-img-grid" id="product-images">
                        {productImages.map((img, idx) => (
                          <div key={img.id} className="isdc-img-box">
                            <img src={img.url} alt={`Upload ${idx}`} />
                            <a
                              type="button"
                              className="isd-img-delete-btn fade"
                              onClick={() => handleDeleteProductImage(img.id)}
                            >
                              <div className="isd-img-delete-btn-text">
                                <FontAwesomeIcon icon={faXmark} />
                                <p>Remove</p>
                              </div>
                            </a>
                          </div>
                        ))}

                        <label className="isdc-img-upload-box">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleProductImageChange}
                          />
                          <span>
                            +<br />
                            Add Product
                          </span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label>Colorway Images</label>
                      <div className="isdc-img-grid" id="colorway-images">
                        {colorwayImages.map((img, idx) => (
                          <div key={img.id} className="isdc-img-box">
                            <img src={img.url} alt={`Upload ${idx}`} />
                            <a
                              type="button"
                              className="isd-img-delete-btn fade"
                              onClick={() => handleDeleteColorwayImage(img.id)}
                            >
                              <div className="isd-img-delete-btn-text">
                                <p>X</p>
                                <p>Remove</p>
                              </div>
                            </a>
                          </div>
                        ))}
                      </div>

                      <label className="isdc-img-upload-box">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleColorwayImageChange}
                        />
                        <span>
                          +<br />
                          Add Product
                        </span>
                      </label>
                    </div>{" "}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label>Virtual Try-On 3D Model</label>
                      <input
                        type="file"
                        id="3dmodel"
                        name="media"
                        accept=".usd,.usdc,.usdz"
                        onChange={handleModel3dChange}
                      />
                      {model3dFile && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "0.85em",
                            color: "#666",
                            backgroundColor: "#f5f5f5",
                            padding: "8px",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>📁 {model3dFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setModel3dFile(null)}
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#ff4444",
                              cursor: "pointer",
                              fontSize: "1.2em",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="aef-section aef-category-sect">
                <div className="section-details csd">
                  <div className="csd-header">
                    <h2>Categories and Specifications</h2>
                  </div>

                  {/* "Oval", "Round", "Rectangle", "Square", "Heart", "Diamond", "Triangle" */}

                  <div className="aef-sect-fields csd-content">
                    <div className="csdc-header">
                      <p style={{ fontFamily: "Rubik" }}>
                        Face Shape Classification
                      </p>
                      <p
                        style={{
                          fontFamily: "Rubik",
                          fontSize: "0.7em",
                          color: "#8f8f8f",
                        }}
                      >
                        Select all that apply.
                      </p>
                    </div>
                    <div className="csdc-lens-categorization">
                      <div className="csdclc-first">
                        {" "}
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="oval"
                            checked={form.specs.includes("face_oval")}
                            onChange={() => handleSpecsChange("face_oval")}
                          />
                          <label for="oval">Oval</label>
                        </div>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="heart"
                            checked={form.specs.includes("face_heart")}
                            onChange={() => handleSpecsChange("face_heart")}
                          />
                          <label for="heart">Heart</label>
                        </div>
                      </div>
                      <div className="csdclc-second">
                        {" "}
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="round"
                            checked={form.specs.includes("face_round")}
                            onChange={() => handleSpecsChange("face_round")}
                          />
                          <label for="round">Round</label>
                        </div>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="diamond"
                            checked={form.specs.includes("face_diamond")}
                            onChange={() => handleSpecsChange("face_diamond")}
                          />
                          <label for="diamond">Diamond</label>
                        </div>
                      </div>
                      <div className="csdclc-third">
                        {" "}
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="rectangle"
                            checked={form.specs.includes("face_rectangle")}
                            onChange={() => handleSpecsChange("face_rectangle")}
                          />
                          <label for="rectangle">Rectangle</label>
                        </div>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="triangle"
                            checked={form.specs.includes("face_triangle")}
                            onChange={() => handleSpecsChange("face_triangle")}
                          />
                          <label for="triangle">Triangle</label>
                        </div>
                      </div>
                      <div className="csdclc-fourth">
                        {" "}
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="square"
                            checked={form.specs.includes("face_square")}
                            onChange={() => handleSpecsChange("face_square")}
                          />
                          <label for="square">Square</label>
                        </div>
                      </div>{" "}
                    </div>

                    {/* Frame Shape Selection Section */}
                    <div className="csdc-header" style={{ marginTop: "20px" }}>
                      <p style={{ fontFamily: "Rubik" }}>
                        Frame Shape Classification
                      </p>
                      <p
                        style={{
                          fontFamily: "Rubik",
                          fontSize: "0.7em",
                          color: "#8f8f8f",
                        }}
                      >
                        Select all frame shapes this product includes.
                      </p>
                    </div>
                    <div className="csdc-lens-categorization">
                      <div className="csdclc-first">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_rectangle"
                            checked={form.specs.includes("frame_rectangle")}
                            onChange={() => handleFrameShapeChange("rectangle")}
                          />
                          <label for="frame_rectangle">Rectangle</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_round"
                            checked={form.specs.includes("frame_round")}
                            onChange={() => handleFrameShapeChange("round")}
                          />
                          <label for="frame_round">Round</label>
                        </div>
                      </div>
                      <div className="csdclc-second">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_cat_eye"
                            checked={form.specs.includes("frame_cat_eye")}
                            onChange={() => handleFrameShapeChange("cat_eye")}
                          />
                          <label for="frame_cat_eye">Cat Eye</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_pilot"
                            checked={form.specs.includes("frame_pilot")}
                            onChange={() => handleFrameShapeChange("pilot")}
                          />
                          <label for="frame_pilot">Pilot</label>
                        </div>
                      </div>
                      <div className="csdclc-third">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_square"
                            checked={form.specs.includes("frame_square")}
                            onChange={() => handleFrameShapeChange("square")}
                          />
                          <label for="frame_square">Square</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_oversized"
                            checked={form.specs.includes("frame_oversized")}
                            onChange={() => handleFrameShapeChange("oversized")}
                          />
                          <label for="frame_oversized">Oversized</label>
                        </div>
                      </div>
                    </div>

                    <div className="aef-sect-fields csd-lower">
                      <div>
                        <p style={{ fontFamily: "Rubik" }}>
                          Lens Options Inclusions
                        </p>
                        <p
                          style={{
                            fontFamily: "Rubik",
                            fontSize: "0.7em",
                            color: "#8f8f8f",
                            marginTop: "5px",
                          }}
                        >
                          Select all that shall be offered.
                        </p>
                      </div>
                      <div className="csdl-lens-container">
                        <div className="aef-sect-fields csd-lens" id="tinted">
                          <div
                            className="bsdf-input csdfl-lens-options"
                            ref={tintedRef}
                          >
                            <label for="title" style={{ marginBottom: "10px" }}>
                              <b>
                                <i>Tinted Lenses</i>
                              </b>
                            </label>

                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="samelenscolor"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "tinted" &&
                                    opt.label ===
                                      `Tinted Lenses - Same Lens Color (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Tinted Lenses - Same Lens Color (Prescription/Non-Prescription)`,
                                    "tinted",
                                    1600
                                  )
                                }
                              />
                              <label htmlFor="samelenscolor">
                                Same Lens Color
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="boostingblack"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "tinted" &&
                                    opt.label ===
                                      `Tinted Lenses - Boosting Black (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Tinted Lenses - Boosting Black (Prescription/Non-Prescription)`,
                                    "tinted",
                                    1600
                                  )
                                }
                              />
                              <label htmlFor="boostingblack">
                                Boosting Black
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="blissfulblue"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "tinted" &&
                                    opt.label ===
                                      `Tinted Lenses - Blissful Blue (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Tinted Lenses - Blissful Blue (Prescription/Non-Prescription)`,
                                    "tinted",
                                    1600
                                  )
                                }
                              />
                              <label htmlFor="blissfulblue">
                                Blissful Blue
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="beamingbrown"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "tinted" &&
                                    opt.label ===
                                      `Tinted Lenses - Beaming Brown (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Tinted Lenses - Beaming Brown (Prescription/Non-Prescription)`,
                                    "tinted",
                                    1600
                                  )
                                }
                              />
                              <label htmlFor="beamingbrown">
                                Beaming Brown
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="gloriousgreen"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "tinted" &&
                                    opt.label ===
                                      `Tinted Lenses - Glorious Green (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Tinted Lenses - Glorious Green (Prescription/Non-Prescription)`,
                                    "tinted",
                                    1600
                                  )
                                }
                              />
                              <label htmlFor="gloriousgreen">
                                Glorious Green
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="perfectpink"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "tinted" &&
                                    opt.label ===
                                      `Tinted Lenses - Perfect Pink (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Tinted Lenses - Perfect Pink (Prescription/Non-Prescription)`,
                                    "tinted",
                                    1600
                                  )
                                }
                              />
                              <label htmlFor="perfectpink">Perfect Pink</label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="pleasingpurple"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "tinted" &&
                                    opt.label ===
                                      `Tinted Lenses - Pleasing Purple (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Tinted Lenses - Pleasing Purple (Prescription/Non-Prescription)`,
                                    "tinted",
                                    1600
                                  )
                                }
                              />
                              <label htmlFor="pleasingpurple">
                                Pleasing Purple
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="radiantrose"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "tinted" &&
                                    opt.label ===
                                      `Tinted Lenses - Radiant Rose (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Tinted Lenses - Radiant Rose (Prescription/Non-Prescription)`,
                                    "tinted",
                                    1600
                                  )
                                }
                              />
                              <label htmlFor="radiantrose">Radiant Rose</label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="youthfulyellow"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "tinted" &&
                                    opt.label ===
                                      `Tinted Lenses - Youthful Yellow (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Tinted Lenses - Youthful Yellow (Prescription/Non-Prescription)`,
                                    "tinted",
                                    1600
                                  )
                                }
                              />
                              <label htmlFor="youthfulyellow">
                                Youthful Yellow
                              </label>
                            </div>

                            <div className="csd-lens-multiselect">
                              <button
                                type="button"
                                onClick={() => handleToggle(tintedRef, true)}
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggle(tintedRef, false)}
                              >
                                Select None
                              </button>
                            </div>
                          </div>
                        </div>

                        <div
                          className="aef-sect-fields csd-lens"
                          id="sun-adaptive"
                        >
                          <div
                            className="bsdf-input csdfl-lens-options"
                            ref={sunAdaptiveRef}
                          >
                            <label for="title" style={{ marginBottom: "10px" }}>
                              <b>
                                <i>Sun-Adaptive Lenses</i>
                              </b>
                            </label>

                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="samelenscolor_sun"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "adaptive" &&
                                    opt.label ===
                                      `Sun Adaptive Lenses - Same Lens Color (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Sun Adaptive Lenses - Same Lens Color (Prescription/Non-Prescription)`,
                                    "adaptive",
                                    2400
                                  )
                                }
                              />
                              <label htmlFor="samelenscolor">
                                Same Lens Color
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="boostingblack_sun"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "adaptive" &&
                                    opt.label ===
                                      `Sun Adaptive Lenses - Boosting Black (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Sun Adaptive Lenses - Boosting Black (Prescription/Non-Prescription)`,
                                    "adaptive",
                                    2400
                                  )
                                }
                              />
                              <label htmlFor="boostingblack">
                                Boosting Black
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="blissfulblue_sun"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "adaptive" &&
                                    opt.label ===
                                      `Sun Adaptive Lenses - Blissful Blue (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Sun Adaptive Lenses - Blissful Blue (Prescription/Non-Prescription)`,
                                    "adaptive",
                                    2400
                                  )
                                }
                              />
                              <label htmlFor="blissfulblue">
                                Blissful Blue
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="beamingbrown_sun"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "adaptive" &&
                                    opt.label ===
                                      `Sun Adaptive Lenses - Beaming Brown (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Sun Adaptive Lenses - Beaming Brown (Prescription/Non-Prescription)`,
                                    "adaptive",
                                    2400
                                  )
                                }
                              />
                              <label htmlFor="beamingbrown">
                                Beaming Brown
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="gloriousgreen_sun"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "adaptive" &&
                                    opt.label ===
                                      `Sun Adaptive Lenses - Glorious Green (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Sun Adaptive Lenses - Glorious Green (Prescription/Non-Prescription)`,
                                    "adaptive",
                                    2400
                                  )
                                }
                              />
                              <label htmlFor="gloriousgreen">
                                Glorious Green
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="perfectpink_sun"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "adaptive" &&
                                    opt.label ===
                                      `Sun Adaptive Lenses - Perfect Pink (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Sun Adaptive Lenses - Perfect Pink (Prescription/Non-Prescription)`,
                                    "adaptive",
                                    2400
                                  )
                                }
                              />
                              <label htmlFor="perfectpink">Perfect Pink</label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="pleasingpurple_sun"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "adaptive" &&
                                    opt.label ===
                                      `Sun Adaptive Lenses - Pleasing Purple (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Sun Adaptive Lenses - Pleasing Purple (Prescription/Non-Prescription)`,
                                    "adaptive",
                                    2400
                                  )
                                }
                              />
                              <label htmlFor="pleasingpurple">
                                Pleasing Purple
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="radiantrose_sun"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "adaptive" &&
                                    opt.label ===
                                      `Sun Adaptive Lenses - Radiant Rose (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Sun Adaptive Lenses - Radiant Rose (Prescription/Non-Prescription)`,
                                    "adaptive",
                                    2400
                                  )
                                }
                              />
                              <label htmlFor="radiantrose">Radiant Rose</label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="youthfulyellow_sun"
                                checked={form.lensOptions.some(
                                  (opt) =>
                                    opt.type === "adaptive" &&
                                    opt.label ===
                                      `Sun Adaptive Lenses - Youthful Yellow (Prescription/Non-Prescription)`
                                )}
                                onChange={() =>
                                  handleLensOptionsChange(
                                    `Sun Adaptive Lenses - Youthful Yellow (Prescription/Non-Prescription)`,
                                    "adaptive",
                                    2400
                                  )
                                }
                              />
                              <label htmlFor="youthfulyellow">
                                Youthful Yellow
                              </label>
                            </div>

                            <div className="csd-lens-multiselect">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggle(sunAdaptiveRef, true)
                                }
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggle(sunAdaptiveRef, false)
                                }
                              >
                                Select None
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="csd-post-button-container"
                    style={{ margin: "10px 0 0 0" }}
                  >
                    <Button
                      className=""
                      type="submit"
                      children={<p>Add to Catalogue</p>}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEyeglassPage;
