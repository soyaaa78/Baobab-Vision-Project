import { useState, useEffect, useRef } from "react";
import "../../styles/eyeglass/AddEyeglassPage.css";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import InfoModal from "../../components/InfoModal";
import Cookies from "js-cookie";

const AddEyeglassPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [token, setToken] = useState();
  const navigate = useNavigate();
  const handleBack = () => navigate("../catalogue");
  const [productImages, setProductImages] = useState([]);
  // Removed global colorway images; use per-colorway image upload
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [colorwayModelFiles, setColorwayModelFiles] = useState([]);

  const tintedRef = useRef(null);
  const sunAdaptiveRef = useRef(null);

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

  // Per-colorway image drag-and-drop
  const handleColorwayImageDrop = (e, optionIndex) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setForm((prev) => {
      const updated = [...prev.colorOptions];
      updated[optionIndex].imageFile = file;
      return { ...prev, colorOptions: updated };
    });
  };

  // Per-colorway image input change
  const handleColorwayImageChange = (e, optionIndex) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setForm((prev) => {
      const updated = [...prev.colorOptions];
      updated[optionIndex].imageFile = file;
      return { ...prev, colorOptions: updated };
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

  // 3D model helpers for drag-and-drop per colorway
  const is3dModelFile = (file) =>
    !!file && /\.(glb)$/i.test((file.name || "").toLowerCase());
  const handleColorwayModelDrop = (e, optionIndex) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && is3dModelFile(file)) {
      setColorwayModelFiles((prev) => {
        const next = [...prev];
        next[optionIndex] = file;
        return next;
      });
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
  /* raph eto yung iibahin para sa adding */
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
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "info",
    onPrimary: null,
  });
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
    setColorwayModelFiles((prev) => [...prev, null]);
  };

  const handleColorOptionChange = (optionIndex, field, value) => {
    setForm((prev) => {
      const newColorOptions = [...prev.colorOptions];
      const updated = {
        ...newColorOptions[optionIndex],
        [field]: value,
      };

      // Enforce color constraints on type change
      if (field === "type") {
        const colors = Array.isArray(updated.colors)
          ? [...updated.colors]
          : ["#000000"];
        if (value === "solid") {
          // Exactly one color
          updated.colors = colors.length ? [colors[0]] : ["#000000"];
        } else if (value === "split" || value === "swatch") {
          // Exactly two colors
          if (colors.length < 2) {
            const second = colors[0] === "#000000" ? "#ff8800" : "#000000";
            updated.colors = [colors[0] || "#000000", colors[1] || second];
          } else if (colors.length > 2) {
            updated.colors = [colors[0], colors[1]];
          }
        }
      }

      newColorOptions[optionIndex] = updated;
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

  const handleRemoveColorFromOption = (optionIndex, colorIndex) => {
    setForm((prev) => {
      const newColorOptions = [...prev.colorOptions];
      const opt = newColorOptions[optionIndex];
      const colors = Array.isArray(opt.colors) ? [...opt.colors] : [];
      const min = opt.type === "solid" ? 1 : 2;
      if (colors.length <= min) return prev; // keep required minimum
      const newColors = colors.filter((_, i) => i !== colorIndex);
      newColorOptions[optionIndex] = { ...opt, colors: newColors };
      return { ...prev, colorOptions: newColorOptions };
    });
  };

  const handleRemoveColorOption = (index) => {
    setForm((prev) => ({
      ...prev,
      colorOptions: prev.colorOptions.filter((_, i) => i !== index),
    }));
    setColorwayModelFiles((prev) => prev.filter((_, i) => i !== index));
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

    // Validate color options per type and require image
    for (const [idx, opt] of form.colorOptions.entries()) {
      const type = opt.type || "solid";
      const count = (opt.colors || []).length;
      if (type === "solid" && count !== 1) {
        setSubmitError(
          `Color Option ${idx + 1}: Solid Color requires exactly 1 color.`
        );
        return;
      }
      if ((type === "split" || type === "swatch") && count !== 2) {
        setSubmitError(
          `Color Option ${idx + 1}: ${
            type === "split" ? "Split Color" : "Color Swatch"
          } requires exactly 2 colors.`
        );
        return;
      }
      if (!opt.imageFile) {
        setSubmitError(`Color Option ${idx + 1}: Image is required.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // First, if any per-colorway 3D files exist, upload them to storage to get URLs
      const colorOptionsWithModels = form.colorOptions.map((opt) => ({
        ...opt,
      }));
      const cwFiles = colorwayModelFiles;
      const has3d = Array.isArray(cwFiles) && cwFiles.some((f) => !!f);
      if (has3d) {
        const modelFd = new FormData();
        const indexMap = [];
        cwFiles.forEach((file, idx) => {
          if (file) {
            modelFd.append("colorwayModels3d", file);
            indexMap.push(idx);
          }
        });
        const uploadRes = await axios.post(
          `${SERVER_URL}/api/storage/upload/models`,
          modelFd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const urls = uploadRes.data?.colorwayModelUrls || [];
        indexMap.forEach((optIdx, i) => {
          if (urls[i]) {
            colorOptionsWithModels[optIdx] = {
              ...colorOptionsWithModels[optIdx],
              model3dUrl: urls[i],
            };
          }
        });
      }

      // Create FormData for product creation (images + JSON fields only)
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
      formData.append("colorOptions", JSON.stringify(colorOptionsWithModels));

      // Add product images
      productImageFiles.forEach((file) => {
        formData.append("productImages", file);
      });

      // Add colorway images if any
      // Add per-colorway images
      form.colorOptions.forEach((opt) => {
        if (opt.imageFile) {
          formData.append("colorwayImages", opt.imageFile);
        }
      });

      // 3D models are already uploaded; don't append any 3D files here
      await axios.post(`${SERVER_URL}/api/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setModal({
        open: true,
        title: "Product Added",
        message: `"${form.name}" has been added successfully.`,
        variant: "success",
        onPrimary: () => navigate("../catalogue"),
      });
    } catch (error) {
      console.error("Error adding product:", error);
      const msg =
        error.response?.data?.message ||
        (error.response?.status === 413
          ? "Files are too large. Please upload smaller files."
          : error.response?.status >= 500
          ? "Server error. Please try again later."
          : "Failed to add product. Please check your files and try again.");
      setSubmitError(msg);
      setModal({
        open: true,
        title: "Add Product Failed",
        message: msg,
        variant: "error",
      });
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
                    {/* Colorway images are now handled per colorway option below */}
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

              {/* Additional Product Fields Section */}
              <div className="aef-section aef-additional-sect">
                <div className="section-details">
                  <div className="section-header">
                    <h2>Additional Product Information</h2>
                  </div>
                  <div className="aef-additional-fields">
                    <div className="additional-field-group">
                      <label htmlFor="stock" className="field-label">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        id="stock"
                        name="stock"
                        min="0"
                        placeholder="Enter stock quantity"
                        value={form.stock}
                        onChange={handleInputChange}
                        className="stock-input"
                      />
                    </div>

                    <div className="additional-field-group checkbox-group">
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="recommendedFor"
                          name="recommendedFor"
                          checked={form.recommendedFor}
                          onChange={handleInputChange}
                          className="custom-checkbox"
                        />
                        <label
                          htmlFor="recommendedFor"
                          className="checkbox-label"
                        >
                          Recommended Product
                        </label>
                      </div>
                      <p className="field-description">
                        Mark this product as recommended to feature it
                        prominently
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Options Section */}
              <div className="aef-section aef-color-sect">
                <div className="section-details">
                  <div
                    className="section-header"
                    style={{ marginBottom: "15px" }}
                  >
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
                        <div>
                          <label>Colors:</label>
                          {/* Preview chip */}
                          {(() => {
                            const c = option.colors || ["#000000"];
                            const c1 = c[0] || "#000000";
                            const c2 = c[1] || c1;
                            let bg = c1;
                            if (option.type === "split") {
                              // Blend smoothly from first to second color
                              bg = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
                            } else if (option.type === "swatch") {
                              // Glossy swatch: subtle highlight, soft color spot, inner vignette, base fill
                              bg = [
                                // highlight glare
                                `radial-gradient(circle at 28% 22%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%)`,
                                // color 2 spot with soft falloff
                                `radial-gradient(circle at 35% 35%, ${c2} 0%, ${c2} 38%, rgba(0,0,0,0) 62%)`,
                                // inner shadow/vignette
                                `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.14) 78%, rgba(0,0,0,0.22) 100%)`,
                                // base color fill
                                `linear-gradient(135deg, ${c1} 0%, ${c1} 100%)`,
                              ].join(", ");
                            }
                            return (
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  border: "2px solid #ddd",
                                  marginTop: 8,
                                  boxShadow:
                                    "inset 0 0 0 2px rgba(255,255,255,0.6)",
                                  background: bg,
                                }}
                                title={`${option.type} preview`}
                              />
                            );
                          })()}
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
                                className="aef-color-container"
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
                                  className="aef-color-picker"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveColorFromOption(
                                      optionIndex,
                                      colorIndex
                                    )
                                  }
                                  className="aef-color-remove"
                                  disabled={
                                    (option.type === "solid" &&
                                      option.colors.length <= 1) ||
                                    ((option.type === "split" ||
                                      option.type === "swatch") &&
                                      option.colors.length <= 2)
                                  }
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            {/* Add Color button removed by request */}
                          </div>
                          {/* Helper text for constraints */}
                          <div
                            style={{
                              fontSize: "0.8em",
                              color: "#777",
                              marginTop: 6,
                            }}
                          >
                            {option.type === "solid" &&
                              "Solid: exactly 1 color."}
                            {option.type === "split" &&
                              "Split: exactly 2 colors (diagonal preview)."}
                            {option.type === "swatch" &&
                              "Swatch: exactly 2 colors (radial preview)."}
                          </div>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          <label>
                            Colorway Image{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) =>
                              handleColorwayImageDrop(e, optionIndex)
                            }
                            style={{
                              border: "2px dashed #ccc",
                              padding: "10px",
                              margin: "10px 0",
                              borderRadius: "6px",
                              background: "#fafafa",
                              textAlign: "center",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              document
                                .getElementById(`cwimg-${optionIndex}`)
                                ?.click()
                            }
                          >
                            {option.imageFile ? (
                              <img
                                src={URL.createObjectURL(option.imageFile)}
                                alt="Preview"
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  border: "1px solid #ddd",
                                }}
                              />
                            ) : (
                              <span>
                                Drag & drop image here, or click to browse
                              </span>
                            )}
                            <input
                              id={`cwimg-${optionIndex}`}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handleColorwayImageChange(e, optionIndex)
                              }
                            />
                          </div>
                        </div>
                        <div style={{ marginTop: "10px" }}>
                          <label>Virtual Try-On 3D Model (optional)</label>
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) =>
                              handleColorwayModelDrop(e, optionIndex)
                            }
                            style={{
                              border: "2px dashed #bbb",
                              borderRadius: "6px",
                              padding: "12px",
                              textAlign: "center",
                              color: "#666",
                              background: "#fafafa",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              document
                                .getElementById(`cw3d-${optionIndex}`)
                                ?.click()
                            }
                          >
                            <div style={{ fontSize: "0.9em" }}>
                              Drag & drop .glb here, or click to browse
                            </div>
                            <input
                              id={`cw3d-${optionIndex}`}
                              type="file"
                              accept=".glb"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file && is3dModelFile(file)) {
                                  setColorwayModelFiles((prev) => {
                                    const next = [...prev];
                                    next[optionIndex] = file;
                                    return next;
                                  });
                                }
                              }}
                            />
                          </div>
                          {colorwayModelFiles[optionIndex] && (
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
                              <span>
                                📁 {colorwayModelFiles[optionIndex]?.name}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setColorwayModelFiles((prev) => {
                                    const next = [...prev];
                                    next[optionIndex] = null;
                                    return next;
                                  })
                                }
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
                    ))}

                    <Button
                      className="add-color-option-btn"
                      onClick={handleAddColorOption}
                    >
                      + Add Color Option
                    </Button>
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
                    style={{
                      margin: "10px 0 0 0",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
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
            <InfoModal
              isOpen={modal.open}
              onClose={() => setModal((m) => ({ ...m, open: false }))}
              title={modal.title}
              message={modal.message}
              variant={modal.variant}
              primaryText={modal.onPrimary ? "Continue" : "OK"}
              onPrimary={modal.onPrimary}
            />
          </div>
        </div>
      </div>
      <InfoModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onPrimary={modal.onPrimary}
      />
    </>
  );
};

export default AddEyeglassPage;
