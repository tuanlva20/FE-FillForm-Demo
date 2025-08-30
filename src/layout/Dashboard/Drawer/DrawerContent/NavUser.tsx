import { MouseEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';

// material-ui
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// project-imports
import { useGetMenuMaster } from 'api/menu';
import Avatar from 'components/@extended/Avatar';
import useAuth from 'hooks/useAuth';

// assets
import avatar1 from 'assets/images/users/avatar-6.png';
import { Logout, More, Profile, Setting2 } from 'iconsax-react';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
  drawerOpen: boolean;
}

const ExpandMore = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'theme' && prop !== 'expand' && prop !== 'drawerOpen'
})<ExpandMoreProps>(({ theme, expand, drawerOpen }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(-90deg)',
  marginLeft: 'auto',
  color: theme.palette.secondary.dark,
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  }),
  ...(!drawerOpen && { opacity: 0, width: 50, height: 50 })
}));

// ==============================|| LIST - USER ||============================== //

export default function UserList() {
  const navigate = useNavigate();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const { logout, user } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/login`, {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        p: drawerOpen ? 1.25 : 0.5,
        px: drawerOpen ? 3 : 1.25,
        borderTop: '2px solid ',
        borderTopColor: 'divider',
        minHeight: drawerOpen ? 'auto' : 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: drawerOpen ? 'flex-start' : 'center'
      }}
    >
      <List disablePadding sx={{ width: '100%' }}>
        <ListItem
          disablePadding
          secondaryAction={
            drawerOpen ? (
              <ExpandMore
                expand={open}
                drawerOpen={drawerOpen}
                id="user-menu-button"
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                aria-label="more options"
              >
                <More />
              </ExpandMore>
            ) : undefined
          }
          sx={{
            ...(!drawerOpen && {
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center'
            }),
            '& .MuiListItemSecondaryAction-root': {
              right: !drawerOpen ? 8 : -16,
              top: !drawerOpen ? 8 : '50%',
              transform: !drawerOpen ? 'none' : 'translateY(-50%)'
            }
          }}
          onClick={!drawerOpen ? handleClick : undefined}
        >
          <ListItemAvatar sx={{ minWidth: !drawerOpen ? 'auto' : 56 }}>
            <Avatar
              alt={user?.name || 'Avatar'}
              src={user?.avatar || avatar1}
              sx={{
                width: drawerOpen ? 46 : 36,
                height: drawerOpen ? 46 : 36,
                mx: !drawerOpen ? 'auto' : 0
              }}
            />
          </ListItemAvatar>

          {drawerOpen && (
            <>
              <ListItemText primary={user?.name || 'User'} secondary={user?.role || 'User'} sx={{ ml: 1 }} />
            </>
          )}
        </ListItem>
      </List>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ 'aria-labelledby': 'user-menu-button' }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography variant="subtitle1">{user?.name || 'User'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role || 'User'}
          </Typography>
        </Box>
        <Divider />
        {/* <MenuItem component={Link} to="/apps/profiles/user/personal" onClick={handleClose}>
          <ListItemIcon>
            <Profile size={18} />
          </ListItemIcon>
          Hồ sơ
        </MenuItem>
        <MenuItem component={Link} to="/apps/profiles/account/my-account" onClick={handleClose}>
          <ListItemIcon>
            <Setting2 size={18} />
          </ListItemIcon>
          Tài khoản của tôi
        </MenuItem> */}
        {/* <Divider /> */}
        <MenuItem
          onClick={() => {
            handleClose();
            void handleLogout();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Logout size={18} color="currentColor" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </Box>
  );
}
