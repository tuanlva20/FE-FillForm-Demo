import { Box, Button, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useState } from 'react';

const METHODS = [
  { label: 'VISA', value: 'visa' },
  { label: 'Alternative VISA', value: 'alt-visa' },
  { label: 'PayPal', value: 'paypal' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Bank Transfer', value: 'bank' },
  { label: 'MOMO', value: 'momo' },
  { label: 'VNPay', value: 'vnpay' }
];

export default function PaymentMethodsTabs() {
  const [method, setMethod] = useState('visa');
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Tabs
        value={method}
        onChange={(_, v) => setMethod(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {METHODS.map((m) => (
          <Tab key={m.value} label={m.label} value={m.value} />
        ))}
      </Tabs>
      <Box>
        {method === 'visa' && (
          <Stack spacing={2} maxWidth={350} mx="auto">
            <TextField label="Card Number" fullWidth size="small" />
            <Stack direction="row" spacing={2}>
              <TextField label="Expiration Date" placeholder="MM/YY" size="small" fullWidth />
              <TextField label="CVV" size="small" fullWidth />
            </Stack>
            <TextField label="Name on Card" fullWidth size="small" />
            <Button variant="contained" color="primary">Pay Now</Button>
          </Stack>
        )}
        {method !== 'visa' && (
          <Typography textAlign="center" color="text.secondary" mt={2}>
            Tính năng {METHODS.find((m) => m.value === method)?.label} sẽ sớm được hỗ trợ.
          </Typography>
        )}
      </Box>
    </Paper>
  );
} 