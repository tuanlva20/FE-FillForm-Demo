import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
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
import huongDanCaiDatImg from 'assets/images/dienformtudong/huong-dan-cai-dat.png';
import { ErrorIcon } from 'assets/images/svg/icon';
import { InfoCircle } from 'iconsax-react';

// ==============================|| DIENFORM - CREATE ||============================== //

export default function TabCreate() {
  const [formName, setFormName] = useState('');
  const [formLink, setFormLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Validate Google Form link
  const validateGoogleFormLink = (link: string): boolean => {
    if (!link.trim()) return true; // Allow empty for initial state

    try {
      const url = new URL(link);
      const isGoogleForms = url.hostname === 'docs.google.com' && url.pathname.includes('/forms/');
      const isViewForm = url.pathname.includes('/viewform') || url.searchParams.has('usp');

      return isGoogleForms && isViewForm;
    } catch {
      return false;
    }
  };

  const handleFormLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormLink(value);

    // Clear previous errors
    setError(null);

    // Validate link format
    if (value.trim() && !validateGoogleFormLink(value)) {
      setLinkError('Link không hợp lệ. Vui lòng sử dụng link trả lời của Google Form (dạng /viewform)');
    } else {
      setLinkError(null);
    }
  };

  const handleCreateForm = async () => {
    if (!formLink) {
      setError('Vui lòng điền link trả lời của form');
      return;
    }

    if (!validateGoogleFormLink(formLink)) {
      setError('Link không hợp lệ. Vui lòng sử dụng link trả lời của Google Form (dạng /viewform)');
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
      setLinkError(null);

      // Trigger refresh for form list
      setRefreshList((prev) => !prev);
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
                  onChange={handleFormLinkChange}
                  error={!!linkError || (!!error && !formLink)}
                  helperText={linkError}
                />
              </Stack>
            </Grid>
            {error && !linkError && (
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
                  disabled={loading || !!linkError}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Đang tạo...' : 'Tạo Form'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <FormList refreshTrigger={refreshList} />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <MainCard title="Hướng dẫn" sx={MAINCARD_STYLE}>
          <Grid container>
            <Stack sx={{ width: '100%', gap: 2 }}>
            <Stack sx={{ gap: 1.25 }}>
                <Chip
                  variant="outlined"
                  color="warning"
                  icon={<InfoCircle size={16} />}
                  label={
                    <Typography component="span" sx={{ fontWeight: 700 }}>
                      ⚠️ Lưu ý quan trọng cho Form có câu hỏi điều hướng
                    </Typography>
                  }
                  sx={(theme) => ({
                    px: 1,
                    color: theme.palette.warning.main,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.12) : alpha(theme.palette.warning.main, 0.08),
                    borderColor: alpha(theme.palette.warning.main, 0.35),
                    '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.5 }
                  })}
                />
                <Typography variant="body2" color="text.secondary">
                  Để chương trình có thể quét được <strong>toàn bộ câu hỏi</strong> trong form, bạn cần:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: 'text.secondary' }}>
                  <Box component="li">
                    <Typography variant="body2">
                      <strong>Đối với câu hỏi điều hướng tới phần:</strong> Tắt "Chuyển tới phần dựa trên câu trả lời"
                    </Typography>
                  </Box>
                  <Box component="li">
                    <Typography variant="body2">
                      <strong>Chuyển nút Gửi:</strong> Đặt nút gửi ở câu hỏi cuối cùng thay vì mỗi trang
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Thiết lập này đảm bảo hệ thống có thể truy cập và xử lý tất cả câu hỏi trong form một cách chính xác.
                </Typography>
              </Stack>
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
                  <strong> Bất kỳ ai có đường liên kết</strong> ở phần <strong>Chế độ xem cho Người trả lời</strong>
                  <br />
                  Sau đó nhấn <strong>Sao chép đường liên kết của người trả lời</strong> và dán vào <strong>"Link trả lời của form"</strong>
                  . Thiết lập này giúp hệ thống truy cập được (tránh lỗi không thể truy cập/accessible).
                </Typography>
                <Box
                  component="img"
                  src={capQuyenFormImg}
                  alt="Cấp quyền hiển thị cho người trả lời trong Google Form"
                  sx={{
                    width: '100%',
                    maxWidth: 480,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    alignSelf: 'center',
                    boxShadow: 0
                  }}
                />
              </Stack>

              <Stack sx={{ gap: 1.25 }}>
                <Chip
                  variant="outlined"
                  color="info"
                  icon={<InfoCircle size={16} />}
                  label={
                    <Typography component="span" sx={{ fontWeight: 700 }}>
                      Thiết lập trong Google Form (khuyến nghị)
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
                  Mở tab <strong>Cài đặt</strong> của Google Form và thiết lập như ảnh bên dưới để hệ thống có thể tự động gửi trả lời:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: 'text.secondary' }}>
                  <Box component="li">
                    <Typography variant="body2">
                      Trong <strong>Thu thập địa chỉ email</strong> chọn <strong>Không thu thập</strong> hoặc{' '}
                      <strong>Thông tin về người trả lời</strong>
                    </Typography>
                  </Box>
                  <Box component="li">
                    <Typography variant="body2">Tắt giới hạn 1 lần trả lời</Typography>
                  </Box>
                </Box>
                <Box
                  component="img"
                  src={huongDanCaiDatImg}
                  alt="Thiết lập Google Form để hệ thống hoạt động"
                  sx={{
                    width: '100%',
                    maxWidth: 640,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    alignSelf: 'center',
                    boxShadow: 0
                  }}
                />
              </Stack>
            </Stack>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
