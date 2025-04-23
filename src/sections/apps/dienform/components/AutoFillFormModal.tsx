import { useState, ChangeEvent } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';

// assets
import { Add, Minus } from 'iconsax-react';

// Interface
interface AutoFillFormModalProps {
  open: boolean;
  onClose: () => void;
  formName: string;
}

export default function AutoFillFormModal({ open, onClose, formName }: AutoFillFormModalProps) {
  const [formValues, setFormValues] = useState({
    name: formName,
    currentBalance: "300.000",
    costPerSubmission: "350đ/khảo sát",
    submissionCount: 500,
    fillLikeHuman: true,
    timeInterval: "Combo box để chọn khoản thời gian",
    varySubmissionsByTime: true,
    totalCost: "175.000"
  });

  // Handle submission count increase/decrease
  const handleCountChange = (increase: boolean) => {
    setFormValues(prev => ({
      ...prev,
      submissionCount: increase ? prev.submissionCount + 1 : Math.max(1, prev.submissionCount - 1)
    }));
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.checked
    });
  };

  // Close with confirmation message
  const handleSubmit = () => {
    // Here you would typically submit the form data
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h4" component="div" align="center">
          TẠO YÊU CẦU ĐIỀN FORM TỰ ĐỘNG
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <InputLabel htmlFor="form-name-select">Tên Form</InputLabel>
              <Select
                fullWidth
                id="form-name-select"
                value={formName}
                disabled
              >
                <MenuItem value={formName}>{formName}</MenuItem>
              </Select>
            </Grid>
            <Grid size={12} container alignItems="center">
              <Grid size={6}>
                <Typography variant="body1">Số dư hiện có:</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body1" align="right" fontWeight="bold">
                  {formValues.currentBalance}
                </Typography>
              </Grid>
            </Grid>

            <Grid size={12} container alignItems="center">
              <Grid size={6}>
                <Typography variant="body1">Đơn giá mỗi khảo sát:</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body1" align="right" fontWeight="bold">
                  {formValues.costPerSubmission}
                </Typography>
              </Grid>
            </Grid>

            <Grid size={12} container alignItems="center">
              <Grid size={6}>
                <Typography variant="body1">Số lượng khảo sát cần tăng:</Typography>
              </Grid>
              <Grid size={6}>
                <Box display="flex" justifyContent="flex-end">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #d9d9d9',
                      borderRadius: '100px',
                      padding: '4px 8px',
                      width: 'fit-content'
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={() => handleCountChange(false)}
                      sx={{ p: 0.5 }}
                    >
                      <Minus size={18} />
                    </IconButton>
                    <Typography sx={{ mx: 2 }}>{formValues.submissionCount}</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCountChange(true)}
                      sx={{ p: 0.5 }}
                    >
                      <Add size={18} />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formValues.fillLikeHuman} 
                    onChange={handleCheckboxChange} 
                    name="fillLikeHuman" 
                  />
                }
                label="Điền rất giống người thật"
                sx={{ '& .MuiFormControlLabel-label': { fontWeight: 500 } }}
              />
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid size={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">Thời gian giãn cách:</Typography>
                <Typography variant="body1" color="error">{formValues.timeInterval}</Typography>
              </Stack>
            </Grid>

            <Grid size={12}>
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formValues.varySubmissionsByTime} 
                      onChange={handleCheckboxChange} 
                      name="varySubmissionsByTime"
                    />
                  }
                  label="Thay đổi số lượng khảo sát tùy vào thời gian hiện tại trong ngày (Múi giờ UTC +7):"
                  sx={{ 
                    '& .MuiFormControlLabel-label': { 
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      lineHeight: 1.5
                    } 
                  }}
                />
                <Box 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid size={12} container alignItems="center">
              <Grid size={6}>
                <Typography variant="h5">Tổng cộng</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="h4" align="right" fontWeight="bold">
                  {formValues.totalCost}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 0 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          sx={{ borderRadius: '100px' }}
        >
          Bắt đầu điền Form
        </Button>
        <Button 
          variant="contained" 
          color="error" 
          onClick={onClose}
          sx={{ borderRadius: '100px' }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}