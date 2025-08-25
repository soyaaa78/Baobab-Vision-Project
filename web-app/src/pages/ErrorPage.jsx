import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ErrorPage.css';
import Button from '../components/Button';

const ErrorPage = () => {
    const navigate = useNavigate();
    const returnHome = () => navigate('../');

    return (
        <>
            <div className='error-container'>
                <div className='error-content'>
                    <div className='error-bulk'>

                        <h1>Drat.</h1>
                        <div className='error-bodytext'>
                            <p>Something went wrong. Either the page you entered does not exist, or something broke. <br /> Don't worry; this isn't on you.</p>
    
                            <Button className='error-button' onClick={returnHome} children={<p>Return to Home </p>} />
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default ErrorPage;