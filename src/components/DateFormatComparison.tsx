import { Box, Container, Divider, Typography } from '@mui/material';
import { formatFullDateTime } from 'utils/DateUtil';

export default function DateFormatComparison() {
  // Sample dates for comparison
  const sampleDates = [
    '2025-08-31T02:38:19.281318',
    '2025-08-31T02:13:09.779671',
    '2025-08-31T02:12:33.217453',
    '2025-08-31T02:11:24.18282',
    '2025-08-31T02:11:08.37173'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Date Format Comparison
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Format ngày sử dụng formatFullDateTime (giống TabFillInData):
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          {sampleDates.map((date, index) => (
            <Box key={index} sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Original: {date}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                Formatted: {formatFullDateTime(date, 'N/A')}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Format Pattern Details:
        </Typography>
        
        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Pattern:</strong> dd/MM/yyyy HH:mm:ss
          </Typography>
          <Typography variant="body2">
            <strong>Example:</strong> 31/08/2025 02:38:19
          </Typography>
          <Typography variant="body2">
            <strong>Locale:</strong> Vietnamese (vi)
          </Typography>
          <Typography variant="body2">
            <strong>Library:</strong> date-fns
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Các bảng sử dụng format này:
        </Typography>
        
        <Box sx={{ pl: 2 }}>
          <Typography variant="body2">• TabFillInData - FillRequestList</Typography>
          <Typography variant="body2">• TabFillExpectedRatio - FormList</Typography>
          <Typography variant="body2">• UserOrdersTable (đã cập nhật)</Typography>
        </Box>
      </Box>
    </Container>
  );
}

