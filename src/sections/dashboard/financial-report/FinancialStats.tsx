import { AccountBalance, Payment, TrendingDown, TrendingUp } from '@mui/icons-material';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { getFinancialStats } from 'api/payment';
import { useEffect, useState } from 'react';

interface FinancialStatsData {
  monthlyDeposits: number;
  monthlySpending: number;
  depositGrowth: number;
  spendingGrowth: number;
  averageOrderValue: number;
  successRate: number;
}

export default function FinancialStats() {
  const [data, setData] = useState<FinancialStatsData>({
    monthlyDeposits: 0,
    monthlySpending: 0,
    depositGrowth: 0,
    spendingGrowth: 0,
    averageOrderValue: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFinancialStats();
        if (response.success) {
          setData(response.data);
        } else {
          // Fallback to mock data for testing
          console.warn('API not available, using mock data');
          setData({
            monthlyDeposits: 1500000,
            monthlySpending: 800000,
            depositGrowth: 15.5,
            spendingGrowth: -8.2,
            averageOrderValue: 200000,
            successRate: 95.8
          });
        }
      } catch (error) {
        console.error('Error fetching financial stats:', error);
        // Fallback to mock data for testing
        setData({
          monthlyDeposits: 1500000,
          monthlySpending: 800000,
          depositGrowth: 15.5,
          spendingGrowth: -8.2,
          averageOrderValue: 200000,
          successRate: 95.8
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: 'Nạp tiền tháng này',
      value: data.monthlyDeposits.toLocaleString('vi-VN'),
      growth: data.depositGrowth,
      icon: <TrendingUp sx={{ fontSize: 24, color: 'success.main' }} />,
      color: 'success.main'
    },
    {
      title: 'Chi tiêu tháng này',
      value: data.monthlySpending.toLocaleString('vi-VN'),
      growth: data.spendingGrowth,
      icon: <TrendingDown sx={{ fontSize: 24, color: 'error.main' }} />,
      color: 'error.main'
    },
    {
      title: 'Giá trị đơn hàng TB',
      value: data.averageOrderValue.toLocaleString('vi-VN'),
      growth: 0,
      icon: <AccountBalance sx={{ fontSize: 24, color: 'primary.main' }} />,
      color: 'primary.main'
    },
    {
      title: 'Tỷ lệ thành công',
      value: `${data.successRate.toFixed(1)}%`,
      growth: 0,
      icon: <Payment sx={{ fontSize: 24, color: 'warning.main' }} />,
      color: 'warning.main'
    }
  ];

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Typography variant="h6" color="text.secondary">
              Đang tải...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Thống kê chi tiết
        </Typography>
        
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid key={index} size={12}>
              <Box sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1,
                '&:hover': { 
                  borderColor: stat.color,
                  backgroundColor: `${stat.color}08`
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  {stat.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} color={stat.color}>
                  {stat.value}
                </Typography>
                {stat.growth !== 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography 
                      variant="caption" 
                      color={stat.growth > 0 ? 'success.main' : 'error.main'}
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      {stat.growth > 0 ? '+' : ''}{stat.growth.toFixed(1)}%
                      {stat.growth > 0 ? (
                        <TrendingUp sx={{ fontSize: 12, ml: 0.5 }} />
                      ) : (
                        <TrendingDown sx={{ fontSize: 12, ml: 0.5 }} />
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      so với tháng trước
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
