/**
 * AI Loading Dialog Component
 *
 * A reusable, modern loading dialog with futuristic animations for AI processing operations.
 * Features gradient background, rotating ring, pulsing AI icon, and bouncing progress indicators.
 *
 * @component
 * @example
 * ```tsx
 * <AILoadingDialog
 *   open={isLoading}
 *   title="AI đang xử lý dữ liệu"
 *   subtitle="Đang phân tích và tạo kết quả..."
 * />
 * ```
 */
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Box, Dialog, DialogContent, Stack, Typography } from '@mui/material';

interface AILoadingDialogProps {
  /** Controls whether the dialog is open */
  open: boolean;
  /** Main title text (default: "AI đang xử lý và điền dữ liệu") */
  title?: string;
  /** Subtitle text (default: "Đang phân tích form và tạo dữ liệu mẫu...") */
  subtitle?: string;
  /** Whether to disable escape key closing (default: true) */
  disableEscapeKeyDown?: boolean;
}

export default function AILoadingDialog({
  open,
  title = 'Đang xử lý điền dữ liệu',
  subtitle = 'Vui lòng chờ trong giây lát...',
  disableEscapeKeyDown = true
}: AILoadingDialogProps) {
  return (
    <Dialog
      open={open}
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={{
        sx: {
          borderRadius: 4,
          minWidth: 400,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          p: 4
        }
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          {/* Futuristic AI Icon */}
          <Box
            sx={{
              position: 'relative',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Rotating outer ring */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                border: '3px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                borderTop: '3px solid white',
                animation: 'spin 2s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            />
            {/* Inner AI icon */}
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                  '100%': { transform: 'scale(1)', opacity: 1 }
                }
              }}
            >
              <SmartToyIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
          </Box>

          {/* Modern Typography */}
          <Stack spacing={1}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: '0.875rem',
                letterSpacing: '0.25px'
              }}
            >
              {subtitle}
            </Typography>
          </Stack>

          {/* Progress indicators */}
          <Stack direction="row" spacing={1}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  animation: `bounce 1.4s ease-in-out ${index * 0.16}s infinite both`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0.8)',
                      opacity: 0.5
                    },
                    '40%': {
                      transform: 'scale(1)',
                      opacity: 1
                    }
                  }
                }}
              />
            ))}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
