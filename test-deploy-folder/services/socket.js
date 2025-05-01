import { io } from 'socket.io-client';
import { getConfig } from '../lib/config';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = {};
    this.rooms = new Set();
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 2000; // Start with 2 seconds
  }

  /**
   * Initialize the socket connection
   * @param {Object} options - Connection options
   * @param {string} options.token - Authentication token
   * @returns {Promise} - Resolves when connected
   */
  connect(options = {}) {
    if (this.socket && this.connected) {
      return Promise.resolve(this.socket);
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    const { token } = options;
    const config = getConfig();
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = io(config.SOCKET_URL || `${config.API_BASE_URL}`, {
          transports: ['websocket', 'polling'],
          auth: token ? { token } : undefined,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
          console.log('Socket connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.reconnectInterval = 2000;
          
          // Rejoin rooms if reconnecting
          if (this.rooms.size > 0) {
            this.rooms.forEach(room => {
              this.socket.emit('join', { room });
            });
          }
          
          resolve(this.socket);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.connected = false;
          
          // If the server disconnected us, try to reconnect manually
          if (reason === 'io server disconnect') {
            this.handleReconnect();
          }
        });

        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
          reject(error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('Socket reconnection failed');
          this.connected = false;
          this.connectionPromise = null;
          reject(new Error('Reconnection failed'));
        });

        // Set up handlers for any pre-registered events
        for (const event in this.listeners) {
          if (this.listeners[event]?.length > 0) {
            this.listeners[event].forEach(callback => {
              this.socket.on(event, callback);
            });
          }
        }
      } catch (error) {
        console.error('Socket initialization error:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Handle manual reconnection with exponential backoff
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
      this.reconnectAttempts++;
      this.connectionPromise = null;
      this.connect();
      
      // Exponential backoff
      this.reconnectInterval *= 1.5;
    }, this.reconnectInterval);
  }

  /**
   * Disconnect the socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connectionPromise = null;
      this.rooms.clear();
    }
  }

  /**
   * Join a room
   * @param {string} room - Room name
   */
  joinRoom(room) {
    if (!this.connected || !this.socket) {
      console.warn('Socket not connected, cannot join room:', room);
      return;
    }

    this.socket.emit('join', { room });
    this.rooms.add(room);
  }

  /**
   * Leave a room
   * @param {string} room - Room name
   */
  leaveRoom(room) {
    if (!this.connected || !this.socket) {
      return;
    }

    this.socket.emit('leave', { room });
    this.rooms.delete(room);
  }

  /**
   * Send a message to the server
   * @param {string} event - Event name
   * @param {any} data - Event data
   * @param {Object} options - Additional options
   * @param {string} options.room - Optional room to send to
   */
  emit(event, data, options = {}) {
    if (!this.connected || !this.socket) {
      console.warn('Socket not connected, cannot emit:', event);
      return;
    }

    if (options.room) {
      this.socket.emit(event, { ...data, room: options.room });
    } else {
      this.socket.emit(event, data);
    }
  }

  /**
   * Listen for events from the server
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    // Initialize event array if it doesn't exist
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    // Add to our internal listeners collection
    this.listeners[event].push(callback);
    
    // If already connected, register with socket
    if (this.socket) {
      this.socket.on(event, callback);
    }
    
    return () => this.off(event, callback);
  }

  /**
   * Stop listening for an event
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  off(event, callback) {
    if (!this.listeners[event]) {
      return;
    }
    
    // Remove from internal listeners
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    
    // If connected, remove from socket too
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Listen for an event once
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  once(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized, cannot register once listener:', event);
      return;
    }
    
    this.socket.once(event, callback);
  }

  /**
   * Get connection status
   * @returns {boolean} - Connection status
   */
  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
