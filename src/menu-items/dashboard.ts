// project-imports
import { useGetMenu } from 'api/menu';

// assets
import { Box1, DocumentText, DollarSquare, Home3, HomeTrendUp, Refresh } from 'iconsax-react';

// types
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

  if (menuLoading) return loadingMenu;

  // If no menu from API, return default dashboard menu
  if (!menu || !menu.children || menu.children.length === 0) {
    return defaultDashboardMenu;
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

  let menuList = fillItem(menu, childrenList);
  return menuList;
}

function fillItem(item: NavItemType, children?: NavItemType[] | undefined) {
  return {
    ...item,
    title: item?.title,
    // @ts-ignore
    icon: icons[item?.icon],
    ...(children && { children })
  };
}
