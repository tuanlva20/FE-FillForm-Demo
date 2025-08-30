import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';

// project-imports
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import Loader from 'components/Loader';
import { DRAWER_WIDTH, MenuOrientation, MINI_DRAWER_WIDTH } from 'config';
import useConfig from 'hooks/useConfig';
import AuthGuard from 'utils/route-guard/AuthGuard';
import Drawer from './Drawer';
import HorizontalBar from './Drawer/HorizontalBar';
import Footer from './Footer';
import Header from './Header';

// ==============================|| MAIN LAYOUT ||============================== //

export default function MainLayout() {
  const { menuMasterLoading, menuMaster } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;
  const drawerOpen = menuMaster?.isDashboardDrawerOpened || false;

  // Calculate main content width based on drawer state
  const getMainWidth = () => {
    if (isHorizontal) return '100%';
    if (downLG) return '100%'; // On mobile, drawer is overlay so main takes full width
    return drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${MINI_DRAWER_WIDTH}px)`;
  };

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      handlerDrawerOpen(!downXL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  return (
    <AuthGuard>
      {menuMasterLoading ? (
        <Loader />
      ) : (
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Header />
          {!isHorizontal ? <Drawer /> : <HorizontalBar />}

          <Box
            component="main"
            sx={{
              width: getMainWidth(),
              flexGrow: 1,
              p: { xs: 1, sm: 3 },
              transition: 'width 0.2s ease-in-out'
            }}
          >
            <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit', mb: isHorizontal ? 2 : 'inherit' }} />
            <Container
              maxWidth={container && !downXL ? 'xl' : false}
              sx={{
                ...(container && !downXL && { px: { xs: 0, sm: 3 } }),
                position: 'relative',
                minHeight: 'calc(100vh - 124px)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Breadcrumbs />
              <Outlet />
              <Footer />
            </Container>
          </Box>
        </Box>
      )}
    </AuthGuard>
  );
}
