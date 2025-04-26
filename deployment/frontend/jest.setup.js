// Jest setup file for Auto AGI Builder frontend
import '@testing-library/jest-dom';
import { setLogger } from 'react-query';
import { TextDecoder, TextEncoder } from 'util';

// Mock matchMedia for components that rely on media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress react-query error logging during tests
setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {},
});

// Mock for ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock for IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock TextEncoder/TextDecoder for environments where it's not available
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage for testing
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Setup fetch mock
global.fetch = jest.fn();

// Silence console errors during tests
console.error = jest.fn();

// Add custom Jest matchers
expect.extend({
  toHaveBeenCalledWithMatch(received, ...expected) {
    const isSpy = received.calls && received.calls.all;
    
    if (!isSpy) {
      return {
        message: () => `${received} is not a spy or mock function`,
        pass: false,
      };
    }
    
    const calls = isSpy
      ? received.calls.all().map(call => call.args)
      : received.mock.calls;
    
    const match = calls.some(call =>
      expected.every((arg, i) =>
        this.equals(arg, call[i])
      )
    );
    
    return {
      message: () => `Expected ${received.name || 'spy'} to have been called with arguments matching ${expected.join(', ')}`,
      pass: match,
    };
  },
});
