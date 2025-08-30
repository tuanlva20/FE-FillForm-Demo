import { Link } from 'react-router-dom';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import useAuth from 'hooks/useAuth';
import useRedirectAfterLogin from 'hooks/useRedirectAfterLogin';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';
import AuthDivider from 'sections/auth/AuthDivider';
import AuthSocButton from 'sections/auth/AuthSocButton';
import AuthWrapper from 'sections/auth/AuthWrapper';
import GoogleOAuthButton from 'sections/auth/GoogleOAuthButton';

// assets
import imgFacebook from 'assets/images/auth/facebook.svg';

// ================================|| LOGIN ||================================ //

export default function Login() {
  const { isLoggedIn } = useAuth();
  const { handleRedirectAfterLogin } = useRedirectAfterLogin();

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid sx={{ textAlign: 'center' }} size={12}>
          {/* <Logo /> */}
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1}>
            <Grid size={12}>
              <AuthSocButton>
                <CardMedia component="img" src={imgFacebook} alt="Facebook" sx={{ my: 0, mx: 1.25, width: 'auto' }} /> Đăng nhập với
                Facebook
              </AuthSocButton>
            </Grid>
            {/* <Grid size={12}>
              <AuthSocButton>
                <CardMedia component="img" src={imgTwitter} alt="Twitter" sx={{ my: 0, mx: 1.25, width: 'auto' }} /> Đăng nhập với Twitter
              </AuthSocButton>
            </Grid> */}
            <Grid size={12}>
              <GoogleOAuthButton mode="login" onSuccess={handleRedirectAfterLogin} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <AuthDivider>
            <Typography variant="body1">HOẶC</Typography>
          </AuthDivider>
        </Grid>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Đăng nhập</Typography>
            <Typography
              component={Link}
              to={isLoggedIn ? '/auth/register' : '/register'}
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
            >
              Đăng ký tài khoản?
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin forgot="/auth/forgot-password" />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
