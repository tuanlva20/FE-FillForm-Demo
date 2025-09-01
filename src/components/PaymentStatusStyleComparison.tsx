import { Box, Container, Divider, Typography } from '@mui/material';
import { PAYMENT_STATUS_CONFIG, PaymentStatusType } from 'types/paymentStatus';
import PaymentStatusChip from './PaymentStatusChip';
import StatusChip from './StatusChip';

export default function PaymentStatusStyleComparison() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Payment Status Chip Style Comparison
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          PaymentStatusChip (New Style):
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {Object.values(PAYMENT_STATUS_CONFIG).map((config) => (
            <PaymentStatusChip 
              key={config.value}
              status={config.value as PaymentStatusType}
            />
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          StatusChip (Reference Style):
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <StatusChip status="COMPLETED" />
          <StatusChip status="IN_PROGRESS" />
          <StatusChip status="FAILED" />
          <StatusChip status="QUEUED" />
          <StatusChip status="PENDING" />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          PaymentStatusChip Variants:
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <PaymentStatusChip status="COMPLETED" />
          <PaymentStatusChip status="COMPLETED" variant="outlined" />
          <PaymentStatusChip status="COMPLETED" size="small" />
          <PaymentStatusChip status="COMPLETED" showIcon={false} />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Style Features:</strong>
          <br />
          • borderRadius: 16px (rounded corners)
          <br />
          • fontWeight: 500 (medium weight)
          <br />
          • pl: 1 (left padding for icon)
          <br />
          • Consistent with StatusChip design
        </Typography>
      </Box>
    </Container>
  );
}

