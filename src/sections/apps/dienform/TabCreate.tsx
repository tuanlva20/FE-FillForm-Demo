import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';
import FormList from './components/tabcreate/FormList';

// api
import { createForm } from 'api/form';

// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = { PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP } } };

// icons & assets
import capQuyenFormImg from 'assets/images/dienformtudong/cap-quyen-google-form.png';
import { ErrorIcon } from 'assets/images/svg/icon';
import { CloseCircle, Copy, Eye, InfoCircle, Link1, TickCircle } from 'iconsax-react';

// ==============================|| DIENFORM - CREATE ||============================== //

export default function TabCreate() {
  const [formName, setFormName] = useState('');
  const [formLink, setFormLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateForm = async () => {
    if (!formLink) {
      setError('Vui lòng điền link trả lời của form');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await createForm({
        name: formName,
        editLink: formLink
      });

      // Reset form fields after successful submission
      setFormName('');
      setFormLink('');
      
      // Trigger refresh for form list
      setRefreshList(prev => !prev);
    } catch (err) {
      setError('Đã có lỗi xảy ra khi tạo form. Vui lòng thử lại sau.');
      console.error('Form creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [checked, setChecked] = useState(['sb', 'ln', 'la']);

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <MainCard title="Tạo Form" sx={MAINCARD_STYLE}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 24, sm: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="ten-form">Tên form</InputLabel>
                <TextField 
                  fullWidth 
                  id="ten-form" 
                  placeholder="Điền tên form (Không bắt buộc)" 
                  autoFocus 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  error={false}
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 24, sm: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="link-edit-form">Link trả lời của form</InputLabel>
                <TextField 
                  fullWidth 
                  id="link-edit-form" 
                  placeholder="Điền link trả lời của form (hướng dẫn bên dưới)..." 
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  error={!!error && !formLink}
                />
              </Stack>
            </Grid>
            {error && (
              <Grid size={{ xs: 24, sm: 24 }}>
                <Alert color="error" icon={<ErrorIcon />} sx={{ mb: 1 }}>
                  {error}
                </Alert>
              </Grid>
            )}
            <Grid size={{ xs: 24, sm: 12 }}>
              <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleCreateForm}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Đang tạo...' : 'Tạo Form'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormList refreshTrigger={refreshList} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MainCard title="Hướng dẫn" sx={MAINCARD_STYLE}>
          <Grid container>
            <Stack sx={{ mt: 1.5, width: '100%', gap: 2 }}>
              <List sx={{ width: '100%', py: 0 }}>
                <ListItem sx={{ alignItems: 'center', px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box sx={(theme) => ({ width: 22, height: 22, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, fontSize: 12, display: 'grid', placeItems: 'center', border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}` })}>1</Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600}>Tạo Google Form</Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Vào{' '}
                        <Link href="https://docs.google.com/forms" target="_blank" rel="noopener noreferrer">
                          https://docs.google.com/forms
                        </Link>{' '}và tạo một form mới theo nhu cầu của bạn.
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem sx={{ alignItems: 'center', px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box sx={(theme) => ({ width: 22, height: 22, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, fontSize: 12, display: 'grid', placeItems: 'center', border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}` })}>2</Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600}>Sao chép đường link trả lời của form</Typography>
                    }
                    secondary={
                      <Stack sx={{ gap: 1, color: 'text.secondary' }}>
                        <Typography variant="body2">
                          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                            <Box component="span">
                              <strong>Cách 1 (khuyên dùng):</strong> Nhấn biểu tượng{' '}
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', mx: 0.25 }}>
                                <Eye size={14} />
                              </Box>
                              {' '}
                              (<strong>Xem trước</strong> ) ở góc trên → trang preview mở ra → nhấn "Sao chép đường liên kết của người trả lời".
                            </Box>
                          </Box>
                        </Typography>
                        <Typography variant="body2">
                          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                            <Box component="span">
                              <strong>Cách 2:</strong> Nhấn biểu tượng{' '}
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', mx: 0.25 }}>
                                <Link1 size={14} />
                              </Box>
                              {' '}
                              (<strong>Sao chép đường iên kết của người trả lời</strong> )
                              {' '}→{' '}
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', mx: 0.25 }}>
                                <Copy size={14} />
                              </Box>
                              {' '}<strong>Sao chép</strong> đường link.
                            </Box>
                          </Box>
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>

                <ListItem sx={{ alignItems: 'center', px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box sx={(theme) => ({ width: 22, height: 22, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, fontSize: 12, display: 'grid', placeItems: 'center', border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}` })}>3</Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600}>Dán link vào ô "Link trả lời của form"</Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Quay lại trang này và dán link vừa sao chép vào ô nhập liệu phía trên.
                      </Typography>
                    }
                  />
                </ListItem>
              </List>

              <Divider />

              <Stack sx={{ gap: 1.25 }}>
                <Chip
                  variant="outlined"
                  color="info"
                  icon={<InfoCircle size={16} />}
                  label={
                    <Typography component="span" sx={{ fontWeight: 700 }}>
                      Lưu ý: Mở quyền cho người trả lời
                    </Typography>
                  }
                  sx={(theme) => ({
                    px: 1,
                    color: theme.palette.info.main,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.12) : alpha(theme.palette.info.main, 0.08),
                    borderColor: alpha(theme.palette.info.main, 0.35),
                    '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.5 }
                  })}
                />
                <Typography variant="body2" color="text.secondary">
                  Trong cửa sổ chia sẻ (như hình), tại mục <strong>Quyền truy cập chung</strong> hãy chọn
                  <strong> Bất kỳ ai có đường liên kết</strong> ở phần <strong>Chế độ xem cho Người trả lời</strong>,
                  sau đó nhấn <strong>Sao chép đường liên kết của người trả lời</strong>. Thiết lập này giúp hệ thống truy cập được (tránh lỗi không thể truy cập/accessible).
                </Typography>
                <Box
                  component="img"
                  src={capQuyenFormImg}
                  alt="Cấp quyền hiển thị cho người trả lời trong Google Form"
                  sx={{
                    width: '100%',
                    maxWidth: 720,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 0
                  }}
                />
              </Stack>

              <Divider />

              <Stack sx={{ gap: 1 }}>
                <Chip
                  variant="outlined"
                  color="info"
                  icon={<InfoCircle size={16} />}
                  label={
                    <Typography component="span" sx={{ fontWeight: 700 }}>
                      Link hợp lệ/không hợp lệ
                    </Typography>
                  }
                  sx={(theme) => ({
                    px: 1,
                    color: theme.palette.info.main,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.12) : alpha(theme.palette.info.main, 0.08),
                    borderColor: alpha(theme.palette.info.main, 0.35),
                    '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.5 }
                  })}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Alert severity="success" iconMapping={{ success: <TickCircle /> }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" color="success" label="Hợp lệ" />
                      <Typography variant="body2" sx={{ fontFamily: 'mono', wordBreak: 'break-all' }}>
                        Ví dụ: https://docs.google.com/forms/d/e/1FAlpQLSdUJNsCKq.../viewform
                      </Typography>
                    </Stack>
                  </Alert>
                  <Alert severity="error" iconMapping={{ error: <CloseCircle /> }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" color="error" label="Không hợp lệ" />
                      <Typography variant="body2" sx={{ fontFamily: 'mono', wordBreak: 'break-all' }}>
                        Không dùng link dạng <strong>.../edit</strong> hoặc link chỉnh sửa form.
                      </Typography>
                    </Stack>
                  </Alert>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
