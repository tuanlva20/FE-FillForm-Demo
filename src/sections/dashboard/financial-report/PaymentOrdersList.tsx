import { Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    Pagination,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { getPaymentHistory } from 'api/payment';
import { useEffect, useState } from 'react';
import { PaymentTransaction } from 'types/payment';
import { formatAmount } from 'utils/paymentUtils';

export default function PaymentOrdersList() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPaymentHistory({
        page,
        limit: 20,
        status: statusFilter || undefined
      });

      if (response.success) {
        setTransactions(response.data || []);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(response.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error('Error fetching payment orders:', err);
      setError('Có lỗi xảy ra khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const getStatusColor = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'failed':
        return 'Thất bại';
      case 'pending':
        return 'Đang xử lý';
      default:
        return 'Không xác định';
    }
  };

  const getMethodText = (method: string) => {
    switch (method.toLowerCase()) {
      case 'sepay':
        return 'SEPAY';
      case 'vnpay':
        return 'VNPAY';
      case 'bank_transfer':
        return 'Chuyển khoản';
      default:
        return method;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getMethodText(transaction.method).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress size={40} />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Thử lại">
            <IconButton onClick={fetchOrders} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Danh sách đơn hàng thanh toán
        </Typography>
        <Tooltip title="Làm mới">
          <IconButton onClick={fetchOrders} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Search and Filter */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Tìm kiếm theo mô tả, mã giao dịch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <TextField
          select
          label="Trạng thái"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <option value="">Tất cả</option>
          <option value="completed">Thành công</option>
          <option value="pending">Đang xử lý</option>
          <option value="failed">Thất bại</option>
        </TextField>
      </Stack>

      {filteredTransactions.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || statusFilter ? 'Không tìm thấy đơn hàng nào' : 'Chưa có đơn hàng nào'}
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Thời gian
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Mã giao dịch
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Phương thức
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Mô tả
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Số tiền
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Trạng thái
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2">{formatDate(transaction.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} color="primary">
                        {transaction.transactionId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {getMethodText(transaction.method)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {transaction.description || 'Nạp tiền SmartFill'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {formatAmount(transaction.amount.toString())} VND
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusText(transaction.status)}
                        color={getStatusColor(transaction.status) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(_, newPage) => setPage(newPage)} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}

