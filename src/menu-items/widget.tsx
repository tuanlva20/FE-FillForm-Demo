// assets
import { Home2, MessageQuestion, Money } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  widgets: Home2,
  statistics: Home2,
  data: MessageQuestion,
  chart: Money,
  money: Money
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const widget: NavItemType = {
  id: 'group-widget',
  title: 'Truy cập nhanh',
  icon: icons.widgets,
  type: 'group',
  children: [
    // {
    //   id: 'statistics',
    //   title: 'statistics',
    //   type: 'item',
    //   url: '/widget/statistics',
    //   icon: icons.statistics
    // },
    // {
    //   id: 'data',
    //   title: 'data',
    //   type: 'item',
    //   url: '/widget/data',
    //   icon: icons.data
    // },
    // {
    //   id: 'chart',
    //   title: 'chart',
    //   type: 'item',
    //   url: '/widget/chart',
    //   icon: icons.chart
    // }
    {
      id: 'statistics',
      title: 'Trang chủ',
      type: 'item',
      url: '/#',
      icon: icons.statistics
    },
    // {
    //   id: 'data',
    //   title: 'Liên hệ',
    //   type: 'item',
    //   url: '/',
    //   icon: icons.data
    // },
    {
      id: 'chart',
      title: 'Nạp tiền',
      type: 'item',
      url: '/money',
      icon: icons.money
    }
  ]
};

export default widget;
