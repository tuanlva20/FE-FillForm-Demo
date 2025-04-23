import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';
import FormList from './components/tabcreate/FormList';

// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = { PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP } } };

// ==============================|| DIENFORM - CREATE ||============================== //

export default function TabCreate() {
  const [signing, setSigning] = useState('facebook');

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSigning(event.target.value);
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
                <TextField fullWidth id="ten-form" placeholder="Điền tên form..." autoFocus />
              </Stack>
            </Grid>
            <Grid size={{ xs: 24, sm: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="link-edit-form">Link Edit form</InputLabel>
                <TextField fullWidth id="link-edit-form" placeholder="Điền link edit form (hướng dẫn bên dưới)..." autoFocus />
              </Stack>
            </Grid>
            <Grid size={{ xs: 24, sm: 12 }}>
              <Stack direction="row" sx={{ gap: 1 ,  justifyContent: 'flex-end', alignItems: 'center'}}>
                <Button variant="contained" color="primary">
                  Tạo Form
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormList/>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MainCard title="Hướng dẫn" sx={MAINCARD_STYLE}>
          <Grid container>
            <Typography variant="subtitle1">Hướng dẫn điền form</Typography>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
