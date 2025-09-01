import { Box, Stack, Typography } from '@mui/material';
import { PAYMENT_STATUS_CONFIG, PaymentStatusType } from 'types/paymentStatus';
import PaymentStatusChip from './PaymentStatusChip';

export default function PaymentStatusDemo() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment Status Chips Demo
      </Typography>
      
      <Stack spacing={2}>
        {Object.values(PAYMENT_STATUS_CONFIG).map((config) => (
          <Box key={config.value}>
            <Typography variant="subtitle2" gutterBottom>
              {config.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <PaymentStatusChip status={config.value as PaymentStatusType} />
              <PaymentStatusChip status={config.value as PaymentStatusType} variant="outlined" />
              <PaymentStatusChip status={config.value as PaymentStatusType} size="small" />
              <PaymentStatusChip status={config.value as PaymentStatusType} showIcon={false} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {config.description}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
