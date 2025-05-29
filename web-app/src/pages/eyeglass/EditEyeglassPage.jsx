import { useState, useRef, useEffect } from "react";
import "../../styles/eyeglass/AddEyeglassPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import EyeglassPreview from "../../components/EyeglassPreview";

const EditEyeglassPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eyeglass = location.state?.eyeglass || null;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [productImages, setProductImages] = useState(eyeglass?.imageUrls || []);
  const [colorwayImages, setColorwayImages] = useState([]);
  const [name, setName] = useState(eyeglass?.name || "");
  const [description, setDescription] = useState(eyeglass?.description || "");
  const [price, setPrice] = useState(eyeglass?.price || "");
  const [productId] = useState(eyeglass?._id || null);
  const tintedRef = useRef(null);
  const sunAdaptiveRef = useRef(null);

  useEffect(() => {
    if (eyeglass) {
      setName(eyeglass.name || "");
      setDescription(eyeglass.description || "");
      setPrice(eyeglass.price || "");
      setProductImages(
        Array.isArray(eyeglass.imageUrls) ? eyeglass.imageUrls : []
      );
    }
  }, [eyeglass]);

  const handleToggle = (ref, shouldCheck) => {
    if (!ref?.current) return;
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
    setProductImages((prev) => [...prev, ...newPreviews.map((img) => img.url)]);
  };

  const handleColorwayImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      id: URL.createObjectURL(file),
      url: URL.createObjectURL(file),
    }));
    setColorwayImages((prev) => [...prev, ...newPreviews]);
  };

  const handleDeleteProductImage = (urlToRemove) => {
    setProductImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleDeleteColorwayImage = (idToRemove) => {
    setColorwayImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) return;
    try {
      await axios.put(`${SERVER_URL}/api/productRoutes/${productId}`, {
        name,
        description,
        price,
        imageUrls: productImages,
      });
      navigate("/dashboard/catalogue");
    } catch (err) {}
  };

  const handleBack = () => navigate(-1);

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
            <form className="add-eyeglass-form" onSubmit={handleSubmit}>
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
                        name="title"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="bsdf-input bsdfu-desc">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
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
                        id="price"
                        name="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
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
                        {(Array.isArray(productImages)
                          ? productImages
                          : []
                        ).map((url, idx) => (
                          <div key={url} className="isdc-img-box">
                            <img src={url} alt={`Upload ${idx}`} />
                            <a
                              type="button"
                              className="isd-img-delete-btn fade"
                              onClick={() => handleDeleteProductImage(url)}
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
                        {(Array.isArray(colorwayImages)
                          ? colorwayImages
                          : []
                        ).map((img, idx) => (
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
                          <input type="checkbox" name="oval" id="oval" />
                          <label htmlFor="oval">Oval</label>
                        </div>
                        <div className="checkbox-container">
                          <input type="checkbox" name="heart" id="heart" />
                          <label htmlFor="heart">Heart</label>
                        </div>
                      </div>
                      <div className="csdclc-second">
                        <div className="checkbox-container">
                          <input type="checkbox" name="round" id="round" />
                          <label htmlFor="round">Round</label>
                        </div>
                        <div className="checkbox-container">
                          <input type="checkbox" name="diamond" id="diamond" />
                          <label htmlFor="diamond">Diamond</label>
                        </div>
                      </div>
                      <div className="csdclc-third">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="rectangle"
                            id="rectangle"
                          />
                          <label htmlFor="rectangle">Rectangle</label>
                        </div>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="triangle"
                            id="triangle"
                          />
                          <label htmlFor="triangle">Triangle</label>
                        </div>
                      </div>
                      <div className="csdclc-fourth">
                        <div className="checkbox-container">
                          <input type="checkbox" name="square" id="square" />
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
                              htmlFor="tinted"
                              style={{ marginBottom: "10px" }}
                            >
                              <b>
                                <i>Tinted Lenses</i>
                              </b>
                            </label>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="samelenscolor_sun"
                                id="samelenscolor_sun"
                              />
                              <label htmlFor="samelenscolor_sun">
                                Same Lens Color
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="boostingblack_sun"
                                id="boostingblack_sun"
                              />
                              <label htmlFor="boostingblack_sun">
                                Boosting Black
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="blissfulblue_sun"
                                id="blissfulblue_sun"
                              />
                              <label htmlFor="blissfulblue_sun">
                                Blissful Blue
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="beamingbrown_sun"
                                id="beamingbrown_sun"
                              />
                              <label htmlFor="beamingbrown_sun">
                                Beaming Brown
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="gloriousgreen_sun"
                                id="gloriousgreen_sun"
                              />
                              <label htmlFor="gloriousgreen_sun">
                                Glorious Green
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="perfectpink_sun"
                                id="perfectpink_sun"
                              />
                              <label htmlFor="perfectpink_sun">
                                Perfect Pink
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="pleasingpurple_sun"
                                id="pleasingpurple_sun"
                              />
                              <label htmlFor="pleasingpurple_sun">
                                Pleasing Purple
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="radiantrose_sun"
                                id="radiantrose_sun"
                              />
                              <label htmlFor="radiantrose_sun">
                                Radiant Rose
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="youthfulyellow_sun"
                                id="youthfulyellow_sun"
                              />
                              <label htmlFor="youthfulyellow_sun">
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
                            <label
                              htmlFor="sun-adaptive"
                              style={{ marginBottom: "10px" }}
                            >
                              <b>
                                <i>Sun-Adaptive Lenses</i>
                              </b>
                            </label>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="samelenscolor"
                                id="samelenscolor"
                              />
                              <label htmlFor="samelenscolor">
                                Same Lens Color
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="boostingblack"
                                id="boostingblack"
                              />
                              <label htmlFor="boostingblack">
                                Boosting Black
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="blissfulblue"
                                id="blissfulblue"
                              />
                              <label htmlFor="blissfulblue">
                                Blissful Blue
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="beamingbrown"
                                id="beamingbrown"
                              />
                              <label htmlFor="beamingbrown">
                                Beaming Brown
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="gloriousgreen"
                                id="gloriousgreen"
                              />
                              <label htmlFor="gloriousgreen">
                                Glorious Green
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="perfectpink"
                                id="perfectpink"
                              />
                              <label htmlFor="perfectpink">Perfect Pink</label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="pleasingpurple"
                                id="pleasingpurple"
                              />
                              <label htmlFor="pleasingpurple">
                                Pleasing Purple
                              </label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="radiantrose"
                                id="radiantrose"
                              />
                              <label htmlFor="radiantrose">Radiant Rose</label>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                name="youthfulyellow"
                                id="youthfulyellow"
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
                      type="submit"
                      className=""
                      children={<p>Save Changes</p>}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
          {eyeglass && (
            <div style={{ margin: "2rem 0" }}>
              <h2>Preview Eyeglass</h2>
              <EyeglassPreview
                name={eyeglass.name}
                image={eyeglass.imageUrls?.[0]}
                description={eyeglass.description}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditEyeglassPage;
