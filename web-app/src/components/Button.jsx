import React from 'react';
import '../styles/Button.css';

const Button = ({ className = '', children, onClick }) => {

    return (
        <button className={`button-component ${className}`} onClick ={onClick}>
            {children}
        </button>
    );
};

export default Button;