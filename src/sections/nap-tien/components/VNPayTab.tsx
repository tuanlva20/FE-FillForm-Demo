import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { createVNPayPayment } from 'api/payment';
import { useSnackbar } from 'notistack';
import QRCode from 'qrcode.react';
import { useState } from 'react';
import { formatAmount, parseAmount, validateAmount } from 'utils/paymentUtils';

export default function VNPayTab() {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setAmount(formatted);
  };

  const numericAmount = parseAmount(amount);
  const isValidAmount = validateAmount(numericAmount);

  const handleVNPayPayment = async () => {
    if (!isValidAmount) return;

    setIsLoading(true);
    try {
      const response = await createVNPayPayment({
        amount: numericAmount,
        description: `Nạp tiền SmartFill - ${numericAmount.toLocaleString('vi-VN')} VND`
      });

      if (response.success && response.qrCode) {
        setQrCode(response.qrCode);
        enqueueSnackbar('QR code VNPAY đã được tạo thành công!', {
          variant: 'success'
        });
      } else {
        enqueueSnackbar(response.message || 'Không thể tạo QR code VNPAY', {
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('VNPAY payment error:', error);
      enqueueSnackbar('Có lỗi xảy ra khi tạo giao dịch VNPAY', {
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Stack spacing={3}>
        {/* Header với VNPAY Logo và Title */}
        <Box display="flex" alignItems="flex-start" gap={3}>
          {/* VNPAY QR Logo */}
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e9ecef',
              flexShrink: 0
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#0055a4',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }}
            >
              <Typography variant="caption" color="white" fontWeight={600} fontSize={8}>
                QR
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize={10}>
              VNPAY QR
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize={8}>
              Scan to Pay
            </Typography>
          </Box>

          {/* Title và Description */}
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
              Thanh toán VNPAY-QR
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Quét mã QR PAY trên ứng dụng Mobile Banking, phí giao dịch 2%
            </Typography>
          </Box>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            height: 1,
            bgcolor: '#e9ecef',
            width: '100%'
          }}
        />

        {/* Instructions */}
        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
          Mở App ngân hàng trên điện thoại, chọn phần QR Pay và nhập số tiền bạn muốn nạp vào khung bên dưới.
        </Typography>

        {/* QR Code Placeholder */}
        <Box
          sx={{
            width: 200,
            height: 200,
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e9ecef',
            mx: 'auto'
          }}
        >
          {qrCode ? (
            <QRCode value={qrCode} size={180} />
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              VNPAY QR
            </Typography>
          )}
        </Box>

        {/* Input và Button */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
          <TextField
            label="Nhập số tiền"
            size="medium"
            value={amount}
            onChange={handleAmountChange}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9,]*',
              min: 10000
            }}
            sx={{ flex: 1 }}
            placeholder="Tối thiểu 10,000"
            helperText={!isValidAmount && amount ? 'Số tiền tối thiểu là 10,000 VND' : ''}
            error={!isValidAmount && amount.length > 0}
            variant="outlined"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleVNPayPayment}
            disabled={!isValidAmount || isLoading}
            sx={{
              minWidth: 140,
              height: 56,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            {isLoading ? 'Đang xử lý...' : 'Nạp Dcoin'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
