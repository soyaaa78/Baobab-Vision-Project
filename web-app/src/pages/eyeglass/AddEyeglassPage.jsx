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
    if (ref && ref.current) {
      const checkboxes = ref.current.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        if (!cb.disabled) cb.checked = shouldCheck;
      });
    }
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
    stock: "",
    numStars: 0.0,
    recommendedFor: false,
    sales: 0,
    specs: [],
    lensOptions: [
      { label: "Built-in UV400 Lenses", price: 0, type: "builtin" },
    ],
    colorOptions: [],
  });

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  // --- Handlers for form fields ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      // Always keep the built-in lens as the first item
      let lensOptions = prev.lensOptions ? [...prev.lensOptions] : [];
      // Remove all built-in except the first
      lensOptions = lensOptions.filter(
        (opt, idx) => !(opt.type === "builtin" && idx !== 0)
      );
      // Ensure built-in is always present at index 0
      if (!lensOptions.length || lensOptions[0].type !== "builtin") {
        lensOptions.unshift({
          label: "Built-in UV400 Lenses",
          price: 0,
          type: "builtin",
        });
      }
      // Prevent removing the built-in lens
      if (type === "builtin") {
        return { ...prev, lensOptions };
      }
      const optionIndex = lensOptions.findIndex(
        (opt) => opt.label === label && opt.type === type
      );
      if (optionIndex > -1) {
        // Remove the option if it already exists, but never remove built-in
        if (lensOptions[optionIndex].type !== "builtin") {
          lensOptions = lensOptions.filter((_, i) => i !== optionIndex);
        }
      } else {
        lensOptions.push({ label, type, price });
      }
      // Always ensure built-in is first and only once
      lensOptions = [
        lensOptions.find((opt) => opt.type === "builtin"),
        ...lensOptions.filter((opt) => opt.type !== "builtin"),
      ].filter(Boolean);
      // Remove any _id fields from lensOptions before saving to state (let backend add them)
      lensOptions = lensOptions.map(({ label, type, price }) => ({
        label,
        type,
        price,
      }));
      return {
        ...prev,
        lensOptions,
      };
    });
  };

  // --- Color Options Handlers ---
  const handleAddColorOption = () => {
    setForm((prev) => ({
      ...prev,
      colorOptions: [
        ...prev.colorOptions,
        {
          name: "",
          type: "solid",
          colors: ["#000000"],
          imageUrl: "",
        },
      ],
    }));
  };

  const handleColorOptionChange = (optionIndex, field, value) => {
    setForm((prev) => {
      const newColorOptions = [...prev.colorOptions];
      newColorOptions[optionIndex] = {
        ...newColorOptions[optionIndex],
        [field]: value,
      };
      return {
        ...prev,
        colorOptions: newColorOptions,
      };
    });
  };

  const handleColorOptionColorChange = (optionIndex, colorIndex, color) => {
    setForm((prev) => {
      const newColorOptions = [...prev.colorOptions];
      const newColors = [...newColorOptions[optionIndex].colors];
      newColors[colorIndex] = color;
      newColorOptions[optionIndex] = {
        ...newColorOptions[optionIndex],
        colors: newColors,
      };
      return {
        ...prev,
        colorOptions: newColorOptions,
      };
    });
  };

  const handleAddColorToOption = (optionIndex) => {
    setForm((prev) => {
      const newColorOptions = [...prev.colorOptions];
      newColorOptions[optionIndex] = {
        ...newColorOptions[optionIndex],
        colors: [...newColorOptions[optionIndex].colors, "#000000"],
      };
      return {
        ...prev,
        colorOptions: newColorOptions,
      };
    });
  };

  const handleRemoveColorFromOption = (optionIndex, colorIndex) => {
    setForm((prev) => {
      const newColorOptions = [...prev.colorOptions];
      const newColors = newColorOptions[optionIndex].colors.filter(
        (_, i) => i !== colorIndex
      );
      newColorOptions[optionIndex] = {
        ...newColorOptions[optionIndex],
        colors: newColors,
      };
      return {
        ...prev,
        colorOptions: newColorOptions,
      };
    });
  };

  const handleRemoveColorOption = (index) => {
    setForm((prev) => ({
      ...prev,
      colorOptions: prev.colorOptions.filter((_, i) => i !== index),
    }));
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
      formData.append("stock", form.stock || "0");
      formData.append("numStars", "0.0");
      formData.append("recommendedFor", form.recommendedFor);
      formData.append("sales", "0");
      formData.append("specs", JSON.stringify(form.specs));
      // Always include the built-in lens and all selected lens options (no duplicates)
      const builtInLens = {
        label: "Built-in UV400 Lenses",
        price: 0,
        type: "builtin",
      };
      // Remove any duplicate lens options (same label+type) and preserve all selected
      const uniqueLensOptions = [];
      const seen = new Set();
      // Always start with built-in lens
      uniqueLensOptions.push(builtInLens);
      form.lensOptions.forEach((opt) => {
        if (opt.type === "builtin") return; // skip any extra built-in
        const key = `${opt.label}|${opt.type}`;
        if (!seen.has(key)) {
          uniqueLensOptions.push({
            label: opt.label,
            price: opt.price,
            type: opt.type,
          });
          seen.add(key);
        }
      });
      formData.append("lensOptions", JSON.stringify(uniqueLensOptions));
      formData.append("colorOptions", JSON.stringify(form.colorOptions));

      // Debug logging
      console.log("Form data being sent:");
      console.log("Name:", form.name.trim());
      console.log("Description:", form.description.trim());
      console.log("Price:", form.price);
      console.log("Stock:", form.stock || "0");

      // Log all FormData entries
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

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
        `${SERVER_URL}/api/productRoutes`,
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
                      <label>Virtual Try-On 3D Model</label>{" "}
                      <input
                        type="file"
                        id="3dmodel"
                        name="media"
                        accept=".usd,.usdc,.usdz,.glb,.gltf"
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
                        </p>{" "}
                      </div>
                      <div className="csdl-lens-container">
                        {/* Built-in UV400 Lenses (Always included) */}
                        <div className="aef-sect-fields csd-lens" id="builtin">
                          <div className="bsdf-input csdfl-lens-options">
                            <label style={{ marginBottom: "10px" }}>
                              <b>
                                <i>Standard Lenses</i>
                              </b>
                            </label>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                checked={true}
                                disabled={true}
                              />
                              <label>
                                Built-in UV400 Lenses (Included with all frames)
                              </label>
                            </div>
                          </div>
                        </div>

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

                            <div className="csd-lens-multiselect"></div>
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

                            <div className="csd-lens-multiselect"></div>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                  </div>
                </div>
              </div>

              {/* Color Options Section */}
              <div className="aef-section aef-color-sect">
                <div className="section-details">
                  <div className="section-header">
                    <h2>Color Options</h2>
                    <p
                      style={{
                        color: "#666",
                        fontSize: "0.9em",
                        marginTop: "5px",
                      }}
                    >
                      Add color options for this product
                    </p>
                  </div>
                  <div className="aef-sect-fields">
                    {form.colorOptions.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="color-option-container"
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "15px",
                          marginBottom: "15px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <h4>Color Option {optionIndex + 1}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveColorOption(optionIndex)}
                            style={{
                              backgroundColor: "#ff4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "5px 10px",
                              cursor: "pointer",
                              fontSize: "0.8em",
                            }}
                          >
                            Remove Option
                          </button>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          <label>Option Name:</label>
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) =>
                              handleColorOptionChange(
                                optionIndex,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Frame Color, Accent Color"
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              marginTop: "5px",
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          <label>Option Type:</label>
                          <select
                            value={option.type}
                            onChange={(e) =>
                              handleColorOptionChange(
                                optionIndex,
                                "type",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              marginTop: "5px",
                            }}
                          >
                            <option value="solid">Solid Color</option>
                            <option value="split">Split Color</option>
                            <option value="swatch">Color Swatch</option>
                          </select>
                        </div>{" "}
                        <div style={{ marginBottom: "10px" }}>
                          <label>
                            Reference Image (from uploaded colorway images):
                          </label>
                          <select
                            value={option.imageUrl}
                            onChange={(e) =>
                              handleColorOptionChange(
                                optionIndex,
                                "imageUrl",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              marginTop: "5px",
                            }}
                          >
                            <option value="">
                              Select a colorway image (optional)
                            </option>
                            {colorwayImages.map((img, idx) => (
                              <option key={img.id} value={img.url}>
                                Colorway Image {idx + 1}
                              </option>
                            ))}
                          </select>
                          {option.imageUrl && (
                            <div style={{ marginTop: "10px" }}>
                              <img
                                src={option.imageUrl}
                                alt="Selected colorway"
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  border: "1px solid #ddd",
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <label>Colors:</label>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "10px",
                              marginTop: "5px",
                            }}
                          >
                            {option.colors.map((color, colorIndex) => (
                              <div
                                key={colorIndex}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <input
                                  type="color"
                                  value={color}
                                  onChange={(e) =>
                                    handleColorOptionColorChange(
                                      optionIndex,
                                      colorIndex,
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    border: "none",
                                    borderRadius: "4px",
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveColorFromOption(
                                      optionIndex,
                                      colorIndex
                                    )
                                  }
                                  style={{
                                    backgroundColor: "#ff4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    cursor: "pointer",
                                    fontSize: "0.7em",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                handleAddColorToOption(optionIndex)
                              }
                              style={{
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontSize: "0.8em",
                              }}
                            >
                              + Add Color
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddColorOption}
                      style={{
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "10px 15px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                        marginTop: "10px",
                      }}
                    >
                      + Add Color Option
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Product Fields Section */}
              <div className="aef-section aef-additional-sect">
                <div className="section-details">
                  <div className="section-header">
                    <h2>Additional Product Information</h2>
                  </div>{" "}
                  <div
                    className="aef-sect-fields"
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div className="bsdf-input" style={{ flex: "1" }}>
                      <label htmlFor="stock">Stock Quantity</label>
                      <input
                        type="number"
                        id="stock"
                        name="stock"
                        min="0"
                        placeholder="0"
                        value={form.stock}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          marginTop: "5px",
                        }}
                      />
                    </div>

                    <div
                      className="bsdf-input"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "20px",
                      }}
                    >
                      <input
                        type="checkbox"
                        id="recommendedFor"
                        name="recommendedFor"
                        checked={form.recommendedFor}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="recommendedFor">
                        Recommended Product
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display and Submit Section */}
              <div className="aef-section">
                <div className="section-details">
                  {/* Error Display */}
                  {submitError && (
                    <div
                      style={{
                        backgroundColor: "#ffebee",
                        color: "#c62828",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ffcdd2",
                        marginBottom: "15px",
                      }}
                    >
                      {submitError}
                    </div>
                  )}

                  <div
                    className="csd-post-button-container"
                    style={{ margin: "10px 0 0 0" }}
                  >
                    <Button
                      className=""
                      type="submit"
                      disabled={isSubmitting}
                      children={
                        <p>
                          {isSubmitting
                            ? "Adding Product..."
                            : "Add to Catalogue"}
                        </p>
                      }
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
