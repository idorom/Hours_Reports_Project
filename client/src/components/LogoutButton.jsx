import React from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../utils/api'; // Adjust the path as necessary
import './LogoutButton.css'; // Create a CSS file for styling

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        await apiService.logout();
        localStorage.removeItem('authToken');  // Clear token from localStorage
        navigate('/login', { replace: true });  // Redirect to login page
    } catch (error) {
        console.error('Error during logout:', error);
    }
};

  return (
    <button className="logout_btn" onClick={handleLogout} >
      התנתק
    </button>
  );
}

export default LogoutButton;