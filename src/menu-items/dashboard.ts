// project-imports
import { useGetMenu } from 'api/menu';

// assets
import { Box1, Home3, HomeTrendUp, Refresh } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

const icons = {
  navigation: Home3,
  dashboard: HomeTrendUp,
  components: Box1,
  loading: Refresh
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
      icon: icons.dashboard,
      url: '/dashboard/default',
      breadcrumbs: false
    }
  ]
};

// ==============================|| MENU ITEMS - API ||============================== //

export function MenuFromAPI() {
  const { menu, menuLoading } = useGetMenu();

  if (menuLoading) return loadingMenu;

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
