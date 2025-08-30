
import QrCodeIcon from '@mui/icons-material/QrCode';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { checkSEPAYPaymentStatus, createSEPAYOrder } from 'api/payment';
import { useWebSocket } from 'hooks/useWebSocket';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { SEPAYPaymentStatus } from 'types/payment';
import { formatAmount, parseAmount, validateAmount } from 'utils/paymentUtils';
import PaymentSuccessModal from './PaymentSuccessModal';

export default function SEPAYTab() {
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
  
  const { enqueueSnackbar } = useSnackbar();
  const { 
    isConnected, 
    handlePaymentUpdate, 
    subscribeToPayment, 
    unsubscribeFromPayment,
    connectionError
  } = useWebSocket();

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
          enqueueSnackbar('Thanh toán thất bại. Vui lòng thử lại.', { variant: 'error' });
        } else if (data.status === 'expired') {
          enqueueSnackbar('Mã QR đã hết hạn. Vui lòng tạo mã mới.', { variant: 'warning' });
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
          enqueueSnackbar('Thanh toán thất bại. Vui lòng thử lại.', { variant: 'error' });
        } else if (status.status === 'expired') {
          enqueueSnackbar('Mã QR đã hết hạn. Vui lòng tạo mã mới.', { variant: 'warning' });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 15000); // Fallback check every 15 seconds when socket is disconnected

    return () => clearInterval(interval);
  }, [orderId, paymentStatus, enqueueSnackbar, isConnected]);

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
      
      const hasRequiredFields = Boolean(responseData && 
        responseData.success === true && 
        responseData.qrCodeUrl && 
        responseData.orderId && 
        typeof responseData.amount === 'number' && 
        responseData.expiresAt);
      
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
        
        enqueueSnackbar('Mã QR đã được tạo thành công!', { variant: 'success' });
      } else {
        const errorMessage = responseData?.message || 'Không thể tạo mã QR';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } catch (error) {
      console.error('SEPAY payment error:', error);
      enqueueSnackbar('Có lỗi xảy ra khi tạo giao dịch', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };



  const resetForm = () => {
    setAmount('');
    setOrderId(null);
    setQrCodeUrl(null);
    setQrCodeLoading(false);
    setQrCodeError(null);
    setPaymentStatus(null);
    setExpiresAt(null);
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
              fontWeight: 400,
              // lineHeight: 1.5
            }}
          >
            Quét mã QR để thanh toán nhanh chóng và an toàn
          </Typography>
        </Box>

        <Divider />

        {/* Amount Input */}
        <Stack spacing={2}>
          <Typography 
            variant="h6" 
            fontWeight={600}
            color="text.primary"
            sx={{ fontSize: '1.25rem' }}
          >
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
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Tạo Mã QR'
                )}
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
              <Typography 
                variant="h6" 
                fontWeight={600} 
                textAlign="center"
                color="text.primary"
                sx={{ fontSize: '1.375rem' }}
              >
                Mã QR Thanh Toán
              </Typography>
              
              <Box sx={{ 
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
              }}>
                {qrCodeLoading && (
                  <CircularProgress size={60} />
                )}
                
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
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.default', 
                  borderRadius: 2, 
                  width: '100%',
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
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

                {/* WebSocket Status */}
              </Stack>

              {/* Action Buttons */}
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

        {/* Payment Status Info */}
        {/* {paymentStatus === 'pending' && (
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
              <strong>Đang chờ thanh toán:</strong> Vui lòng quét mã QR và hoàn tất thanh toán trong ứng dụng SEPAY.
            </Typography>
          </Alert>
        )} */}

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
                Hệ thống sẽ tự động cập nhật trạng thái khi thanh toán thành công
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
