import RefreshIcon from '@mui/icons-material/Refresh';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';
import { checkSEPAYPaymentStatus, createSEPAYOrder } from '../../../../api/payment';
import { useWebSocket } from '../../../../hooks/useWebSocket';
import { SEPAYPaymentStatus } from '../../../../types/payment';
import { formatAmount, parseAmount, validateAmount } from '../../../../utils/paymentUtils';
import PaymentSuccessModal from './PaymentSuccessModal';

export default function SEPAYTab() {
  const [amount, setAmount] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    unsubscribeFromPayment 
  } = useWebSocket();

  const numericAmount = parseAmount(amount);
  const isValidAmount = validateAmount(numericAmount);

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

  // Polling fallback for payment status
  useEffect(() => {
    if (!orderId || paymentStatus === 'completed' || paymentStatus === 'failed') return;

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
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [orderId, paymentStatus, enqueueSnackbar]);

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
        description: `Nạp tiền SmartFill - ${numericAmount.toLocaleString('vi-VN')} VND`
      });
      
      if (response.success) {
        setOrderId(response.orderId);
        setQrCodeUrl(response.qrCodeUrl);
        setExpiresAt(response.expiresAt);
        setPaymentStatus('pending');
        
        enqueueSnackbar('Mã QR SEPAY đã được tạo thành công!', { variant: 'success' });
      } else {
        enqueueSnackbar('Không thể tạo mã QR SEPAY', { variant: 'error' });
      }
    } catch (error) {
      console.error('SEPAY payment error:', error);
      enqueueSnackbar('Có lỗi xảy ra khi tạo giao dịch SEPAY', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
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
        }
    } catch (error) {
      console.error('Error refreshing payment status:', error);
      enqueueSnackbar('Không thể kiểm tra trạng thái thanh toán', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setOrderId(null);
    setQrCodeUrl(null);
    setPaymentStatus(null);
    setExpiresAt(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
  };

  const getStatusColor = (status: SEPAYPaymentStatus['status'] | null) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'expired': return 'warning';
      case 'mismatch': return 'error';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: SEPAYPaymentStatus['status'] | null) => {
    switch (status) {
      case 'completed': return 'Thành công';
      case 'failed': return 'Thất bại';
      case 'expired': return 'Hết hạn';
      case 'mismatch': return 'Số tiền không khớp';
      case 'pending': return 'Đang chờ';
      default: return '';
    }
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 4, 
        maxWidth: 600, 
        mx: 'auto',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      <Stack spacing={4}>
        {/* Header */}
        <Box textAlign="center">
          <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
            Thanh toán qua SEPAY
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quét mã QR để thanh toán nhanh chóng và an toàn
          </Typography>
        </Box>

        <Divider />

        {/* Amount Input */}
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Nhập số tiền
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
            <TextField
              label="Số tiền (VND)"
              size="large"
              value={amount}
              onChange={handleAmountChange}
              inputProps={{ 
                inputMode: 'numeric', 
                pattern: '[0-9,]*',
                min: 10000 
              }}
              sx={{ flex: 1 }}
              placeholder="Tối thiểu 10,000"
              helperText={!isValidAmount && amount ? 'Số tiền tối thiểu là 10,000 VND' : ''}
              error={!isValidAmount && amount.length > 0}
              variant="outlined"
              disabled={!!orderId}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateQR}
              disabled={!isValidAmount || isLoading || !!orderId}
              sx={{ 
                minWidth: 140,
                height: 56,
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
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Tạo Mã QR'
              )}
            </Button>
          </Stack>
        </Stack>

        {/* QR Code Display */}
        {qrCodeUrl && (
          <Box>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h6" fontWeight={600} textAlign="center">
                Mã QR Thanh Toán
              </Typography>
              
              <Box sx={{ 
                position: 'relative',
                p: 3,
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '2px solid #e3f2fd'
              }}>
                <QRCode 
                  value={qrCodeUrl} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
                
                {/* Status Badge */}
                {paymentStatus && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Chip
                      label={getStatusText(paymentStatus)}
                      color={getStatusColor(paymentStatus) as any}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                )}
              </Box>

              {/* Order Info */}
              <Stack spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Mã giao dịch: <strong>{orderId}</strong>
                </Typography>
                
                {expiresAt && (
                  <Typography variant="body2" color="text.secondary">
                    Hết hạn: {new Date(expiresAt).toLocaleString('vi-VN')}
                  </Typography>
                )}

                {/* WebSocket Status */}
                <Chip
                  label={isConnected ? 'Kết nối realtime' : 'Không kết nối'}
                  color={isConnected ? 'success' : 'warning'}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={isLoading}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Làm mới
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={resetForm}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Tạo mới
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Instructions */}
        {!qrCodeUrl && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Hướng dẫn:</strong> Nhập số tiền và nhấn "Tạo Mã QR" để bắt đầu thanh toán qua SEPAY.
            </Typography>
          </Alert>
        )}

        {/* Payment Status Info */}
        {paymentStatus === 'pending' && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Đang chờ thanh toán:</strong> Vui lòng quét mã QR và hoàn tất thanh toán trong ứng dụng SEPAY.
            </Typography>
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
