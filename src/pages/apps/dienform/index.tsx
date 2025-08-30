import { SyntheticEvent, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';

// assets
import { DocumentText, Lock, Profile, Profile2User } from 'iconsax-react';

// ==============================|| PROFILE - ACCOUNT ||============================== //

export default function AccountProfile() {
  const { pathname } = useLocation();

  let selectedTab = 0;
  let breadcrumbTitle = '';
  let breadcrumbHeading = '';
  switch (pathname) {
    case '/apps/dienform/create':
      breadcrumbTitle = 'Danh sách/Tạo Form';
      breadcrumbHeading = 'Danh sách/Tạo Form';
      selectedTab = 0;
      break;
    case '/apps/dienform/fill-expected-ratio':
      breadcrumbTitle = 'Điền theo tỉ lệ mong muốn';
      breadcrumbHeading = 'Điền theo tỉ lệ mong muốn';
      selectedTab = 1;
      break;
    case '/apps/dienform/fill-in-data':
      breadcrumbTitle = 'Điền theo data có trước';
      breadcrumbHeading = 'Điền theo data có trước';
      selectedTab = 2;
      break;
    case '/apps/dienform/history':
      breadcrumbTitle = 'Lịch sử';
      breadcrumbHeading = 'Lịch sử';
      selectedTab = 3;
      break;
  }

  const [value, setValue] = useState(selectedTab);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  let breadcrumbLinks = [
    { title: 'Trang chủ', to: APP_DEFAULT_PATH },
    { title: 'Điền form tự động', to: '/apps/dienform/create' },
    { title: breadcrumbTitle }
  ];
  if (selectedTab === 0) {
    breadcrumbLinks = [{ title: 'Trang chủ', to: APP_DEFAULT_PATH }, { title: 'Điền form tự động' }];
  }

  useEffect(() => {
    if (pathname === '/apps/dienform/create') {
      setValue(0);
    }
  }, [pathname]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MainCard border={false}>
        <Stack sx={{ gap: GRID_COMMON_SPACING }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
            <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
              <Tab label="Danh sách/Tạo Form" component={Link} to="/apps/dienform/create" icon={<Profile />} iconPosition="start" />
              <Tab
                label="Điền theo tỉ lệ mong muốn"
                component={Link}
                to="/apps/dienform/fill-expected-ratio"
                icon={<DocumentText />}
                iconPosition="start"
              />
              {/* <Tab
                label="My Account"
                component={Link}
                to="/apps/profiles/account/my-account"
                icon={<TableDocument />}
                iconPosition="start"
              /> */}
              <Tab label="Điền theo data có trước" component={Link} to="/apps/dienform/fill-in-data" icon={<Lock />} iconPosition="start" />
              <Tab label="Lịch sử" component={Link} to="/apps/dienform/history" icon={<Profile2User />} iconPosition="start" />
            </Tabs>
          </Box>
          <Outlet />
        </Stack>
      </MainCard>
    </>
  );
}
