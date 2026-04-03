import { useState, useRef, useEffect } from "react";
import "../../styles/EditEyeglass.css";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router";
import axios from "axios";
import InfoModal from "../../components/InfoModal";
import Cookies from "js-cookie";

const EditEyeglassPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id;
  const handleBack = () => navigate("../catalogue");
  const [productImages, setProductImages] = useState([]);
  const [colorwayImages, setColorwayImages] = useState([]);
  const [eyeglass, setEyeglass] = useState({});
  const [originalEyeglass, setOriginalEyeglass] = useState({});
  const [colorwayModelFiles, setColorwayModelFiles] = useState([]);

  const [TOKEN, setToken] = useState();
  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t);
  }, []);

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
        const response = await axios.get(
          `${SERVER_URL}/api/products?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        );
        const data = response.data;
        setEyeglass(data);
        setOriginalEyeglass(JSON.parse(JSON.stringify(data))); // Deep copy for comparison
        // Process colorOptions to include existing images as imageFile references
        const processedColorOptions = (data.colorOptions || []).map(
          (option) => ({
            ...option,
            imageFile: option.imageUrl
              ? {
                  // Create a mock file object that represents the existing image
                  name: `existing_${option.name || "colorway"}.jpg`,
                  type: "image/jpeg",
                  size: 0,
                  lastModified: Date.now(),
                  // Store the URL for preview purposes
                  preview: option.imageUrl,
                }
              : null,
          })
        );

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
          colorOptions: processedColorOptions,
          stock: data.stock || 0,
          recommendedFor: !!data.recommendedFor,
        });
        setProductImages(
          (data.imageUrls || []).map((url) => ({
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
        setColorwayModelFiles(
          (data.colorOptions || []).map((opt) =>
            opt.model3dUrl
              ? {
                  name: `${data.name} - ${opt.name}.glb`,
                  url: opt.model3dUrl,
                  originalUrl: opt.model3dUrl,
                  rawFile: null,
                }
              : null
          )
        );
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (id && TOKEN) {
      fetchEyeglass();
    }
  }, [id, TOKEN, SERVER_URL]);

  // Check if any changes were made
  const hasChanges = () => {
    if (!originalEyeglass.name) return false;

    // Check basic fields
    if (form.name !== originalEyeglass.name) return true;
    if (form.description !== originalEyeglass.description) return true;
    if (form.price !== String(originalEyeglass.price)) return true;
    if (form.stock !== originalEyeglass.stock) return true;
    if (form.recommendedFor !== !!originalEyeglass.recommendedFor) return true;

    // Check specs
    if (
      JSON.stringify(form.specs.sort()) !==
      JSON.stringify((originalEyeglass.specs || []).sort())
    )
      return true;

    // Check lens options (excluding _id fields for comparison)
    const cleanLensOptions = (options) =>
      options.map(({ label, type, price }) => ({ label, type, price }));
    if (
      JSON.stringify(cleanLensOptions(form.lensOptions)) !==
      JSON.stringify(cleanLensOptions(originalEyeglass.lensOptions || []))
    )
      return true;

    // Check product images
    const currentImageUrls = productImages.map((img) => img.url).sort();
    const originalImageUrls = (originalEyeglass.imageUrls || []).sort();
    if (JSON.stringify(currentImageUrls) !== JSON.stringify(originalImageUrls))
      return true;

    // Check color options
    if (
      JSON.stringify(form.colorOptions) !==
      JSON.stringify(originalEyeglass.colorOptions || [])
    )
      return true;

    // Check colorway images
    const currentColorwayData = colorwayImages.map((img) => ({
      url: img.url,
      name: img.name,
    }));
    const originalColorwayData = (originalEyeglass.colorOptions || []).map(
      (opt) => ({ url: opt.imageUrl, name: opt.name })
    );
    if (
      JSON.stringify(currentColorwayData) !==
      JSON.stringify(originalColorwayData)
    )
      return true;

    // If any new 3D model file was added, that's a change
    if (
      (colorwayModelFiles || []).some(
        (m) => m && m.rawFile && m.rawFile instanceof File
      )
    ) {
      return true;
    }

    // Check 3D models (existing URLs vs original)
    const currentModels = colorwayModelFiles.map(
      (model) => model?.originalUrl || model?.url || null
    );
    const originalModels = (originalEyeglass.colorOptions || []).map(
      (opt) => opt.model3dUrl || null
    );
    if (JSON.stringify(currentModels) !== JSON.stringify(originalModels))
      return true;

    return false;
  };

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

  const handleDeleteProductImage = (idToRemove) => {
    setProductImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const handleDeleteColorwayImage = (idToRemove) => {
    setColorwayImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };
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

    // Update 3D model display names if product name changed
    if (name === "name") {
      setColorwayModelFiles((prev) => {
        return prev.map((modelFile, index) => {
          if (modelFile && modelFile.name) {
            const colorOptionName =
              form.colorOptions[index]?.name || `Color ${index + 1}`;
            return {
              ...modelFile,
              name: `${value || "Product"} - ${colorOptionName}.glb`,
            };
          }
          return modelFile;
        });
      });
    }
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
      const updated = {
        ...newColorOptions[optionIndex],
        [field]: value,
      };

      // Enforce color constraints when type changes
      if (field === "type") {
        const colors = Array.isArray(updated.colors)
          ? [...updated.colors]
          : ["#000000"];
        if (value === "solid") {
          updated.colors = colors.length ? [colors[0]] : ["#000000"];
        } else if (value === "split" || value === "swatch") {
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

    // Update 3D model display name if the option name changed
    if (field === "name" && colorwayModelFiles[optionIndex]) {
      setColorwayModelFiles((prev) => {
        const next = [...prev];
        if (next[optionIndex] && next[optionIndex].name) {
          next[optionIndex] = {
            ...next[optionIndex],
            name: `${form.name || "Product"} - ${value}.glb`,
          };
        }
        return next;
      });
    }
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
      const opt = newColorOptions[optionIndex];
      const colors = Array.isArray(opt.colors) ? [...opt.colors] : [];
      const type = opt.type;
      const limit = type === "solid" ? 1 : 2;
      if (colors.length >= limit) return prev; // do nothing
      colors.push("#000000");
      newColorOptions[optionIndex] = { ...opt, colors };
      return { ...prev, colorOptions: newColorOptions };
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
  // 3D model helpers for drag-and-drop per colorway
  const is3dModelFile = (file) =>
    !!file && /\.(glb)$/i.test((file.name || "").toLowerCase());
  const handleColorwayModelDrop = (e, optionIndex) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && is3dModelFile(file)) {
      const colorOptionName =
        form.colorOptions[optionIndex]?.name || `Color ${optionIndex + 1}`;
      const displayFile = {
        name: `${form.name || "Product"} - ${colorOptionName}.glb`,
        rawFile: file,
      };
      setColorwayModelFiles((prev) => {
        const next = [...prev];
        next[optionIndex] = displayFile;
        return next;
      });
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate color options
    for (const [idx, opt] of form.colorOptions.entries()) {
      const type = opt.type || "solid";
      const count = (opt.colors || []).length;
      if (type === "solid" && count !== 1) {
        setModal({
          open: true,
          title: "Invalid Color Option",
          message: `Color Option ${
            idx + 1
          }: Solid Color requires exactly 1 color.`,
          variant: "error",
        });
        setIsSubmitting(false);
        return;
      }
      if ((type === "split" || type === "swatch") && count !== 2) {
        setModal({
          open: true,
          title: "Invalid Color Option",
          message: `Color Option ${idx + 1}: ${
            type === "split" ? "Split Color" : "Color Swatch"
          } requires exactly 2 colors.`,
          variant: "error",
        });
        setIsSubmitting(false);
        return;
      }
      if (
        !opt.imageFile ||
        (!opt.imageFile.preview && !(opt.imageFile instanceof File))
      ) {
        setModal({
          open: true,
          title: "Missing Colorway Image",
          message: `Color Option ${idx + 1}: Image is required.`,
          variant: "error",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Build FormData for all fields and files
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    // Add product images
    productImages.forEach((img) => {
      if (img.file) formData.append("productImages", img.file);
    });

    // Add colorway images and models (only new files)
    form.colorOptions.forEach((opt, idx) => {
      // Only append if it's a new file (not an existing image with preview property)
      if (opt.imageFile && opt.imageFile instanceof File) {
        formData.append(
          "colorwayImages",
          opt.imageFile,
          `colorway_${idx}_${opt.imageFile.name}`
        );
      }
      if (colorwayModelFiles[idx] && colorwayModelFiles[idx].rawFile) {
        formData.append(
          "colorwayModels3d",
          colorwayModelFiles[idx].rawFile,
          `colorway_${idx}_${colorwayModelFiles[idx].rawFile.name}`
        );
      }
    });

    // Add product ID for update
    formData.append("id", id);

    try {
      await axios.put(`${SERVER_URL}/api/products?id=${id}`, formData, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setModal({
        open: true,
        title: "Success",
        message: "Product updated successfully.",
        variant: "success",
        onPrimary: handleBack,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update product.";
      setModal({
        open: true,
        title: "Error",
        message: errorMsg,
        variant: "error",
        onPrimary: null,
      });
    } finally {
      setIsSubmitting(false);
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
      await axios.delete(`${SERVER_URL}/api/products?id=${eyeglass._id}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      setModal({
        open: true,
        title: "Product Deleted",
        message: `"${
          eyeglass?.name || "Product"
        }" has been deleted successfully.`,
        variant: "success",
        onPrimary: () => navigate("../catalogue"),
      });
      return; // Prevent further code execution after navigation
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to delete eyeglass.";
      setModal({
        open: true,
        title: "Delete Failed",
        message: msg,
        variant: "error",
      });
    }
  };

  return (
    <>
      <div className="page" id="edit-eyeglass">
        <div className="edit-eyeglass-content">
          <div className="ee-header">
            <div className="ee-header-text">
              <h1>Edit Product</h1>
              <p style={{ color: "#666666" }}>
                Got the wrong color? A typo in the description, perhaps?
              </p>
            </div>
            <Button className="" onClick={handleBack} children={<p>Back</p>} />
          </div>

          <div className="edit-eyeglass-form-container">
            <form className="edit-eyeglass-form" onSubmit={handleUpdate}>
              {/* Basic Info Section */}
              <div className="eef-section eef-basic-sect">
                <div className="section-details bsd">
                  <div className="bsd-header">
                    <h2>Basic Info</h2>
                  </div>
                  <div className="eef-sect-fields bsd-upper">
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

                  <div className="eef-sect-fields bsd-lower">
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
              <div className="eef-section eef-image-sect">
                <div className="section-details isd">
                  <div className="isd-header">
                    <h2>Product Media</h2>
                  </div>
                  <div className="eef-sect-fields isd-content">
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
                  </div>
                </div>
              </div>

              {/* Categories and Specifications Section */}
              <div className="eef-section eef-category-sect">
                <div className="section-details csd">
                  <div className="csd-header">
                    <h2>Categories and Specifications</h2>
                  </div>
                  <div className="eef-sect-fields csd-content">
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
                    <div className="eef-sect-fields csd-lower">
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
                        <div className="eef-sect-fields csd-lens" id="builtin">
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

                        <div className="eef-sect-fields csd-lens" id="tinted">
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
                          className="eef-sect-fields csd-lens"
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
              <div className="eef-section eef-color-sect">
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
                  <div className="eef-sect-fields">
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
                          {/* Preview chip (blended) */}
                          {(() => {
                            const c = option.colors || ["#000000"];
                            const c1 = c[0] || "#000000";
                            const c2 = c[1] || c1;
                            let bg = c1;
                            if (option.type === "split") {
                              // Smooth diagonal blend
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
                                className="eef-color-container"
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
                                  className="eef-color-picker"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveColorFromOption(
                                      optionIndex,
                                      colorIndex
                                    )
                                  }
                                  className="eef-color-remove"
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
                        {/* Per-colorway image upload and preview */}
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
                                src={
                                  option.imageFile.preview ||
                                  URL.createObjectURL(option.imageFile)
                                }
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
                                  const colorOptionName =
                                    form.colorOptions[optionIndex]?.name ||
                                    `Color ${optionIndex + 1}`;
                                  const displayFile = {
                                    name: `${
                                      form.name || "Product"
                                    } - ${colorOptionName}.glb`,
                                    rawFile: file,
                                  };
                                  setColorwayModelFiles((prev) => {
                                    const next = [...prev];
                                    next[optionIndex] = displayFile;
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
                                File:{" "}
                                {colorwayModelFiles[optionIndex]?.name ||
                                  "Unknown file"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setColorwayModelFiles((prev) => {
                                    const next = [...prev];
                                    next[optionIndex] = null; // explicit removal
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
                    <button
                      type="button"
                      onClick={handleAddColorOption}
                      style={{
                        backgroundColor: "#222222",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "10px 15px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                        marginTop: "10px",
                        width: "fit-content",
                      }}
                    >
                      + Add Color Option
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Product Fields Section */}
              <div className="eef-section eef-additional-sect">
                <div className="section-details">
                  <div className="section-header">
                    <h2>Additional Product Information</h2>
                  </div>
                  <div
                    className="eef-sect-fields"
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

              {/* Action Buttons */}
              <div className="eef-submit-container">
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges()}
                  className={`eef-submit-btn ${
                    !hasChanges() || isSubmitting ? "disabled" : ""
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Update Eyeglass"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="eef-submit-btn eef-delete-btn"
                >
                  Delete Eyeglass
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <InfoModal
        isOpen={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        primaryText={modal.onPrimary ? "Continue" : "OK"}
        onPrimary={modal.onPrimary}
      />
    </>
  );
};

export default EditEyeglassPage;
