import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MainCard from 'components/MainCard';
import { useState } from 'react';
import { MAINCARD_STYLE } from 'themes/component/style';
import MaHoaDataFormList from './FormList';

// Main entry for Mã hóa Data section
export default function MaHoaDataPage() {
  const [formLink, setFormLink] = useState('');
  const [dataLink, setDataLink] = useState('');

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <MainCard sx={MAINCARD_STYLE}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <InputLabel htmlFor="form-link" sx={{ minWidth: 80 }}>Link Form</InputLabel>
              <TextField
                id="form-link"
                fullWidth
                size="small"
                value={formLink}
                onChange={e => setFormLink(e.target.value)}
                placeholder="Dán link Google Form của bạn..."
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <InputLabel htmlFor="data-link" sx={{ minWidth: 80 }}>Link Data của bạn</InputLabel>
              <TextField
                id="data-link"
                fullWidth
                size="small"
                value={dataLink}
                onChange={e => setDataLink(e.target.value)}
                placeholder="Dán link Google Sheet chứa data..."
              />
            </Stack>
            <Box>
              <Button variant="contained" color="primary" size="large">
                Mã Hóa Data
              </Button>
            </Box>
          </Stack>
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <MaHoaDataFormList />
      </Grid>
    </Grid>
  );
} 