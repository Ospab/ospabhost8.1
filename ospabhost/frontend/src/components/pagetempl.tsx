import Header from './header';
import Footer from './footer';
import React from 'react';

interface PageTmplProps {
  children: React.ReactNode;
}

const PageTmpl: React.FC<PageTmplProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageTmpl;