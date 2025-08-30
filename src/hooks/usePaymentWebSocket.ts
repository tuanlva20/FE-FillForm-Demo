import { useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';

export const usePaymentWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_APP_SOCKET_URL;
    
    if (!wsUrl) {
      console.log('WebSocket URL not configured, skipping connection');
      return;
    }

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'PAYMENT_SUCCESS') {
          enqueueSnackbar('Thanh toán thành công! Số dư đã được cập nhật.', {
            variant: 'success'
          });
        } else if (data.type === 'PAYMENT_ERROR') {
          enqueueSnackbar(`Thanh toán thất bại: ${data.message}`, {
            variant: 'error'
          });
        }
      };

      wsRef.current.onerror = (error) => {
        console.warn('WebSocket error:', error);
        // Don't show error snackbar for WebSocket connection issues
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
      };

      return () => {
        wsRef.current?.close();
      };
    } catch (error) {
      console.warn('Failed to create WebSocket connection:', error);
    }
  }, [enqueueSnackbar]);

  return wsRef.current;
};
