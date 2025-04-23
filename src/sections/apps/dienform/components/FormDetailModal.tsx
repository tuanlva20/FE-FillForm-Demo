import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// types
interface FormDetailModalProps {
  open: boolean;
  onClose: () => void;
  formId: number | null;
}

// Mock data for the modal
const formDetails = {
  name: 'Trả lời sự kiện',
  totalRequests: 200,
  totalCompleted: 200,
  totalSuccessful: 200,
  totalFailed: 0,
  failedQuestions: 200
};

export default function FormDetailModal({ open, onClose, formId }: FormDetailModalProps) {
  // In a real application, you would fetch the form details based on formId
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h4">Chi tiết Form</Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6">
                  {formDetails.name}
                </Typography>
              </Stack>
            </Grid>
            
            <Grid size={12}>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Chi tiết form
              </Typography>
            </Grid>
            
            <Grid size={12}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Thông số</TableCell>
                    <TableCell align="right">Số liệu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Tổng khảo sát yêu cầu</TableCell>
                    <TableCell align="right">{formDetails.totalRequests}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tổng khảo sát đã chạy</TableCell>
                    <TableCell align="right">{formDetails.totalCompleted}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Số khảo sát thành công</TableCell>
                    <TableCell align="right">{formDetails.totalSuccessful}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Số khảo sát bị lỗi</TableCell>
                    <TableCell align="right">{formDetails.totalFailed}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Các câu hỏi bị lỗi</TableCell>
                    <TableCell align="right">{formDetails.failedQuestions}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}