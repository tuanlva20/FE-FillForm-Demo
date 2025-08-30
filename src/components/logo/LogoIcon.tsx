// material-ui
import { useTheme } from '@mui/material/styles';

// project-imports
import logo from '../../assets/images/logo-khaosat.png';

// ==============================|| LOGO ICON IMAGE ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return <img src={logo} alt="KHAOSAT.TECH Icon" width="32" height="auto" style={{ maxHeight: '32px' }} />;
}
