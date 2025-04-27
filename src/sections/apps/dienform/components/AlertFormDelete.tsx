import React from 'react';

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// ==============================|| ALERT - FORM DELETE ||============================== //

interface AlertFormDeleteProps {
  id: string | null;
  title: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

export default function AlertFormDelete({ id, title, open, handleClose, handleConfirm }: AlertFormDeleteProps) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Xác nhận xóa form"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Bạn có chắc chắn muốn xóa form <strong>"{title}"</strong>? Hành động này không thể hoàn tác.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Hủy
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained" autoFocus>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}