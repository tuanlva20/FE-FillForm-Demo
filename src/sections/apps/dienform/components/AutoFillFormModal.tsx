import { ChangeEvent, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// assets

// Interface
interface AutoFillFormModalProps {
  open: boolean;
  onClose: () => void;
  formName: string;
  onSubmit?: (formValues: {
    submissionCount: number;
    pricePerSurvey: number;
    isHumanLike: boolean;
  }) => void;
}

export default function AutoFillFormModal({ open, onClose, formName, onSubmit }: AutoFillFormModalProps) {
  const [formValues, setFormValues] = useState({
    submissionCount: 1,
    pricePerSurvey: 350,
    isHumanLike: true,
    timeInterval: "1-5 phút",
    varySubmissionsByTime: false,
  });

  const [errors, setErrors] = useState<{
    submissionCount?: string;
  }>({});

  // Handle submission count change directly through input field
  const handleSubmissionCountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0;
    
    if (value <= 0) {
      setErrors({...errors, submissionCount: 'Số lượng phải lớn hơn 0'});
    } else {
      setErrors({...errors, submissionCount: undefined});
    }
    
    setFormValues({
      ...formValues,
      submissionCount: value
    });
  };

  // Handle switch change
  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.checked
    });
  };

  // Handle time interval change
  const handleTimeIntervalChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFormValues({
      ...formValues,
      timeInterval: event.target.value as string
    });
  };

  // Close with confirmation message
  const handleSubmit = () => {
    // Validate form before submitting
    if (formValues.submissionCount <= 0) {
      setErrors({...errors, submissionCount: 'Số lượng phải lớn hơn 0'});
      return;
    }

    // If onSubmit callback is provided, call it with form values
    if (onSubmit) {
      onSubmit({
        submissionCount: formValues.submissionCount,
        pricePerSurvey: formValues.pricePerSurvey,
        isHumanLike: formValues.isHumanLike
      });
    }
    
    // Close the modal
    onClose();
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    return (formValues.submissionCount * formValues.pricePerSurvey).toLocaleString('vi-VN');
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
                  300.000đ
                </Typography>
              </Grid>
            </Grid>

            <Grid size={12} container alignItems="center">
              <Grid size={6}>
                <Typography variant="body1">Đơn giá mỗi khảo sát:</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body1" align="right" fontWeight="bold">
                  {formValues.pricePerSurvey}đ/khảo sát
                </Typography>
              </Grid>
            </Grid>

            <Grid size={12} container alignItems="center">
              <Grid size={6}>
                <Typography variant="body1">Số lượng khảo sát cần tăng:</Typography>
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  type="number"
                  value={formValues.submissionCount}
                  onChange={handleSubmissionCountChange}
                  inputProps={{ min: 1 }}
                  error={!!errors.submissionCount}
                  helperText={errors.submissionCount}
                />
              </Grid>
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formValues.isHumanLike} 
                    onChange={handleSwitchChange} 
                    name="isHumanLike" 
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
              <InputLabel htmlFor="time-interval-select">Thời gian giãn cách</InputLabel>
              <Select
                fullWidth
                id="time-interval-select"
                value={formValues.timeInterval}
                onChange={handleTimeIntervalChange as any}
              >
                <MenuItem value="1-5 phút">1-5 phút</MenuItem>
                <MenuItem value="5-10 phút">5-10 phút</MenuItem>
                <MenuItem value="10-30 phút">10-30 phút</MenuItem>
                <MenuItem value="30-60 phút">30-60 phút</MenuItem>
                <MenuItem value="1-3 giờ">1-3 giờ</MenuItem>
              </Select>
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formValues.varySubmissionsByTime} 
                    onChange={handleSwitchChange} 
                    name="varySubmissionsByTime"
                  />
                }
                label="Thay đổi số lượng khảo sát tùy vào thời gian hiện tại trong ngày (Múi giờ UTC +7)"
                sx={{ 
                  '& .MuiFormControlLabel-label': { 
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  } 
                }}
              />
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
                  {calculateTotalCost()}đ
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
          disabled={formValues.submissionCount <= 0}
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