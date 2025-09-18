// frontend/src/components/dashboardtempl.tsx
import React from 'react';
import Header from './header';

interface DashboardTemplProps {
  children: React.ReactNode;
}

const DashboardTempl: React.FC<DashboardTemplProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
};

export default DashboardTempl;