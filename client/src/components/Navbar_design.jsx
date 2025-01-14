import React from 'react';
import LogoutButton from './LogoutButton'; // Adjust the path as necessary
import './navbar_design.css'; // Create a CSS file for styling
import mainLogo from '../Calendar64.png'; // Import the React logo image

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logout_btn"> <LogoutButton /> </div>
      <div className="title">דיווח שעות</div>
      <img  src={mainLogo} alt="fireSpot"/>
    </div>
  );
};

export default Navbar;
