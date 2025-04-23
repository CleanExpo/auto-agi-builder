# Handling Network Errors in Auto AGI Builder

This document provides guidance on how to handle network errors, particularly `ECONNRESET`, in the Auto AGI Builder application using the Context 7 and Sequential Thinking methodologies.

## Understanding ECONNRESET

`ECONNRESET` (Connection Reset by Peer) is a common network error that occurs when a connection is abruptly closed by the remote host. In JavaScript/Node.js applications, this typically manifests as:

```
Error: read ECONNRESET
    at TCP.onStreamRead (node:internal/stream_base_commons:217:20)
```

### Common Causes

1. **Network instability**: Temporary network disruptions or unstable connections
2. **Server timeouts**: Server closing connections that have been idle too long
3. **Load balancers**: Timeout policies at load balancer level
4. **Firewall rules**: Aggressive firewall settings closing connections
5. **Rate limiting**: Exceeding API rate limits causing server to drop connections
6. **Client abrupt disconnection**: User closing browser tab or navigating away during request

## Sequential Thinking Approach

When addressing ECONNRESET errors, follow this sequential approach:

1. **Identify occurrence points**: Determine where in the application these errors occur
2. **Implement detection**: Add proper error catching and logging
3. **Add resilience**: Implement retry mechanisms with exponential backoff
4. **Graceful degradation**: Ensure non-critical features fail gracefully
5. **Monitor and refine**: Track error rates and adjust strategies

## Context 7 Implementation

Using the Context 7 methodology, we consider seven layers of context when handling network errors:

### 1. User Experience Context

```javascript
// In frontend/lib/api.js - Graceful error handling with user feedback
export const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      timeout: options.timeout || 10000, // 10 second timeout
    });
    return await response.json();
  } catch (error) {
    // Determine if it's a network error
    const isNetworkError = error.message.includes('ECONNRESET') || 
                          error.message.includes('Failed to fetch') ||
                          error.message.includes('NetworkError');
    
    if (isNetworkError) {
      // Log for analytics
      if (analytics && analytics.trackError) {
        analytics.trackError('network', error.message, {
          url,
          method: options.method || 'GET'
        });
      }
      
      // Show appropriate message to user
      // Non-blocking for non-critical operations
      if (!options.critical) {
        console.error('Network error occurred:', error);
        return { error: 'network', message: 'A network error occurred. Please try again.' };
      } else {
        // For critical operations, might want to show a modal or toast notification
        throw new Error('Network connection lost. Please check your connection and try again.');
      }
    }
    
    throw error; // Re-throw other errors
  }
};
```

### 2. Application Logic Context

```javascript
// In frontend/utils/analytics.js - Apply retry logic for tracking events
export const trackEventWithRetry = async (category, action, label, value, options = {}) => {
  const maxRetries = options.maxRetries || 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      await trackEvent(category, action, label, value, options);
      return true; // Success
    } catch (error) {
      lastError = error;
      
      // Only retry network errors
      if (!error.message.includes('ECONNRESET') && 
          !error.message.includes('Failed to fetch') &&
          !error.message.includes('NetworkError')) {
        break;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 300 + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }

  // Log failed attempts after all retries exhausted
  console.error(`Failed to track event after ${maxRetries} attempts:`, lastError);
  
  // For analytics, we can degrade gracefully - store in localStorage for later retry
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const pendingEvents = JSON.parse(localStorage.getItem('pendingAnalyticsEvents') || '[]');
      pendingEvents.push({
        category, action, label, value, options, timestamp: Date.now()
      });
      localStorage.setItem('pendingAnalyticsEvents', JSON.stringify(pendingEvents));
    } catch (e) {
      console.error('Failed to store event for later retry:', e);
    }
  }
  
  return false; // Indicate failure
};

// Function to retry sending pending events on reconnection
export const retryPendingEvents = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  
  try {
    const pendingEvents = JSON.parse(localStorage.getItem('pendingAnalyticsEvents') || '[]');
    if (pendingEvents.length === 0) return;
    
    // Process in batches to avoid overwhelming the network
    const processBatch = async (batch) => {
      const results = await Promise.allSettled(
        batch.map(event => 
          trackEvent(event.category, event.action, event.label, event.value, event.options)
        )
      );
      
      // Return indices of successful events
      return results
        .map((result, index) => result.status === 'fulfilled' ? index : -1)
        .filter(index => index !== -1);
    };
    
    // Process in batches of 5
    const batchSize = 5;
    const processAllBatches = async () => {
      let remaining = [...pendingEvents];
      
      while (remaining.length > 0) {
        const batch = remaining.slice(0, batchSize);
        const successIndices = await processBatch(batch);
        
        // Remove successful events from remaining
        successIndices.reverse().forEach(index => {
          remaining.splice(index, 1);
        });
        
        // Wait a bit between batches
        if (remaining.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Update localStorage with remaining events
      localStorage.setItem('pendingAnalyticsEvents', JSON.stringify(remaining));
    };
    
    processAllBatches();
  } catch (e) {
    console.error('Error retrying pending events:', e);
  }
};

// Add network status detection to retry on reconnection
if (typeof window !== 'undefined') {
  window.addEventListener('online', retryPendingEvents);
}
```

### 3. Network Infrastructure Context

```javascript
// In frontend/lib/api.js - Add connection health monitoring
let connectionHealthy = true;
let connectionHealthChecks = [];

// Network health check
export const checkConnectionHealth = async () => {
  try {
    // Use a lightweight endpoint for health check
    const response = await fetch('/api/health', { 
      method: 'HEAD',
      timeout: 3000 
    });
    
    const newStatus = response.ok;
    if (newStatus !== connectionHealthy) {
      connectionHealthy = newStatus;
      // Notify subscribers
      connectionHealthChecks.forEach(cb => cb(connectionHealthy));
      
      // If connection restored, retry pending operations
      if (connectionHealthy && typeof retryPendingEvents === 'function') {
        retryPendingEvents();
      }
    }
    return connectionHealthy;
  } catch (e) {
    if (connectionHealthy) {
      connectionHealthy = false;
      connectionHealthChecks.forEach(cb => cb(false));
    }
    return false;
  }
};

// Subscribe to connection health changes
export const onConnectionHealthChange = (callback) => {
  connectionHealthChecks.push(callback);
  return () => {
    connectionHealthChecks = connectionHealthChecks.filter(cb => cb !== callback);
  };
};

// Periodic health checks in background
if (typeof window !== 'undefined') {
  setInterval(checkConnectionHealth, 30000); // Every 30 seconds
  
  // Also check on visibility change (tab becomes active)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkConnectionHealth();
    }
  });
}
```

### 4. Timeout and Circuit Breaking Context

```javascript
// In frontend/lib/api.js - Implement circuit breaker pattern
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.lastFailureTime = null;
    this.onStateChange = options.onStateChange || (() => {});
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      // Check if it's time to try again
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.onStateChange(this.state);
      } else {
        throw new Error('Circuit is OPEN - service unavailable');
      }
    }
    
    try {
      const result = await fn();
      
      // Success - reset if in HALF_OPEN
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      // Track network failures
      if (error.message.includes('ECONNRESET') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('timeout')) {
        
        this.lastFailureTime = Date.now();
        this.failureCount++;
        
        if (this.state === 'CLOSED' && this.failureCount >= this.failureThreshold) {
          this.state = 'OPEN';
          this.onStateChange(this.state);
        } else if (this.state === 'HALF_OPEN') {
          this.state = 'OPEN';
          this.onStateChange(this.state);
        }
      }
      
      throw error;
    }
  }
  
  reset() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
    this.onStateChange(this.state);
  }
}

// Create circuit breakers for different services
const analyticsCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 60000, // 1 minute
  onStateChange: (state) => {
    console.log(`Analytics circuit breaker state changed to: ${state}`);
    // Optionally notify user if analytics is down
  }
});

// Use circuit breaker with analytics calls
export const trackEventWithCircuitBreaker = async (...args) => {
  try {
    return await analyticsCircuitBreaker.execute(() => trackEvent(...args));
  } catch (error) {
    // If circuit is open, store for later
    if (error.message.includes('Circuit is OPEN')) {
      // Store in localStorage for later retry
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const pendingEvents = JSON.parse(localStorage.getItem('pendingAnalyticsEvents') || '[]');
          pendingEvents.push({
            args,
            timestamp: Date.now()
          });
          localStorage.setItem('pendingAnalyticsEvents', JSON.stringify(pendingEvents));
        } catch (e) {
          console.error('Failed to store event for later retry:', e);
        }
      }
      return false; // Indicate circuit is open
    }
    
    throw error; // Re-throw other errors
  }
};
```

### 5. Backend API Context

```javascript
// In app/api/v1/api.py - Handle ECONNRESET at the API level
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import logging
import time
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from typing import Callable
import asyncio

logger = logging.getLogger(__name__)

# Custom middleware to handle connection resets
class ConnectionErrorMiddleware:
    def __init__(self, app: FastAPI, max_retries: int = 3):
        self.app = app
        self.max_retries = max_retries
        
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
            
        # For HTTP requests, wrap in retry logic
        async def retry_receive():
            try:
                return await receive()
            except ConnectionResetError:
                logger.warning("Connection reset during request processing")
                # Create a response indicating connection reset
                return {
                    "type": "http.response.start",
                    "status": HTTP_503_SERVICE_UNAVAILABLE,
                    "headers": [(b"content-type", b"application/json")],
                }
                
        # Modified send that handles connection errors
        async def resilient_send(message):
            retries = 0
            while retries < self.max_retries:
                try:
                    await send(message)
                    return
                except ConnectionResetError:
                    logger.warning(f"Connection reset during response sending (attempt {retries+1}/{self.max_retries})")
                    retries += 1
                    if retries < self.max_retries:
                        await asyncio.sleep(0.5 * (2 ** retries))  # Exponential backoff
            
            # If we get here, all retries failed
            logger.error("Failed to send response after maximum retries due to connection resets")
        
        await self.app(scope, retry_receive, resilient_send)

# Add this middleware to FastAPI app
app = FastAPI()
app.add_middleware(ConnectionErrorMiddleware, max_retries=3)

# Health check endpoint for connection monitoring
@app.head("/api/health")
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": time.time()}
```

### 6. Logging and Monitoring Context

```python
# In app/core/monitoring/network.py - Monitor and alert on network errors
import logging
import time
from collections import deque
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class NetworkErrorMonitor:
    def __init__(self, window_seconds=300, threshold=10):
        self.errors = deque(maxlen=1000)  # Store up to 1000 errors
        self.window_seconds = window_seconds  # 5-minute rolling window
        self.threshold = threshold  # Alert threshold
        self.alerted = False
        self.last_alert_time = None
    
    def record_error(self, error_type, details=None):
        """Record a network error occurrence"""
        timestamp = time.time()
        self.errors.append({
            'timestamp': timestamp,
            'type': error_type,
            'details': details
        })
        
        # Check if we need to alert
        self.check_alert_threshold()
        
        return {
            'recorded': True,
            'total_errors': len(self.errors),
            'recent_errors': self.get_recent_error_count()
        }
    
    def get_recent_error_count(self):
        """Get error count in the current window"""
        now = time.time()
        window_start = now - self.window_seconds
        
        return sum(1 for error in self.errors if error['timestamp'] >= window_start)
    
    def check_alert_threshold(self):
        """Check if error threshold is exceeded and alert if needed"""
        recent_count = self.get_recent_error_count()
        now = time.time()
        
        # Determine if we should alert (throttle alerts to max once per 10 minutes)
        should_alert = (
            recent_count >= self.threshold and
            (not self.alerted or 
             not self.last_alert_time or 
             now - self.last_alert_time > 600)  # 10 minutes
        )
        
        if should_alert:
            logger.critical(
                f"Network error threshold exceeded: {recent_count} ECONNRESET errors in the last {self.window_seconds} seconds"
            )
            # In a real system, this could trigger a PagerDuty alert, email, etc.
            self.alerted = True
            self.last_alert_time = now
            
            # Return the most common error types for diagnosis
            error_types = {}
            for error in list(self.errors)[-recent_count:]:
                error_type = error.get('type', 'unknown')
                error_types[error_type] = error_types.get(error_type, 0) + 1
            
            most_common = sorted(error_types.items(), key=lambda x: x[1], reverse=True)
            logger.error(f"Most common error types: {most_common}")
        elif recent_count < self.threshold and self.alerted:
            logger.info("Network error rate has returned to normal levels")
            self.alerted = False
    
    def get_error_stats(self):
        """Get error statistics for monitoring dashboards"""
        now = time.time()
        
        # Error count by minute for the last hour
        hour_ago = now - 3600
        by_minute = {}
        
        for error in self.errors:
            if error['timestamp'] >= hour_ago:
                minute = int(error['timestamp'] // 60 * 60)
                by_minute[minute] = by_minute.get(minute, 0) + 1
        
        # Sort by time
        by_minute_sorted = sorted(by_minute.items())
        
        return {
            'total_recorded': len(self.errors),
            'recent_window': self.get_recent_error_count(),
            'by_minute': by_minute_sorted,
            'is_alerting': self.alerted
        }

# Create a global instance
network_monitor = NetworkErrorMonitor()

# In middleware or error handlers
def handle_network_error(error, details=None):
    if "ECONNRESET" in str(error):
        network_monitor.record_error("ECONNRESET", details)
```

### 7. Environment Context

```python
# In app/core/config.py - Configure network resilience settings
from pydantic import BaseSettings, Field

class NetworkSettings(BaseSettings):
    """Network resilience configuration"""
    
    # Retry settings
    DEFAULT_MAX_RETRIES: int = Field(3, description="Default maximum number of retries for network operations")
    DEFAULT_RETRY_DELAY_MS: int = Field(500, description="Base delay between retries in milliseconds")
    MAX_RETRY_DELAY_MS: int = Field(8000, description="Maximum delay between retries in milliseconds")
    RETRY_JITTER_MS: int = Field(100, description="Random jitter to add to retry delays in milliseconds")
    
    # Timeout settings
    DEFAULT_CONNECT_TIMEOUT_MS: int = Field(5000, description="Default connection timeout in milliseconds")
    DEFAULT_READ_TIMEOUT_MS: int = Field(30000, description="Default read timeout in milliseconds")
    DEFAULT_WRITE_TIMEOUT_MS: int = Field(30000, description="Default write timeout in milliseconds")
    
    # Circuit breaker settings
    CIRCUIT_BREAKER_ENABLED: bool = Field(True, description="Whether to enable circuit breakers")
    CIRCUIT_BREAKER_THRESHOLD: int = Field(5, description="Number of failures before opening circuit")
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: int = Field(30000, description="Time before trying closed circuit again in milliseconds")
    
    # Monitoring settings
    NETWORK_ERROR_ALERT_THRESHOLD: int = Field(10, description="Number of errors in window to trigger alerts")
    NETWORK_ERROR_WINDOW_SECONDS: int = Field(300, description="Window size for error monitoring in seconds")
    
    class Config:
        env_prefix = "NETWORK_"  # Use NETWORK_* environment variables
        env_file = ".env"

# Add to main settings
class Settings(BaseSettings):
    # ... other settings ...
    network: NetworkSettings = Field(default_factory=NetworkSettings)
```

## Implementation in Analytics Context

To specifically address ECONNRESET errors in the analytics implementation:

1. **Frontend Tracking Resilience**:
   - Implement the retry mechanism for analytics tracking
   - Use the circuit breaker pattern for analytics endpoints
   - Store failed tracking events locally for later submission

2. **Backend Analytics Handling**:
   - Add connection error middleware to API endpoints
   - Monitor error rates and set appropriate alerts
   - Configure timeouts and network settings based on environment

3. **User Experience**:
   - Ensure analytics failures don't impact critical user flows
   - Provide mechanisms to identify and report tracking issues

## Sequential Implementation Steps

1. **Add retry logic to analytics utility**:
   - Integrate `trackEventWithRetry` in `frontend/utils/analytics.js`
   - Add local storage backup for failed events

2. **Implement circuit breaker**:
   - Add circuit breaker logic to API client
   - Configure for different service categories

3. **Configure network monitoring**:
   - Add error tracking in both frontend and backend
   - Set up alerts and dashboards for ECONNRESET errors

4. **Add health check endpoint**:
   - Create lightweight endpoint for connection checks
   - Add client-side connection monitoring

5. **Update environment configuration**:
   - Add network resilience settings
   - Configure based on environment (dev/stage/prod)

6. **Test resilience**:
   - Simulate network failures with proxies or service workers
   - Verify retry mechanisms and circuit breakers work as expected

## Best Practices

1. **Always use timeouts**: Set reasonable timeouts for all network requests
2. **Implement retries with backoff**: Use exponential backoff to avoid overwhelming the system
3. **Circuit breakers for external services**: Prevent cascading failures
4. **Graceful degradation**: Non-critical features should fail gracefully
5. **Local storage fallback**: Store failed operations for later retry when possible
6. **Monitor and alert**: Track error rates and patterns to identify issues

By implementing these patterns using the Context 7 and Sequential Thinking methodologies, the Auto AGI Builder will be more resilient to ECONNRESET and other network errors, providing a better user experience even under challenging network conditions.
