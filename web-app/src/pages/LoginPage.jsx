import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import baobablogo from '../assets/bvfull.png';
import '../styles/Login.css';
import axios from 'axios';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('login');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await axios.post('http://localhost:3001/api/admin/login', {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const { token, role } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            navigate('/dashboard');

        } catch (err) {
            const res = err.response;
            if (res?.data?.requiresVerification) {
                setStep('verify');
                setEmail(res.data.email);
                localStorage.setItem('pendingEmail', res.data.email);
                return;
            }
            setError(res?.data?.message || 'Login failed');
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await axios.post('http://localhost:3001/api/admin/verify-otp', {
                email,
                otp
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.removeItem('pendingEmail');

            setSuccess('Account successfully verified!');
            setTimeout(() => navigate('/dashboard/home'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setSuccess('');
        try {
            await axios.post('http://localhost:3001/api/admin/resend-otp', {
                email
            });
            setSuccess('Verification code resent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code');
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
                        <h1>{step === 'login' ? 'Staff Login' : 'Email Verification'}</h1>
                        <p>
                            {step === 'login'
                                ? 'Heya, bud. Ready to take on the world?'
                                : `OTP sent to ${email}`}
                        </p>
                    </div>
                </div>

                {step === 'login' ? (
                    <form className='input-fields' onSubmit={handleLogin}>
                        <input
                            type="text"
                            id="uname"
                            name="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            id="pass"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className='submit-container'>
                            <input type="submit" value="SIGN IN" className='submit-button' />
                        </div>
                    </form>
                ) : (
                    <form className='input-fields' onSubmit={handleVerify}>
                        <input
                            type="text"
                            id="otp"
                            name="otp"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            required
                        />
                        <div className='submit-container'>
                            <input type="submit" value="VERIFY" className='submit-button' />
                        </div>
                        <div className='submit-container'>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className='submit-button'
                                style={{ marginTop: '10px' }}
                            >
                                Resend Verification Code
                            </button>
                        </div>
                    </form>
                )}

                {/* ✅ Message block positioned below the form */}
                {(error || success) && (
                    <div className="form-message-box">
                        {error && <p className="form-error">{error}</p>}
                        {success && <p className="form-success">{success}</p>}
                    </div>
                )}
            </div>
        </>
    );
};

export default LoginPage;
