// project-imports
import adminPanel from './admin-panel';
import applications from './applications';
import chartsMap from './charts-map';
import formsTables from './forms-tables';
import pages from './pages';
import samplePage from './sample-page';
import support from './support';
import widget from './widget';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [widget, adminPanel, applications, formsTables, chartsMap, samplePage, pages, support]
};

export default menuItems;
