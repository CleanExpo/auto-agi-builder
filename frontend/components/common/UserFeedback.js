import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { XIcon, ThumbUpIcon, ThumbDownIcon, ChatAlt2Icon, StarIcon } from '@heroicons/react/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/solid';

/**
 * UserFeedback component
 * Allows users to provide various types of feedback throughout the application
 */
const UserFeedback = ({
  type = 'thumbs',
  onSubmit,
  onClose,
  title = 'Share your feedback',
  messageLabel = 'What could we improve?',
  messagePrompt = 'Tell us what you think...',
  className = '',
  compact = false,
  placement = 'bottom-right',
  context = null,
  allowDismiss = true,
  showCloseAfterSubmit = true,
  initialValue = null
}) => {
  const [rating, setRating] = useState(initialValue || 0);
  const [liked, setLiked] = useState(initialValue === true);
  const [disliked, setDisliked] = useState(initialValue === false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Handle feedback submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (submitting || (type === 'message' && !message.trim())) {
      return;
    }
    
    setSubmitting(true);
    
    // Prepare feedback data
    const feedbackData = {
      type,
      timestamp: new Date().toISOString(),
      context
    };
    
    // Add value based on feedback type
    if (type === 'thumbs') {
      feedbackData.value = liked ? 'positive' : disliked ? 'negative' : null;
    } else if (type === 'rating') {
      feedbackData.value = rating;
    } else if (type === 'message') {
      feedbackData.value = message.trim();
    }
    
    // Submit feedback if callback provided
    if (onSubmit) {
      try {
        await onSubmit(feedbackData);
        setSubmitted(true);
      } catch (error) {
        console.error('Failed to submit feedback:', error);
      }
    } else {
      // For demo/testing
      console.log('Feedback submitted:', feedbackData);
      setSubmitted(true);
    }
    
    setSubmitting(false);
  };
  
  // Close the feedback component
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  
  // Determine placement classes
  let placementClasses = '';
  switch (placement) {
    case 'bottom-right':
      placementClasses = 'bottom-4 right-4';
      break;
    case 'bottom-left':
      placementClasses = 'bottom-4 left-4';
      break;
    case 'top-right':
      placementClasses = 'top-4 right-4';
      break;
    case 'top-left':
      placementClasses = 'top-4 left-4';
      break;
    case 'inline':
      placementClasses = '';
      break;
    default:
      placementClasses = 'bottom-4 right-4';
  }
  
  // Determine container classes based on placement and compact mode
  const containerClasses = placement !== 'inline' 
    ? `fixed ${placementClasses} z-40 ${className}` 
    : `relative ${className}`;
  
  const cardClasses = compact 
    ? 'shadow-sm rounded-md overflow-hidden max-w-sm'
    : 'shadow-lg rounded-lg overflow-hidden max-w-md';
  
  // Render thank you message after submission
  if (submitted && !showCloseAfterSubmit) {
    return null;
  }
  
  if (submitted) {
    return (
      <div className={containerClasses}>
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${cardClasses}`}>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Thanks for your feedback!</h3>
              {allowDismiss && (
                <button 
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your feedback helps us improve our application.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={containerClasses}>
      <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${cardClasses}`}>
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
            {allowDismiss && (
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="mt-4">
            {/* Thumbs feedback type */}
            {type === 'thumbs' && (
              <div className="flex justify-center space-x-6">
                <button
                  type="button"
                  onClick={() => {
                    setLiked(!liked);
                    setDisliked(false);
                  }}
                  className={`flex flex-col items-center p-2 rounded-md transition-colors duration-150 ${
                    liked 
                      ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400' 
                      : 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                  }`}
                >
                  <ThumbUpIcon className="h-8 w-8" />
                  <span className="mt-1 text-sm">Like</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setDisliked(!disliked);
                    setLiked(false);
                  }}
                  className={`flex flex-col items-center p-2 rounded-md transition-colors duration-150 ${
                    disliked 
                      ? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400' 
                      : 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                  }`}
                >
                  <ThumbDownIcon className="h-8 w-8" />
                  <span className="mt-1 text-sm">Dislike</span>
                </button>
              </div>
            )}
            
            {/* Star rating feedback type */}
            {type === 'rating' && (
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`p-1 focus:outline-none ${
                      value <= rating 
                        ? 'text-yellow-400 hover:text-yellow-500' 
                        : 'text-gray-300 hover:text-gray-400 dark:text-gray-600 dark:hover:text-gray-500'
                    }`}
                  >
                    {value <= rating ? (
                      <StarIconSolid className="h-8 w-8" />
                    ) : (
                      <StarIcon className="h-8 w-8" />
                    )}
                    <span className="sr-only">{value} stars</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Optional feedback message */}
            {(type === 'message' || (type === 'thumbs' && (liked || disliked)) || (type === 'rating' && rating > 0)) && (
              <div className="mt-4">
                <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {messageLabel}
                </label>
                <div className="mt-1">
                  <textarea
                    id="feedback-message"
                    name="message"
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder={messagePrompt}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required={type === 'message'}
                  />
                </div>
              </div>
            )}
            
            {/* Submit button */}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting || (type === 'thumbs' && !liked && !disliked) || (type === 'rating' && rating === 0) || (type === 'message' && !message.trim())}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

UserFeedback.propTypes = {
  type: PropTypes.oneOf(['thumbs', 'rating', 'message']),
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  title: PropTypes.string,
  messageLabel: PropTypes.string,
  messagePrompt: PropTypes.string,
  className: PropTypes.string,
  compact: PropTypes.bool,
  placement: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left', 'inline']),
  context: PropTypes.any,
  allowDismiss: PropTypes.bool,
  showCloseAfterSubmit: PropTypes.bool,
  initialValue: PropTypes.any
};

export default UserFeedback;

// Convenience button to trigger feedback popup
export const FeedbackButton = ({ onClick, className = '', variant = 'outline', size = 'md', label = 'Feedback' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    solid: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    outline: 'bg-white hover:bg-gray-50 text-blue-600 border-blue-300 hover:border-blue-400',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent'
  };
  
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center ${sizeClasses[size]} border rounded-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${variantClasses[variant]} ${className}`}
    >
      <ChatAlt2Icon className="-ml-0.5 mr-1.5 h-4 w-4" />
      {label}
    </button>
  );
};

FeedbackButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['solid', 'outline', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string
};
