import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import HourReportPage from './pages/HourReportPage';
import LoginPage from './pages/LoginPage';
import apiService from './utils/api'; // Import your apiService
import Navbar from "./components/Navbar_design.jsx";

const App = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isValid_, setIsValid] = useState(false);

    useEffect(() => {
        // Function to check token validity
        const checkToken = async () => {
            const { isValid } = apiService.getTokenDetails(); // Assuming you get the token details like this

            if (isValid) {
                setIsValid(isValid)
                navigate('/', { replace: true }); // Navigate to the correct page
            } else {
                localStorage.removeItem('authToken'); // Remove the invalid token
                navigate('/login', { replace: true }); // Navigate to login
            }

        };

        // Call the token checker once after mounting
        if (loading) {
            checkToken().finally(() => setLoading(false)); // Ensure the loading state gets turned off
        }
    }, [loading, navigate]);

    return (
        <>
            <Navbar />
            <Routes>                
                <Route path="/" element={<HourReportPage />}  />
                <Route path="/login" element={<LoginPage />}  />
                <Route path="/" element={<Navigate to={isValid_ ?  "/" : "/login"} replace />} />
                <Route path="/login" element={<Navigate to={isValid_ ?  "/login" : "/"} replace />} />
            </Routes>
        </>
    );
};

export default App;