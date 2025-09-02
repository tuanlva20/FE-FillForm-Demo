import { useEffect, useMemo, useState } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import PaymentStatusChip from 'components/PaymentStatusChip';
import { TablePagination } from 'components/third-party/react-table';

// API
import { getPaymentOrders, PaymentOrderData } from 'api/payment-orders';

// types
import { PaymentStatusType } from 'types/paymentStatus';

// assets
import { Refresh, SearchNormal1 } from 'iconsax-react';

// utils
import { formatFullDateTime } from 'utils/DateUtil';
import { handleApiError } from 'utils/errorHandler';
import { formatAmount } from 'utils/paymentUtils';

// ==========================|| FINANCE - PAYMENT ORDERS HISTORY ||========================== //

export default function PaymentOrdersHistoryCard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrderData[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch payment orders data
  const fetchPaymentOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const params: any = {
        page: pageIndex,
        size: pageSize
      };

      if (debouncedSearchQuery) {
        params.userName = debouncedSearchQuery;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await getPaymentOrders(params);
      // Align with BE shape: { status, content, pageSize, pageNumber, totalPages, totalElements }
      setPaymentOrders(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error('Error fetching payment orders:', err);
      const errorMessage = handleApiError(err, 'Không thể tải dữ liệu giao dịch. Vui lòng thử lại sau.');
      setError(errorMessage);
      // Fallback to empty array
      setPaymentOrders([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPaymentOrders();
  }, [debouncedSearchQuery, statusFilter, pageIndex, pageSize]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearchQuery, statusFilter]);

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(paymentOrders.map(order => order.status))];
    return statuses;
  }, [paymentOrders]);

  const getTableState = () => ({
    pagination: { pageIndex, pageSize },
    columnVisibility: {},
    columnOrder: [],
    columnPinning: { left: [], right: [] },
    rowSelection: {},
    sorting: [],
    columnFilters: [],
    globalFilter: '',
    expanded: {},
    columnSizing: {},
    columnSizingInfo: {
      startOffset: null,
      columnSizingStart: [],
      isResizingColumn: false,
      deltaOffset: null,
      deltaPercentage: null,
      startSize: null
    },
    rowPinning: { top: [], bottom: [] },
    grouping: []
  } as any);

  const getPageCount = () => totalPages;

  // Map order status to PaymentStatusType
  const mapOrderStatusToPaymentStatus = (status: string): PaymentStatusType => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
        return 'COMPLETED';
      case 'PENDING':
        return 'PENDING';
      case 'FAILED':
        return 'FAILED';
      case 'CANCELLED':
        return 'CANCELLED';
      case 'EXPIRED':
        return 'FAILED';
      case 'MISMATCH':
        return 'FAILED';
      case 'OVERPAYMENT':
        return 'COMPLETED';
      default:
        return 'PENDING';
    }
  };

  // Get default avatar if userAvatar is not available
  const getAvatar = (order: PaymentOrderData) => {
    if (order.userAvatar) {
      return order.userAvatar;
    }
    // Return a default avatar based on user name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(order.userName)}&background=random`;
  };

  // Calculate summary info
  const summaryInfo = useMemo(() => {
    const startItem = pageIndex * pageSize + 1;
    const endItem = Math.min((pageIndex + 1) * pageSize, totalElements);
    
    return {
      startItem,
      endItem,
      totalElements,
      hasResults: totalElements > 0
    };
  }, [pageIndex, pageSize, totalElements]);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchPaymentOrders(true);
  };

  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Lịch sử thanh toán</Typography>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading || refreshing}
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
      }
      content={false}
    >
      {/* Filters */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm tên người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {uniqueStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Summary Info */}
      {!loading && !error && summaryInfo.hasResults && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {summaryInfo.startItem}-{summaryInfo.endItem} trong tổng số {summaryInfo.totalElements} giao dịch
          </Typography>
        </Box>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell>Người dùng</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Số tiền</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Đang tải dữ liệu...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1" color="error">
                    {error}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paymentOrders.length > 0 ? (
              paymentOrders.map((order) => (
                <TableRow hover key={order.id}>
                  <TableCell align="center">
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                      <Avatar alt={order.userName} src={getAvatar(order)} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {order.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.userEmail}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatFullDateTime(order.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600} color="primary">
                      {formatAmount(order.amount.toString())} VND
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <PaymentStatusChip 
                      status={mapOrderStatusToPaymentStatus(order.status)}
                      size="medium"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1" color="text.secondary">
                    {debouncedSearchQuery || statusFilter !== 'all' ? 'Không tìm thấy giao dịch nào phù hợp' : 'Chưa có giao dịch nào'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && !error && paymentOrders.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              setPageSize={setPageSize}
              setPageIndex={setPageIndex}
              getState={getTableState}
              getPageCount={getPageCount}
              initialPageSize={5}
            />
          </Box>
        </>
      )}
    </MainCard>
  );
}
