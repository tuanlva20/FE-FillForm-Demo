import { useCallback, useEffect, useState } from 'react';
import io from 'socket.io-client';

interface PaymentUpdateData {
  orderId: string;
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'mismatch';
  amount: number;
  actualAmount?: number;
}

export const useWebSocket = () => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Only try to connect if WebSocket URL is configured
    const wsUrl = import.meta.env.VITE_APP_SOCKET_URL;

    if (!wsUrl) {
      console.log('WebSocket URL not configured, skipping connection');
      return;
    }

    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000, // Reduced timeout
      reconnection: true,
      reconnectionAttempts: 3, // Reduced attempts
      reconnectionDelay: 2000,
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error: any) => {
      console.warn('WebSocket connection error:', error);
      setIsConnected(false);
      setConnectionError('Không thể kết nối WebSocket server');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  const handlePaymentUpdate = useCallback(
    (callback: (data: PaymentUpdateData) => void) => {
      if (!socket || !isConnected) {
        console.log('WebSocket not available for payment updates');
        return;
      }

      socket.on('payment:update', callback);

      return () => {
        socket.off('payment:update', callback);
      };
    },
    [socket, isConnected]
  );

  const subscribeToPayment = useCallback(
    (orderId: string) => {
      if (!socket || !isConnected) {
        console.log('WebSocket not available for subscription');
        return;
      }

      socket.emit('subscribe:payment', { orderId });
    },
    [socket, isConnected]
  );

  const unsubscribeFromPayment = useCallback(
    (orderId: string) => {
      if (!socket || !isConnected) {
        console.log('WebSocket not available for unsubscription');
        return;
      }

      socket.emit('unsubscribe:payment', { orderId });
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    connectionError,
    handlePaymentUpdate,
    subscribeToPayment,
    unsubscribeFromPayment
  };
};
