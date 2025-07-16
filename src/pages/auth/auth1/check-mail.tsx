import { Link } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';

// ================================|| CHECK MAIL ||================================ //

export default function CheckMail() {
  const { isLoggedIn } = useAuth();

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Box sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Chào bạn, kiểm tra email của bạn</Typography>
            <Typography color="secondary" sx={{ mb: 0.5, mt: 1.25 }}>
              Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn.
            </Typography>
          </Box>
        </Grid>
        <Grid size={12}>
          <AnimateButton>
            <Button
              component={Link}
              to={isLoggedIn ? '/auth/login' : '/login'}
              disableElevation
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              Đăng nhập
            </Button>
          </AnimateButton>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
