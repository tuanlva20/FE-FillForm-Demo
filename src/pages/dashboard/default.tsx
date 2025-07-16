// material-ui
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import SurveyBanner from 'sections/dashboard/default/SurveyBanner';
import SurveyStatsCard from 'sections/dashboard/default/SurveyStatsCard';
import FormSubmissionChart from 'sections/widget/chart/FormSubmissionChart';

// assets
import { Clock, CloseCircle, DocumentText, TickCircle } from 'iconsax-react';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const theme = useTheme();

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {/* Survey Banner */}
      <Grid size={12}>
        <SurveyBanner />
      </Grid>

      {/* Survey Statistics Row */}
      <Grid size={12}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Thống kê khảo sát
        </Typography>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <SurveyStatsCard
          title="Khảo sát chờ xử lý"
          description="Các khảo sát đang trong hàng đợi"
          count="12"
          percentage={15}
          extra="3 khảo sát mới hôm nay"
          color="warning"
          icon={<Clock />}
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <SurveyStatsCard
          title="Khảo sát thành công"
          description="Đã hoàn thành điền form"
          count="48"
          percentage={25}
          extra="10 khảo sát hoàn thành tuần này"
          color="success"
          icon={<TickCircle />}
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <SurveyStatsCard
          title="Khảo sát thất bại"
          description="Gặp lỗi hoặc không thành công"
          count="5"
          percentage={8}
          isLoss
          extra="2 khảo sát lỗi cần xem lại"
          color="error"
          icon={<CloseCircle />}
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <SurveyStatsCard
          title="Tổng số khảo sát"
          description="Tất cả khảo sát đã tạo"
          count="65"
          percentage={20}
          extra="55 khảo sát đã chạy thành công"
          color="primary"
          icon={<DocumentText />}
        />
      </Grid>

      {/* Monthly Chart */}
      <Grid size={12}>
        <Typography variant="h3" sx={{ mt: 4, mb: 2 }}>
          Biểu đồ hoạt động theo tháng
        </Typography>
      </Grid>
      
      <Grid size={12}>
        <MainCard>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Số lượng điền form theo tháng
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Thống kê số lượng form được điền tự động trong 12 tháng gần nhất
              </Typography>
            </Grid>
            <Grid size={12}>
              <FormSubmissionChart />
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
