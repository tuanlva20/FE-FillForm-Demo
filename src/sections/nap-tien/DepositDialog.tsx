import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PaymentTabs from './components/PaymentTabs';

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
  initialAmount?: number;
}

export default function DepositDialog({ open, onClose, initialAmount }: DepositDialogProps) {
  const [resetKey, setResetKey] = useState(0);

  // Reset payment form when dialog opens
  useEffect(() => {
    if (open) {
      setResetKey(prev => prev + 1);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Nạp tiền vào tài khoản</Typography>
          <IconButton aria-label="đóng" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <PaymentTabs resetKey={resetKey} initialAmount={initialAmount} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}



