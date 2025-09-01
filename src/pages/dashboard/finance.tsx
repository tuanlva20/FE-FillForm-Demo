import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-imports
import PaymentOrdersHistoryCard from 'sections/dashboard/finance/PaymentOrdersHistory';
import TransactionCard from 'sections/dashboard/finance/TransactionsCard';

// API
import { getFinancialReport } from 'api/payment';

// utils
import { handleApiError } from 'utils/errorHandler';
import { formatAmount } from 'utils/paymentUtils';

// assets
import { Refresh } from 'iconsax-react';

// Types
interface FinancialReportData {
  totalDeposited: number;
  totalSpent: number;
  totalPromotional: number;
  currency: string | null;
}

// ==============================|| DASHBOARD - FINANCE ||============================== //

export default function DashboardFinance() {
  const theme = useTheme();
  const [data, setData] = useState<FinancialReportData>({
    totalDeposited: 0,
    totalSpent: 0,
    totalPromotional: 0,
    currency: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch financial report data
  const fetchFinancialData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await getFinancialReport();
      
      if (response.status === 'OK' && response.content) {
        // Map API response to our data structure
        setData({
          totalDeposited: response.content.totalDeposited || 0,
          totalSpent: response.content.totalSpent || 0,
          totalPromotional: response.content.totalPromotional || 0,
          currency: response.content.currency || 'VND'
        });
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('Error fetching financial report:', err);
      const errorMessage = handleApiError(err, 'Không thể tải dữ liệu tài chính. Vui lòng thử lại sau.');
      setError(errorMessage);
      
      // Keep the current data instead of using mock data
      // This ensures we show actual data from API even if there's an error
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Format amount with currency
  const formatAmountWithCurrency = (amount: number) => {
    const currency = data.currency || 'VND';
    return `${formatAmount(amount.toString())} ${currency}`;
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchFinancialData(true);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
            Tổng quan tài chính
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Theo dõi tình hình tài chính của bạn
          </Typography>
        </Box>

        {/* Loading Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3].map((index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Box
                sx={{
                  height: 200,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'background.paper'
                }}
              >
                <CircularProgress size={40} />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Loading Transaction History */}
        <Box
          sx={{
            height: 400,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'background.paper'
          }}
        >
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h4" fontWeight={600} color="text.primary">
            Tổng quan tài chính
          </Typography>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              size="small"
            >
              {refreshing ? (
                <CircularProgress size={20} />
              ) : (
                <Refresh size={20} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Theo dõi tình hình tài chính của bạn
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'error.light', borderRadius: 1 }}>
          <Typography variant="body2" color="error.main">
            {error}
          </Typography>
        </Box>
      )}

      {/* Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <TransactionCard
            title="Số tiền đã nạp"
            color={theme.palette.info.main}
            amount={formatAmountWithCurrency(data.totalDeposited)}
            icon="account-balance"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <TransactionCard
            title="Số tiền khuyến mãi"
            color={theme.palette.success.main}
            amount={formatAmountWithCurrency(data.totalPromotional)}
            icon="card-giftcard"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <TransactionCard
            title="Số tiền thực chi"
            color={theme.palette.error.main}
            amount={formatAmountWithCurrency(data.totalSpent)}
            icon="payment"
          />
        </Grid>
      </Grid>

      {/* Payment Orders History */}
      <Box sx={{ mb: 3 }}>
        <PaymentOrdersHistoryCard />
      </Box>
    </Box>
  );
}
