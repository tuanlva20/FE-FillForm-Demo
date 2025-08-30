import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// assets
import { TickCircle } from 'iconsax-react';

// context
import { usePayment } from 'contexts/PaymentContext';

export default function PaymentSuccessPopup() {
  const { showPaymentPopup, paymentAmount, hidePaymentSuccess } = usePayment();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (showPaymentPopup) {
      setShow(true);
      // Auto hide after 4 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(hidePaymentSuccess, 300); // Wait for fade out animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showPaymentPopup, hidePaymentSuccess]);

  if (!showPaymentPopup) return null;

  return (
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 2,
            minWidth: 280,
            maxWidth: 320,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(5px)'
              }}
            >
              <TickCircle size={24} variant="Bold" color="white" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                Nạp tiền thành công!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                +{paymentAmount.toLocaleString('vi-VN')}đ đã được thêm vào ví.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Fade>
  );
}
