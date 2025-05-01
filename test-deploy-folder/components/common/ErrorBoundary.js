import React from 'react';

/**
 * ErrorBoundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the entire app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // This lifecycle is invoked after an error has been thrown by a descendant component
  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  // This lifecycle is invoked after an error has been thrown by a descendant component
  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("React Error Boundary caught an error:", error, errorInfo);
    
    this.setState({
      errorInfo
    });
    
    // You could also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary-fallback" style={{ 
          padding: '2rem', 
          margin: '1rem', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '0.5rem',
          boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
        }}>
          <h1 style={{ color: '#dc3545' }}>Something went wrong</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          {process.env.NODE_ENV !== 'production' && (
            <div>
              <h2>Error Details</h2>
              <p style={{ 
                color: '#6c757d', 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f1f3f5',
                padding: '1rem',
                borderRadius: '0.25rem' 
              }}>
                {this.state.error && this.state.error.toString()}
              </p>
              <h3>Component Stack</h3>
              <p style={{ 
                color: '#6c757d', 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f1f3f5',
                padding: '1rem',
                borderRadius: '0.25rem' 
              }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    // If there's no error, render the children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
