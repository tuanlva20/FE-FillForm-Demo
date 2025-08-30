import io from 'socket.io-client';
import { logger } from './logger';

let socketInstance: any = null;

export function getSocket(): any {
  if (socketInstance) return socketInstance;

  const baseUrl = import.meta.env.VITE_APP_SOCKET_URL || import.meta.env.VITE_APP_API_URL;

  // Don't create socket if no URL is configured
  if (!baseUrl) {
    logger.log('⚠️ WebSocket URL not configured, skipping socket creation');
    return null;
  }

  logger.log('🔌 Creating socket connection to:', baseUrl);

  // Socket.IO v2.4.0 configuration for netty-socketio compatibility
  socketInstance = io(baseUrl, {
    path: '/socket.io',
    withCredentials: true,
    transports: ['polling', 'websocket'], // v2.x supports both
    autoConnect: false, // Don't auto-connect
    forceNew: true,
    timeout: 10000, // Reduced timeout
    // v2.x specific settings
    upgrade: true,
    rememberUpgrade: false,
    // Reconnection settings
    reconnection: true,
    reconnectionAttempts: 3, // Reduced attempts
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 3,
    // v2.x protocol settings
    secure: window.location.protocol === 'https:',
    rejectUnauthorized: false
  });

  // Add connection event listeners for debugging
  socketInstance.on('connect', () => {
    logger.log('✅ Socket connected successfully to v2.4.0 server');
  });

  socketInstance.on('disconnect', (reason: string) => {
    logger.log('❌ Socket disconnected:', reason);
  });

  socketInstance.on('connect_error', (error: any) => {
    logger.warn('❌ Socket connection error:', error);
  });

  socketInstance.on('reconnect', (attemptNumber: number) => {
    logger.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  });

  socketInstance.on('reconnect_error', (error: any) => {
    logger.warn('❌ Socket reconnection error:', error);
  });

  socketInstance.on('reconnect_failed', () => {
    logger.warn('❌ Socket reconnection failed after all attempts');
  });

  return socketInstance;
}

export function closeSocket() {
  if (socketInstance) {
    logger.log('🔌 Closing socket connection...');
    socketInstance.close();
    socketInstance = null;
  }
}
