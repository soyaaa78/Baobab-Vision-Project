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
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    // Add more fields as needed
  });

  const tintedRef = useRef(null);
  const sunAdaptiveRef = useRef(null);

  useEffect(() => {
    const fetchEyeglass = async () => {
      try {
        const response = await axios.get(
          `${SERVER_URL}/api/productRoutes?id=${id}`
        );
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
          lensOptions: data.lensOptions || [],
          // Add more fields as needed
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
      console.log(updatedEyeglass);
      await axios.put(
        `${SERVER_URL}/api/productRoutes?id=${eyeglass._id}`,
        updatedEyeglass
      );
      alert("Eyeglass updated successfully!");
      window.location.reload();
    } catch (error) {
      alert("Failed to update eyeglass.");
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
                        accept=".usd,.usdc,.usdz"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="aef-section aef-category-sect">
                <div className="section-details csd">
                  <div className="csd-header">
                    <h2>Categories and Specifications</h2>
                  </div>

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
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="oval"
                            checked={form.specs?.includes("Oval")}
                            onChange={() => handleSpecsChange("Oval")}
                          />
                          <label htmlFor="oval">Oval</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="heart"
                            checked={form.specs?.includes("Heart")}
                            onChange={() => handleSpecsChange("Heart")}
                          />
                          <label htmlFor="heart">Heart</label>
                        </div>
                      </div>
                      <div className="csdclc-second">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="round"
                            checked={form.specs?.includes("Round")}
                            onChange={() => handleSpecsChange("Round")}
                          />
                          <label htmlFor="round">Round</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="diamond"
                            checked={form.specs?.includes("Diamond")}
                            onChange={() => handleSpecsChange("Diamond")}
                          />
                          <label htmlFor="diamond">Diamond</label>
                        </div>
                      </div>
                      <div className="csdclc-third">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="rectangle"
                            checked={form.specs?.includes("Rectangle Shape")}
                            onChange={() =>
                              handleSpecsChange("Rectangle Shape")
                            }
                          />
                          <label htmlFor="rectangle">Rectangle</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="triangle"
                            checked={form.specs?.includes("Triangle")}
                            onChange={() => handleSpecsChange("Triangle")}
                          />
                          <label htmlFor="triangle">Triangle</label>
                        </div>
                      </div>

                      <div className="csdclc-fourth">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="square"
                            checked={form.specs?.includes("Square")}
                            onChange={() => handleSpecsChange("Square")}
                          />
                          <label htmlFor="square">Square</label>
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
                          Select all that apply.
                        </p>
                      </div>
                      <div className="csdl-lens-container">
                        <div className="aef-sect-fields csd-lens" id="tinted">
                          <div
                            className="bsdf-input csdfl-lens-options"
                            ref={tintedRef}
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
                      children={<p>Update Eyeglass</p>}
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

export default EditEyeglassPage;
