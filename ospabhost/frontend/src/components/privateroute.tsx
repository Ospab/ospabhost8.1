import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import useAuth from '../context/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  return isLoggedIn ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRoute;