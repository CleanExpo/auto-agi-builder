import { useEffect } from 'react';

/**
 * useKeyboardShortcuts Hook
 * 
 * A custom React hook for handling keyboard shortcuts in the application
 * Allows registering multiple keyboard shortcuts with associated callbacks
 * 
 * @param {Object} shortcuts - Object mapping key combinations to handler functions
 * @param {boolean} active - Whether the shortcuts are currently active (default: true)
 */
export const useKeyboardShortcuts = (shortcuts, active = true) => {
  useEffect(() => {
    if (!active || !shortcuts) return;
    
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when user is typing in an input, textarea, or contentEditable element
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }
      
      // Build key identifier from key and modifiers
      let keyPressed = event.key;
      
      // Check if the pressed key combination matches any shortcuts
      const handler = shortcuts[keyPressed];
      
      if (handler && typeof handler === 'function') {
        // Prevent default browser behavior for this key
        event.preventDefault();
        // Call the handler function
        handler(event);
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, active]);
};

/**
 * Keyboard Shortcut Combinations
 * 
 * Constants for common keyboard shortcut combinations
 * Use these to ensure consistency across the application
 */
export const KeyboardShortcuts = {
  SAVE: 'ctrl+s',
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  COPY: 'ctrl+c',
  PASTE: 'ctrl+v',
  CUT: 'ctrl+x',
  FIND: 'ctrl+f',
  HELP: '?',
  ESCAPE: 'Escape',
  NEXT: 'ArrowRight',
  PREVIOUS: 'ArrowLeft',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  ENTER: 'Enter',
  SPACE: ' ',
  DELETE: 'Delete',
  FULLSCREEN: 'f',
  TOGGLE_NOTES: 'n',
  TOGGLE_GRID: 'g',
  TOGGLE_DARK_MODE: 'd'
};

/**
 * useGlobalShortcuts Hook
 * 
 * A specialized hook for application-wide keyboard shortcuts
 * Maintains a consistent set of shortcuts throughout the app
 * 
 * @param {Object} customHandlers - Custom handlers for global shortcuts
 * @param {boolean} active - Whether the shortcuts are currently active
 */
export const useGlobalShortcuts = (customHandlers = {}, active = true) => {
  const globalShortcuts = {
    [KeyboardShortcuts.HELP]: () => {
      // Show keyboard shortcuts help modal
      if (customHandlers.showHelpModal && typeof customHandlers.showHelpModal === 'function') {
        customHandlers.showHelpModal();
      }
    },
    [KeyboardShortcuts.TOGGLE_DARK_MODE]: () => {
      // Toggle dark mode
      if (customHandlers.toggleDarkMode && typeof customHandlers.toggleDarkMode === 'function') {
        customHandlers.toggleDarkMode();
      }
    },
    ...customHandlers
  };
  
  useKeyboardShortcuts(globalShortcuts, active);
};

export default useKeyboardShortcuts;
