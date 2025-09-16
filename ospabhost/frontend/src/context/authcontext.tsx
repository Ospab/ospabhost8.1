// /src/context/authcontext.tsx
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Создаем контекст с начальными значениями
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// Создаем провайдер, который будет управлять состоянием
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Проверяем статус входа при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;