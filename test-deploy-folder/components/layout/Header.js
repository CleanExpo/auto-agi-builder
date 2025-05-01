import React, { useState } from 'react';
import Link from 'next/link';
import { useUI, useAuth } from '../../contexts';
import { LogoWithText } from '../../styles/theme';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useUI();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-navy-800' : 'bg-white'} border-b ${isDarkMode ? 'border-navy-600' : 'border-gray-200'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <LogoWithText height={40} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/product" className={`font-medium ${isDarkMode ? 'text-silver-400 hover:text-silver-100' : 'text-navy-600 hover:text-navy-800'}`}>
              Product
            </Link>
            <Link href="/features" className={`font-medium ${isDarkMode ? 'text-silver-400 hover:text-silver-100' : 'text-navy-600 hover:text-navy-800'}`}>
              Features
            </Link>
            <Link href="/documentation" className={`font-medium ${isDarkMode ? 'text-silver-400 hover:text-silver-100' : 'text-navy-600 hover:text-navy-800'}`}>
              Docs
            </Link>
            <Link href="/pricing" className={`font-medium ${isDarkMode ? 'text-silver-400 hover:text-silver-100' : 'text-navy-600 hover:text-navy-800'}`}>
              Pricing
            </Link>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-navy-700 text-silver-300' : 'bg-silver-300 text-navy-800'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-navy-700 text-silver-100 hover:bg-navy-600' : 'bg-silver-200 text-navy-800 hover:bg-silver-300'}`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-md bg-cyan-500 text-navy-900 hover:bg-cyan-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className={`px-4 py-2 rounded-md ${isDarkMode ? 'text-silver-100 hover:bg-navy-700' : 'text-navy-800 hover:bg-silver-200'}`}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-4 py-2 rounded-md bg-green-500 text-navy-900 hover:bg-green-400"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {!mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${isDarkMode ? 'text-silver-100' : 'text-navy-800'}`}>
                  <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${isDarkMode ? 'text-silver-100' : 'text-navy-800'}`}>
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${isDarkMode ? 'bg-navy-800 text-silver-100' : 'bg-white text-navy-800'} p-4 shadow-lg`}>
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/product" 
              className="py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Product
            </Link>
            <Link 
              href="/features" 
              className="py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/documentation" 
              className="py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>
            <Link 
              href="/pricing" 
              className="py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            
            <div className="border-t border-navy-600 dark:border-navy-500 pt-4 mt-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block w-full py-2 text-center rounded-md bg-navy-600 dark:bg-navy-500 text-silver-100 mb-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full py-2 text-center rounded-md bg-cyan-500 text-navy-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className="block w-full py-2 text-center rounded-md bg-navy-600 dark:bg-navy-500 text-silver-100 mb-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="block w-full py-2 text-center rounded-md bg-green-500 text-navy-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
