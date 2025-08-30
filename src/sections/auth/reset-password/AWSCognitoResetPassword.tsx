import { Eye, EyeSlash } from 'iconsax-react';
import { ErrorIcon } from 'assets/images/svg/icon';
import { Alert } from '@mui/material';

export default function AWSCognitoResetPassword() {
  return <Alert color="error" variant="border" icon={<ErrorIcon />}></Alert>;
}
