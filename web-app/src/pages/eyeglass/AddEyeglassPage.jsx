import { useState, useRef } from 'react';
import '../../styles/eyeglass/AddEyeglassPage.css';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const AddEyeglassPage = () => {
    const navigate = useNavigate();
    const handleBack = () => navigate('../catalogue');
    const [productImages, setProductImages] = useState([]);
    const [colorwayImages, setColorwayImages] = useState([]);

    const tintedRef = useRef(null);
    const sunAdaptiveRef = useRef(null);

    const handleToggle = (ref, shouldCheck) => {
        const checkboxes = ref.current.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = shouldCheck;
        });
    };


    const handleProductImageChange = (e) => {
        const files = Array.from(e.target.files); /* files = uploaded files from (input, in this case) */
        const newPreviews = files.map(file => ({
            id: URL.createObjectURL(file),
            url: URL.createObjectURL(file)
        })); /* files.map puts everything uploaded in an array and returns it as the functional newPreviews array constant  */
        setProductImages(prev => [...prev, ...newPreviews]); /* three dots (aka spread operator) SPREADS items into the new array  */
    }

    const handleColorwayImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => ({
            id: URL.createObjectURL(file),
            url: URL.createObjectURL(file)
        }));
        setColorwayImages(prev => [...prev, ...newPreviews]);
    }

    const handleDeleteProductImage = (idToRemove) => {
        setProductImages(prev =>
            prev.filter(img => img.id !== idToRemove)
        );
    };

    const handleDeleteColorwayImage = (idToRemove) => {
        setColorwayImages(prev =>
            prev.filter(img => img.id !== idToRemove)
        );
    };



    const [product, setProduct] = useState('');
    /* const addProduct = () => {
        setProduct(userdata);
    } */ /* raph eto yung iibahin para sa adding */

    return (
        <>
            <div className='page' id='add-eyeglass'>


                <div className="add-eyeglass-content">

                    <div className='ae-header'>
                        <div className='ae-header-text'>
                            <h1>Add Product</h1>
                            <p style={{ color: '#666666' }}>Time to hash out the details.</p>
                        </div>
                        <Button className='' onClick={handleBack} children={<p>Back</p>} />
                    </div>

                    <div className='add-eyeglass-form-container'>
                        <form /* action={addProduct} */ className='add-eyeglass-form'>

                            <div className='aef-section aef-basic-sect'>
                                <div className='section-details bsd'>
                                    <div className='bsd-header'>
                                        <h2>Basic Info</h2>
                                    </div>
                                    <div className='aef-sect-fields bsd-upper'>
                                        <div className='bsdf-input bsdfu-name'>
                                            <label for="title">Product Name</label>
                                            <input type="text" id="title" name="title" placeholder="John or whatever" required />
                                        </div>
                                        <div className='bsdf-input bsdfu-desc'>
                                            <label for="description">Description</label>
                                            <textarea id="description" name="description" placeholder="Enter Product Details" required></textarea>
                                        </div>
                                    </div>

                                    <div className='bsd-price-header'>
                                        <h2>Product Price</h2>
                                    </div>

                                    <div className='aef-sect-fields bsd-lower'>
                                        <div className='bsdf-input bsdfl-price'>
                                            <label for="title">Price</label>
                                            <input type="number" min="1" step="any" placeholder='-1 PHP' required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='aef-section aef-image-sect'>
                                <div className='section-details isd'>
                                    <div className='isd-header'>
                                        <h2>Product Media</h2>
                                    </div>
                                    <div className='aef-sect-fields isd-content'>

                                        <div>
                                            <label >Product Images</label>
                                            <div className="isdc-img-grid" id='product-images' >
                                                {productImages.map((img, idx) => (
                                                    <div key={img.id} className="isdc-img-box">
                                                        <img src={img.url} alt={`Upload ${idx}`} />
                                                        <a
                                                            type="button"
                                                            className="isd-img-delete-btn fade"
                                                            onClick={() => handleDeleteProductImage(img.id)}
                                                        >
                                                            <div className='isd-img-delete-btn-text'>
                                                                <FontAwesomeIcon icon={faXmark} />
                                                                <p>Remove</p>
                                                            </div>
                                                        </a>
                                                    </div>
                                                ))}



                                                <label className="isdc-img-upload-box">
                                                    <input type="file" accept="image/*" multiple onChange={handleProductImageChange} />
                                                    <span>+<br />Add Product</span>
                                                </label>
                                            </div>
                                        </div>


                                        <div>
                                            <label >Colorway Images</label>
                                            <div className="isdc-img-grid" id='colorway-images'>
                                                {colorwayImages.map((img, idx) => (
                                                    <div key={img.id} className="isdc-img-box">
                                                        <img src={img.url} alt={`Upload ${idx}`} />
                                                        <a
                                                            type="button"
                                                            className="isd-img-delete-btn fade"
                                                            onClick={() => handleDeleteColorwayImage(img.id)}
                                                        >
                                                            <div className='isd-img-delete-btn-text'>
                                                                <p>X</p>
                                                                <p>Remove</p>
                                                            </div>
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>



                                            <label className="isdc-img-upload-box">
                                                <input type="file" accept="image/*" multiple onChange={handleColorwayImageChange} />
                                                <span>+<br />Add Product</span>
                                            </label>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <label>Virtual Try-On 3D Model</label>
                                            <input type="file" id="3dmodel" name="media" accept=".usd,.usdc,.usdz" /> {/* papalitan pa to accommodate 3d model file types */}
                                        </div>


                                    </div>

                                </div>
                            </div>

                            <div className='aef-section aef-category-sect'>
                                <div className='section-details csd'>
                                    <div className='csd-header'>
                                        <h2>Categories and Specifications</h2>
                                    </div>

                                    {/* "Oval", "Round", "Rectangle", "Square", "Heart", "Diamond", "Triangle" */}

                                    <div className='aef-sect-fields csd-content'>
                                        <div className='csdc-header'>
                                            <p style={{ fontFamily: 'Rubik' }}>Face Shape Classification</p>
                                            <p style={{ fontFamily: 'Rubik', fontSize: '0.7em', color: '#8f8f8f' }}>Select all that apply.</p>
                                        </div>
                                        <div className='csdc-lens-categorization'>
                                            <div className='csdclc-first'>
                                                <div className='checkbox-container'>
                                                    <input type="checkbox" name="oval" id="" />
                                                    <label for="oval">Oval</label>
                                                </div>

                                                <div className='checkbox-container'>
                                                    <input type="checkbox" name="heart" id="" />
                                                    <label for="heart">Heart</label>
                                                </div>
                                            </div>
                                            <div className='csdclc-second'>
                                                <div className='checkbox-container'>
                                                    <input type="checkbox" name="round" id="" />
                                                    <label for="round">Round</label>
                                                </div>

                                                <div className='checkbox-container'>
                                                    <input type="checkbox" name="diamond" id="" />
                                                    <label for="diamond">Diamond</label>
                                                </div>
                                            </div>
                                            <div className='csdclc-third'>
                                                <div className='checkbox-container'>
                                                    <input type="checkbox" name="rectangle" id="" />
                                                    <label for="rectangle">Rectangle</label>
                                                </div>

                                                <div className='checkbox-container'>
                                                    <input type="checkbox" name="triangle" id="" />
                                                    <label for="triangle">Triangle</label>
                                                </div>
                                            </div>

                                            <div className='csdclc-fourth'>
                                                <div className='checkbox-container'>
                                                    <input type="checkbox" name="square" id="" />
                                                    <label for="square">Square</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='aef-sect-fields csd-lower'>
                                            <div>
                                                <p style={{ fontFamily: 'Rubik' }}>Lens Options Inclusions</p>
                                                <p style={{ fontFamily: 'Rubik', fontSize: '0.7em', color: '#8f8f8f', marginTop: "5px" }}>Select all that shall be offered.</p>
                                            </div>
                                            <div className='csdl-lens-container'>
                                                <div className='aef-sect-fields csd-lens' id='tinted'>
                                                    <div className='bsdf-input csdfl-lens-options' ref={tintedRef}>

                                                        <label for="title" style={{ marginBottom: '10px' }}><b><i>Tinted Lenses</i></b></label>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="samelenscolor" id="" />
                                                            <label for="samelenscolor">Same Lens Color</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="boostingblack" id="" />
                                                            <label for="boostingblack">Boosting Black</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="blissfulblue" id="" />
                                                            <label for="blissfulblue">Blissful Blue</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="beamingbrown" id="" />
                                                            <label for="beamingbrown">Beaming Brown</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="gloriousgreen" id="" />
                                                            <label for="gloriousgreen">Glorious Green</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="perfectpink" id="" />
                                                            <label for="perfectpink">Perfect Pink</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="pleasingpurple" id="" />
                                                            <label for="pleasingpurple">Pleasing Purple</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="radiantrose" id="" />
                                                            <label for="radiantrose">Radiant Rose</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="youthfulyellow" id="" />
                                                            <label for="youthfulyellow">Youthful Yellow</label>
                                                        </div>

                                                        <div className='csd-lens-multiselect'>
                                                            <button type="button" onClick={() => handleToggle(tintedRef, true)}>Select All</button>
                                                            <button type="button" onClick={() => handleToggle(tintedRef, false)}>Select None</button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="aef-sect-fields csd-lens" id='sun-adaptive'>
                                                    <div className='bsdf-input csdfl-lens-options' ref={sunAdaptiveRef}>

                                                        <label for="title" style={{ marginBottom: '10px' }}><b><i>Sun-Adaptive Lenses</i></b></label>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="samelenscolor_sun" id="" />
                                                            <label for="samelenscolor">Same Lens Color</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="boostingblack_sun" id="" />
                                                            <label for="boostingblack">Boosting Black</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="blissfulblue_sun" id="" />
                                                            <label for="blissfulblue">Blissful Blue</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="beamingbrown_sun" id="" />
                                                            <label for="beamingbrown">Beaming Brown</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="gloriousgreen_sun" id="" />
                                                            <label for="gloriousgreen">Glorious Green</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="perfectpink_sun" id="" />
                                                            <label for="perfectpink">Perfect Pink</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="pleasingpurple_sun" id="" />
                                                            <label for="pleasingpurple">Pleasing Purple</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="radiantrose_sun" id="" />
                                                            <label for="radiantrose">Radiant Rose</label>
                                                        </div>

                                                        <div className='checkbox-container'>
                                                            <input type="checkbox" name="youthfulyellow_sun" id="" />
                                                            <label for="youthfulyellow">Youthful Yellow</label>
                                                        </div>



                                                        <div className='csd-lens-multiselect'>
                                                            <button type="button" onClick={() => handleToggle(sunAdaptiveRef, true)}>Select All</button>
                                                            <button type="button" onClick={() => handleToggle(sunAdaptiveRef, false)}>Select None</button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className='csd-post-button-container' style={{ margin: '10px 0 0 0' }}>
                                        <Button className='' onClick={handleBack} children={<p>Add to Catalogue</p>} /> {/* change onclick to add to db */}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddEyeglassPage;