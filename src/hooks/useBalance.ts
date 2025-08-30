import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsAPI } from 'api/payments';
import { usePayment } from 'contexts/PaymentContext';
import { useEffect, useMemo, useRef } from 'react';
import { logger } from 'utils/logger';
import { getSocket } from 'utils/socket';
import useAuth from './useAuth';

const QUERY_KEY = ['payments', 'balance'];

export default function useBalance() {
  const queryClient = useQueryClient();
  const { isLoggedIn, user } = useAuth();
  const { showPaymentSuccess, currentStepper } = usePayment();
  const socketRef = useRef<any>(null);
  const previousBalanceRef = useRef<number>(0);

  const { data, isLoading, isError, refetch } = useQuery<number>({
    queryKey: QUERY_KEY,
    enabled: isLoggedIn,
    queryFn: async () => {
      try {
        const amount = await paymentsAPI.getBalance();
        // Ensure we return a clean number, not accumulated value
        return typeof amount === 'number' ? amount : 0;
      } catch (error) {
        logger.error('❌ Error fetching balance:', error);
        throw error;
      }
    },
    staleTime: 30_000,
    retry: 1,
    // Clear cache when component unmounts to prevent accumulation
    gcTime: 0
  });

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;

    const socket = getSocket();
    socketRef.current = socket;

    // If no socket is available, skip realtime updates
    if (!socket) {
      logger.log('⚠️ WebSocket not available, skipping balance realtime updates');
      return;
    }

    const onConnect = () => {
      logger.log('🔌 Connected. Joining balance room');
      socket.emit('join_balance_room', { userId: user.id });
    };

    if (!socket.connected) socket.connect();
    onConnect();

    const handleBalanceUpdate = (payload: any) => {
      logger.log('💸 Raw balance_update received:', payload);

      // Handle different payload formats
      let balanceData;
      if (Array.isArray(payload) && payload.length === 2) {
        // Format: ["balance_update", {...}]
        balanceData = payload[1];
      } else if (typeof payload === 'object') {
        // Format: {...}
        balanceData = payload;
      } else {
        logger.error('❌ Invalid balance_update payload format:', payload);
        return;
      }

      if (!balanceData || balanceData.userId !== user.id) {
        logger.log('💸 Balance update not for current user:', balanceData?.userId, 'vs', user.id);
        return;
      }

      logger.log('💸 Processing balance update for user:', balanceData);
      const newBalance = typeof balanceData.balance === 'number' ? balanceData.balance : 0;
      const currentBalance = queryClient.getQueryData<number>(QUERY_KEY) || 0;

      // Calculate the amount added
      const amountAdded = newBalance - currentBalance;

      logger.log('💸 Balance update details:', {
        currentBalance,
        newBalance,
        amountAdded
      });

      // Update the balance
      queryClient.setQueryData<number>(QUERY_KEY, newBalance);

      // Show popup notification if money was added
      // Note: Even during payment confirmation, we want to show the success notification
      // as the PaymentStepper will handle the UI state appropriately
      if (amountAdded > 0) {
        showPaymentSuccess(amountAdded);
      }
    };

    socket.on('connect', onConnect);
    socket.on('balance_update', handleBalanceUpdate);

    // Also listen for raw messages in case the event is emitted differently
    socket.on('message', (message: any) => {
      logger.log('📨 Raw socket message received:', message);
      if (message && typeof message === 'string') {
        try {
          const parsed = JSON.parse(message);
          if (Array.isArray(parsed) && parsed[0] === 'balance_update') {
            handleBalanceUpdate(parsed);
          }
        } catch (error) {
          logger.error('❌ Error parsing socket message:', error);
        }
      }
    });

    // Debug: Listen for all events (Socket.IO v2.4.0 compatible)
    const originalEmit = socket.emit;
    socket.emit = function (event: string, ...args: any[]) {
      return originalEmit.apply(this, [event, ...args]);
    };

    return () => {
      try {
        socket.off('connect', onConnect);
        socket.off('balance_update', handleBalanceUpdate);
        socket.off('message');
        // Restore original emit function
        socket.emit = originalEmit;
      } catch {}
    };
  }, [isLoggedIn, user?.id, queryClient]);

  const balance = useMemo(() => {
    const finalBalance = data ?? 0;

    // Update previous balance reference
    if (finalBalance !== previousBalanceRef.current) {
      previousBalanceRef.current = finalBalance;
    }

    return finalBalance;
  }, [data]);

  return {
    balance,
    isLoading,
    isError,
    refetch,
    refresh: async () => {
      await paymentsAPI.refreshBalance();
      // Invalidate and refetch balance data
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    // Force clear cache and refetch
    forceRefresh: async () => {
      // Clear cache completely
      queryClient.removeQueries({ queryKey: QUERY_KEY });
      // Refetch fresh data
      await refetch();
    },
    // Debug socket connection
    debugSocket: () => {
      const socket = getSocket();
      logger.log('🔌 Socket debug info:', {
        connected: socket.connected,
        id: socket.id,
        userId: user?.id
      });
    },
    // Test notification
    testNotification: () => {
      const currentBalance = queryClient.getQueryData<number>(QUERY_KEY) || 0;
      const testAmount = 50000;
      queryClient.setQueryData<number>(QUERY_KEY, currentBalance + testAmount);

      if (currentStepper !== 'Xác nhận thanh toán') {
        showPaymentSuccess(testAmount);
      }
    }
  };
}
