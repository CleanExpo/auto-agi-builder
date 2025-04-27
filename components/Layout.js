import React from 'react';
import { useUI } from '../contexts';
import Link from 'next/link';

const Layout = ({ children }) => {
  const { toastVisible, toastMessage, toastType, hideToast } = useUI();

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="logo-container">
            {/* Logo will be displayed as a colored div for now */}
            <div 
              style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'var(--primary-color)',
                border: '2px solid var(--secondary-color)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  width: '70%',
                  height: '70%',
                  borderRadius: '50%',
                  border: '3px solid var(--secondary-color)'
                }}
              >
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    width: '40%',
                    height: '40%',
                    background: 'var(--accent-color)',
                    borderRadius: '50%'
                  }}
                ></div>
              </div>
            </div>
            <span className="logo-text">AGI Auto Builder</span>
          </div>

          <nav className="nav">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/features" className="nav-link">Features</Link>
            <Link href="/documentation" className="nav-link">Docs</Link>
            <Link href="/login" className="nav-link">Login</Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>© 2025 AGI Auto Builder - Intelligent Application Development</p>
        </div>
      </footer>

      {toastVisible && (
        <div className={`toast toast-${toastType}`} onClick={hideToast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Layout;
