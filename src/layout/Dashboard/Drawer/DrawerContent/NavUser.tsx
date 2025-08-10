import { MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import Box from '@mui/material/Box';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';

// project-imports
import { useGetMenuMaster } from 'api/menu';
import Avatar from 'components/@extended/Avatar';
import useAuth from 'hooks/useAuth';

// assets
import { Tooltip } from '@mui/material';
import avatar1 from 'assets/images/users/avatar-6.png';
import { Logout, More } from 'iconsax-react';

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

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
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
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                aria-label="show more"
                sx={{ display: 'none' }} // Hide the expand button, we'll use menu icon instead
              >
                <More />
              </ExpandMore>
            ) : (
              <Tooltip title="Đăng xuất">
                <IconButton size="small" color="error" sx={{ p: 0.5 }} onClick={handleLogout}>
                  <Logout variant="Bulk" size={20} />
                </IconButton>
              </Tooltip>
            )
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
              <ListItemText
                primary={user?.name || 'User'}
                secondary={user?.role || 'User'}
                sx={{ ml: 1 }}
              />
              <Tooltip title="Đăng xuất">
                <IconButton size="large" color="error" sx={{ ml: 0.5, p: 1 }} onClick={handleLogout}>
                  <Logout variant="Bulk" size={20} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </ListItem>
      </List>
      
      {/* {drawerOpen && (
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{ 'aria-labelledby': 'basic-button' }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MenuItem component={Link} to="/apps/profiles/user/personal" onClick={handleClose}>
            Hồ sơ
          </MenuItem>
          <MenuItem component={Link} to="/apps/profiles/account/my-account" onClick={handleClose}>
            Tài khoản của tôi
          </MenuItem>
        </Menu>
      )} */}
    </Box>
  );
}
