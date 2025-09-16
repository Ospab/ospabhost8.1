import { Navigate } from 'react-router-dom';
import React from 'react';
import useAuth from '../context/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;