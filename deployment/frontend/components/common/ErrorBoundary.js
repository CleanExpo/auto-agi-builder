import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("UI Error:", error, errorInfo);
    
    // You could send to your own API endpoint or a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: error.toString(), 
            errorInfo: JSON.stringify(errorInfo),
            location: window.location.href,
            timestamp: new Date().toISOString()
          })
        }).catch(e => console.error("Error logging failed:", e));
      } catch (e) {
        console.error("Failed to send error report:", e);
      }
    }

    // You can also store the error info in state for displaying
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h2>Something went wrong</h2>
            <p>We're sorry for the inconvenience. The issue has been reported to our team.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="error-boundary-button"
            >
              Refresh the page
            </button>
            {process.env.NODE_ENV !== 'production' && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
