// /src/context/authcontext.tsx
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import type { UserData } from '../pages/dashboard/types';

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  login: (token: string) => void;
  logout: () => void;
}

// Создаем контекст с начальными значениями
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userData: null,
  setUserData: () => {},
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// Создаем провайдер, который будет управлять состоянием
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    // Можно добавить загрузку userData при наличии токена
  }, []);

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userData, setUserData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;