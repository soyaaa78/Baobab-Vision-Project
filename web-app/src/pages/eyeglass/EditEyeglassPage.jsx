import { useState, useRef, useEffect } from "react";
import "../../styles/eyeglass/AddEyeglassPage.css";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router";
import axios from "axios";

const EditEyeglassPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id;
  const handleBack = () => navigate("../catalogue");
  const [productImages, setProductImages] = useState([]);
  const [colorwayImages, setColorwayImages] = useState([]);
  const [eyeglass, setEyeglass] = useState({});
  const [model3dFile, setModel3dFile] = useState(null);
  // Add colorOptions, stock, recommendedFor to form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    specs: [],
    lensOptions: [
      { label: "Built-in UV400 Lenses", price: 0, type: "builtin" },
    ],
    colorOptions: [],
    stock: 0,
    recommendedFor: false,
  });
  const tintedRef = useRef(null);
  const sunAdaptiveRef = useRef(null);

  // Helper function to ensure built-in lens option is always included
  const ensureBuiltInLensOption = (lensOptions) => {
    // Check if built-in lens option already exists
    const hasBuiltIn = lensOptions.some(
      (option) =>
        option.type === "builtin" && option.label.includes("Built-in UV400")
    );

    // If not, add it
    if (!hasBuiltIn) {
      return [
        { label: "Built-in UV400 Lenses", price: 0, type: "builtin" },
        ...lensOptions,
      ];
    }

    return lensOptions;
  };

  useEffect(() => {
    const fetchEyeglass = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/products?id=${id}`);
        const data = response.data;
        setEyeglass(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          price:
            data.price !== undefined && data.price !== null
              ? String(data.price)
              : "",
          specs: data.specs || [],
          lensOptions:
            data.lensOptions && data.lensOptions.length > 0
              ? ensureBuiltInLensOption(data.lensOptions)
              : [{ label: "Built-in UV400 Lenses", price: 0, type: "builtin" }],
          colorOptions: data.colorOptions || [],
          stock: data.stock || 0,
          recommendedFor: !!data.recommendedFor,
        });
        setProductImages(
          (data.imageUrls || []).map((url, idx) => ({
            id: url,
            url,
          }))
        );
        setColorwayImages(
          (data.colorOptions || []).map((opt) => ({
            id: opt._id,
            url: opt.imageUrl,
            name: opt.name,
          }))
        );
        // 3D model file (if present)
        if (data.model3dUrl) {
          setModel3dFile({
            name: data.model3dUrl.split("/").pop(),
            url: data.model3dUrl,
          });
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (id) {
      fetchEyeglass();
    }
  }, [id]);

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
    }));
    setProductImages((prev) => [...prev, ...newPreviews]);
  };

  const handleColorwayImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      id: URL.createObjectURL(file),
      url: URL.createObjectURL(file),
    }));
    setColorwayImages((prev) => [...prev, ...newPreviews]);
  };

  const handleDeleteProductImage = (idToRemove) => {
    setProductImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const handleDeleteColorwayImage = (idToRemove) => {
    setColorwayImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

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

  // --- Lens Options Handler (match AddEyeglassPage logic) ---
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
          lensOptions.splice(optionIndex, 1);
        }
      } else {
        lensOptions.push({ label, type, price });
      }
      // Always ensure built-in is first and only once
      lensOptions = [
        lensOptions.find((opt) => opt.type === "builtin"),
        ...lensOptions.filter((opt) => opt.type !== "builtin"),
      ].filter(Boolean);
      // Remove any _id fields from lensOptions before saving to state
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
        { name: "", type: "solid", colors: ["#000000"], imageUrl: "" },
      ],
    }));
  };
  const handleRemoveColorOption = (index) => {
    setForm((prev) => ({
      ...prev,
      colorOptions: prev.colorOptions.filter((_, i) => i !== index),
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
  const handleModel3dChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModel3dFile(file);
    }
  };

  // Add frame shape handler
  const handleFrameShapeChange = (frameShape) => {
    setForm((prev) => {
      const specs = new Set(prev.specs);
      const frameSpec = `frame_${frameShape.toLowerCase().replace(/ /g, "_")}`;
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

  // --- Face Shape Handler ---
  const handleFaceShapeChange = (faceShape) => {
    setForm((prev) => {
      const specs = new Set(prev.specs);
      const faceSpec = `face_${faceShape.toLowerCase().replace(/ /g, "_")}`;
      if (specs.has(faceSpec)) {
        specs.delete(faceSpec);
      } else {
        specs.add(faceSpec);
      }
      return {
        ...prev,
        specs: Array.from(specs),
      };
    });
  };

  // Update handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedEyeglass = {};
      if (form.name !== eyeglass.name) updatedEyeglass.name = form.name;
      if (form.description !== eyeglass.description)
        updatedEyeglass.description = form.description;
      if (form.price !== eyeglass.price.toString()) {
        updatedEyeglass.price = parseFloat(form.price);
      }

      // Only include specs and lensOptions if they have changed
      if (JSON.stringify(form.specs) !== JSON.stringify(eyeglass.specs)) {
        updatedEyeglass.specs = form.specs || [];
      }
      if (
        JSON.stringify(form.lensOptions) !==
        JSON.stringify(eyeglass.lensOptions)
      ) {
        updatedEyeglass.lensOptions = form.lensOptions || [];
      }
      if (form.stock !== eyeglass.stock) updatedEyeglass.stock = form.stock;
      if (form.recommendedFor !== eyeglass.recommendedFor)
        updatedEyeglass.recommendedFor = form.recommendedFor;

      const newImageUrls = productImages.map((img) => img.url);
      if (JSON.stringify(newImageUrls) !== JSON.stringify(eyeglass.imageUrls)) {
        updatedEyeglass.imageUrls = newImageUrls;
      }
      const newColorOptions = colorwayImages.map((img) => ({
        name: img.name || "",
        imageUrl: img.url,
      }));
      const oldColorOptions = (eyeglass.colorOptions || []).map((opt) => ({
        name: opt.name || "",
        imageUrl: opt.imageUrl,
      }));
      if (JSON.stringify(newColorOptions) !== JSON.stringify(oldColorOptions)) {
        updatedEyeglass.colorOptions = newColorOptions;
      }
      if (
        JSON.stringify(form.colorOptions) !==
        JSON.stringify(eyeglass.colorOptions)
      ) {
        updatedEyeglass.colorOptions = form.colorOptions || [];
      }
      if (model3dFile && model3dFile !== eyeglass.model3dUrl) {
        updatedEyeglass.model3dFile = model3dFile;
      }
      await axios.put(
        `${SERVER_URL}/api/products?id=${eyeglass._id}`,
        updatedEyeglass
      );
      alert("Eyeglass updated successfully!");
      window.location.reload();
    } catch (error) {
      alert("Failed to update eyeglass.");
      console.error(error);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;
    try {
      await axios.delete(`${SERVER_URL}/api/products?id=${eyeglass._id}`);
      alert("Eyeglass deleted successfully!");
      navigate("../catalogue");
      return; // Prevent further code execution after navigation
    } catch (error) {
      alert("Failed to delete eyeglass.");
      console.error(error);
    }
  };

  return (
    <>
      <div className="page" id="add-eyeglass">
        <div className="add-eyeglass-content">
          <div className="ae-header">
            <div className="ae-header-text">
              <h1>Edit Product</h1>
              <p style={{ color: "#666666" }}>
                Got the wrong color? A typo in the description, perhaps?
              </p>
            </div>
            <Button className="" onClick={handleBack} children={<p>Back</p>} />
          </div>

          <div className="add-eyeglass-form-container">
            <form className="add-eyeglass-form" onSubmit={handleUpdate}>
              {/* Basic Info Section */}
              <div className="aef-section aef-basic-sect">
                <div className="section-details bsd">
                  <div className="bsd-header">
                    <h2>Basic Info</h2>
                  </div>
                  <div className="aef-sect-fields bsd-upper">
                    <div className="bsdf-input bsdfu-name">
                      <label htmlFor="title">Product Name</label>
                      <input
                        type="text"
                        id="title"
                        name="name"
                        placeholder="John or whatever"
                        required
                        value={form.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="bsdf-input bsdfu-desc">
                      <label htmlFor="description">Description</label>
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
                      <label htmlFor="price">Price</label>
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

              {/* Product Media Section */}
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
                            <img
                              src={img.url}
                              alt={img.name || `Colorway ${idx}`}
                            />
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
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label>Virtual Try-On 3D Model</label>
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

              {/* Categories and Specifications Section */}
              <div className="aef-section aef-category-sect">
                <div className="section-details csd">
                  <div className="csd-header">
                    <h2>Categories and Specifications</h2>
                  </div>
                  <div className="aef-sect-fields csd-content">
                    {/* Face Shape Classification */}
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
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="face_oval"
                            checked={form.specs?.includes("face_oval")}
                            onChange={() => handleFaceShapeChange("Oval")}
                          />
                          <label htmlFor="face_oval">Oval</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="face_heart"
                            checked={form.specs?.includes("face_heart")}
                            onChange={() => handleFaceShapeChange("Heart")}
                          />
                          <label htmlFor="face_heart">Heart</label>
                        </div>
                      </div>
                      <div className="csdclc-second">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="face_round"
                            checked={form.specs?.includes("face_round")}
                            onChange={() => handleFaceShapeChange("Round")}
                          />
                          <label htmlFor="face_round">Round</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="face_diamond"
                            checked={form.specs?.includes("face_diamond")}
                            onChange={() => handleFaceShapeChange("Diamond")}
                          />
                          <label htmlFor="face_diamond">Diamond</label>
                        </div>
                      </div>
                      <div className="csdclc-third">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="face_rectangle"
                            checked={form.specs?.includes("face_rectangle")}
                            onChange={() => handleFaceShapeChange("Rectangle")}
                          />
                          <label htmlFor="face_rectangle">Rectangle</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="face_triangle"
                            checked={form.specs?.includes("face_triangle")}
                            onChange={() => handleFaceShapeChange("Triangle")}
                          />
                          <label htmlFor="face_triangle">Triangle</label>
                        </div>
                      </div>

                      <div className="csdclc-fourth">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="face_square"
                            checked={form.specs?.includes("face_square")}
                            onChange={() => handleFaceShapeChange("Square")}
                          />
                          <label htmlFor="face_square">Square</label>
                        </div>
                      </div>
                    </div>
                    {/* Frame Shape Classification */}
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
                          <label htmlFor="frame_rectangle">Rectangle</label>
                        </div>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_round"
                            checked={form.specs.includes("frame_round")}
                            onChange={() => handleFrameShapeChange("round")}
                          />
                          <label htmlFor="frame_round">Round</label>
                        </div>
                      </div>
                      <div className="csdclc-second">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_cat_eye"
                            checked={form.specs.includes("frame_cat_eye")}
                            onChange={() => handleFrameShapeChange("cat eye")}
                          />
                          <label htmlFor="frame_cat_eye">Cat Eye</label>
                        </div>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_pilot"
                            checked={form.specs.includes("frame_pilot")}
                            onChange={() => handleFrameShapeChange("pilot")}
                          />
                          <label htmlFor="frame_pilot">Pilot</label>
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
                          <label htmlFor="frame_square">Square</label>
                        </div>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="frame_oversized"
                            checked={form.specs.includes("frame_oversized")}
                            onChange={() => handleFrameShapeChange("oversized")}
                          />
                          <label htmlFor="frame_oversized">Oversized</label>
                        </div>
                      </div>
                    </div>

                    {/* Lens Options Inclusions */}
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
                          Select all that apply.
                        </p>
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
                            // ref={tintedRef} // No longer needed
                          >
                            <label
                              htmlFor="title"
                              style={{ marginBottom: "10px" }}
                            >
                              <b>
                                <i>Tinted Lenses</i>
                              </b>
                            </label>
                            {[
                              "Same Lens Color",
                              "Boosting Black",
                              "Blissful Blue",
                              "Beaming Brown",
                              "Glorious Green",
                              "Perfect Pink",
                              "Pleasing Purple",
                              "Radiant Rose",
                              "Youthful Yellow",
                            ].map((label) => {
                              const lensLabel = `Tinted Lenses - ${label} (Prescription/Non-Prescription)`;
                              const checked = form.lensOptions?.some(
                                (opt) =>
                                  opt.type === "tinted" &&
                                  opt.label === lensLabel
                              );
                              return (
                                <div className="checkbox-container" key={label}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      handleLensOptionsChange(
                                        lensLabel,
                                        "tinted",
                                        1600
                                      )
                                    }
                                  />
                                  <label htmlFor={label.toLowerCase()}>
                                    {label}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div
                          className="aef-sect-fields csd-lens"
                          id="sun-adaptive"
                        >
                          <div
                            className="bsdf-input csdfl-lens-options"
                            // ref={sunAdaptiveRef} // No longer needed
                          >
                            <label
                              htmlFor="title"
                              style={{ marginBottom: "10px" }}
                            >
                              <b>
                                <i>Sun-Adaptive Lenses</i>
                              </b>
                            </label>
                            {[
                              "Same Lens Color",
                              "Boosting Black",
                              "Blissful Blue",
                              "Beaming Brown",
                              "True Teal",
                              "Perfect Pink",
                              "Pleasing Purple",
                              "Radiant Rose",
                              "Youthful Yellow",
                            ].map((label) => {
                              const lensLabel = `Sun Adaptive Lenses - ${label} (Prescription/Non-Prescription)`;
                              const checked = form.lensOptions?.some(
                                (opt) =>
                                  opt.type === "adaptive" &&
                                  opt.label === lensLabel
                              );
                              return (
                                <div className="checkbox-container" key={label}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      handleLensOptionsChange(
                                        lensLabel,
                                        "adaptive",
                                        2400
                                      )
                                    }
                                  />
                                  <label htmlFor={label.toLowerCase()}>
                                    {label}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
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
                        </div>
                        <div style={{ marginBottom: "10px" }}>
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
                        <div style={{ marginBottom: "10px" }}>
                          <label>Image URL:</label>
                          <input
                            type="text"
                            value={option.imageUrl}
                            onChange={(e) =>
                              handleColorOptionChange(
                                optionIndex,
                                "imageUrl",
                                e.target.value
                              )
                            }
                            placeholder="Paste image URL or upload below"
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              marginTop: "5px",
                            }}
                          />
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
                  </div>
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

              {/* Submit Button Only */}
              <div
                className="csd-post-button-container"
                style={{ margin: "10px 0 0 0" }}
              >
                <Button
                  className=""
                  type="submit"
                  children={<p>Update Eyeglass</p>}
                />
              </div>
            </form>
            <div
              className="csd-post-button-container"
              style={{ margin: "10px 0 0 0" }}
            >
              <Button
                className="delete-btn"
                type="button"
                onClick={handleDelete}
                style={{
                  marginLeft: 12,
                  background: "#e74c3c",
                  color: "#fff",
                }}
                children={<p>Delete Eyeglass</p>}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditEyeglassPage;
