import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Pagination,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import { getPaymentHistory } from 'api/payment';
import { useEffect, useState } from 'react';
import { PaymentTransaction } from 'types/payment';
import { formatAmount } from 'utils/paymentUtils';

interface PaymentHistoryProps {
  maxHeight?: number;
}

export default function PaymentHistory({ maxHeight = 400 }: PaymentHistoryProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPaymentHistory({
        page,
        limit: 10,
      });
      
      if (response.success) {
        setTransactions(response.data || []);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(response.message || 'Không thể tải lịch sử thanh toán');
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError('Có lỗi xảy ra khi tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const getStatusColor = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed': return 'Thành công';
      case 'failed': return 'Thất bại';
      case 'pending': return 'Đang xử lý';
      default: return 'Không xác định';
    }
  };

  const getMethodText = (method: string) => {
    switch (method.toLowerCase()) {
      case 'sepay': return 'SEPAY';
      case 'vnpay': return 'VNPAY';
      case 'bank_transfer': return 'Chuyển khoản';
      default: return method;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading && transactions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Đang tải lịch sử thanh toán...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Lịch sử thanh toán
        </Typography>
        
        <Tooltip title="Làm mới">
          <IconButton onClick={fetchHistory} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {transactions.length === 0 ? (
        <Box textAlign="center" sx={{ py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Chưa có giao dịch thanh toán nào
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer sx={{ maxHeight }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phương thức</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {getMethodText(transaction.method)}
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
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                size="small"
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}
