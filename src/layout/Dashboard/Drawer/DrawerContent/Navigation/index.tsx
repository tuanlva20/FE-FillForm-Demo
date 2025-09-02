import { Fragment, useLayoutEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// project-imports
import { useGetMenu, useGetMenuMaster } from 'api/menu';
import { HORIZONTAL_MAX_ITEM, MenuOrientation } from 'config';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import menuItem from 'menu-items';
import { MenuFromAPI } from 'menu-items/dashboard';
import NavGroup from './NavGroup';
import NavItem from './NavItem';

// types
import { NavItemType } from 'types/menu';

function isFound(arr: any, str: string) {
  return arr.items.some((element: any) => {
    if (element.id === str) {
      return true;
    }
    return false;
  });
}

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  const { menuLoading } = useGetMenu();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const { user } = useAuth();

  const [selectedID, setSelectedID] = useState<string | undefined>('');
  const [selectedItems, setSelectedItems] = useState<string | undefined>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [menuItems, setMenuItems] = useState<{ items: NavItemType[] }>({ items: [] });

  const dashboardMenu = MenuFromAPI();
  useLayoutEffect(() => {
    // Always refresh the first dashboard group according to current role/loading state
    const firstId = menuItem.items[0]?.id;
    if (firstId === 'group-dashboard' || firstId === 'group-dashboard-loading') {
      menuItem.items.splice(0, 1, dashboardMenu);
    } else {
      menuItem.items.splice(0, 0, dashboardMenu);
    }
    setMenuItems({ items: [...menuItem.items] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuLoading, user?.role]);

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = menuItems.items.length - 1;
  let remItems: NavItemType[] = [];
  let lastItemId: string;

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id!;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navGroups = menuItems.items.slice(0, lastItemIndex + 1).map((item) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <Fragment key={item.id}>
              {menuOrientation !== MenuOrientation.HORIZONTAL && <Divider sx={{ my: 0.5 }} />}
              <NavItem item={item} level={1} isParents setSelectedID={setSelectedID} />
            </Fragment>
          );
        }
        return (
          <NavGroup
            key={item.id}
            selectedID={selectedID}
            setSelectedID={setSelectedID}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            lastItem={lastItem!}
            remItems={remItems}
            lastItemId={lastItemId}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 2) : 0,
        '& > ul:first-of-type': { mt: 0 },
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block',
        alignItems: 'center'
      }}
    >
      {navGroups}
    </Box>
  );
}
