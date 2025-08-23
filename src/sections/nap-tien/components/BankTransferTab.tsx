import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Alert, Box, IconButton, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import QRCode from 'qrcode.react';
import { useState } from 'react';
import { formatAmount, parseAmount, validateAmount } from '../../../utils/paymentUtils';

const BANK_INFO = {
  accountName: 'SMARTFILL',
  accountNumber: '1051042692',
  bank: 'Vietcombank',
  branch: 'Gia Lai',
  content: 'TS 1520398'
};



export default function BankTransferTab() {
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar(`${label} đã được sao chép!`);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setAmount(formatted);
  };

  const numericAmount = parseAmount(amount);
  const isValidAmount = validateAmount(numericAmount);

  // Tạo nội dung QR động
  const qrValue = isValidAmount
    ? `STK: ${BANK_INFO.accountNumber}\nTen: ${BANK_INFO.accountName}\nNoi dung: ${BANK_INFO.content}\nSo tien: ${numericAmount}`
    : '';

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h6" textAlign="center" color="primary">
          Tên tài khoản: {BANK_INFO.accountName}
        </Typography>
        
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Typography variant="h6" color="primary">
            Nội dung: {BANK_INFO.content}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => handleCopy(BANK_INFO.content, 'Nội dung')}
            color="primary"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} alignItems="center" justifyContent="center">
          <Box>
            <TextField
              label="Số tiền (VND)"
              size="medium"
              value={amount}
              onChange={handleAmountChange}
              inputProps={{ 
                inputMode: 'numeric', 
                pattern: '[0-9,]*',
                min: 10000 
              }}
              sx={{ mb: 2, width: 200 }}
              placeholder="Tối thiểu 10,000"
              helperText={!isValidAmount && amount ? 'Số tiền tối thiểu là 10,000 VND' : ''}
              error={!isValidAmount && amount.length > 0}
            />
            
            <Box sx={{ 
              width: 200, 
              height: 200, 
              bgcolor: '#f5f5f5', 
              borderRadius: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '1px solid #e0e0e0',
              mb: 1
            }}>
              {qrValue ? (
                <QRCode value={qrValue} size={180} />
              ) : (
                <Typography fontSize={14} color="text.secondary" textAlign="center">
                  Nhập số tiền để tạo mã QR
                </Typography>
              )}
            </Box>
            
            <Typography variant="body2" textAlign="center" color="primary" fontWeight={600}>
              {BANK_INFO.bank}
            </Typography>
            <Typography variant="body2" textAlign="center">
              Chi nhánh: {BANK_INFO.branch}
            </Typography>
          </Box>
          
          <Box>
            <Stack spacing={2}>
              <Typography variant="h6" color="primary" fontWeight={600}>
                Thông tin tài khoản
              </Typography>
              
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight={600}>Ngân hàng:</Typography>
                  <Typography variant="body2">{BANK_INFO.bank}</Typography>
                </Stack>
                
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight={600}>Tên tài khoản:</Typography>
                  <Typography variant="body2">{BANK_INFO.accountName}</Typography>
                </Stack>
                
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight={600}>Số tài khoản:</Typography>
                  <Typography variant="body2" fontFamily="monospace">{BANK_INFO.accountNumber}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleCopy(BANK_INFO.accountNumber, 'Số tài khoản')}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Stack>
                
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight={600}>Chi nhánh:</Typography>
                  <Typography variant="body2">{BANK_INFO.branch}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Stack>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity="success" sx={{ width: '100%' }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
