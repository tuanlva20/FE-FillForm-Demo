import { openSnackbar } from 'api/snackbar';
import { isValid } from 'date-fns';
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
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// date picker
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

export default function AutoFillFormModal({ open, onClose, formName, onSubmit }: AutoFillFormModalProps) {
  const [formValues, setFormValues] = useState({
    submissionCount: 1,
    pricePerSurvey: 450,
    isHumanLike: true,
    startDate: new Date() as Date | null,
    endDate: null as Date | null,
  });

  const [errors, setErrors] = useState<{
    submissionCount?: string;
    endDate?: string;
    startDate?: string;
  }>({});

  // Handle submission count change directly through input field
  const handleSubmissionCountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0;
    
    if (value < 1) {
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
    if (event.target.name === 'isHumanLike') {
      const isChecked = event.target.checked;
      setFormValues((prev) => ({
        ...prev,
        isHumanLike: isChecked,
        pricePerSurvey: isChecked ? 350 + 100 : 350
      }));
    } else {
      setFormValues({
        ...formValues,
        [event.target.name]: event.target.checked
      });
    }
  };

  // Handle start date change
  const handleStartDateChange = (newValue: Date | null) => {
    // Validate date format
    if (newValue && !isValid(newValue)) {
      setErrors({
        ...errors,
        startDate: 'Định dạng ngày không hợp lệ. Hãy sử dụng định dạng DD-MM-YYYY'
      });
      return;
    }
    
    setFormValues({
      ...formValues,
      startDate: newValue
    });
    
    // Check if end date is before start date
    if (newValue && formValues.endDate && newValue > formValues.endDate) {
      setErrors({
        ...errors,
        endDate: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    } else {
      setErrors({
        ...errors,
        startDate: undefined,
        endDate: undefined
      });
    }
  };

  // Handle end date change
  const handleEndDateChange = (newValue: Date | null) => {
    // Validate date format
    if (newValue && !isValid(newValue)) {
      setErrors({
        ...errors,
        endDate: 'Định dạng ngày không hợp lệ. Hãy sử dụng định dạng DD-MM-YYYY'
      });
      return;
    }
    
    setFormValues({
      ...formValues,
      endDate: newValue
    });
    
    // Check if end date is before start date
    if (formValues.startDate && newValue && formValues.startDate > newValue) {
      setErrors({
        ...errors,
        endDate: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    } else {
      setErrors({
        ...errors,
        endDate: undefined
      });
    }
  };

  // Close with confirmation message
  const handleSubmit = () => {
    // Validate form before submitting
    if (formValues.submissionCount <= 0) {
      setErrors({...errors, submissionCount: 'Số lượng phải lớn hơn 0'});
      return;
    }

    // Validate end date is after start date
    if (formValues.startDate && formValues.endDate && formValues.startDate > formValues.endDate) {
      setErrors({
        ...errors,
        endDate: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
      return;
    }

    // If onSubmit callback is provided, call it with form values
    if (onSubmit) {
      // Set time to beginning of day for start date (00:00:00)
      let startDate = formValues.startDate;
      if (startDate) {
        startDate = new Date(startDate);
        startDate.setHours(0, 0, 0, 0);
      }
      
      // Set time to end of day for end date (23:59:59)
      let endDate = formValues.endDate;
      if (endDate) {
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 999);
      }
      
      onSubmit({
        submissionCount: formValues.submissionCount,
        pricePerSurvey: formValues.pricePerSurvey,
        isHumanLike: formValues.isHumanLike,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      // Hiện snackbar thành công góc trên phải
      openSnackbar({
        open: true,
        message: 'Tạo yêu cầu điền form thành công!',
        variant: 'alert',
        alert: { color: 'success' },
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        duration: 3000,
        action: false,
        transition: 'Fade',
        close: true,
        actionButton: false,
        dense: false,
        maxStack: 3,
        iconVariant: 'usedefault'
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
      {/* <Divider /> */}
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Form name display */}
            <Grid size={12}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" fontWeight="500" minWidth={100}>
                  Tên Form:
                </Typography>
                <Typography variant="body1">
                  {formName}
                </Typography>
              </Stack>
            </Grid>
            
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Account balance row */}
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

            {/* Price per survey row */}
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

            {/* Survey count row */}
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
                  error={!!errors.submissionCount}
                  helperText={errors.submissionCount}
                />
              </Grid>
            </Grid>

            {/* Human-like toggle */}
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formValues.isHumanLike} 
                    onChange={handleSwitchChange} 
                    name="isHumanLike" 
                  />
                }
                label="Điền rất giống người thật (+100đ/khảo sát)"
                sx={{ '& .MuiFormControlLabel-label': { fontWeight: 500 } }}
              />
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Time interval selection */}
            {/* <Grid size={12}>
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
            </Grid> */}

            {/* Time-based submissions toggle */}
            {/* <Grid size={12}>
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
            </Grid> */}

            {/* <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid> */}

            {/* Date selection row */}
            <Grid size={12} container spacing={2}>
              <Grid size={6}>
                <InputLabel htmlFor="start-date" sx={{ mb: 1 }}>Ngày bắt đầu</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={formValues.startDate}
                    onChange={handleStartDateChange}
                    format="dd-MM-yyyy"
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        id: "start-date",
                        placeholder: "DD-MM-YYYY",
                        error: !!errors.startDate,
                        helperText: errors.startDate
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={6}>
                <InputLabel htmlFor="end-date" sx={{ mb: 1 }}>Ngày kết thúc</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={formValues.endDate}
                    onChange={handleEndDateChange}
                    format="dd-MM-yyyy"
                    minDate={formValues.startDate || new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        id: "end-date",
                        error: !!errors.endDate,
                        helperText: errors.endDate,
                        placeholder: "DD-MM-YYYY"
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Total cost row */}
            <Grid size={12} container alignItems="center">
              {/* <Grid size={6}>
                <Typography variant="h3">Tổng cộng</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="h4" align="right" fontWeight="bold">
                  {calculateTotalCost()}đ
                </Typography>
              </Grid> */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: 2 }}>
                <Typography variant="h4">Tổng cộng:</Typography>
                <Typography variant="h4" align="right" fontWeight="bold" sx={{ color: 'red' }}>
                  {calculateTotalCost()}đ
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 0 }}>
        <Button 
          variant="contained" 
          color="error" 
          onClick={onClose}
          sx={{ borderRadius: '100px' }}
        >
          Đóng
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          sx={{ borderRadius: '100px' }}
          disabled={
            formValues.submissionCount <= 0 || 
            !!errors.endDate || 
            !!errors.startDate
          }
        >
          Bắt Đầu Điền Form
        </Button>
      </DialogActions>
    </Dialog>
  );
}