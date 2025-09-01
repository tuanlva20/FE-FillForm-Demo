// material-ui
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';

// project-imports
import { GRID_COMMON_SPACING } from 'config';

import FinancialOverview from 'sections/dashboard/financial-report/FinancialOverview';

// ==============================|| DASHBOARD - FINANCIAL REPORT ||============================== //

export default function DashboardFinancialReport() {
  const theme = useTheme();

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {/* Financial Overview Cards */}
      <Grid size={12}>
        <FinancialOverview />
      </Grid>
    </Grid>
  );
}

