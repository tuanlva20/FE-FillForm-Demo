import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

// assets
import { Trash } from 'iconsax-react';

interface Props {
  id: number | null;
  title: string;
  open: boolean;
  handleClose: () => void;
}

export default function AlertFormDelete({ id, title, open, handleClose }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      handleClose();
      // Here you would typically call an API to delete the form
      console.log(`Form ${id} deleted`);
    }, 800);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Typography variant="h5" sx={{ pt: 2 }}>Bạn có chắc chắn muốn xóa form này?</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Typography variant="body2">
            Form <strong>"{title}"</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục lại được.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          color="error"
          onClick={handleDelete}
          variant="contained"
          startIcon={<Trash variant="Bold" />}
          disabled={isDeleting}
        >
          {isDeleting ? 'Đang xóa...' : 'Xóa'}
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClose}>
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
}