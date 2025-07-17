import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
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

// iconsax-react
import { Ethereum } from 'iconsax-react';

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
                <Alert color="error" icon={<Ethereum variant="Bold" />} sx={{ mb: 1 }}>
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
            <Stack sx={{ mt: 2, width: '100%', alignItems: 'flex-start' }}>
              <Typography variant="body2">
              1. Tạo Google Form tại <a href="https://docs.google.com/forms" target="_blank" rel="noopener noreferrer">Google Forms</a>
              </Typography>
              <Typography variant="body2">
              2. Sau khi tạo xong, sao chép đường link trả lời của form
              </Typography>
              <Typography variant="body2">
              3. Dán đường link trả lời vào ô "Link trả lời của form"
              </Typography>
            </Stack>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
