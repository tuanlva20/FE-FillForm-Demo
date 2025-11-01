import { useEffect, useMemo, useState } from 'react';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// project-imports
import PaymentOrdersHistoryCard from 'sections/dashboard/finance/PaymentOrdersHistory';
import TransactionCard from 'sections/dashboard/finance/TransactionsCard';

// API
import { getFinancialReport } from 'api/payment';
import { getUsers, User } from 'api/users';

// utils
import { formatDateForAPI, getEndOfMonth, getStartOfMonth } from 'utils/DateUtil';
import { handleApiError } from 'utils/errorHandler';
import { formatAmount } from 'utils/paymentUtils';

// assets
import { Filter, Refresh } from 'iconsax-react';

// Types
interface FinancialReportData {
  totalDeposited: number;
  totalSpent: number;
  totalPromotional: number;
  currency: string | null;
}

interface FilterState {
  fromDate: Date;
  toDate: Date;
  excludedUsers: User[];
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
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    fromDate: getStartOfMonth(),
    toDate: getEndOfMonth(),
    excludedUsers: []
  });
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  // Trigger child refetch on Apply (not on every keystroke)
  const [applyVersion, setApplyVersion] = useState(0);

  // Fetch users for the exclude filter
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await getUsers();
      
      if (response.status === 'OK' && response.content) {
        setUsers(response.content);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      // Don't show error to user, just log it
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch financial report data
  const fetchFinancialData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Build API params
      const params: {
        fromDate?: string;
        toDate?: string;
        excludeUserIds?: string;
      } = {};
      
      if (filters.fromDate) {
        params.fromDate = formatDateForAPI(filters.fromDate);
      }
      
      if (filters.toDate) {
        params.toDate = formatDateForAPI(filters.toDate);
      }
      
      if (filters.excludedUsers.length > 0) {
        params.excludeUserIds = filters.excludedUsers.map(u => u.id).join(',');
      }
      
      const response = await getFinancialReport(params);
      
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
    fetchUsers();
  }, []);

  // Initial load
  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Handle filter changes
  const handleFromDateChange = (date: Date | null) => {
    if (date) {
      // Set to start of day (00:00:00)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      setFilters(prev => ({ ...prev, fromDate: startOfDay }));
    }
  };

  const handleToDateChange = (date: Date | null) => {
    if (date) {
      // Set to end of day (23:59:59)
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      setFilters(prev => ({ ...prev, toDate: endOfDay }));
    }
  };

  const handleExcludedUsersChange = (_event: any, value: User[]) => {
    setFilters(prev => ({ ...prev, excludedUsers: value }));
  };

  const handleApplyFilters = () => {
    // Trigger refetch in both components exactly once
    setApplyVersion((v) => v + 1);
    fetchFinancialData(true);
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: getStartOfMonth(),
      toDate: getEndOfMonth(),
      excludedUsers: []
    });
    // Trigger will happen automatically via useEffect
  };

  // Format amount with currency
  const formatAmountWithCurrency = (amount: number) => {
    const currency = data.currency || 'VND';
    return `${formatAmount(amount.toString())} ${currency}`;
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchFinancialData(true);
  };

  // Memoize filters passed to child to avoid refetches due to new object identity
  const computedFilters = useMemo(() => ({
    fromDate: formatDateForAPI(filters.fromDate),
    toDate: formatDateForAPI(filters.toDate),
    excludeUserIds: filters.excludedUsers.map((u) => u.id).join(',')
  }), [filters.fromDate, filters.toDate, filters.excludedUsers]);

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
          <Stack direction="row" spacing={1}>
            <Tooltip title={showFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}>
              <IconButton 
                onClick={() => setShowFilters(!showFilters)} 
                size="small"
                color={showFilters ? "primary" : "default"}
              >
                <Filter size={20} />
              </IconButton>
            </Tooltip>
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
          </Stack>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Theo dõi tình hình tài chính của bạn
        </Typography>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="Từ ngày"
                  value={filters.fromDate}
                  onChange={handleFromDateChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small"
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="Đến ngày"
                  value={filters.toDate}
                  onChange={handleToDateChange}
                  format="dd/MM/yyyy"
                  minDate={filters.fromDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small"
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                <Autocomplete
                  multiple
                  id="exclude-users"
                  options={users}
                  value={filters.excludedUsers}
                  onChange={handleExcludedUsersChange}
                  loading={usersLoading}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: 37.25,
                      // paddingTop: '2px',
                      // paddingBottom: '2px'
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Loại trừ người dùng"
                      placeholder="Chọn người dùng để loại trừ"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        checked={filters.excludedUsers.some(u => u.id === option.id)}
                        sx={{ p: 0 }}
                      />
                      {option.avatar ? (
                        <Avatar src={option.avatar} sx={{ width: 32, height: 32 }} />
                      ) : (
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {option.name.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        avatar={
                          option.avatar ? (
                            <Avatar src={option.avatar} />
                          ) : (
                            <Avatar>{option.name.charAt(0).toUpperCase()}</Avatar>
                          )
                        }
                        label={option.name}
                        size="small"
                      />
                    ))
                  }
                  disableCloseOnSelect
                  filterSelectedOptions
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetFilters}
                    startIcon={<Refresh size={16} />}
                  >
                    Đặt lại
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleApplyFilters}
                    startIcon={<Filter size={16} />}
                  >
                    Áp dụng
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Paper>
      )}

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
        <PaymentOrdersHistoryCard
          filters={computedFilters}
          applyVersion={applyVersion}
        />
      </Box>
    </Box>
  );
}
