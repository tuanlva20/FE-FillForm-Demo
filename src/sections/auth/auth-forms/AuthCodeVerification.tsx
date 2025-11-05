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
import { useRef, useState } from 'react';
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AlertSnackbarWithProgress from 'components/@extended/AlertSnackbarWithProgress';
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
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorAlertMessage, setErrorAlertMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successAlertMessage, setSuccessAlertMessage] = useState('');
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  // Throttle state - ngăn user nhấn liên tục (1s chỉ nhấn được 1 lần)
  const lastSubmitTimeRef = useRef<number>(0);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastResendTimeRef = useRef<number>(0);
  const resendCooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const SUBMIT_THROTTLE_MS = 1000; // 1 second
  const RESEND_THROTTLE_MS = 3000; // 3 seconds

  // Get email from localStorage
  const email = localStorage.getItem('pendingVerificationEmail');

  const handleResendCode = async () => {
    if (!email) return;
    
    // Throttle: Kiểm tra xem đã gửi lại mã quá nhanh chưa (3s chỉ được gửi 1 lần)
    const now = Date.now();
    if (now - lastResendTimeRef.current < RESEND_THROTTLE_MS) {
      return;
    }
    
    // Set cooldown timer for resend button
    lastResendTimeRef.current = now;
    setResendCooldown(3);
    setIsResending(true);
    
    if (resendCooldownIntervalRef.current) {
      clearInterval(resendCooldownIntervalRef.current);
    }
    
    resendCooldownIntervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 0) {
          if (resendCooldownIntervalRef.current) {
            clearInterval(resendCooldownIntervalRef.current);
            resendCooldownIntervalRef.current = null;
          }
          setIsResending(false);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    
    try {
      await resendSignupCode(email);
      // Hiển thị alert success kèm progress component 2s khi gửi lại mã thành công
      setSuccessAlertMessage('Mã xác thực đã được gửi lại đến email của bạn.');
      setShowSuccessAlert(true);
      
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
      // Hiển thị alert error kèm progress component 2s khi lỗi
      setErrorAlertMessage(parsed.message);
      setShowErrorAlert(true);
      
      openSnackbar({
        open: true,
        message: parsed.message,
        variant: 'alert',
        alert: { color: severityFromParsedError(parsed) }
      } as SnackbarProps);
    }
  };

  return (
    <>
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

          // Throttle: Kiểm tra xem đã gọi API quá nhanh chưa (1s chỉ được gọi 1 lần)
          const now = Date.now();
          if (now - lastSubmitTimeRef.current < SUBMIT_THROTTLE_MS) {
            setSubmitting(false);
            return;
          }
          
          // Set cooldown timer
          lastSubmitTimeRef.current = now;
          setRemainingCooldown(1);
          
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
          }
          
          cooldownIntervalRef.current = setInterval(() => {
            setRemainingCooldown((prev) => {
              if (prev <= 0) {
                if (cooldownIntervalRef.current) {
                  clearInterval(cooldownIntervalRef.current);
                  cooldownIntervalRef.current = null;
                }
                return 0;
              }
              return prev - 0.1;
            });
          }, 100);

          try {
            await validateSignupCode(email, values.otp);
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              if (cooldownIntervalRef.current) {
                clearInterval(cooldownIntervalRef.current);
                cooldownIntervalRef.current = null;
              }
              setRemainingCooldown(0);
              
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
            
            // Hiển thị alert kèm progress component trong 2s khi lỗi validation
            setErrorAlertMessage(parsed.message);
            setShowErrorAlert(true);
            
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
                    disabled={isSubmitting || values.otp.length !== 6 || remainingCooldown > 0}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {isSubmitting ? 'Đang xác thực...' : remainingCooldown > 0 ? `Xác thực (${remainingCooldown.toFixed(0)}s)` : 'Xác thực'}
                  </Button>
                </AnimateButton>
              </Grid>
              <Grid size={12}>
                <Stack direction="column" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography>Không nhận được email? Kiểm tra thư mục spam. Hoặc</Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      minWidth: 87, 
                      textDecoration: 'none', 
                      cursor: isResending ? 'not-allowed' : 'pointer',
                      opacity: isResending ? 0.6 : 1,
                      transition: 'all 0.2s ease'
                    }} 
                    color={isResending ? 'textDisabled' : 'primary'}
                    onClick={handleResendCode}
                  >
                    {'>>'} {isResending ? `Gửi lại (${resendCooldown.toFixed(0)}s)` : 'Gửi lại mã'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      {/* Alert kèm progress component 2s hiển thị lỗi */}
      <AlertSnackbarWithProgress
        open={showErrorAlert}
        message={errorAlertMessage}
        onClose={() => setShowErrorAlert(false)}
        severity="error"
      />

      {/* Alert kèm progress component 2s hiển thị success */}
      <AlertSnackbarWithProgress
        open={showSuccessAlert}
        message={successAlertMessage}
        onClose={() => setShowSuccessAlert(false)}
        severity="success"
      />
    </>
  );
}
