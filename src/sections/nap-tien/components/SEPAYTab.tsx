import QrCodeIcon from '@mui/icons-material/QrCode';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
import { checkSEPAYPaymentStatus, createSEPAYOrder } from 'api/payment';
import { usePayment } from 'contexts/PaymentContext';
import useBalance from 'hooks/useBalance';
import { useWebSocket } from 'hooks/useWebSocket';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { SEPAYPaymentStatus } from 'types/payment';
import { formatAmount, parseAmount, validateAmount } from 'utils/paymentUtils';
import { getSocket } from 'utils/socket';
import PaymentSuccessModal from './PaymentSuccessModal';

interface SEPAYTabProps {
  resetKey?: number;
  initialAmount?: number;
}

export default function SEPAYTab({ resetKey = 0, initialAmount }: SEPAYTabProps) {
  const [amount, setAmount] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [qrCodeError, setQrCodeError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<SEPAYPaymentStatus['status'] | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    amount: number;
    orderId: string;
    method: string;
  } | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const initialBalanceRef = useRef<number>(0);

  const { enqueueSnackbar } = useSnackbar();
  const { showPaymentSuccess } = usePayment();
  const { balance, refresh } = useBalance();
  
  // Reset form when resetKey changes
  useEffect(() => {
    setAmount('');
    setOrderId(null);
    setQrCodeUrl(null);
    setIsLoading(false);
    setQrCodeLoading(false);
    setQrCodeError(null);
    setPaymentStatus(null);
    setExpiresAt(null);
    setShowSuccessModal(false);
    setSuccessData(null);
    setIsConfirmingPayment(false);
    
    // Auto-fill amount but do NOT auto-generate QR code
    setTimeout(() => {
      // Use initialAmount if provided, format it to VND like user input; otherwise default to 50.000
      const defaultAmount = initialAmount ? formatAmount(initialAmount) : '50.000';
      setAmount(defaultAmount);
      // User needs to click "Tạo Mã QR" button manually
    }, 100);
  }, [resetKey, initialAmount]);

  // Debug: Log balance changes
  useEffect(() => {
  }, [balance]);

  // Set default amount when component mounts (only if completely empty)
  useEffect(() => {
    if (!amount && !orderId && !qrCodeUrl && resetKey === 0) {
      console.log('🔄 Setting default amount on component mount');
      setAmount('50.000');
    }
  }, [amount, orderId, qrCodeUrl, resetKey]);

  // Removed: Auto-create QR code when amount is set after reset
  // User must manually click "Tạo Mã QR" button

  // Auto-start payment confirmation when QR code is generated
  useEffect(() => {
    if (qrCodeUrl && !isConfirmingPayment && !showSuccessModal) {
      console.log('🔄 Auto-starting payment confirmation for QR code');
      setIsConfirmingPayment(true);
      initialBalanceRef.current = balance; 
    }
  }, [qrCodeUrl, isConfirmingPayment, showSuccessModal, balance, enqueueSnackbar]);

  // Debug: Force refresh balance when confirming payment
  useEffect(() => {
    if (isConfirmingPayment && orderId) {
      console.log('🔄 Force refreshing balance...');
      
      // Use the refresh function from useBalance hook
      const refreshBalance = async () => {
        try {
          await refresh();
          console.log('🔄 Balance refreshed via hook');
        } catch (error) {
          console.error('❌ Error refreshing balance:', error);
        }
      };
      
      // Refresh immediately and then every 2 seconds
      refreshBalance();
      const interval = setInterval(refreshBalance, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isConfirmingPayment, orderId, refresh]);

  // Direct socket listener for balance updates
  useEffect(() => {
    if (!isConfirmingPayment || !orderId) return;

    const handleDirectBalanceUpdate = (payload: any) => {
      console.log('🔌 Direct balance update received:', payload);
      
      // Handle different payload formats
      let balanceData;
      if (Array.isArray(payload) && payload.length === 2) {
        // Format: ["balance_update", {...}]
        balanceData = payload[1];
      } else if (typeof payload === 'object') {
        // Format: {...}
        balanceData = payload;
      } else {
        console.error('❌ Invalid balance_update payload format:', payload);
        return;
      }

      if (balanceData && typeof balanceData.balance === 'number') {
        const newBalance = balanceData.balance;
        const amountAdded = newBalance - initialBalanceRef.current;
        
        console.log('💰 Direct balance update:', {
          newBalance,
          initialBalance: initialBalanceRef.current,
          amountAdded
        });

        if (amountAdded > 0) {
          
          // Auto-confirm payment if user hasn't clicked "Tôi đã thanh toán"
          if (isConfirmingPayment) {
            console.log('✅ Auto-confirming payment due to balance increase');
            setSuccessData({
              amount: amountAdded,
              orderId: orderId || 'auto-confirmed',
              method: 'SEPAY QR'
            });
            setShowSuccessModal(true);
            setIsConfirmingPayment(false);
          }
          
          // Force refresh balance from server to ensure consistency
          refresh().then(() => {
            console.log('🔄 Balance refreshed after socket update');
          });
          
          showPaymentSuccess(amountAdded);
          setIsConfirmingPayment(false);
          resetForm();
          initialBalanceRef.current = 0;
        }
      }
    };

    // Get socket instance
    const socket = (window as any).socket || getSocket();
    if (socket) {
      socket.on('balance_update', handleDirectBalanceUpdate);
      
      return () => {
        socket.off('balance_update', handleDirectBalanceUpdate);
      };
    }
  }, [isConfirmingPayment, orderId, showPaymentSuccess, refresh]);
  const { isConnected, handlePaymentUpdate, subscribeToPayment, unsubscribeFromPayment, connectionError } = useWebSocket();

  const numericAmount = parseAmount(amount);
  const isValidAmount = validateAmount(numericAmount);

  // Timeout cho QR code loading - giảm xuống 5 giây để tăng tốc độ
  useEffect(() => {
    if (qrCodeLoading && qrCodeUrl && !qrCodeError) {
      const timeoutId = setTimeout(() => {
        setQrCodeLoading(false);
        setQrCodeError('QR code không tải được. Vui lòng thử lại.');
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [qrCodeLoading, qrCodeUrl, qrCodeError]);

  // Handle payment updates via WebSocket
  useEffect(() => {
    if (!orderId) return;

    const cleanup = handlePaymentUpdate((data) => {
      if (data.orderId === orderId) {
        setPaymentStatus(data.status);

        if (data.status === 'completed') {
          setSuccessData({
            amount: data.amount,
            orderId: data.orderId,
            method: 'SEPAY'
          });
          setShowSuccessModal(true);
          resetForm();
        } else if (data.status === 'failed') {
          enqueueSnackbar('Thanh toán thất bại. Vui lòng thử lại.', { variant: 'error', autoHideDuration: 2000 });
          setIsConfirmingPayment(false);
        } else if (data.status === 'expired') {
          enqueueSnackbar('Mã QR đã hết hạn. Vui lòng tạo mã mới.', { variant: 'warning', autoHideDuration: 2000 });
          setIsConfirmingPayment(false);
        }
      }
    });

    // Subscribe to payment updates
    subscribeToPayment(orderId);

    return () => {
      cleanup?.();
      unsubscribeFromPayment(orderId);
    };
  }, [orderId, handlePaymentUpdate, subscribeToPayment, unsubscribeFromPayment, enqueueSnackbar]);

  // Polling fallback for payment status - only when socket is not connected
  useEffect(() => {
    if (!orderId || paymentStatus === 'completed' || paymentStatus === 'failed' || isConnected) return;

    const interval = setInterval(async () => {
      try {
        const status = await checkSEPAYPaymentStatus(orderId);
        setPaymentStatus(status.status);

        if (status.status === 'completed') {
          setSuccessData({
            amount: status.amount,
            orderId: status.orderId,
            method: 'SEPAY'
          });
          setShowSuccessModal(true);
          resetForm();
        } else if (status.status === 'failed') {
          enqueueSnackbar('Thanh toán thất bại. Vui lòng thử lại.', { variant: 'error', autoHideDuration: 2000 });
          setIsConfirmingPayment(false);
        } else if (status.status === 'expired') {
          enqueueSnackbar('Mã QR đã hết hạn. Vui lòng tạo mã mới.', { variant: 'warning', autoHideDuration: 2000 });
          setIsConfirmingPayment(false);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 15000); // Fallback check every 15 seconds when socket is disconnected

    return () => clearInterval(interval);
  }, [orderId, paymentStatus, enqueueSnackbar, isConnected]);

  // Listen for balance updates from socket
  useEffect(() => {
    if (!isConfirmingPayment || !orderId) return;

    // Store initial balance when starting confirmation
    if (initialBalanceRef.current === 0) {
      initialBalanceRef.current = balance;
      console.log('🔍 Initial balance set:', balance);
    }

    // Check for balance increase
    const checkBalanceUpdate = () => {
      // console.log('🔍 Checking balance update:', {
      //   currentBalance: balance,
      //   initialBalance: initialBalanceRef.current,
      //   difference: balance - initialBalanceRef.current
      // });
      
      if (balance > initialBalanceRef.current) {
        const amountAdded = balance - initialBalanceRef.current;
        // Show success popup with the actual amount added
        showPaymentSuccess(amountAdded);
        setIsConfirmingPayment(false);
        resetForm();
        initialBalanceRef.current = 0; // Reset for next payment
      }
    };

    // Check balance every 0.6 seconds while confirming payment
    const interval = setInterval(checkBalanceUpdate, 600);

    // Timeout after 15 minutes (900 seconds) of confirmation
    const timeout = setTimeout(() => {
      if (isConfirmingPayment) {
        enqueueSnackbar('Hết thời gian xác nhận thanh toán. Vui lòng thử lại.', { variant: 'warning', autoHideDuration: 2000 });
        setIsConfirmingPayment(false);
        resetForm();
      }
    }, 900000); // 15 minutes

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isConfirmingPayment, orderId, balance, showPaymentSuccess, enqueueSnackbar]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setAmount(formatted);
  };

  const handleCreateQR = async () => {
    if (!isValidAmount) return;

    setIsLoading(true);
    try {
      const response = await createSEPAYOrder({
        amount: numericAmount,
        description: `Nạp tiền - ${numericAmount.toLocaleString('vi-VN')} VND`
      });

      // Kiểm tra response có đầy đủ thông tin cần thiết không
      // BE trả về response.content thay vì response trực tiếp
      const responseData = response?.content || response;

      const hasRequiredFields = Boolean(
        responseData &&
          responseData.success === true &&
          responseData.qrCodeUrl &&
          responseData.orderId &&
          typeof responseData.amount === 'number' &&
          responseData.expiresAt
      );

      if (hasRequiredFields) {
        setOrderId(responseData.orderId);
        setQrCodeUrl(responseData.qrCodeUrl);
        setExpiresAt(responseData.expiresAt);
        setPaymentStatus('pending');
        setQrCodeLoading(true);
        setQrCodeError(null);

        // Preload QR code image để tăng tốc độ
        const img = new Image();
        img.onload = () => {
          setQrCodeLoading(false);
        };
        img.onerror = () => {
          setQrCodeLoading(false);
          setQrCodeError('Không thể tải mã QR. Vui lòng thử lại.');
        };
        img.src = responseData.qrCodeUrl;

        enqueueSnackbar('Mã QR đã được tạo thành công!', { variant: 'success', autoHideDuration: 1000 });
      } else {
        const errorMessage = responseData?.message || 'Không thể tạo mã QR';
        enqueueSnackbar(errorMessage, { variant: 'error', autoHideDuration: 1000 });
      }
    } catch (error) {
      console.error('SEPAY payment error:', error);
      enqueueSnackbar('Có lỗi xảy ra khi tạo giao dịch', { variant: 'error', autoHideDuration: 1000 });
    } finally {
      setIsLoading(false);
    }
  };

  // handleConfirmPayment function no longer needed since button is hidden
  // const handleConfirmPayment = () => {
  //   setIsConfirmingPayment(true);
  //   initialBalanceRef.current = balance; // Set initial balance when user confirms
  //   enqueueSnackbar('Đang xác nhận thanh toán...', { variant: 'info' });
  // };

  const resetForm = () => {
    setAmount('');
    setOrderId(null);
    setQrCodeUrl(null);
    setQrCodeLoading(false);
    setQrCodeError(null);
    setPaymentStatus(null);
    setExpiresAt(null);
    setIsConfirmingPayment(false);
    initialBalanceRef.current = 0; // Reset initial balance
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={4}>
        {/* Header */}
        <Box textAlign="center">
          <Typography
            variant="h3"
            fontWeight={700}
            color="text.primary"
            gutterBottom
            sx={{
              // fontSize: { xs: '1.5rem', sm: '1.75rem' },
              lineHeight: 1.3,
              mb: 1.5
            }}
          >
            Nạp tiền bằng QR
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem' },
              fontWeight: 400
              // lineHeight: 1.5
            }}
          >
            Quét mã QR để thanh toán nhanh chóng và an toàn
          </Typography>
        </Box>

        <Divider />

        {/* Amount Input */}
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: '1.25rem' }}>
            Nhập số tiền
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
            <TextField
              label="Số tiền (VND)"
              value={amount}
              onChange={handleAmountChange}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9,]*',
                min: 10000
              }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  height: 48
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.9rem'
                }
              }}
              placeholder="Tối thiểu 10,000"
              helperText={!isValidAmount && amount ? 'Số tiền tối thiểu là 10,000 VND' : ''}
              error={!isValidAmount && amount.length > 0}
              variant="outlined"
              disabled={!!orderId}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<QrCodeIcon />}
                onClick={handleCreateQR}
                disabled={!isValidAmount || isLoading || !!orderId}
                sx={{
                  minWidth: 140,
                  height: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Tạo Mã QR'}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={resetForm}
                disabled={isLoading || !amount}
                sx={{
                  height: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  fontSize: '0.95rem'
                }}
              >
                Tạo mới
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {/* QR Code Display */}
        {qrCodeUrl && (
          <Box>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h6" fontWeight={600} textAlign="center" color="text.primary" sx={{ fontSize: '1.375rem' }}>
                Mã QR Thanh Toán
              </Typography>

              <Box
                sx={{
                  position: 'relative',
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: 'divider',
                  minHeight: 260,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {qrCodeLoading && <CircularProgress size={60} />}

                {qrCodeError && (
                  <Box textAlign="center">
                    <Typography color="error" variant="body2" gutterBottom>
                      {qrCodeError}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setQrCodeError(null);
                        setQrCodeLoading(true);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Thử lại
                    </Button>
                  </Box>
                )}

                {!qrCodeLoading && !qrCodeError && (
                  <Box
                    component="img"
                    src={qrCodeUrl}
                    alt="QR Code thanh toán"
                    loading="eager"
                    decoding="sync"
                    sx={{
                      width: 250,
                      height: 250,
                      display: 'block',
                      mx: 'auto',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      objectFit: 'contain'
                    }}
                    onLoad={() => {
                      setQrCodeLoading(false);
                    }}
                    onError={(e) => {
                      setQrCodeLoading(false);
                      setQrCodeError('Không thể tải mã QR. Vui lòng thử lại.');
                    }}
                  />
                )}
              </Box>

              {/* Order Info */}
              <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    width: '100%',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                      Nội dung thanh toán: <strong>{orderId}</strong>
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                      Số tiền: <strong>{numericAmount.toLocaleString('vi-VN')} VND</strong>
                    </Typography>

                    {expiresAt && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                        Hết hạn: <strong>{new Date(expiresAt).toLocaleString('vi-VN')}</strong>
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Confirm Payment Button - Hidden because system auto-confirms */}
                {/* <Button
                  variant="contained"
                  color="success"
                  onClick={handleConfirmPayment}
                  disabled={isConfirmingPayment}
                  sx={{
                    minWidth: 200,
                    height: 48,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  {isConfirmingPayment ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} color="inherit" />
                      <span>Đang xác nhận...</span>
                    </Stack>
                  ) : (
                    'Tôi đã thanh toán'
                  )}
                </Button> */}
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Instructions */}
        {!qrCodeUrl && (
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '0.95rem',
                lineHeight: 1.5
              }
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
              <strong>Hướng dẫn:</strong> Nhập số tiền và nhấn "Tạo Mã QR" để bắt đầu thanh toán.
            </Typography>
          </Alert>
        )}

        {/* WebSocket Status Alert */}
        {connectionError && (
          <Alert
            severity="warning"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '0.95rem',
                lineHeight: 1.5
              }
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
              <strong>Lưu ý:</strong> {connectionError}. Tính năng cập nhật realtime có thể không hoạt động.
            </Typography>
          </Alert>
        )}

        {/* QR Code Instructions */}
        {qrCodeUrl && !qrCodeLoading && !qrCodeError && (
          <Alert
            severity="success"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '0.95rem',
                lineHeight: 1.5
              }
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
              <strong>Hướng dẫn thanh toán:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ fontSize: '0.9rem' }}>
                Mở ứng dụng ngân hàng trên điện thoại
              </Typography>
              <Typography component="li" variant="body2" sx={{ fontSize: '0.9rem' }}>
                Chọn tính năng quét mã QR
              </Typography>
              <Typography component="li" variant="body2" sx={{ fontSize: '0.9rem' }}>
                Quét mã QR bên trên và xác nhận thanh toán
              </Typography>
              <Typography component="li" variant="body2" sx={{ fontSize: '0.9rem' }}>
                Sau khi thanh toán xong, hệ thống sẽ tự động xác nhận và cập nhật số dư
              </Typography>
            </Box>
          </Alert>
        )}
      </Stack>

      {/* Success Modal */}
      {successData && (
        <PaymentSuccessModal
          open={showSuccessModal}
          onClose={handleCloseSuccessModal}
          amount={successData.amount}
          orderId={successData.orderId}
          method={successData.method}
        />
      )}
    </Paper>
  );
}
