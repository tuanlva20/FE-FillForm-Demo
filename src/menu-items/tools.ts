// project-imports

// assets
import { Calendar1, CpuCharge, DocumentText, Kanban, KyberNetwork, Link1, Messages2, Profile2User, SecuritySafe, ShoppingBag, UserSquare } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  tools: KyberNetwork,
  chat: Messages2,
  calendar: Calendar1,
  kanban: Kanban,
  customer: Profile2User,
  invoice: DocumentText,
  profile: UserSquare,
  ecommerce: ShoppingBag,
  add: Link1,
  link: Link1,
  plugins: CpuCharge,
  form: DocumentText,
  encrypt: SecuritySafe
};

// ==============================|| MENU ITEMS - TOOLS ||============================== //

const tools: NavItemType = {
  id: 'group-tools',
  title: 'tools',
  icon: icons.tools,
  type: 'group',
  children: [
    {
      id: 'dienform',
      title: 'Điền form tự động',
      type: 'item',
      url: '/apps/dienform/create',
      icon: icons.form,
      breadcrumbs: false,
    },
    {
      id: 'chat',
      title: 'Mã hóa data',
      type: 'item',
      url: '/mahoadata',
      icon: icons.encrypt,
      breadcrumbs: false
    },
    // {
    //   id: 'calendar',
    //   title: 'calendar',
    //   type: 'item',
    //   url: '/apps/calendar',
    //   icon: icons.calendar,
    //   actions: [
    //     {
    //       type: NavActionType.LINK,
    //       label: 'Full Calendar',
    //       icon: icons.link,
    //       url: 'https://fullcalendar.io/docs/react',
    //       target: true
    //     }
    //   ]
    // },
    // {
    //   id: 'kanban',
    //   title: 'kanban',
    //   type: 'item',
    //   icon: icons.kanban,
    //   url: '/apps/kanban/board',
    //   link: '/apps/kanban/:tab',
    //   breadcrumbs: false
    // },
    // {
    //   id: 'customer',
    //   title: 'customer',
    //   type: 'collapse',
    //   icon: icons.customer,
    //   children: [
    //     {
    //       id: 'customer-list',
    //       title: 'list',
    //       type: 'item',
    //       url: '/apps/customer/customer-list',
    //       actions: [
    //         {
    //           type: NavActionType.FUNCTION,
    //           label: 'Add Customer',
    //           function: () => handlerCustomerDialog(true),
    //           icon: icons.add
    //         }
    //       ]
    //     },
    //     {
    //       id: 'customer-card',
    //       title: 'cards',
    //       type: 'item',
    //       url: '/apps/customer/customer-card'
    //     }
    //   ]
    // },
    // {
    //   id: 'invoice',
    //   title: 'invoice',
    //   url: '/apps/invoice/dashboard',
    //   type: 'collapse',
    //   icon: icons.invoice,
    //   breadcrumbs: false,
    //   children: [
    //     {
    //       id: 'create',
    //       title: 'create',
    //       type: 'item',
    //       url: '/apps/invoice/create',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'details',
    //       title: 'details',
    //       type: 'item',
    //       url: '/apps/invoice/details/1',
    //       link: '/apps/invoice/details/:id',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'list',
    //       title: 'list',
    //       type: 'item',
    //       url: '/apps/invoice/list',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'edit',
    //       title: 'edit',
    //       type: 'item',
    //       url: '/apps/invoice/edit/1',
    //       link: '/apps/invoice/edit/:id',
    //       breadcrumbs: false
    //     }
    //   ]
    // },
    // {
    //   id: 'profile',
    //   title: 'profile',
    //   type: 'collapse',
    //   icon: icons.profile,
    //   children: [
    //     {
    //       id: 'user-profile',
    //       title: 'user-profile',
    //       type: 'item',
    //       link: '/apps/profiles/user/:tab',
    //       url: '/apps/profiles/user/personal',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'account-profile',
    //       title: 'account-profile',
    //       type: 'item',
    //       url: '/apps/profiles/account/basic',
    //       link: '/apps/profiles/account/:tab',
    //       breadcrumbs: false
    //     }
    //   ]
    // },

    // {
    //   id: 'e-commerce',
    //   title: 'e-commerce',
    //   type: 'collapse',
    //   icon: icons.ecommerce,
    //   children: [
    //     {
    //       id: 'products',
    //       title: 'products',
    //       type: 'item',
    //       url: '/apps/e-commerce/products'
    //     },
    //     {
    //       id: 'product-details',
    //       title: 'product-details',
    //       type: 'item',
    //       link: '/apps/e-commerce/product-details/:id',
    //       url: '/apps/e-commerce/product-details/1',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'product-list',
    //       title: 'product-list',
    //       type: 'item',
    //       url: '/apps/e-commerce/product-list',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'add-new-product',
    //       title: 'add-new-product',
    //       type: 'item',
    //       url: '/apps/e-commerce/add-new-product'
    //     },
    //     {
    //       id: 'checkout',
    //       title: 'checkout',
    //       type: 'item',
    //       url: '/apps/e-commerce/checkout'
    //     }
    //   ]
    // }
  ]
};

export default tools;
