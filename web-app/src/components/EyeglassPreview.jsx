import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/EyeglassPreview.css';
import placeholder from '../assets/placeholder.png';
import Button from './Button';



const EyeglassPreview = ({ className = '', deleteMode = false }) => {
    

    

    return (
        <>
            <Link to='/dashboard/eyeglasses' className={`eyeglass-listing ${className}`}> {/* change on context */}
                <div className='listing-content'>
                    <div className='bg'>
                        <div className='content-container'>
                            <div className='pic'>
                                <img id='eyeglass-img' src={placeholder} alt="placeholder" /> {/* placeholder (incl. alt text) to be replaced actual javascript stuff like in flutter */}
                            </div>
                            <div className='desc-container'>
                                <div className='eyeglass-descriptor'>
                                    <div className='eyeglass-name'>
                                        <h3><b>REID</b></h3>
                                    </div>

                                   <div className='eyeglass-buttons'>
                                     {deleteMode && <Button 
                                         className='button-component--listing delete'
                                         /* onClick={delete(specificParam)} */ /* change after array */
                                         children={<p>Delete</p>} />
                                     }
                                     <Button className='button-component--listing' children={<p>Edit</p>}/> {/* pass parameter to specify which array joint to look into */}
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </Link>
        </>
    )
}

export default EyeglassPreview