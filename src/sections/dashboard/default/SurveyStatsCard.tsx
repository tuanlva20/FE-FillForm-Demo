// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// types
import { ColorProps } from 'types/extended';

interface SurveyStatsCardProps {
  title: string;
  count: number;
  percentage?: number;
  trend?: 'up' | 'down';
  trendPercentage?: number;
  color: ColorProps;
  extra: string;
  icon: React.ReactNode;
  description: string;
  progressBarPercentage?: number;
}

// ==============================|| DASHBOARD - SURVEY STATS CARD ||============================== //

export default function SurveyStatsCard({
  title,
  count,
  percentage,
  trend,
  trendPercentage,
  color = 'primary',
  extra,
  icon,
  description,
  progressBarPercentage
}: SurveyStatsCardProps) {
  const theme = useTheme();

  const getColorPalette = (colorName: ColorProps) => {
    switch (colorName) {
      case 'warning':
        return {
          main: theme.palette.warning.main,
          light: theme.palette.warning.light,
          dark: theme.palette.warning.dark,
          lighter: alpha(theme.palette.warning.main, 0.1)
        };
      case 'success':
        return {
          main: theme.palette.success.main,
          light: theme.palette.success.light,
          dark: theme.palette.success.dark,
          lighter: alpha(theme.palette.success.main, 0.1)
        };
      case 'error':
        return {
          main: theme.palette.error.main,
          light: theme.palette.error.light,
          dark: theme.palette.error.dark,
          lighter: alpha(theme.palette.error.main, 0.1)
        };
      default:
        return {
          main: theme.palette.primary.main,
          light: theme.palette.primary.light,
          dark: theme.palette.primary.dark,
          lighter: alpha(theme.palette.primary.main, 0.1)
        };
    }
  };

  const colors = getColorPalette(color);

  // Format count with thousands separator
  const formatCount = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  // Calculate progress bar percentage based on count relative to total
  const calculateProgressPercentage = () => {
    // For failed surveys, show as percentage of total surveys
    // For successful surveys, show as percentage of total surveys
    // For pending surveys, show as percentage of total surveys
    // For total surveys, show as 100%
    if (title.includes('Tổng số')) {
      return 100;
    }
    // For other cards, use the percentage from API or calculate based on total
    return progressBarPercentage || percentage || 0;
  };

  return (
    <MainCard
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: `linear-gradient(90deg, ${colors.main} 0%, ${colors.light} 100%)`,
          zIndex: 1
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${alpha(colors.main, 0.15)}`,
          transition: 'all 0.3s ease'
        },
        transition: 'all 0.3s ease'
      }}
    >
      <Grid container spacing={2}>
        {/* Icon Section */}
        <Grid size={12}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: colors.lighter,
                color: colors.main,
                width: 60,
                height: 60,
                '& svg': {
                  fontSize: '1.5rem'
                }
              }}
            >
              {icon}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {title}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Main Stats */}
        <Grid size={12}>
          <Stack spacing={1}>
            <Typography
              variant="h2"
              sx={{
                color: colors.main,
                fontWeight: 700,
                fontSize: '2.5rem'
              }}
            >
              {formatCount(count)}
            </Typography>
          </Stack>
        </Grid>

        {/* Progress Indicator */}
        <Grid size={12}>
          <Box
            sx={{
              height: 6,
              bgcolor: alpha(colors.main, 0.1),
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                height: '100%',
                background: `linear-gradient(90deg, ${colors.main} 0%, ${colors.light} 100%)`,
                borderRadius: 3,
                width: `${calculateProgressPercentage()}%`,
                animation: 'progressFill 1.5s ease-out',
                '@keyframes progressFill': {
                  from: { width: 0 },
                  to: { width: `${calculateProgressPercentage()}%` }
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
}
