import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import MuiSnackbar from '@mui/material/Snackbar';
import { useEffect, useRef, useState } from 'react';

interface AlertSnackbarWithProgressProps {
  open: boolean;
  message: string;
  onClose: () => void;
  severity?: 'error' | 'success' | 'info' | 'warning';
}

export default function AlertSnackbarWithProgress({ open, message, onClose, severity = 'error' }: AlertSnackbarWithProgressProps) {
  const [progress, setProgress] = useState(100);
  const rafIdRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);

  // keep latest onClose without restarting the animation
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setProgress(100);
    const duration = 5000; // 5s
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const value = Math.max(100 - (elapsed / duration) * 100, 0);
      setProgress(value);
      if (elapsed < duration) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        onCloseRef.current?.();
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [open]);

  return (
    <MuiSnackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={open}
      onClose={onClose}
      // autoHideDuration={null}
      sx={{
        '& .MuiPaper-root': { minWidth: 320 },
        zIndex: 1400
      }}
    >
      <Alert severity={severity} sx={{ width: '100%', alignItems: 'flex-start', px: 2, py: 1.5 }}>
        <Box sx={{ whiteSpace: 'pre-line' }}>
          {message}
        </Box>
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              background:
                severity === 'success' ? '#e7f6ec' : severity === 'info' ? '#e8f4fd' : severity === 'warning' ? '#fff7e6' : '#ffeaea',
              '& .MuiLinearProgress-bar': {
                background:
                  severity === 'success' ? '#4caf50' : severity === 'info' ? '#2196f3' : severity === 'warning' ? '#ff9800' : '#f44336'
              }
            }}
          />
        </Box>
      </Alert>
    </MuiSnackbar>
  );
}
