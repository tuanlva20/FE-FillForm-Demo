import io from 'socket.io-client';

let socketInstance: any = null;

export function getSocket(): any {
  if (socketInstance) return socketInstance;
  
  const baseUrl = import.meta.env.VITE_APP_SOCKET_URL || import.meta.env.VITE_APP_API_URL || '';
  
  // Socket.IO v2.4.0 configuration for netty-socketio compatibility
  socketInstance = io(baseUrl, {
    path: '/socket.io',
    withCredentials: true,
    transports: ['polling', 'websocket'], // v2.x supports both
    autoConnect: false,
    forceNew: true,
    timeout: 20000,
    // v2.x specific settings
    upgrade: true,
    rememberUpgrade: false,
    // Reconnection settings
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5,
    // v2.x protocol settings
    secure: window.location.protocol === 'https:',
    rejectUnauthorized: false
  });

  // Add connection event listeners for debugging
  socketInstance.on('connect', () => {
    console.log('✅ Socket connected successfully to v2.4.0 server');
  });

  socketInstance.on('disconnect', (reason: string) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socketInstance.on('connect_error', (error: any) => {
    console.error('❌ Socket connection error:', error);
  });

  socketInstance.on('reconnect', (attemptNumber: number) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  });

  socketInstance.on('reconnect_error', (error: any) => {
    console.error('❌ Socket reconnection error:', error);
  });

  socketInstance.on('reconnect_failed', () => {
    console.error('❌ Socket reconnection failed after all attempts');
  });

  return socketInstance;
}

export function closeSocket() {
  if (socketInstance) {
    console.log('🔌 Closing socket connection...');
    socketInstance.close();
    socketInstance = null;
  }
}


