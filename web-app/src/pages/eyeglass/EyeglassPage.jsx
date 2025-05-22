import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import '../../styles/eyeglass/EyeglassPage.css';
import placeholder from '../../assets/placeholder.png';

const EyeglassPage = () => {

    const navigate = useNavigate();
    const handleBack = () => navigate('../catalogue');

    return (
        <>
            <div className='page' id='edit-eyeglass'>
                <div className='edit-eyeglass-content'>

                    <Button className='' onClick={handleBack} children={<p>Back</p>} />
                    <div className='edit-eyeglass-bulk'>

                        <div className='ee-image-section'>
                            <div className='ee-product-image-wrapper'>
                                <div className='ee-product-main-img'>
                                    <img id='product-img' src={placeholder} alt="" />
                                </div>

                                <div className='ee-product-tertiary-imgs'>
                                    <img className='tertiary-img' id='ti-1' src={placeholder} alt="" />
                                    <img className='tertiary-img' id='ti-2' src={placeholder} alt="" />
                                    <img className='tertiary-img' id='ti-3' src={placeholder} alt="" />
                                </div>
                            </div>
                        </div>

                        <div className='ee-details-section'>
                            <div className='ee-header-wrapper'>
                                <div className='ee-header-text'>
                                    <h2>Placeholder Name</h2>
                                </div>
                                <div className='edit-eyeglass-button' id='top-edit'>
                                    <input type="submit" value="EDIT" className='submit-button'></input>
                                </div>

                            </div>
                            <div className='ee-details-body-text'>
                                <p>MIRANDA is best worn while strolling a lavish mansion, wondering how you can contact the real estate agent. <br /><br />

                                    Why you need MIRANDA: <br />
                                    - 51 x 18 x 145mm (frame-nose bridge-temple) <br />
                                    - Hypoallergenic polycarbonate frame that can handle anything <br />
                                    - Impact resistant and saltwater-proof <br />
                                    - Perfect for men and women with round, heart, diamond, and oval face shapes who want maximum sun coverage in style</p>
                            </div>

                            <div className='ee-details-color-selection'>
                                <div className='color-text'>
                                    <p>color: placeholder {/* change placeholder to be changable */}</p>
                                </div>

                                <div className='color-indicators'>
                                    <div className='colorcircle-border'>
                                        <div className='colorcircle' id='color1' />
                                    </div>
                                    <div className='colorcircle-border'>
                                        <div className='colorcircle' id='color2' />
                                    </div>
                                    <div className='colorcircle-border'>
                                        <div className='colorcircle' id='color3' />
                                    </div>
                                </div>


                            </div>

                            <div className='blackline' />


                            <div className='customer-section'>
                                <div className='price-section'>
                                    <p>₱(PLACEHOLDER VALUE).00 PHP</p> {/* replace */}
                                </div>

                                <div className='lens-type-section'>
                                    <div className='required-text-container'>
                                        <p>SELECT LENS TYPE</p>
                                        <p id='red'>&nbsp;*</p>
                                    </div>
                                </div>

                                <div className='ee-dropdown-section'>
                                    <div className='dropdown-container'>
                                        <form action="">
                                            <select name="lens" id="dropdown">
                                                <option value="test">Built-in UV400 Lenses (FREE)</option>
                                            </select>
                                        </form>
                                    </div>
                                    <div className='edit-eyeglass-button' id='bottom-edit'>
                                        <input type="submit" value="EDIT AVAILABILITY" className='submit-button'></input>
                                    </div>

                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default EyeglassPage