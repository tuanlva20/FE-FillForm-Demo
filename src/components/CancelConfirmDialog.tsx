import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

// assets
import { CloseCircle, Warning2 } from 'iconsax-react';

interface CancelConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function CancelConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Xác nhận hủy yêu cầu',
  message = 'Bạn có chắc chắn muốn hủy yêu cầu điền form này? Hành động này không thể hoàn tác!',
  confirmText = 'Hủy yêu cầu',
  cancelText = 'Không'
}: CancelConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error confirming action:', error);
      // Error handling is done by the parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2 }}>
        <Warning2 size={24} color="#f57c00" />
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        <DialogContentText sx={{ color: 'text.primary', fontSize: '1rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CloseCircle size={20} />
            )
          }
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Đang hủy...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


