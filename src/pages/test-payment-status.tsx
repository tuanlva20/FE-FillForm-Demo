import { Box, Container, Typography } from '@mui/material';
import PaymentStatusChip from 'components/PaymentStatusChip';
import { PAYMENT_STATUS_CONFIG, PaymentStatusType } from 'types/paymentStatus';

export default function TestPaymentStatus() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Payment Status Chip Test
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          All Payment Status Chips:
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {Object.values(PAYMENT_STATUS_CONFIG).map((config) => (
            <PaymentStatusChip 
              key={config.value}
              status={config.value as PaymentStatusType}
              size="medium"
            />
          ))}
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Outlined Variants:
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {Object.values(PAYMENT_STATUS_CONFIG).map((config) => (
            <PaymentStatusChip 
              key={config.value}
              status={config.value as PaymentStatusType}
              variant="outlined"
              size="medium"
            />
          ))}
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Without Icons:
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {Object.values(PAYMENT_STATUS_CONFIG).map((config) => (
            <PaymentStatusChip 
              key={config.value}
              status={config.value as PaymentStatusType}
              showIcon={false}
              size="medium"
            />
          ))}
        </Box>
      </Box>
    </Container>
  );
}

