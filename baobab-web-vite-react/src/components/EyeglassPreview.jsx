import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/EyeglassPreview.css';
import placeholder from '../assets/placeholder.png';


/* this thing should link to the product page affter linking */

function EyeglassPreview() {
    return (
        <>
            <Link to='/home' className='eyeglass-listing'>
                <div className='listing-content'> {/* this needs to be small enough to fit within a grid without blowing it over */}
                    <div className='bg'>
                        <div className='content-container'>
                            <div className='pic'>
                                <img id='eyeglass-img' src={placeholder} alt="placeholder" /> {/* placeholder (incl. alt text) to be replaced by, duh, actual javascript stuff like in flutter */}
                            </div>
                            <div className='desc-container'> {/* think abt implementing straight to edit button here and thusly making the div inline? */}
                                <div className='eyeglass-name'>
                                    <p>Placeholder Name</p>
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