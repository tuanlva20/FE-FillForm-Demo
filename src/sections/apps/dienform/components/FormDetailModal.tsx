// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// API
import { FillRequestDTO } from 'api/form';
import { formatDateTime } from 'utils/DateUtil';

interface FormDetailModalProps {
  open: boolean;
  onClose: () => void;
  fillRequest: FillRequestDTO | null;
  formName: string;
}

export default function FormDetailModal({ open, onClose, fillRequest, formName }: FormDetailModalProps) {
  // Format date string from ISO format
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return formatDateTime(dateString, '-');
  };

  // Format number as currency
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Get status label
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'IN_PROGRESS':
        return 'Đang thực thi';
      case 'PENDING':
        return 'Chưa bắt đầu';
      default:
        return 'Chưa xác định';
    }
  };

  if (!fillRequest) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Chi tiết yêu cầu điền form</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Tên form:</Typography>
            <Typography variant="body1" gutterBottom>{formName}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Trạng thái:</Typography>
            <Typography variant="body1" gutterBottom>
              {getStatusLabel(fillRequest.status)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Số lượng cần điền:</Typography>
            <Typography variant="body1" gutterBottom>{fillRequest.surveyCount}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Số lượng đã điền:</Typography>
            <Typography variant="body1" gutterBottom>{fillRequest.completedSurvey || 0}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Giá mỗi lượt điền:</Typography>
            <Typography variant="body1" gutterBottom>{formatCurrency(fillRequest.pricePerSurvey)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Tổng giá:</Typography>
            <Typography variant="body1" gutterBottom>{formatCurrency(fillRequest.totalPrice)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Ngày tạo:</Typography>
            <Typography variant="body1" gutterBottom>{formatDate(fillRequest.createdAt)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Hẹn giờ:</Typography>
            <Typography variant="body1" gutterBottom>{fillRequest.scheduledTime ? formatDate(fillRequest.scheduledTime) : 'Không'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Điền tự nhiên như người dùng:</Typography>
            <Typography variant="body1" gutterBottom>{fillRequest.humanLike ? 'Có' : 'Không'}</Typography>
          </Grid>
          {fillRequest.startDate && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Ngày bắt đầu:</Typography>
              <Typography variant="body1" gutterBottom>{formatDate(fillRequest.startDate)}</Typography>
            </Grid>
          )}
          {fillRequest.endDate && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Ngày kết thúc:</Typography>
              <Typography variant="body1" gutterBottom>{formatDate(fillRequest.endDate)}</Typography>
            </Grid>
          )}
        </Grid>
        
        {fillRequest.answerDistributions && fillRequest.answerDistributions.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Phân bố câu trả lời</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Lựa chọn</TableCell>
                    <TableCell align="right">Tỉ lệ (%)</TableCell>
                    <TableCell align="right">Số lượng</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fillRequest.answerDistributions.map((dist, index) => (
                    <TableRow key={index}>
                      <TableCell>{dist.option?.text || '-'}</TableCell>
                      <TableCell align="right">{dist.percentage}%</TableCell>
                      <TableCell align="right">{dist.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}