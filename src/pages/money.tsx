import { Box, Typography } from '@mui/material';
import PaymentStepper from 'sections/nap-tien/PaymentStepper';

export default function MoneyPage() {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" textAlign="center" mb={3}>
        Nạp tiền vào hệ thống
      </Typography>
      <PaymentStepper />
    </Box>
  );
} 