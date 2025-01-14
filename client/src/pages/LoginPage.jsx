import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../utils/api'; // Import the apiService
import './LoginPage.css';
import Notification from "../components/Notification.jsx";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();



  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("sfegfeuigjregjmruijgrujgujurejgrujgrurejrugejruejgrugjrugrjgru")

      const success = await apiService.login(email, password);
      if (success) {
        navigate('/', { replace: true });  // Navigate to HourReportPage on successful login
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError('המשתמש או הסיסמה אינם נכונים');
    }
  };

  return (
    <div className="login-page">
      {/* Stylish background wrapper */}
      <div className="login-background">
        <div className="login-content">
          <h2>התחברות</h2>
          <form onSubmit={handleLogin}>
            <div className="input-container">
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" " // Placeholder needed for floating label effect
              />
              <label htmlFor="email">משתמש</label>
            </div>
            <div className="input-container">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" " // Placeholder needed for floating label effect
              />
              <label htmlFor="password">סיסמה</label>
            </div>
            <button type="submit" className='submitB'>התחבר</button>
          </form>

          {error.length > 0 && (
            <Notification
              className="notification failure"
              content={error}
              width="15vw"
              type="msg"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;