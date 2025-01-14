import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ isValid, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isValid === null) return; // If still loading, do nothing
    if (!isValid && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
    if (isValid && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [isValid, location.pathname, navigate]);

  // Only render children if the token validity check has finished
  return isValid === null ? null : children;
};

export default ProtectedRoute;