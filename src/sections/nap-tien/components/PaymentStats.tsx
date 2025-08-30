import { AccountBalance, Payment, Schedule, TrendingUp } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import { getPaymentHistory } from 'api/payment';
import { useEffect, useState } from 'react';
import { PaymentTransaction } from 'types/payment';
import { formatAmount } from 'utils/paymentUtils';

interface PaymentStats {
  totalAmount: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  successRate: number;
}

export default function PaymentStats() {
  const [stats, setStats] = useState<PaymentStats>({
    totalAmount: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all transactions for stats calculation
      const response = await getPaymentHistory({
        page: 1,
        limit: 1000 // Get all transactions for stats
      });

      if (response.success) {
        const transactions: PaymentTransaction[] = response.data || [];

        const totalAmount = transactions.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);

        const totalTransactions = transactions.length;
        const completedTransactions = transactions.filter((t) => t.status === 'completed').length;
        const pendingTransactions = transactions.filter((t) => t.status === 'pending').length;
        const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

        setStats({
          totalAmount,
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          successRate
        });
      } else {
        setError(response.message || 'Không thể tải thống kê thanh toán');
      }
    } catch (err) {
      console.error('Error fetching payment stats:', err);
      setError('Có lỗi xảy ra khi tải thống kê thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Tổng tiền đã nạp',
      value: formatAmount(stats.totalAmount.toString()) + ' VND',
      icon: <TrendingUp color="primary" />,
      color: 'primary'
    },
    {
      title: 'Tổng giao dịch',
      value: stats.totalTransactions.toString(),
      icon: <Payment color="success" />,
      color: 'success'
    },
    {
      title: 'Giao dịch thành công',
      value: stats.completedTransactions.toString(),
      icon: <AccountBalance color="info" />,
      color: 'info'
    },
    {
      title: 'Đang xử lý',
      value: stats.pendingTransactions.toString(),
      icon: <Schedule color="warning" />,
      color: 'warning'
    }
  ];

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Đang tải thống kê...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Thống kê thanh toán
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${card.color}.50 0%, ${card.color}.100 100%)`,
                border: `1px solid ${card.color}.200`
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color={`${card.color}.main`}>
                      {card.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Success Rate */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'success.50', borderRadius: 2, border: '1px solid success.200' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" color="success.main" fontWeight={600}>
            Tỷ lệ thành công:
          </Typography>
          <Typography variant="h5" color="success.main" fontWeight={700}>
            {stats.successRate.toFixed(1)}%
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}
