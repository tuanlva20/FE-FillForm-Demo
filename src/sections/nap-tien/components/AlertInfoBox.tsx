import { Alert, Typography } from '@mui/material';

export default function AlertInfoBox() {
  return (
    <Alert severity="info" sx={{ color: 'black', border: '1px solid #e0e0e0', fontSize: 16 }}>
      <Typography component="span">
        Bạn vui lòng chuyển khoản <b>chính xác nội dung chuyển tiền</b> bên dưới hệ thống sẽ tự động cộng tiền cho bạn sau 1 - 3 phút sau khi nhận được tiền.<br/>
        Sau khi thấy tài khoản chuyển tiền thành công, thử <b>Đăng xuất và Đăng nhập lại</b> để kiểm tra số dư smartFill nhé!<br/>
        Nếu sau 10 phút từ khi tiền trong tài khoản của bạn bị trừ mà vẫn chưa được cộng tiền vui lòng liên hệ bộ phận hỗ trợ.
      </Typography>
    </Alert>
  );
} 