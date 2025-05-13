import React, { useState } from 'react';
import '../../styles/eyeglass/AddEyeglassPage.css';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

const AddEyeglassPage = () => {
    const navigate = useNavigate();
    const handleBack = () => navigate('../eyeglasses');
    const [product, setProduct] = useState('');
    /* const addProduct = () => {
        setProduct(userdata);
    } */ /* raph eto yung iibahin para sa adding */

    return (
        <>
            <div className='page' id='add-eyeglass'>
                <Button className='' onClick={handleBack} children={<p>Back</p>} />

                <div className="add-eyeglass-content">
                    <div className='add-eyeglass-form'>
                        <form /* action={addProduct} */>
                            <h1>Product Information</h1>
                            <p style={{ color:'#666666' }}>As per usual.</p>

                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" placeholder="Short sleeve t-shirt" required />

                            <label for="description">Description</label>
                            <textarea id="description" name="description" placeholder="Enter product details..." required></textarea>

                            <label>Media</label>
                            <input type="file" id="media" name="media" />
                            <p class="hint">Accepts images, videos, or 3D models</p>

                            <h2>Pricing</h2>
                            <label for="price">Price</label>
                            <input type="number" id="price" name="price" placeholder="0.00" required />

                            <label for="cost">Cost per item</label>
                            <input type="number" id="cost" name="cost" placeholder="0.00" />

                            <h2>Inventory</h2>
                            <div class="checkbox-group">
                                <input type="checkbox" id="track-quantity" name="track_quantity" />
                                <label for="track-quantity">Track quantity</label>
                            </div>

                            <label for="quantity">Quantity</label>
                            <input type="number" id="quantity" name="stock_quantity" placeholder="0" required />

                            <label for="shop-location">Shop location</label>
                            <input type="text" id="shop-location" name="shop_location" placeholder="Enter shop location" required />

                            <label for="location-quantity">Shop location quantity available</label>
                            <input type="number" id="location-quantity" name="location_quantity" placeholder="0" />

                            <h2>Shipping</h2>
                            <div class="checkbox-group">
                                <input type="checkbox" id="physical-product" name="is_physical" />
                                <label for="physical-product">This is a physical product</label>
                            </div>

                            <label for="weight">Weight</label>
                            <input type="number" id="weight" name="weight" placeholder="0.0" />

                            <label for="weight-unit">Weight unit</label>
                            <select id="weight-unit" name="weight_unit">
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="lb">lb</option>
                                <option value="oz">oz</option>
                            </select>

                            <button type="submit" class="add-product-btn">Add Product</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddEyeglassPage;