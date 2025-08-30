import { Celebration, CheckCircle } from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import { formatAmount } from 'utils/paymentUtils';

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  method: string;
}

export default function PaymentSuccessModal({
  open,
  onClose,
  amount,
  orderId,
  method
}: PaymentSuccessModalProps) {
  const getMethodText = (method: string) => {
    switch (method.toLowerCase()) {
      case 'sepay': return 'SEPAY';
      case 'vnpay': return 'VNPAY';
      case 'bank_transfer': return 'Chuyển khoản';
      default: return method;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
          <CheckCircle color="success" sx={{ fontSize: 40 }} />
          <Typography variant="h5" fontWeight={700} color="success.main">
            Thanh toán thành công!
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <Celebration sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
            {formatAmount(amount.toString())} VND
          </Typography>
          
          <Typography variant="body1" color="text.secondary" gutterBottom>
            đã được nạp thành công vào tài khoản của bạn
          </Typography>
        </Box>

        <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Phương thức thanh toán:
              </Typography>
              <Chip 
                label={getMethodText(method)} 
                color="primary" 
                variant="outlined"
                size="small"
              />
            </Stack>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Mã giao dịch:
              </Typography>
              <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                {orderId}
              </Typography>
            </Stack>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Thời gian:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {new Date().toLocaleString('vi-VN')}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            borderRadius: 2,
            py: 1.5
          }}
        >
          Hoàn tất
        </Button>
      </DialogActions>
    </Dialog>
  );
}
