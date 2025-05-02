import React from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/Layout.css';
import Navbar from '../components/Navbar.jsx';

const Layout = () => {
    return (
        <>
            <Navbar />
            <div className="layout-container">
                <Outlet />
            </div>
        </>
    );
};

export default Layout;