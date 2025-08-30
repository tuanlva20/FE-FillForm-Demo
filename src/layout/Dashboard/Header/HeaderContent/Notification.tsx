import useBalance from 'hooks/useBalance';
import { useRef, useState } from 'react';

// material-ui
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// assets
import moneybank from 'assets/images/icons/gif/moneybank.gif';
import { CheckCircleIcon } from 'assets/images/svg/icon';
import { CloseCircle, Notification } from 'iconsax-react';

// types

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function NotificationPage() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { balance, isLoading: isBalanceLoading, forceRefresh, debugSocket, testNotification } = useBalance();

  const anchorRef = useRef<any>(null);
  const [read] = useState(2);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip
          title={`Số dư hiện có: ${isBalanceLoading ? 'Đang tải...' : `${(balance || 0).toLocaleString('vi-VN')}đ`}`}
          placement="bottom"
          arrow
        >
          <Box
            onClick={() => {
              forceRefresh();
              debugSocket(); // Debug socket connection
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              testNotification(); // Right-click to test notification
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              mr: 1,
              bgcolor: '#ffffff',
              border: '1px solid',
              borderColor: 'primary.lighter',
              boxShadow: '0 2px 8px rgba(145, 158, 171, 0.16)',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(145, 158, 171, 0.24)',
                borderColor: 'primary.light',
                bgcolor: '#ffffff'
              }
            }}
          >
            <img src={moneybank} alt="balance" style={{ width: 36, height: 34 }} />
            <Typography
              variant="subtitle1"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {isBalanceLoading ? 'Đang tải...' : `${(balance || 0).toLocaleString('vi-VN')}đ`}
            </Typography>
          </Box>
        </Tooltip>
        <IconButton
          color="secondary"
          variant="light"
          aria-label="open profile"
          ref={anchorRef}
          aria-controls={open ? 'profile-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          size="large"
          sx={(theme) => ({
            p: 1,
            color: 'secondary.main',
            bgcolor: open ? 'secondary.200' : 'secondary.100',
            ...theme.applyStyles('dark', { bgcolor: open ? 'background.paper' : 'background.default' })
          })}
        >
          <Badge badgeContent={read} color="success" sx={{ '& .MuiBadge-badge': { top: 2, right: 4 } }}>
            <Notification variant="Bold" />
          </Badge>
        </IconButton>
      </Stack>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [downMD ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, borderRadius: 1.5, width: { xs: 320, sm: 420 } })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h5">Thông báo</Typography>
                      <Link href="#" variant="h6" color="primary">
                        Đánh dấu đã đọc
                      </Link>
                    </Stack>
                    <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                      <List
                        component="nav"
                        sx={(theme) => ({
                          '& .MuiListItemButton-root': {
                            p: 1.5,
                            my: 1.5,
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': { bgcolor: 'primary.lighter', borderColor: 'primary.light' },
                            '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' },
                            '&:hover .MuiAvatar-root': { bgcolor: 'primary.main', color: 'background.paper' }
                          }
                        })}
                      >
                        <ListItem
                          component={ListItemButton}
                          secondaryAction={
                            <Typography variant="caption" noWrap>
                              10:42 AM
                            </Typography>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar type="outlined">
                              <CheckCircleIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="h6">
                                Tự động điền{' '}
                                <Typography component="span" variant="subtitle1">
                                  Form khảo sát
                                </Typography>{' '}
                                đã hoàn tất.
                              </Typography>
                            }
                            secondary="Yêu cầu #1243 đã được xử lý thành công."
                          />
                        </ListItem>

                        <ListItem
                          component={ListItemButton}
                          secondaryAction={
                            <Typography variant="caption" noWrap>
                              2:10 PM
                            </Typography>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar type="outlined" sx={{ bgcolor: 'error.main', color: 'background.paper' }}>
                              <CloseCircle size={20} variant="Bold" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="h6">
                                Gặp lỗi khi xử lý{' '}
                                <Typography component="span" variant="subtitle1">
                                  form khảo sát
                                </Typography>
                                .
                              </Typography>
                            }
                            secondary="Vui lòng kiểm tra lại yêu cầu #1244."
                          />
                        </ListItem>
                      </List>
                    </SimpleBar>
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
