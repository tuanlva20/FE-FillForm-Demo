import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Alert, Box, Button, CircularProgress, LinearProgress, Paper, Step, StepLabel, Stepper } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { usePayment } from '../../contexts/PaymentContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import PaymentTabs from './components/PaymentTabs';
import SpecialNoticeBox from './components/SpecialNoticeBox';

const steps = ['Chuyển khoản & QR', 'Xác nhận thanh toán'];

export default function PaymentStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const { setCurrentStepper } = usePayment();

  // Optional: if later we have current order id, we can subscribe by id
  const currentOrderId = useMemo<string | null>(() => null, []);
  const { handlePaymentUpdate, subscribeToPayment, unsubscribeFromPayment } = useWebSocket();

  type PaymentUpdateData = {
    orderId: string;
    status: 'pending' | 'completed' | 'failed' | 'expired' | 'mismatch';
    amount: number;
    actualAmount?: number;
  };

  useEffect(() => {
    if (!handlePaymentUpdate) return;

    const off = handlePaymentUpdate((data: PaymentUpdateData) => {
      if (!isProcessing) return;

      if (data.status === 'completed') {
        setIsProcessing(false);
        setIsSuccess(true);
        setErrorMessage(null);
        setWarningMessage(null);
      } else if (data.status === 'failed' || data.status === 'expired' || data.status === 'mismatch') {
        setIsProcessing(false);
        setIsSuccess(false);
        setErrorMessage('Thanh toán chưa thành công. Vui lòng kiểm tra lại.');
        setWarningMessage(null);
      }
    });

    return () => {
      if (typeof off === 'function') off();
    };
  }, [handlePaymentUpdate, isProcessing]);

  useEffect(() => {
    if (!currentOrderId) return;
    if (!subscribeToPayment || !unsubscribeFromPayment) return;
    subscribeToPayment(currentOrderId);
    return () => unsubscribeFromPayment(currentOrderId);
  }, [currentOrderId, subscribeToPayment, unsubscribeFromPayment]);

  // 5-minute timeout fallback: show warning if still processing
  useEffect(() => {
    if (activeStep !== 1 || !isProcessing) return;
    const timeoutId = setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(false);
      setErrorMessage(null);
      setWarningMessage('Không thể xác nhận thanh toán tự động. Vui lòng liên hệ bộ phận hỗ trợ!');
    }, 5 * 60 * 1000);
    return () => clearTimeout(timeoutId);
  }, [activeStep, isProcessing]);

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
    setIsProcessing(true);
    setActiveStep(1);
    setCurrentStepper('Xác nhận thanh toán');
  };

  return (
    <Paper sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: { xs: 2, md: 4 } }} elevation={2}>
      {isProcessing && <LinearProgress sx={{ mb: 2 }} />}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box>
        {activeStep === 0 && (
          <>
            <SpecialNoticeBox />
            <Box mt={2}>
              <PaymentTabs />
            </Box>
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
                  Nạp tiền thành công! Số dư sẽ được cập nhật trong giây lát.
                </Alert>
                <Button variant="contained" color="success" onClick={() => {
                  setActiveStep(0);
                  setCurrentStepper(null);
                }}>
                  Hoàn tất
                </Button>
              </>
            )}
            {!isProcessing && !!warningMessage && (
              <>
                <Alert severity="warning" sx={{ width: '100%', maxWidth: 520 }}>
                  {warningMessage}
                </Alert>
                <Button variant="outlined" onClick={() => {
                  setActiveStep(0);
                  setCurrentStepper(null);
                }}>
                  Quay lại
                </Button>
              </>
            )}
            {!isProcessing && !!errorMessage && (
              <>
                <Alert severity="error" sx={{ width: '100%', maxWidth: 520 }}>
                  {errorMessage}
                </Alert>
                <Button variant="outlined" onClick={() => {
                  setActiveStep(0);
                  setCurrentStepper(null);
                }}>
                  Quay lại
                </Button>
              </>
            )}
          </Box>
        )}
        {/* {activeStep === 2 && <PaymentHistory />}
        {activeStep === 3 && <PaymentStats />} */}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3 }}>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === 0 && (
          <Button
            variant="contained"
            onClick={handleConfirmPaid}
            disabled={isProcessing}
          >
            Tôi đã thanh toán
          </Button>
        )}
      </Box>
    </Paper>
  );
} 