import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { handleComponentError } from '../../utils/errorHandling';
import { useUI } from '../../contexts/UIContext';
import ErrorMessage from './ErrorMessage';

/**
 * Error boundary component to catch JavaScript errors in child component tree
 * and display a fallback UI instead of crashing the whole app
 */

// Higher-order component to access the UI context inside class component
const withUIContext = (WrappedComponent) => {
  return function WithUIContext(props) {
    const uiContext = useUI();
    return <WrappedComponent {...props} uiContext={uiContext} />;
  };
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error and capture additional info
    this.setState({ errorInfo });
    
    const { uiContext, silent } = this.props;
    const showNotification = uiContext?.showNotification;
    
    // Only handle error with notifications if not silent
    if (!silent) {
      handleComponentError(error, errorInfo, showNotification);
    }
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    const { children, fallback, silent, FallbackComponent } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // If a custom fallback UI is provided, use it
      if (FallbackComponent) {
        return <FallbackComponent error={error} errorInfo={errorInfo} />;
      }
      
      // If fallback prop is provided, use it
      if (fallback) {
        return fallback;
      }
      
      // Default fallback UI
      return (
        <ErrorMessage 
          title="Something went wrong"
          message="We encountered an error while rendering this component."
          details={process.env.NODE_ENV === 'development' ? error?.message : null}
          tryAgain={this.props.resetError ? () => {
            this.setState({ hasError: false, error: null, errorInfo: null });
            if (this.props.resetError) this.props.resetError();
          } : null}
        />
      );
    }

    // If no error, render children normally
    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  FallbackComponent: PropTypes.elementType,
  silent: PropTypes.bool,
  resetError: PropTypes.func,
  onError: PropTypes.func,
  uiContext: PropTypes.shape({
    showNotification: PropTypes.func
  })
};

ErrorBoundary.defaultProps = {
  silent: false
};

// Wrap ErrorBoundary with UI context
export default withUIContext(ErrorBoundary);

// Function component wrapper for easier use
export const withErrorBoundary = (Component, options = {}) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...options}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};
