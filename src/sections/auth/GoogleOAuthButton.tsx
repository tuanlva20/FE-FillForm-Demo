import CardMedia from '@mui/material/CardMedia';
import { useGoogleLogin } from '@react-oauth/google';
import imgGoogle from 'assets/images/auth/google.svg';
import useAuth from 'hooks/useAuth';
import { useSnackbar } from 'notistack';
import AuthSocButton from 'sections/auth/AuthSocButton';

interface Props {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleOAuthButton({ mode, onSuccess, onError }: Props) {
  const { googleLogin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID || '';

  // If client id missing, render a button with same layout and warn on click.
  if (!GOOGLE_CLIENT_ID) {
    const warn = () => {
      enqueueSnackbar('Google OAuth chưa được cấu hình: thiếu VITE_APP_GOOGLE_CLIENT_ID', { variant: 'warning' });
    };
    return (
      <AuthSocButton onClick={warn}>
        <CardMedia component="img" src={imgGoogle} alt="Google" sx={{ my: 0, mx: 1.25, width: 'auto' }} />
        {mode === 'login' ? 'Đăng nhập với Google' : 'Đăng ký với Google'}
      </AuthSocButton>
    );
  }

  const login = useGoogleLogin({
    // Note: clientId is provided by GoogleOAuthProvider at App root
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse: any) => {
      try {
        const token = tokenResponse?.id_token || tokenResponse?.access_token;
        if (!token) throw new Error('Không nhận được token từ Google');
        if (googleLogin) await googleLogin(token);
        enqueueSnackbar('Đăng nhập Google thành công!', { variant: 'success' });
        onSuccess?.();
      } catch (error: any) {
        const errorMessage = error?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        onError?.(errorMessage);
      }
    },
    onError: () => {
      const errorMessage = 'Đăng nhập Google bị hủy hoặc thất bại.';
      enqueueSnackbar(errorMessage, { variant: 'warning' });
      onError?.(errorMessage);
    }
  });

  const handleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      enqueueSnackbar('Google OAuth chưa được cấu hình: thiếu VITE_APP_GOOGLE_CLIENT_ID', { variant: 'warning' });
      return;
    }
    login();
  };

  return (
    <AuthSocButton onClick={handleClick}>
      <CardMedia component="img" src={imgGoogle} alt="Google" sx={{ my: 0, mx: 1.25, width: 'auto' }} />
      {mode === 'login' ? 'Đăng nhập với Google' : 'Đăng ký với Google'}
    </AuthSocButton>
  );
}
