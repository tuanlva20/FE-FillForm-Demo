import { Link } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import { APP_DEFAULT_PATH } from 'config';

// assets
import error404 from 'assets/images/maintenance/img-error-404.svg';
import { ArrowLeft2 } from 'iconsax-react';
import { HomeIcon } from 'assets/images/svg/icon';

// ==============================|| ERROR 404 ||============================== //

export default function Error404() {
  return (
    <Grid
      container
      spacing={10}
      direction="column"
      sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', pt: 2, pb: 1, overflow: 'hidden' }}
    >
      <Grid size={12}>
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          <Grid>
            <Box sx={{ width: { xs: 250, sm: 590 }, height: { xs: 130, sm: 300 } }}>
              <CardMedia component="img" src={error404} alt="error 404" sx={{ height: 1, objectFit: 'inherit' }} />
            </Box>
          </Grid>
        </Stack>
      </Grid>
      <Grid size={12}>
        <Stack sx={{ gap: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h1">Không tìm thấy trang</Typography>
          <Typography align="center" sx={{ color: 'text.secondary', width: { xs: '73%', sm: '61%' } }}>
            Trang bạn đang tìm kiếm đã bị xóa, di chuyển, đổi tên hoặc có thể không tồn tại!
          </Typography>
          <Button component={Link} to='/' variant="contained" sx={{ gap: 1 }}>
            <HomeIcon /> Quay về trang chủ
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
