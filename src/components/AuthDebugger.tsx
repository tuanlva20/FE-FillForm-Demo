import { useState } from 'react';
import { useLocation } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

// project-imports
import useAuth from 'hooks/useAuth';

// ==============================|| AUTH DEBUGGER COMPONENT ||============================== //

export default function AuthDebugger() {
  const { isLoggedIn, isInitialized, user, logout } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 9999
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={() => setIsVisible(true)}
          sx={{ fontSize: '10px', minWidth: 'auto', px: 1 }}
        >
          Auth Debug
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        maxWidth: 350
      }}
    >
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontSize: '14px' }}>
              Auth Status
            </Typography>
            <Button size="small" onClick={() => setIsVisible(false)} sx={{ minWidth: 'auto', px: 1 }}>
              ×
            </Button>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Alert severity={isLoggedIn ? 'success' : 'warning'} sx={{ py: 0 }}>
              {isLoggedIn ? 'Logged In' : 'Not Logged In'}
            </Alert>
          </Box>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Initialized:</strong> {isInitialized ? 'Yes' : 'No'}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Current Path:</strong> {location.pathname}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>User:</strong> {user ? user.email || user.name || 'User' : 'None'}
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>URL Params:</strong> {window.location.search || 'None'}
          </Typography>

          {isLoggedIn && (
            <Button
              variant="outlined"
              size="small"
              onClick={logout}
              color="error"
              fullWidth
            >
              Logout
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
