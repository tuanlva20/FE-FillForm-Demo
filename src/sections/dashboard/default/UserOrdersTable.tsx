import { useEffect, useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
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
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import PaymentStatusChip from 'components/PaymentStatusChip';
import { TablePagination } from 'components/third-party/react-table';

// api
import { getOrdersByStatus, getOrderStatistics, OrderData } from 'api/statistics';

// types
import { PAYMENT_STATUS_OPTIONS, PaymentStatusType } from 'types/paymentStatus';

// assets
import { SearchNormal1 } from 'iconsax-react';

// utils
import { formatFullDateTime } from 'utils/DateUtil';

// ==========================|| USER ORDERS TABLE ||========================== //

export default function UserOrdersTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (statusFilter === 'all') {
          response = await getOrderStatistics(pageIndex, pageSize);
        } else {
          response = await getOrdersByStatus(statusFilter, pageIndex, pageSize);
        }
        
        setOrders(response.orders || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, pageIndex, pageSize]);

  // Filter data based on search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      return order.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [orders, searchQuery]);

  // Use filtered orders directly since pagination is handled by API
  const paginatedOrders = filteredOrders;

  // Get status options
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    ...PAYMENT_STATUS_OPTIONS
  ];

  // Format date using the same utility as other tables
  const formatDate = (dateString: string): string => {
    return formatFullDateTime(dateString, 'N/A');
  };

  // Format amount
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const getTableState = () => ({
    pagination: { pageIndex, pageSize },
    columnVisibility: {},
    columnOrder: [],
    columnPinning: {},
    rowPinning: {},
    sorting: [],
    grouping: [],
    columnFilters: [],
    globalFilter: undefined,
    rowSelection: {},
    expanded: {},
    columnSizing: {},
    columnSizingInfo: {
      startOffset: null,
      startSize: null,
      deltaOffset: null,
      deltaPercentage: null,
      isResizingColumn: false,
      columnSizingStart: []
    }
  } as any);

  const getPageCount = () => totalPages || Math.ceil(filteredOrders.length / pageSize);

  // Reset page when filter changes
  useEffect(() => {
    setPageIndex(0);
  }, [statusFilter]);

  if (loading) {
    return (
      <MainCard
        title={<Typography variant="h5">Đơn hàng của bạn</Typography>}
        content={false}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={<Typography variant="h5">Đơn hàng của bạn</Typography>}
      content={false}
    >
      {/* Filters */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm mã đơn hàng..."
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
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell align="center">Tiền nạp</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order, index) => (
                <TableRow hover key={order.id || index}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {order.orderId}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      {formatAmount(order.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <PaymentStatusChip 
                      status={order.status as PaymentStatusType}
                      size="medium"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery || statusFilter !== 'all' ? 'Không tìm thấy đơn hàng nào phù hợp' : 'Chưa có đơn hàng nào'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
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

      {/* Error Display */}
      {error && (
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="error" align="center">
            {error}
          </Typography>
        </Box>
      )}
    </MainCard>
  );
}
