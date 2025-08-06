import { Box, Paper, Stack, Typography } from '@mui/material';

export default function SpecialNoticeBox() {
  return (
    <Paper variant="outlined" sx={{ border: '1.5px solid #f5c6cb', bgcolor: '#fff', p: 2, mt: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography fontSize={22}>⚠️</Typography>
        <Typography color="error" fontWeight="bold" fontSize={18}>
          ĐẶC BIỆT CHÚ Ý
        </Typography>
      </Stack>
      <Box ml={3}>
        <Typography variant="body2" mb={0.5}>- SMARTFILL sẽ hoàn tiền 100% nếu Tool lỗi / sử dụng dịch vụ không thành công.</Typography>
        <Typography variant="body2" mb={0.5}>- Nạp tối thiểu: 10,000 đ. Có tính nạp dưới mức tối thiểu sẽ không hỗ trợ dưới mọi hình thức.</Typography>
        <Typography variant="body2" mb={0.5}>- Nội dung cần phải chính xác để hệ thống tự động nhận diện, nếu sai sẽ phải liên hệ thủ công.</Typography>
        <Typography variant="body2" mb={0.5}>- Hệ thống xử lý tự động 24/7, nhưng nếu giao dịch từ ngân hàng treo lệnh có thể xử lý chậm.</Typography>
        <Typography variant="body2">- Liên hệ bộ phận hỗ trợ nếu sau 30 phút không thấy cộng tiền.</Typography>
      </Box>
    </Paper>
  );
} 