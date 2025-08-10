import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import MuiSnackbar from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';

interface AlertSnackbarWithProgressProps {
  open: boolean;
  message: string;
  onClose: () => void;
  severity?: 'error' | 'success' | 'info' | 'warning';
}

export default function AlertSnackbarWithProgress({ open, message, onClose, severity = 'error' }: AlertSnackbarWithProgressProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!open) return;
    setProgress(100);
    const start = Date.now();
    const duration = 5000; // Thay đổi từ 1000 thành 5000 (5 giây)
    const step = () => {
      const elapsed = Date.now() - start;
      const value = Math.max(100 - (elapsed / duration) * 100, 0);
      setProgress(value);
      if (elapsed < duration) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
    const timer = setTimeout(onClose, duration);
    return () => {
      clearTimeout(timer);
    };
  }, [open, onClose]);

  return (
    <MuiSnackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={open}
      onClose={onClose}
      autoHideDuration={6000} // Thay đổi từ 1000 thành 5000 (5 giây)
      sx={{
        '& .MuiPaper-root': { minWidth: 320 },
        zIndex: 1400
      }}
    >
      <Alert severity={severity} sx={{ width: '100%', alignItems: 'flex-start', px: 2, py: 1.5 }}>
        {message}
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              background:
                severity === 'success' ? '#e7f6ec' :
                severity === 'info' ? '#e8f4fd' :
                severity === 'warning' ? '#fff7e6' : '#ffeaea',
              '& .MuiLinearProgress-bar': {
                background:
                  severity === 'success' ? '#4caf50' :
                  severity === 'info' ? '#2196f3' :
                  severity === 'warning' ? '#ff9800' : '#f44336'
              }
            }}
          />
        </Box>
      </Alert>
    </MuiSnackbar>
  );
} 