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

  const tintedRef = useRef(null);
  const sunAdaptiveRef = useRef(null);

  const handleToggle = (ref, shouldCheck) => {
    const checkboxes = ref.current.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      cb.checked = shouldCheck;
    });
  };

  const handleProductImageChange = (e) => {
    const files = Array.from(
      e.target.files
    ); /* files = uploaded files from (input, in this case) */
    const newPreviews = files.map((file) => ({
      id: URL.createObjectURL(file),
      url: URL.createObjectURL(file),
    })); /* files.map puts everything uploaded in an array and returns it as the functional newPreviews array constant  */
    setProductImages((prev) => [
      ...prev,
      ...newPreviews,
    ]); /* three dots (aka spread operator) SPREADS items into the new array  */
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

  // --- Submit handler ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const newProduct = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        specs: form.specs,
        lensOptions: form.lensOptions,
        // stock, numStars, recommendedFor, sales, colorOptions, imageUrls can be added later
      };
      const res = await axios.post(
        `${SERVER_URL}/api/productRoutes/`,
        newProduct
      );
      alert("Product added successfully!");
      navigate("../catalogue");
    } catch (error) {
      alert("Failed to add product.");
      console.error(error);
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
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label>Virtual Try-On 3D Model</label>
                      <input
                        type="file"
                        id="3dmodel"
                        name="media"
                        accept=".usd,.usdc,.usdz"
                      />{" "}
                      {/* papalitan pa to accommodate 3d model file types */}
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
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="oval"
                            checked={form.specs.includes("Oval")}
                            onChange={() => handleSpecsChange("Oval")}
                          />
                          <label for="oval">Oval</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="heart"
                            checked={form.specs.includes("Heart")}
                            onChange={() => handleSpecsChange("Heart")}
                          />
                          <label for="heart">Heart</label>
                        </div>
                      </div>
                      <div className="csdclc-second">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="round"
                            checked={form.specs.includes("Round")}
                            onChange={() => handleSpecsChange("Round")}
                          />
                          <label for="round">Round</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="diamond"
                            checked={form.specs.includes("Diamond")}
                            onChange={() => handleSpecsChange("Diamond")}
                          />
                          <label for="diamond">Diamond</label>
                        </div>
                      </div>
                      <div className="csdclc-third">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="rectangle"
                            checked={form.specs.includes("Rectangle Shape")}
                            onChange={() =>
                              handleSpecsChange("Rectangle Shape")
                            }
                          />
                          <label for="rectangle">Rectangle</label>
                        </div>

                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="triangle"
                            checked={form.specs.includes("Triangle")}
                            onChange={() => handleSpecsChange("Triangle")}
                          />
                          <label for="triangle">Triangle</label>
                        </div>
                      </div>

                      <div className="csdclc-fourth">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="square"
                            checked={form.specs.includes("Square")}
                            onChange={() => handleSpecsChange("Square")}
                          />
                          <label for="square">Square</label>
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
