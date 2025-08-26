import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface PaymentUpdateData {
  orderId: string;
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'mismatch';
  amount: number;
  actualAmount?: number;
}

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handlePaymentUpdate = useCallback((callback: (data: PaymentUpdateData) => void) => {
    if (!socket) return;

    socket.on('payment:update', callback);

    return () => {
      socket.off('payment:update', callback);
    };
  }, [socket]);

  const subscribeToPayment = useCallback((orderId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('subscribe:payment', { orderId });
  }, [socket, isConnected]);

  const unsubscribeFromPayment = useCallback((orderId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('unsubscribe:payment', { orderId });
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    handlePaymentUpdate,
    subscribeToPayment,
    unsubscribeFromPayment,
  };
};
