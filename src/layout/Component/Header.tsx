import { cloneElement, ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import useScrollTrigger from '@mui/material/useScrollTrigger';

// project-imports
import { handlerComponentDrawer, useGetMenuMaster } from 'api/menu';
import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';
import Logo from 'components/logo';
import { APP_DEFAULT_PATH } from 'config';
import useAuth from 'hooks/useAuth';

// assets
import { HambergerMenu, Send2 } from 'iconsax-react';

// types

interface ElevationScrollProps {
  children: ReactElement;
  window?: Window | Node;
}

function ElevationScroll({ children, window }: ElevationScrollProps) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
    target: window || undefined
  });

  return cloneElement(children, {
    style: {
      boxShadow: trigger ? 'rgba(0, 0, 0, 0.08) 0px 3px 14px 0px' : 'none'
    }
  });
}

// ==============================|| COMPONENTS - APP BAR ||============================== //

export default function Header() {
  const { isLoggedIn } = useAuth();
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();

  return (
    <ElevationScroll>
      <AppBar
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(8px)',
          color: 'text.primary',
          boxShadow: 'none'
        })}
      >
        <Container maxWidth="xl" disableGutters={downMD}>
          <Toolbar sx={{ px: { xs: 1.5, sm: 4, md: 0, lg: 0 }, py: 1 }}>
            <Stack direction="row" sx={{ alignItems: 'center', flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ display: 'inline-block' }}>
                <Logo to="/" />
              </Box>
            </Stack>
            <Box
              sx={{
                '& .header-link': { '&:hover': { color: 'primary.main' }, ml: 3, fontWeight: 500 },
                '& .header-button': { ml: 3 },
                display: { xs: 'none', md: 'block' }
              }}
            >
              <Link
                className="header-link"
                sx={(theme) => ({ ml: theme.direction === 'rtl' ? 3 : 0 })}
                color="secondary.main"
                component={RouterLink}
                to="/"
                underline="none"
              >
                Trang Chủ
              </Link>
              <Link
                className="header-link"
                color="primary"
                href="#"
                underline="none"
              >
                Liên Hệ
              </Link>
              <Link
                className="header-link"
                color="secondary.main"
                href="#"
                underline="none"
              >
                Bảng Giá
              </Link>
              <Link
                className="header-link"
                color="secondary.main"
                href="#"
                underline="none"
              >
                Tài Liệu Hướng Dẫn
              </Link>
              <Box className="header-button" sx={{ display: 'inline-block' }}>
                <AnimateButton>
                  <Button
                    href="#"
                    disableElevation
                    startIcon={<Send2 />}
                    color="primary"
                    size="large"
                    variant="contained"
                  >
                    Dùng thử miễn phí
                  </Button>
                </AnimateButton>
              </Box>
            </Box>

            <Box
              sx={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                display: { xs: 'flex', md: 'none' }
              }}
            >
              <Box sx={{ display: 'inline-block' }}>
                <Logo to="/" />
              </Box>
              <Stack direction="row" sx={{ gap: 2 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  component={RouterLink}
                  to={isLoggedIn ? APP_DEFAULT_PATH : '/login'}
                  sx={{ mt: 0.25 }}
                >
                  {isLoggedIn ? 'Dashboard' : 'Login'}
                </Button>

                <IconButton
                  size="large"
                  color="secondary"
                  onClick={() => handlerComponentDrawer(!menuMaster.isComponentDrawerOpened)}
                  sx={{ p: 1 }}
                >
                  <HambergerMenu />
                </IconButton>
              </Stack>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
}
