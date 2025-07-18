import { cloneElement, ReactElement, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import useScrollTrigger from '@mui/material/useScrollTrigger';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';
import Logo from 'components/logo';

// assets
import { HambergerMenu, Minus, Send2 } from 'iconsax-react';

interface ElevationScrollProps {
  layout: string;
  children: ReactElement;
  window?: Window | Node;
}

function ElevationScroll({ children, window, layout }: ElevationScrollProps) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
    target: window || undefined
  });

  return cloneElement(children, {
    style: {
      boxShadow: trigger ? 'rgba(0, 0, 0, 0.08) 0px 3px 14px 0px' : 'none',
      backgroundColor: trigger || layout === 'component' ? alpha('#ffffff', 0.8) : alpha('#ffffff', 0)
    }
  });
}

interface Props {
  layout?: string;
}

// ==============================|| COMPONENTS - APP BAR ||============================== //

export default function Header({ layout = 'landing', ...others }: Props) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [drawerToggle, setDrawerToggle] = useState<boolean>(false);

  /** Method called on multiple components with different event types */
  const drawerToggler = (open: boolean) => (event: any) => {
    if (event.type! === 'keydown' && (event.key! === 'Tab' || event.key! === 'Shift')) {
      return;
    }
    setDrawerToggle(open);
  };

  return (
    <ElevationScroll layout={layout} {...others}>
      <AppBar
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.background.default, 0.1),
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
            <Stack
              direction="row"
              sx={{
                gap: 3,
                alignItems: 'center',
                display: { xs: 'none', md: 'flex' },
                '& .header-link': { fontWeight: 500, '&:hover': { color: 'primary.main' } }
              }}
            >
              <Link
                className="header-link"
                color="secondary.main"
                component={RouterLink}
                to="/"
                underline="none"
              >
                Trang Chủ
              </Link>
              <Link
                className="header-link"
                color="secondary.main"
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
              <Box sx={{ display: 'inline-block' }}>
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
            </Stack>
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
                <IconButton
                  size="large"
                  color="secondary"
                  onClick={drawerToggler(true)}
                  sx={{ p: 1 }}
                >
                  <HambergerMenu />
                </IconButton>
              </Stack>
            </Box>
            <Drawer
              anchor="top"
              open={drawerToggle}
              onClose={drawerToggler(false)}
              sx={{ '& .MuiDrawer-paper': { backgroundImage: 'none' } }}
            >
              <Box
                sx={{ width: 'auto', '& .MuiListItemIcon-root': { fontSize: '1rem', minWidth: 28 } }}
                role="presentation"
                onClick={drawerToggler(false)}
                onKeyDown={drawerToggler(false)}
              >
                <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
                  <Link style={{ textDecoration: 'none' }} component={RouterLink} to="/">
                    <ListItemButton>
                      <ListItemIcon>
                        <Minus />
                      </ListItemIcon>
                      <ListItemText primary="Trang Chủ" slotProps={{ primary: { variant: 'h6', color: 'secondary.main' } }} />
                    </ListItemButton>
                  </Link>
                  <Link style={{ textDecoration: 'none' }} href="#">
                    <ListItemButton>
                      <ListItemIcon>
                        <Minus />
                      </ListItemIcon>
                      <ListItemText primary="Liên Hệ" slotProps={{ primary: { variant: 'h6', color: 'secondary.main' } }} />
                    </ListItemButton>
                  </Link>
                  <Link style={{ textDecoration: 'none' }} href="#">
                    <ListItemButton>
                      <ListItemIcon>
                        <Minus />
                      </ListItemIcon>
                      <ListItemText primary="Bảng Giá" slotProps={{ primary: { variant: 'h6', color: 'secondary.main' } }} />
                    </ListItemButton>
                  </Link>
                  <Link style={{ textDecoration: 'none' }} href="#">
                    <ListItemButton>
                      <ListItemIcon>
                        <Minus />
                      </ListItemIcon>
                      <ListItemText primary="Tài Liệu Hướng Dẫn" slotProps={{ primary: { variant: 'h6', color: 'secondary.main' } }} />
                    </ListItemButton>
                  </Link>
                  <Link style={{ textDecoration: 'none' }} href="#">
                    <ListItemButton>
                      <ListItemIcon>
                        <Minus />
                      </ListItemIcon>
                      <ListItemText primary="Dùng thử miễn phí" slotProps={{ primary: { variant: 'h6', color: 'secondary.main' } }} />
                    </ListItemButton>
                  </Link>
                </List>
              </Box>
            </Drawer>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
}
