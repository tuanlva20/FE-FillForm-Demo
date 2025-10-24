import { To } from 'history';
import { Link } from 'react-router-dom';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';
import { SxProps } from '@mui/system';

// project-imports
import useAuth from 'hooks/useAuth';
import LogoIcon from './LogoIcon';
import Logo from './LogoMain';

interface Props {
  isIcon?: boolean;
  sx?: SxProps;
  to?: To;
}

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection({ isIcon, sx, to }: Props) {
  const { isLoggedIn } = useAuth();

  return (
    <ButtonBase disableRipple {...(isLoggedIn && { component: Link, to: !to ? '/' : to, sx })}>
      {isIcon ? <LogoIcon /> : <Logo />}
    </ButtonBase>
  );
}
