/**
 * Performance utilities for the Auto AGI Builder application.
 * This file contains utilities for improving application performance, 
 * including code splitting, lazy loading, and caching mechanisms.
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook for lazy loading components with loading state
 * @param {Function} importFunc - Dynamic import function
 * @returns {Object} { Component, loading, error }
 */
export const useLazyComponent = (importFunc) => {
  const [state, setState] = useState({
    Component: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const module = await importFunc();
        
        if (mounted) {
          setState({
            Component: module.default,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error lazy loading component:', error);
        
        if (mounted) {
          setState({
            Component: null,
            loading: false,
            error
          });
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [importFunc]);

  return state;
};

/**
 * Simple in-memory cache for API responses
 */
export class APICache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxAge = options.maxAge || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100; // Maximum cache entries
  }

  /**
   * Get an item from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    // Check if item is expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  /**
   * Set an item in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} customMaxAge - Custom TTL in milliseconds
   */
  set(key, value, customMaxAge) {
    // Manage cache size - remove oldest items if needed
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.findOldestKey();
      if (oldestKey) this.cache.delete(oldestKey);
    }
    
    const expiry = Date.now() + (customMaxAge || this.maxAge);
    this.cache.set(key, { value, expiry, timestamp: Date.now() });
  }

  /**
   * Remove an item from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Find the oldest cache key
   * @returns {string|null} Oldest key or null if cache is empty
   */
  findOldestKey() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }
}

// Create singleton instances for common caches
export const apiCache = new APICache();
export const staticDataCache = new APICache({ maxAge: 60 * 60 * 1000 }); // 1 hour

/**
 * Wrapper for fetch with caching support
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} cacheOptions - Caching options
 * @returns {Promise<*>} Response data
 */
export const fetchWithCache = async (url, options = {}, cacheOptions = {}) => {
  const { 
    cache = apiCache,
    useCache = true,
    maxAge = null,
    cacheKey = null
  } = cacheOptions;
  
  // Generate cache key from URL and options, unless explicitly provided
  const key = cacheKey || `${url}-${JSON.stringify(options.method || 'GET')}-${JSON.stringify(options.body || '')}`;
  
  // Return cached value if available
  if (useCache) {
    const cachedData = cache.get(key);
    if (cachedData) return cachedData;
  }
  
  // Perform fetch
  const response = await fetch(url, options);
  
  // Handle error responses
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }
  
  // Parse response based on content type
  let data;
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType && contentType.includes('text/')) {
    data = await response.text();
  } else {
    data = await response.blob();
  }
  
  // Cache response
  if (useCache) {
    cache.set(key, data, maxAge);
  }
  
  return data;
};

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce wait time in milliseconds 
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Create a throttled function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Custom hook for detecting if a component is visible in viewport
 * for lazy loading content
 * @param {Object} options - IntersectionObserver options
 * @returns {[React.MutableRefObject, boolean]} [ref, isVisible]
 */
export const useInView = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options, ref]);

  return [ref, isVisible];
};

/**
 * Utility for prefetching data for better perceived performance
 * @param {string} url - URL to prefetch
 * @param {Object} options - Fetch options
 */
export const prefetchData = (url, options = {}) => {
  // Store prefetched URLs to avoid duplicate fetches
  if (!window.__prefetchedUrls) {
    window.__prefetchedUrls = new Set();
  }
  
  // Check if already prefetched
  if (window.__prefetchedUrls.has(url)) return;
  
  // Add to prefetched list
  window.__prefetchedUrls.add(url);
  
  // Perform the fetch but don't wait for it
  fetch(url, options)
    .then(response => {
      if (!response.ok) throw new Error('Prefetch failed');
      return response;
    })
    .catch(error => {
      console.warn('Error prefetching data:', error);
      // Remove from prefetched list on error
      window.__prefetchedUrls.delete(url);
    });
};
