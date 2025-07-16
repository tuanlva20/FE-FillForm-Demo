// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthResetPassword from 'sections/auth/auth-forms/AuthResetPassword';

// ================================|| RESET PASSWORD ||================================ //

export default function ResetPassword() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 1, mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Đặt lại mật khẩu</Typography>
            <Typography color="secondary">Vui lòng chọn mật khẩu mới của bạn</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthResetPassword />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
