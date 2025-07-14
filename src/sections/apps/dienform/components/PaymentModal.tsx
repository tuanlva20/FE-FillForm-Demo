import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { openSnackbar } from 'api/snackbar';

// assets
import { CloseCircle, Copy } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';

// sample QR code image - replace with actual QR code
import defaultQrCode from 'assets/images/users/default.png'; // replace with actual QR code image

// Interface
interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

const PaymentModal = ({ open, onClose }: PaymentModalProps) => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const bankInfo = {
    accountName: 'LE VAN HOANG VI',
    accountNumber: '0291000342855',
    bank: 'Vietcombank',
    branch: 'Chi nhánh Gia Lai',
    content: '178vndt'
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(`Đã sao chép ${type}`);
        setTimeout(() => setCopySuccess(null), 3000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        openSnackbar({
          open: true,
          message: 'Không thể sao chép văn bản',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
      }
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Nạp tiền vào tài khoản</Typography>
            <IconButton color="secondary" onClick={onClose} size="small">
              <CloseCircle />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ p: 1.5 }}>
            <Typography variant="body2">
              Bạn vui lòng chuyển khoản <b>chính xác nội dung chuyển tiền</b> bên dưới hệ thống sẽ tự động cộng tiền cho bạn sau 1 - 3 phút sau khi nhận được tiền.
            </Typography>
            <Typography variant="body2" mt={1}>
              Sau khi thấy tài khoản chuyển tiền thành công, thử <b>Đăng xuất và Đăng nhập lại</b> để kiểm tra số dư SmartFill nhé!
            </Typography>
          </Box>
          
          <Divider />
          
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={2}>
                <Typography variant="h5" textAlign="center">
                  Tên tài khoản: SMARTFILL
                </Typography>
                <Typography variant="h5" textAlign="center" color="primary">
                  Nội dung: {bankInfo.content} <IconButton size="small" onClick={() => handleCopyText(bankInfo.content, 'nội dung')}>
                    <Copy fontSize="small" />
                  </IconButton>
                </Typography>
                
                <Box component={Paper} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography>Ngân hàng:</Typography>
                      <Typography fontWeight="bold">{bankInfo.bank}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography>Tên:</Typography>
                      <Typography fontWeight="bold">{bankInfo.accountName}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography>Số tài khoản:</Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight="bold">{bankInfo.accountNumber}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyText(bankInfo.accountNumber, 'số tài khoản')}
                        >
                          <Copy fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography>Chi nhánh:</Typography>
                      <Typography fontWeight="bold">{bankInfo.branch}</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack alignItems="center" spacing={2}>
                <CardMedia
                  component="img"
                  image={defaultQrCode}
                  alt="QR Code"
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    border: '1px solid', 
                    borderColor: 'divider'
                  }}
                />
                <Typography variant="body1" fontWeight="bold" textAlign="center">
                  {bankInfo.bank}
                </Typography>
                <Typography variant="body2" textAlign="center">
                  Trụ sở CN {bankInfo.branch}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="error" gutterBottom>
              ĐẶC BIỆT CHÚ Ý
            </Typography>
            <Stack spacing={1} sx={{ ml: 2 }}>
              <Typography variant="body2">• SMARTFILL sẽ hoàn tiền 100% nếu Tool lỗi / dịch vụ không thành công.</Typography>
              <Typography variant="body2">• Nạp tối thiểu: 10.000 đ. Có tính nạp dưới mức tối thiểu sai có phép không hỗ trợ dưới mọi hình thức.</Typography>
              <Typography variant="body2">• Nạp tiền sai có phép vui lòng liên hệ hỗ trợ để được hỗ trợ.</Typography>
              <Typography variant="body2">• Chỉ hỗ trợ các giao dịch nạp tiền sai có phép trong vòng 30 ngày kể từ ngày chuyển tiền, quá 30 ngày KHÔNG XỬ LÝ dưới mọi hình thức!</Typography>
              <Typography variant="body2">• Nên chuyển tiền nhanh 24/7 để được cộng tiền ngay sau khi ngân hàng xử lý giao dịch.</Typography>
              <Typography variant="body2">• Dữ liệu lịch sử nạp tiền có thể sẽ tự động xóa sau 30 ngày kể từ ngày nạp tiền!</Typography>
            </Stack>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button variant="contained" onClick={onClose}>
            Đã hiểu
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={!!copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setCopySuccess(null)} severity="success" sx={{ width: '100%' }}>
          {copySuccess}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PaymentModal;