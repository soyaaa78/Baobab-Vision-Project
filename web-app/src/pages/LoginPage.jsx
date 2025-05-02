import React from 'react'
import baobablogo from '../assets/bvfull.png'
import '../styles/Login.css'

function LoginPage() {
    return (
        <>
            <div className="login-header">
                <img src={baobablogo} className="logo" alt="Baobab Vision" />
            </div>

            <div className='main-body'>
                <div className='yellowbox'>
                    <div className='yellowbox-text'>
                        <h1>Staff Login</h1>
                        <p>Heya, bud. Ready to take on the world?</p>
                    </div>
                </div>

                <div className='input-fields'> {/* fix responsiveness later */}
                    <input type="text" id="uname" name="username" placeholder="Username"></input>
                    <input type="password" id="pass" name="password" placeholder="Password"></input>
                    <div className='submit-container'>
                        <input type="submit" value="SIGN IN" className='submit-button'></input>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;