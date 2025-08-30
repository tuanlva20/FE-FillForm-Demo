import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Alert, Box, Button, CircularProgress, LinearProgress, Paper } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { usePayment } from '../../contexts/PaymentContext';
import useBalance from '../../hooks/useBalance';
import { useWebSocket } from '../../hooks/useWebSocket';
import PaymentTabs from './components/PaymentTabs';
import SpecialNoticeBox from './components/SpecialNoticeBox';

export default function PaymentStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [autoPaymentSuccess, setAutoPaymentSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0); // Key để force re-render PaymentTabs
  const { setCurrentStepper, showPaymentSuccess } = usePayment();
  const { refresh: refreshBalance } = useBalance();

  // Optional: if later we have current order id, we can subscribe by id
  const currentOrderId = useMemo<string | null>(() => null, []);
  const { handlePaymentUpdate, subscribeToPayment, unsubscribeFromPayment } = useWebSocket();

  type PaymentUpdateData = {
    orderId: string;
    status: 'pending' | 'completed' | 'failed' | 'expired' | 'mismatch';
    amount: number;
    actualAmount?: number;
  };

  // Auto-start listening for payment updates when component mounts
  useEffect(() => {
    if (!handlePaymentUpdate) return;

    console.log('Starting to listen for payment updates...');
    
    const off = handlePaymentUpdate((data: PaymentUpdateData) => {
      console.log('Payment update received:', data);
      
      if (data.status === 'completed') {
        // Refresh balance to get updated amount
        refreshBalance();
        
        // Show success notification with the amount
        const amount = data.actualAmount || data.amount;
        showPaymentSuccess(amount);
        
        // Set success state regardless of processing state
        setIsProcessing(false);
        setIsSuccess(true);
        setErrorMessage(null);
        setWarningMessage(null);
        setAutoPaymentSuccess(true);
        
        // Reset form after successful payment
        setTimeout(() => {
          setFormKey(prev => prev + 1);
          setAutoPaymentSuccess(false);
          setIsSuccess(false);
        }, 2000); // Reset after 2 seconds
        
        console.log('Payment completed successfully. Amount:', amount);
      } else if (data.status === 'failed' || data.status === 'expired' || data.status === 'mismatch') {
        setIsProcessing(false);
        setIsSuccess(false);
        setErrorMessage('Thanh toán chưa thành công. Vui lòng kiểm tra lại.');
        setWarningMessage(null);
        console.log('Payment failed:', data.status);
      }
    });

    return () => {
      if (typeof off === 'function') off();
    };
  }, [handlePaymentUpdate, refreshBalance, showPaymentSuccess]);

  useEffect(() => {
    if (!currentOrderId) return;
    if (!subscribeToPayment || !unsubscribeFromPayment) return;
    subscribeToPayment(currentOrderId);
    return () => unsubscribeFromPayment(currentOrderId);
  }, [currentOrderId, subscribeToPayment, unsubscribeFromPayment]);

  // Clear stepper when component unmounts
  useEffect(() => {
    return () => {
      setCurrentStepper(null);
    };
  }, [setCurrentStepper]);

  const handleConfirmPaid = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    setWarningMessage(null);
    setAutoPaymentSuccess(false);
    setIsProcessing(true);
    setActiveStep(1);
    setCurrentStepper('Xác nhận thanh toán');
  };

  const handleResetForm = () => {
    setFormKey(prev => prev + 1);
    setAutoPaymentSuccess(false);
    setIsSuccess(false);
    setErrorMessage(null);
    setWarningMessage(null);
    setActiveStep(0);
    setCurrentStepper(null);
  };

  return (
    <Paper sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: { xs: 2, md: 4 } }} elevation={2}>
      {isProcessing && <LinearProgress sx={{ mb: 2 }} />}
      <Box>
        {activeStep === 0 && (
          <>
            <SpecialNoticeBox />
            <Box mt={2}>
              <PaymentTabs key={formKey} resetKey={formKey} />
            </Box>
            {autoPaymentSuccess && (
              <Box mt={2}>
                <Alert 
                  severity="success" 
                  sx={{ width: '100%' }}
                  action={
                    <Button color="inherit" size="small" onClick={handleResetForm}>
                      Tạo mới
                    </Button>
                  }
                >
                  Thanh toán đã được xác nhận tự động! Số dư đã được cập nhật. Form sẽ được tạo mới trong giây lát.
                </Alert>
              </Box>
            )}
          </>
        )}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
            {isProcessing && (
              <>
                <CircularProgress />
                <Box color="text.secondary">Đang kiểm tra thanh toán...</Box>
              </>
            )}
            {!isProcessing && isSuccess && (
              <>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56 }} />
                <Alert severity="success" sx={{ width: '100%', maxWidth: 520 }}>
                  Nạp tiền thành công! Số dư đã được cập nhật tự động.
                </Alert>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleResetForm}
                >
                  Hoàn tất
                </Button>
              </>
            )}
            {!isProcessing && !!warningMessage && (
              <>
                <Alert severity="warning" sx={{ width: '100%', maxWidth: 520 }}>
                  {warningMessage}
                </Alert>
                <Button
                  variant="outlined"
                  onClick={handleResetForm}
                >
                  Quay lại
                </Button>
              </>
            )}
            {!isProcessing && !!errorMessage && (
              <>
                <Alert severity="error" sx={{ width: '100%', maxWidth: 520 }}>
                  {errorMessage}
                </Alert>
                <Button
                  variant="outlined"
                  onClick={handleResetForm}
                >
                  Quay lại
                </Button>
              </>
            )}
          </Box>
        )}
        {/* {activeStep === 2 && <PaymentHistory />}
        {activeStep === 3 && <PaymentStats />} */}
      </Box>
      {/* <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3 }}>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === 0 && (
          <Button variant="contained" onClick={handleConfirmPaid} disabled={isProcessing}>
            Tôi đã thanh toán
          </Button>
        )}
      </Box> */}
    </Paper>
  );
}
