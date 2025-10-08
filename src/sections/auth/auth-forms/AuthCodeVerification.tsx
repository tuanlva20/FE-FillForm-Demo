// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// third-party
import { Formik } from 'formik';
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import { SnackbarProps } from 'types/snackbar';
import { combineFormikErrors, parseApiError, severityFromParsedError } from 'utils/errorHandler';

// ============================|| STATIC - CODE VERIFICATION ||============================ //

export default function AuthCodeVerification() {
  const theme = useTheme();
  const navigate = useNavigate();
  const scriptedRef = useScriptRef();
  const { validateSignupCode, resendSignupCode } = useAuth();

  // Get email from localStorage
  const email = localStorage.getItem('pendingVerificationEmail');

  const handleResendCode = async () => {
    if (!email) return;
    
    try {
      await resendSignupCode(email);
      openSnackbar({
        open: true,
        message: 'Mã xác thực đã được gửi lại đến email của bạn.',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    } catch (err: any) {
      const parsed = parseApiError(err);
      openSnackbar({
        open: true,
        message: parsed.message,
        variant: 'alert',
        alert: { color: severityFromParsedError(parsed) }
      } as SnackbarProps);
    }
  };

  return (
    <Formik
      initialValues={{ otp: '' }}
      validationSchema={Yup.object({
        otp: Yup.string().length(6, 'Mã xác thực phải có đúng 6 ký tự').required('Mã xác thực là bắt buộc')
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        if (!email) {
          setErrors({ otp: 'Không tìm thấy email để xác thực' });
          return;
        }

        try {
          await validateSignupCode(email, values.otp);
          if (scriptedRef.current) {
            setStatus({ success: true });
            setSubmitting(false);
            openSnackbar({
              open: true,
              message: 'Xác thực email thành công!',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);

            setTimeout(() => {
              navigate('/dashboard/default', { replace: true });
            }, 1500);
          }
        } catch (err: any) {
          const parsed = parseApiError(err);
          setErrors(combineFormikErrors(parsed));
          openSnackbar({
            open: true,
            message: parsed.message,
            variant: 'alert',
            alert: { color: severityFromParsedError(parsed) }
          } as SnackbarProps);
          if (scriptedRef.current) {
            setStatus({ success: false });
            setSubmitting(false);
          }
        }
      }}
    >
      {({ errors, handleSubmit, touched, values, setFieldValue, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Box
                sx={(theme) => ({
                  '& input:focus-visible': {
                    outline: 'none !important',
                    borderColor: `${theme.palette.primary.main} !important`,
                    boxShadow: `${theme.customShadows.primary} !important`
                  }
                })}
              >
                <OtpInput
                  value={values.otp}
                  onChange={(otp) => setFieldValue('otp', otp)}
                  inputType="tel"
                  shouldAutoFocus
                  renderInput={(props) => <input {...props} />}
                  numInputs={6}
                  containerStyle={{ justifyContent: 'space-between', margin: -8 }}
                  inputStyle={{
                    width: '100%',
                    margin: '8px',
                    padding: '10px',
                    border: '1px solid',
                    outline: 'none',
                    borderRadius: 4,
                    borderColor: touched.otp && errors.otp ? theme.palette.error.main : theme.palette.divider
                  }}
                />
                {touched.otp && errors.otp && (
                  <FormHelperText error id="standard-weight-helper-text-otp">
                    {errors.otp}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
            <Grid size={12}>
              <AnimateButton>
                <Button 
                  disableElevation 
                  fullWidth 
                  size="large" 
                  type="submit" 
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Đang xác thực...' : 'Xác thực'}
                </Button>
              </AnimateButton>
            </Grid>
            <Grid size={12}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography>Không nhận được email? Kiểm tra thư mục spam, hoặc</Typography>
                <Typography 
                  variant="body1" 
                  sx={{ minWidth: 87, textDecoration: 'none', cursor: 'pointer' }} 
                  color="primary"
                  onClick={handleResendCode}
                >
                  Gửi lại mã
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}
