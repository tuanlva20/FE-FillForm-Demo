// material-ui
import { useTheme } from '@mui/material/styles';

// project-imports
import logo from '../../assets/images/logo-khaosat.png';

// ==============================|| LOGO IMAGE ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    <img 
      src={logo} 
      alt="KHAOSAT.TECH Logo" 
      width="150" 
      height="auto"
      style={{ maxHeight: '40px' }}
    />
  );
}
