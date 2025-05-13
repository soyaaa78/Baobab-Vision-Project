import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import baobablogo from '../assets/bvfull.png';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Hardcoded credentials (you can put this in a better place later)
    const accounts = {
        admin: { password: 'adminpass', role: 'admin' },
        staff: { password: 'staffpass', role: 'staff' },
    };

    const handleLogin = () => {
        const user = accounts[username];
        if (user && user.password === password) {
            setMessage('✅ Login successful!');
            // Save to localStorage for now (until context is added)
            localStorage.setItem('role', user.role);
            localStorage.setItem('isLoggedIn', 'true');
            navigate('/dashboard/home');
        } else {
            setMessage('❌ Invalid credentials.');
        }
    };

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

                <div className='input-fields'>
                    <input
                        type="text"
                        placeholder="Username"
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        onChange={e => setPassword(e.target.value)}
                    />

                    <div className='submit-container'>
                        <input
                            type="submit"
                            value="SIGN IN"
                            className='submit-button'
                            onClick={handleLogin}
                        />
                    </div>
                    {message && <p style={{ textAlign: 'center', marginTop: '1rem' }}>{message}</p>}
                </div>
            </div>
        </>
    );
};

export default LoginPage;
