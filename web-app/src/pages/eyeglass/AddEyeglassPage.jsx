import React, { useState } from 'react';
import '../../styles/eyeglass/AddEyeglassPage.css';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

const AddEyeglassPage = () => {
    const navigate = useNavigate();
    const handleBack = () => navigate('../eyeglasses');
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files); /* files = uploaded files from (input, in this case) */
        const newPreviews = files.map(file => ({
            id: URL.createObjectURL(file),
            url: URL.createObjectURL(file)
        })); /* files.map puts everything uploaded in an array and returns it as the functional newPreviews array constant  */
        setImagePreviews(prev => [...prev, ...newPreviews]); /* three dots (aka spread operator) SPREADS items into the new array  */
    }

    const handleDeleteImage = (idToRemove) => {
        setImagePreviews(prev =>
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

                    {<div className='ae-header'>
                        <div className='ae-header-text'>
                            <h1>Add Product</h1>
                            <p style={{ color: '#666666' }}>Time to hash out the details.</p>
                        </div>
                        <Button className='' onClick={handleBack} children={<p>Back</p>} />
                    </div>}

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

                                        <div className="isdc-img-grid">
                                            {imagePreviews.map((img, idx) => (
                                                <div key={img.id} className="isdc-img-box">
                                                    <img src={img.url} alt={`Upload ${idx}`} />
                                                    <a
                                                        type="button"
                                                        className="isd-img-delete-btn fade"
                                                        onClick={() => handleDeleteImage(img.id)}
                                                    >
                                                        <div className='isd-img-delete-btn-text'>
                                                            <p>X</p>
                                                            <p>Remove</p>
                                                        </div>
                                                    </a>
                                                </div>
                                            ))}

                                            <label className="isdc-img-upload-box">
                                                <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                                                <span>+<br />Add Product</span>
                                            </label>
                                        </div>

                                        <label>Virtual Try-On 3D Model</label>
                                        <input type="file" id="3dmodel" name="media" accept=".usd,.usdc,.usdz" />
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
                                                <div className='radio-container'>
                                                    <input type="radio" name="oval" id="" />
                                                    <label for="oval">Oval</label>
                                                </div>

                                                <div className='radio-container'>
                                                    <input type="radio" name="heart" id="" />
                                                    <label for="heart">Heart</label>
                                                </div>
                                            </div>
                                            <div className='csdclc-second'>
                                                <div className='radio-container'>
                                                    <input type="radio" name="round" id="" />
                                                    <label for="round">Round</label>
                                                </div>

                                                <div className='radio-container'>
                                                    <input type="radio" name="diamond" id="" />
                                                    <label for="diamond">Diamond</label>
                                                </div>
                                            </div>
                                            <div className='csdclc-third'>
                                                <div className='radio-container'>
                                                    <input type="radio" name="rectangle" id="" />
                                                    <label for="rectangle">Rectangle</label>
                                                </div>

                                                <div className='radio-container'>
                                                    <input type="radio" name="triangle" id="" />
                                                    <label for="triangle">Triangle</label>
                                                </div>
                                            </div>

                                            <div className='csdclc-fourth'>
                                                <div className='radio-container'>
                                                    <input type="radio" name="square" id="" />
                                                    <label for="square">Square</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='csdc-lens-inclusions'>
                                            <div className='radio-container'>
                                                <input type="radio" name="sal" id="" checked />
                                                <label for="sal">Include Sun Adaptive Lens options</label>
                                            </div>
                                            <div className='radio-container'>
                                                <input type="radio" name="tl" id="" checked />
                                                <label for="tl">Include Tinted Lenses options</label>
                                            </div>

                                        </div>
                                    </div>

                                    <div className='csd-post-button-container'>
                                        <Button className='' onClick={handleBack} children={<p>Add to Catalogue</p>} />
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