import { useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';

export const usePaymentWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    wsRef.current = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:8080');

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
      console.error('WebSocket error:', error);
      enqueueSnackbar('Kết nối WebSocket bị lỗi', {
        variant: 'error'
      });
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      wsRef.current?.close();
    };
  }, [enqueueSnackbar]);

  return wsRef.current;
};
