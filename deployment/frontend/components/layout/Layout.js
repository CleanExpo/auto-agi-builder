import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useUI } from '../../contexts';

const Layout = ({ children }) => {
  const { isDarkMode } = useUI();
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
