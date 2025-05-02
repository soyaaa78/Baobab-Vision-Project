import React from 'react'
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import baobablogo from '../assets/bvfull.png';


function Navbar() {
    return (
        <nav className="navigation">
            <div className='nav-content'>
                <div className='nav-logo-wrapper'>
                    <img src={baobablogo} className="logo" alt="Baobab Vision" />
                </div>

                <ul className="links">
                    <li>
                        <Link to = 'home' className='nav-button'>Home</Link>
                    </li>
                    <li>
                        <Link to = 'eyeglasses' className='nav-button'>Manage Eyeglass Selections</Link>
                    </li>
                    <li>
                        <Link to = '/articles' className='nav-button'>Statistics</Link>
                    </li>
                </ul>
            </div>
            
        </nav>
    )
}

export default Navbar