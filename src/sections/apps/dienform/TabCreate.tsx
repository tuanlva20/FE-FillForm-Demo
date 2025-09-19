import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import AlertSnackbarWithProgress from 'components/@extended/AlertSnackbarWithProgress';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';
import FormList from './components/tabcreate/FormList';

// api
import { createForm, FormData } from 'api/form';
import LinkInput from 'components/form/LinkInput';
import { handleFormError } from 'utils/errorHandler';

// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = { PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP } } };

// icons & assets
import capQuyenFormImg from 'assets/images/dienformtudong/cap-quyen-google-form.png';
import huongDanCaiDatImg from 'assets/images/dienformtudong/huong-dan-cai-dat.png';
import editLinkImg from 'assets/images/dienformtudong/editlink.png';
import { ErrorIcon } from 'assets/images/svg/icon';
import { InfoCircle } from 'iconsax-react';

// ==============================|| DIENFORM - CREATE ||============================== //

export default function TabCreate() {
  const navigate = useNavigate();
  const [formName, setFormName] = useState('');
  const [formLink, setFormLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<{ title: string; description: React.ReactNode; showFormSettingsLink?: boolean } | null>(null);
  const [successSnackOpen, setSuccessSnackOpen] = useState(false);
  const [successSnackMessage, setSuccessSnackMessage] = useState('');

  // Validate Google Form edit link
  const validateGoogleFormLink = (link: string): boolean => {
    if (!link.trim()) return true; // Allow empty for initial state

    try {
      const url = new URL(link);
      const path = url.pathname;
      const isGoogleForms = url.hostname === 'docs.google.com' && path.includes('/forms/');
      // Accept edit links like /forms/d/<id>/edit with optional trailing slash; allow query params
      const isEditForm = /\/forms\/d\/[^/]+\/edit\/?$/.test(path) || path.includes('/edit');

      return isGoogleForms && isEditForm;
    } catch {
      return false;
    }
  };

  const handleFormLinkChange = (value: string) => {
    setFormLink(value);
    setError(null);
    if (value.trim() && !validateGoogleFormLink(value)) {
      setLinkError('Link không hợp lệ. Vui lòng sử dụng link Edit của Google Form (dạng /edit)');
    } else {
      setLinkError(null);
    }
  };

  const handleCreateForm = async () => {
    if (!formLink) {
      setError('Vui lòng điền link Edit của form');
      return;
    }

    if (!validateGoogleFormLink(formLink)) {
      setError('Link không hợp lệ. Vui lòng sử dụng link Edit của Google Form (dạng /edit)');
      return;
    }

    setLoading(true);
    setError(null);
    setErrorAlert(null);

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

      // Show success snackbar
      setSuccessSnackMessage('Tạo form thành công!');
      setSuccessSnackOpen(true);
    } catch (err) {
      // Special handling: SIGN_IN_REQUIRED -> show titled alert consistent with other tabs
      const data: any = (err as any)?.response?.data ?? err;
      const content = Array.isArray(data?.content) ? data.content : [];
      const hasSignInRequired =
        data?.status === 'SIGN_IN_REQUIRED' ||
        data?.statusOverride === 'SIGN_IN_REQUIRED' ||
        content.some((item: any) => item?.code === 'SIGN_IN_REQUIRED' || item?.status === 'SIGN_IN_REQUIRED');

      if (hasSignInRequired) {
        setErrorAlert({
          title: 'Lỗi cài đặt form',
          description: (
            <>
              Vui lòng tắt <strong>Giới hạn 1 phản hồi/Limit to 1 response</strong>.<br />
              Tắt <strong>Đã xác minh/Verified</strong> trong <strong>Thu thập địa chỉ email/Collect email addresses</strong>.
            </>
          ),
        });
      } else {
        // Handle BAD_REQUEST with structured content (title: message, description: suggestion)
        if (data?.status === 'BAD_REQUEST' && Array.isArray(content) && content.length > 0) {
          const item = content[0];
          const title = item?.message || 'Lỗi tạo form';
          const description = item?.suggestion || data?.errorMessage || 'Vui lòng kiểm tra lại cài đặt form.';
          setErrorAlert({ title, description });
        } else {
          // Prefer backend's errorMessage if provided
          const backendMessage: string | undefined = data?.errorMessage;
          if (backendMessage) {
            setErrorAlert({ title: 'Lỗi tạo form', description: backendMessage });
          } else {
            const msg = handleFormError(err, 'createForm');
            setErrorAlert({ title: 'Lỗi tạo form', description: msg });
          }
        }
      }
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

  // Handle navigation to fill by ratio tab
  const handleFillByRatio = (form: FormData) => {
    // Store selected form data in sessionStorage for the target tab to use
    sessionStorage.setItem('selectedFormForRatio', JSON.stringify(form));
    navigate('/apps/dienform/fill-expected-ratio');
  };

  // Handle navigation to fill by data tab
  const handleFillByData = (form: FormData) => {
    // Store selected form data in sessionStorage for the target tab to use
    sessionStorage.setItem('selectedFormForData', JSON.stringify(form));
    navigate('/apps/dienform/fill-in-data');
  };

  return (
    <>
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          <MainCard title="Tạo Form" sx={MAINCARD_STYLE}>
          {errorAlert && (
            <Alert color="error" variant="border" icon={<ErrorIcon />} sx={{ mb: 2 }}>
              <AlertTitle>{errorAlert.title}</AlertTitle>
              <Typography variant="h6" sx={{ mb: errorAlert.showFormSettingsLink ? 2 : 0, whiteSpace: 'pre-line' }}>
                {errorAlert.description}
              </Typography>
              {errorAlert.showFormSettingsLink && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'primary.light'
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="primary.main" fontWeight="600">
                      💡 Gợi ý:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Xem hướng dẫn:
                    </Typography>
                    <Link
                      href="/apps/dienform/create"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Tại đây
                    </Link>
                  </Stack>
                </Box>
              )}
            </Alert>
          )}
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
                <InputLabel htmlFor="link-edit-form">Link Edit của form</InputLabel>
                <LinkInput
                  id="link-edit-form"
                  placeholder="Điền link Edit của form (dạng /edit, hướng dẫn bên dưới)..."
                  value={formLink}
                  onChange={handleFormLinkChange}
                  size="medium"
                  fullWidth
                />
                {linkError && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {linkError}
                  </Typography>
                )}
              </Stack>
            </Grid>
            {error && !linkError && !errorAlert && (
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
        <FormList 
          refreshTrigger={refreshList} 
          onFillByRatio={handleFillByRatio}
          onFillByData={handleFillByData}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <MainCard title="Hướng dẫn" sx={MAINCARD_STYLE}>
          <Grid container>
            <Stack sx={{ width: '100%', gap: 2 }}>
              <Stack sx={{ gap: 1.25 }}>
                <Chip
                  variant="outlined"
                  color="info"
                  icon={<InfoCircle size={16} />}
                  label={
                    <Typography component="span" sx={{ fontWeight: 700 }}>
                      Lưu ý: Mở quyền cho người trả lời & Sao chép "Link Edit form"
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
                <Typography variant="body1" color="text.secondary">
                  - Trong cửa sổ chia sẻ (như hình), tại mục <strong>Quyền truy cập chung</strong> hãy chọn
1                  <strong> Bất kỳ ai có đường liên kết</strong> ở phần <strong>Chế độ xem cho Người trả lời( Responder) và Người chỉnh sửa( Editor)</strong>
                  <br />
                  - Sau đó nhấn <strong>Sao chép đường link Edit form</strong> và dán vào <strong>"Link Edit của form"</strong>
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
                <Box
                  component="img"
                  src={editLinkImg}
                  alt="Cấp quyền hiển thị cho người trả lời trong Google Form"
                  sx={{
                    width: '100%',
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
                <Typography variant="body1" color="text.secondary">
                  Mở tab <strong>Cài đặt</strong> của Google Form và thiết lập như ảnh bên dưới để hệ thống có thể tự động gửi trả lời:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: 'text.secondary' }}>
                  <Box component="li">
                    <Typography variant="body1">
                      Trong <strong>Thu thập địa chỉ email</strong> chọn <strong>Không thu thập</strong> hoặc{' '}
                      <strong>Thông tin về người trả lời</strong>
                    </Typography>
                  </Box>
                  <Box component="li">
                    <Typography variant="body1">Tắt giới hạn 1 lần trả lời</Typography>
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

      {/* Success snackbar */}
      <AlertSnackbarWithProgress
        open={successSnackOpen}
        message={successSnackMessage}
        onClose={() => setSuccessSnackOpen(false)}
        severity="success"
      />
    </>
  );
}
