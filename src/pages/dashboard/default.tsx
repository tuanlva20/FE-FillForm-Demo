import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// project-imports
import { GRID_COMMON_SPACING } from 'config';
import SurveyBanner from 'sections/dashboard/default/SurveyBanner';
import SurveyStatsCard from 'sections/dashboard/default/SurveyStatsCard';
import UserOrdersTable from 'sections/dashboard/default/UserOrdersTable';

// api
import { getDashboardStatistics, SurveyStatisticsResponse } from 'api/statistics';

// assets
import { Clock, CloseCircle, DocumentText, TickCircle } from 'iconsax-react';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const theme = useTheme();
  const [statistics, setStatistics] = useState<SurveyStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStatistics();
        setStatistics(data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Helper function to get icon based on icon name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'clock':
        return <Clock />;
      case 'check':
        return <TickCircle />;
      case 'x':
        return <CloseCircle />;
      case 'file-text':
        return <DocumentText />;
      default:
        return <DocumentText />;
    }
  };

  // Helper function to get color based on color name
  const getColor = (colorName: string): 'warning' | 'success' | 'error' | 'primary' => {
    switch (colorName) {
      case '#FFA500':
        return 'warning';
      case '#28a745':
        return 'success';
      case '#dc3545':
        return 'error';
      case '#6f42c1':
        return 'primary';
      default:
        return 'primary';
    }
  };

  // Calculate progress bar percentage for each card
  const calculateProgressPercentage = (count: number, totalCount: number) => {
    if (totalCount === 0) return 0;
    return Math.round((count / totalCount) * 100);
  };

  if (loading) {
    return (
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          <SurveyBanner />
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (error || !statistics) {
    return (
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          <SurveyBanner />
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <Typography variant="h6" color="error">
              {error || 'Không thể tải dữ liệu thống kê'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  const totalSurveys = statistics?.totalSurveys?.count || 0;
  const pendingCount = statistics?.pendingSurveys?.count || 0;
  const successfulCount = statistics?.successfulSurveys?.count || 0;
  const failedCount = statistics?.failedSurveys?.count || 0;

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
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Tổng quan về tình trạng các khảo sát trong hệ thống
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <SurveyStatsCard
          title={statistics?.pendingSurveys?.title || 'Khảo sát chờ xử lý'}
          description=""
          count={pendingCount}
          percentage={0}
          trend="up"
          trendPercentage={0}
          extra=""
          color={getColor(statistics?.pendingSurveys?.color || '#FFA500')}
          icon={getIcon(statistics?.pendingSurveys?.icon || 'clock')}
          progressBarPercentage={calculateProgressPercentage(pendingCount, totalSurveys)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <SurveyStatsCard
          title={statistics?.successfulSurveys?.title || 'Khảo sát thành công'}
          description=""
          count={successfulCount}
          percentage={0}
          trend="up"
          trendPercentage={0}
          extra=""
          color={getColor(statistics?.successfulSurveys?.color || '#28a745')}
          icon={getIcon(statistics?.successfulSurveys?.icon || 'check')}
          progressBarPercentage={calculateProgressPercentage(successfulCount, totalSurveys)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <SurveyStatsCard
          title={statistics?.failedSurveys?.title || 'Khảo sát thất bại'}
          description=""
          count={failedCount}
          percentage={0}
          trend="down"
          trendPercentage={0}
          extra=""
          color={getColor(statistics?.failedSurveys?.color || '#dc3545')}
          icon={getIcon(statistics?.failedSurveys?.icon || 'x')}
          progressBarPercentage={calculateProgressPercentage(failedCount, totalSurveys)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <SurveyStatsCard
          title={statistics?.totalSurveys?.title || 'Tổng số khảo sát'}
          description=""
          count={totalSurveys}
          percentage={0}
          trend="up"
          trendPercentage={0}
          extra=""
          color={getColor(statistics?.totalSurveys?.color || '#6f42c1')}
          icon={getIcon(statistics?.totalSurveys?.icon || 'file-text')}
          progressBarPercentage={100}
        />
      </Grid>

      {/* User Orders Table */}
      <Grid size={12}>
        <UserOrdersTable />
      </Grid>
    </Grid>
  );
}
