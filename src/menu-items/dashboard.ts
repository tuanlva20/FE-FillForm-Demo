// project-imports
import { useGetMenu } from 'api/menu';

// assets
import { Box1, DocumentText, DollarSquare, Home3, HomeTrendUp, Refresh } from 'iconsax-react';

// types
import useAuth from 'hooks/useAuth';
import { NavItemType } from 'types/menu';

const icons = {
  navigation: Home3,
  dashboard: HomeTrendUp,
  components: Box1,
  loading: Refresh,
  finance: DollarSquare,
  default: DocumentText
};

const loadingMenu: NavItemType = {
  id: 'group-dashboard-loading',
  title: 'dashboard',
  type: 'group',
  icon: icons.loading,
  children: [
    {
      id: 'dashboard1',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      breadcrumbs: false
    }
  ]
};

// Default dashboard menu with finance submenu
const defaultDashboardMenu: NavItemType = {
  id: 'group-dashboard',
  title: 'dashboard',
  type: 'group',
  icon: icons.dashboard,
  children: [
    {
      id: 'dashboard-default',
      title: 'Default',
      type: 'item',
      url: '/dashboard/default',
      breadcrumbs: false,
      icon: icons.default
    },
    {
      id: 'finance',
      title: 'Tài chính',
      type: 'collapse',
      icon: icons.finance,
      children: [
        {
          id: 'finance-overview',
          title: 'Tổng quan',
          type: 'item',
          url: '/dashboard/finance',
          breadcrumbs: false
        }
      ]
    }
  ]
};

// ==============================|| MENU ITEMS - API ||============================== //

export function MenuFromAPI() {
  const { menu, menuLoading } = useGetMenu();
  const { user } = useAuth();

  if (menuLoading) return loadingMenu;

  // If no menu from API, return default dashboard menu
  if (!menu || !menu.children || menu.children.length === 0) {
    // No menu from API → return default, filtered by role
    const filteredDefault = filterFinanceByRole(defaultDashboardMenu, user?.role);
    return filteredDefault;
  }

  const subChildrenList = (children: NavItemType[]) => {
    return children?.map((subList: NavItemType) => {
      return fillItem(subList);
    });
  };

  const itemList = (subList: NavItemType) => {
    let list = fillItem(subList);

    // if collapsible item, we need to feel its children as well
    if (subList.type === 'collapse') {
      list.children = subChildrenList(subList.children!);
    }
    return list;
  };

  const childrenList: NavItemType[] | undefined = menu?.children?.map((subList: NavItemType) => {
    return itemList(subList);
  });

  let menuList: NavItemType = fillItem(menu, childrenList) as NavItemType;
  // Filter finance section by role
  menuList = filterFinanceByRole(menuList, user?.role);
  return menuList;
}

function fillItem(item: NavItemType, children?: NavItemType[] | undefined): NavItemType {
  return {
    ...item,
    title: item?.title,
    // @ts-ignore
    icon: icons[item?.icon],
    ...(children && { children })
  } as NavItemType;
}

// Hide finance menu if user is not ADMIN
function filterFinanceByRole(menu: NavItemType, role?: string): NavItemType {
  const isAdmin = (role || '').toUpperCase() === 'ADMIN';
  if (isAdmin) return menu;

  // Case 1: this menu IS the dashboard group
  if (menu.id === 'group-dashboard' || menu.id === 'group-dashboard-loading') {
    const pruned = menu.children?.filter((sub) => sub.id !== 'finance');
    return { ...menu, children: pruned } as NavItemType;
  }

  // Case 2: dashboard group is nested somewhere inside children
  const filteredChildren = menu.children?.map((child) => {
    if (child.id === 'group-dashboard' || child.id === 'group-dashboard-loading') {
      const newChildren = child.children?.filter((sub) => sub.id !== 'finance');
      return { ...child, children: newChildren } as NavItemType;
    }
    return child;
  });

  return { ...menu, ...(filteredChildren && { children: filteredChildren }) } as NavItemType;
}
