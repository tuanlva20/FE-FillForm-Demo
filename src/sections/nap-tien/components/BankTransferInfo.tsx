import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Alert, Box, IconButton, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import QRCode from 'qrcode.react';
import { useState } from 'react';

const BANK_INFO = {
  accountName: 'SMARTFILL',
  accountNumber: '1051042692',
  bank: 'Vietcombank',
  branch: 'Gia Lai',
  content: 'TS 1520398'
};

export default function BankTransferInfo() {
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar(`${label} đã được sao chép!`);
  };

  // Tạo nội dung QR động (theo chuẩn VietQR hoặc đơn giản là text)
  const qrValue = amount && !isNaN(Number(amount)) && Number(amount) >= 50000
    ? `STK: ${BANK_INFO.accountNumber}\nTen: ${BANK_INFO.accountName}\nNoi dung: ${BANK_INFO.content}\nSo tien: ${amount}`
    : '';

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" textAlign="center">
          Tên tài khoản: {BANK_INFO.accountName}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Typography variant="h6" color="primary">
            Nội dung: {BANK_INFO.content}
          </Typography>
          <IconButton size="small" onClick={() => handleCopy(BANK_INFO.content, 'Nội dung')}> <ContentCopyIcon fontSize="small" /> </IconButton>
        </Stack>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center" justifyContent="center">
          <Box>
            <TextField
              label="Số tiền (VND)"
              size="small"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 50000 }}
              sx={{ mb: 1, width: 160 }}
              placeholder="Tối thiểu 50,000"
            />
            <Box sx={{ width: 160, height: 160, bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0' }}>
              {qrValue ? (
                <QRCode value={qrValue} size={150} />
              ) : (
                <Typography fontSize={13} color="text.secondary" textAlign="center">Nhập số tiền để tạo mã QR</Typography>
              )}
            </Box>
            <Typography variant="body2" textAlign="center" mt={1}>{BANK_INFO.bank}</Typography>
            <Typography variant="body2" textAlign="center">Chi nhánh: {BANK_INFO.branch}</Typography>
          </Box>
          <Box>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Ngân hàng:</Typography>
                <Typography fontWeight="bold">{BANK_INFO.bank}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Tên tài khoản:</Typography>
                <Typography fontWeight="bold">{BANK_INFO.accountName}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Số tài khoản:</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography fontWeight="bold">{BANK_INFO.accountNumber}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(BANK_INFO.accountNumber, 'Số tài khoản')}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Chi nhánh:</Typography>
                <Typography fontWeight="bold">{BANK_INFO.branch}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Stack>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSnackbar(null)}>{snackbar}</Alert>
      </Snackbar>
    </Paper>
  );
} 