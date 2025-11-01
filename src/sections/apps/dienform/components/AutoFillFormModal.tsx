import { isValid } from 'date-fns';
import useBalance from 'hooks/useBalance';
import { ChangeEvent, useEffect, useState } from 'react';
import { logger } from 'utils/logger';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
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

// Payment component
import DepositDialog from 'sections/nap-tien/DepositDialog';

// date picker
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// assets
import { AddIcon } from 'assets/images/svg/icon';
import { Calendar, CloseCircle, DocumentText, Money, Send2, Timer1 } from 'iconsax-react';
import Alert from '@mui/material/Alert';

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
  onInsufficientBalance?: (requiredAmount: number, currentBalance: number) => void;
}

export default function AutoFillFormModal({ open, onClose, formName, onSubmit, onInsufficientBalance }: AutoFillFormModalProps) {
  // Normalize date by removing time parts for reliable same-day comparisons
  const normalizeToStartOfDay = (date: Date | null | undefined): Date | null => {
    if (!date) return null;
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const [formValues, setFormValues] = useState({
    submissionCount: 1,
    pricePerSurvey: 450,
    isHumanLike: true,
    startDate: new Date() as Date | null,
    endDate: new Date() as Date | null
  });

  const [errors, setErrors] = useState<{
    submissionCount?: string;
    endDate?: string;
    startDate?: string;
  }>({});

  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [balanceBeforeDeposit, setBalanceBeforeDeposit] = useState<number>(0);

  const { balance, isLoading: isBalanceLoading, forceRefresh } = useBalance();

  // Force refresh balance when modal opens and reset submitting state
  useEffect(() => {
    if (open) {
      forceRefresh();
      setIsSubmitting(false);
    }
  }, [open, forceRefresh]);

  // Check balance whenever balance, submissionCount, or pricePerSurvey changes
  useEffect(() => {
    if (open && !isBalanceLoading) {
      checkAndUpdateBalanceError(formValues.submissionCount, formValues.pricePerSurvey);
    }
  }, [balance, formValues.submissionCount, formValues.pricePerSurvey, open, isBalanceLoading]);

  // Auto-close deposit dialog when balance increases (payment successful)
  useEffect(() => {
    if (showDepositDialog && balance > balanceBeforeDeposit) {      
      // Close deposit dialog after a short delay to let user see success message
      setTimeout(() => {
        setShowDepositDialog(false);
        // Refresh balance to ensure latest data
        forceRefresh();
      }, 1500); // 1.5 seconds delay
    }
  }, [balance, balanceBeforeDeposit, showDepositDialog, forceRefresh]);

  // Ensure endDate is always set when component mounts or startDate changes
  useEffect(() => {
    if (!formValues.endDate && formValues.startDate) {
      setFormValues((prev) => ({
        ...prev,
        endDate: formValues.startDate
      }));
    }
  }, [formValues.startDate, formValues.endDate]);

  // Ensure endDate is always set to startDate if not set
  useEffect(() => {
    if (formValues.startDate && !formValues.endDate) {
      logger.log('AutoFillFormModal - Setting endDate to startDate:', formValues.startDate);
      setFormValues((prev) => ({
        ...prev,
        endDate: formValues.startDate
      }));
    }
  }, [formValues.startDate, formValues.endDate]);

  // Debug logging for formValues
  useEffect(() => {
    logger.log('AutoFillFormModal - formValues changed:', {
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      startDateType: typeof formValues.startDate,
      endDateType: typeof formValues.endDate
    });
  }, [formValues.startDate, formValues.endDate]);

  // Check balance and update error message
  const checkAndUpdateBalanceError = (count: number, price: number) => {
    const totalCost = count * price;
    const currentBalance = balance || 0;
    const shortfall = Math.max(0, totalCost - currentBalance);

    if (shortfall > 0) {
      const requiredAmount = Math.max(10000, shortfall);
      setBalanceError(`Số dư không đủ. Cần nạp thêm ${requiredAmount.toLocaleString('vi-VN')}đ để thực hiện yêu cầu này.`);
    } else {
      setBalanceError(null);
    }
  };

  // Handle submission count change directly through input field
  const handleSubmissionCountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0;

    if (value < 1) {
      setErrors({ ...errors, submissionCount: 'Số lượng phải lớn hơn 0' });
    } else {
      setErrors({ ...errors, submissionCount: undefined });
    }

    setFormValues({
      ...formValues,
      submissionCount: value
    });

    // Check balance immediately when count changes
    checkAndUpdateBalanceError(value, formValues.pricePerSurvey);
  };

  // Handle switch change
  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'isHumanLike') {
      const isChecked = event.target.checked;
      const now = new Date();
      const newPrice = isChecked ? 350 + 100 : 350;
      
      setFormValues((prev) => ({
        ...prev,
        isHumanLike: isChecked,
        pricePerSurvey: newPrice,
        // Reset both date fields to current date when toggle is turned off
        startDate: isChecked ? prev.startDate : now,
        endDate: isChecked ? prev.endDate : now
      }));

      // Check balance immediately when price changes
      checkAndUpdateBalanceError(formValues.submissionCount, newPrice);
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

    // Clear start date error if validation passes
    const newErrors = { ...errors, startDate: undefined };

    // Re-validate end date with normalized values (allow equal)
    const normalizedStart = normalizeToStartOfDay(newValue);
    const normalizedEnd = normalizeToStartOfDay(formValues.endDate);

    const isEndBeforeStart =
      normalizedStart !== null &&
      normalizedEnd !== null &&
      normalizedStart.getTime() > normalizedEnd.getTime();

    // Determine if we'll auto-adjust endDate to the new startDate
    const willAutoAdjustEndDate =
      !!newValue && (!formValues.endDate || isEndBeforeStart);

    // If we auto-adjust endDate or dates are valid/equal, clear the error
    if (willAutoAdjustEndDate || !isEndBeforeStart) {
      newErrors.endDate = undefined;
    } else {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    setErrors(newErrors);
    setFormValues({
      ...formValues,
      startDate: newValue,
      // Auto-set endDate to startDate if endDate is null or before startDate
      endDate: willAutoAdjustEndDate ? newValue : formValues.endDate
    });
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

    // Validate end date must not be before start date (allow equal)
    const normalizedEnd = normalizeToStartOfDay(newValue);
    const normalizedStart = normalizeToStartOfDay(formValues.startDate);
    if (normalizedEnd && normalizedStart && normalizedEnd.getTime() < normalizedStart.getTime()) {
      setErrors({
        ...errors,
        endDate: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
      return;
    }

    // Clear error if validation passes
    setErrors({
      ...errors,
      endDate: undefined
    });

    setFormValues({
      ...formValues,
      endDate: newValue
    });
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    return formValues.submissionCount * formValues.pricePerSurvey;
  };

  // Check if balance is sufficient
  const checkBalanceSufficiency = () => {
    const totalCost = calculateTotalCost();
    const currentBalance = balance || 0;
    return {
      isSufficient: currentBalance >= totalCost,
      totalCost,
      currentBalance,
      shortfall: Math.max(0, totalCost - currentBalance)
    };
  };

  // Close with confirmation message
  const handleSubmit = () => {
    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Validate form before submitting
    if (formValues.submissionCount <= 0) {
      setErrors({ ...errors, submissionCount: 'Số lượng phải lớn hơn 0' });
      return;
    }

    // Check balance sufficiency
    const balanceCheck = checkBalanceSufficiency();
    if (!balanceCheck.isSufficient) {
      // This should not happen as button is disabled, but kept for safety
      return;
    }

    // Clear balance error if balance is sufficient
    setBalanceError(null);

    // Set submitting state to prevent multiple clicks
    setIsSubmitting(true);

    try {
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
        logger.log('handleSubmit - formValues.endDate:', formValues.endDate);
        if (endDate) {
          endDate = new Date(endDate);
          endDate.setHours(23, 59, 59, 999);
          logger.log('handleSubmit - processed endDate:', endDate);
        } else {
          logger.log('handleSubmit - endDate is null/undefined');
        }

        // Ensure endDate is always provided if startDate exists
        const finalEndDate = endDate || startDate;

        // Debug logging
        logger.log('AutoFillFormModal - Submitting with values:', {
          submissionCount: formValues.submissionCount,
          pricePerSurvey: formValues.pricePerSurvey,
          isHumanLike: formValues.isHumanLike,
          startDate: startDate,
          endDate: endDate,
          finalEndDate: finalEndDate,
          startDateISO: startDate?.toISOString(),
          endDateISO: endDate?.toISOString(),
          finalEndDateISO: finalEndDate?.toISOString()
        });

        onSubmit({
          submissionCount: formValues.submissionCount,
          pricePerSurvey: formValues.pricePerSurvey,
          isHumanLike: formValues.isHumanLike,
          startDate: startDate || undefined,
          endDate: finalEndDate || undefined
        });
      }

      // Close the modal
      onClose();
    } finally {
      // Reset submitting state after a short delay to prevent rapid re-opening
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  // Handle navigate to payment page with required amount
  const handleOpenDepositDialog = () => {
    const balanceCheck = checkBalanceSufficiency();
    if (!balanceCheck.isSufficient) {
      // Save current balance before opening dialog
      setBalanceBeforeDeposit(balance || 0);
      // Open deposit dialog
      setShowDepositDialog(true);
    }
  };

  // Handle close deposit dialog
  const handleCloseDepositDialog = () => {
    setShowDepositDialog(false);
    // Refresh balance after closing deposit dialog
    forceRefresh();
  };

  // Calculate required amount for payment
  const getRequiredAmount = () => {
    const balanceCheck = checkBalanceSufficiency();
    return Math.max(10000, balanceCheck.shortfall);
  };

  // Calculate total cost for display
  const calculateTotalCostDisplay = () => {
    return (formValues.submissionCount * formValues.pricePerSurvey).toLocaleString('vi-VN');
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
          <DocumentText size={24} variant="Bulk" />
          <Typography variant="h4" component="div">
            TẠO YÊU CẦU ĐIỀN FORM TỰ ĐỘNG
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Form name display */}
            <Grid size={12}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" fontWeight="500" minWidth={100}>
                  Tên Form:
                </Typography>
                <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 500 }}>
                  {formName}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Price Info Section */}
            <Grid size={12}>
              <Stack spacing={2} sx={{ bgcolor: 'primary.lighter', p: 2, borderRadius: 2 }}>
                {/* Account balance */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Số dư hiện có:</Typography>
                  <Typography variant="h6" color="primary">
                    {isBalanceLoading ? 'Đang tải...' : `${(balance || 0).toLocaleString('vi-VN')}đ`}
                  </Typography>
                </Stack>

                {/* Base price */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Giá cơ bản mỗi khảo sát:</Typography>
                  <Typography variant="h6">350đ</Typography>
                </Stack>

                {/* Human-like toggle */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={<Switch checked={formValues.isHumanLike} onChange={handleSwitchChange} name="isHumanLike" />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Timer1 size={20} />
                        <Typography>Điền giãn cách giống người thật</Typography>
                      </Stack>
                    }
                  />
                  <Typography variant="h6" color={formValues.isHumanLike ? 'success.main' : 'text.secondary'}>
                    +100đ
                  </Typography>
                </Stack>

                {/* Alert when spacing is disabled */}
                {!formValues.isHumanLike && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mt: 1,
                      bgcolor: '#fff3cd',
                      border: '1px solid #ffc107',
                      color: '#856404',
                      '& .MuiAlert-icon': {
                        color: '#ff9800'
                      },
                      '& .MuiAlert-message': {
                        fontWeight: 500
                      }
                    }}
                  >
                    Mỗi form sẽ giãn cách từ 5s-60s.
                  </Alert>
                )}

                <Divider />

                {/* Final price per survey */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={500}>
                    Tổng giá mỗi khảo sát:
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight={500}>
                    {formValues.pricePerSurvey}đ
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            {/* Survey count */}
            <Grid size={12}>
              <Stack spacing={1}>
                <InputLabel>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AddIcon />
                    <Typography>Số lượng khảo sát cần tăng</Typography>
                  </Stack>
                </InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  value={formValues.submissionCount}
                  onChange={handleSubmissionCountChange}
                  error={!!errors.submissionCount}
                  helperText={errors.submissionCount}
                />
              </Stack>
            </Grid>

            {/* Date selection */}
            <Grid size={12} container spacing={2}>
              <Grid size={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Calendar size={20} />
                      <Typography>Ngày bắt đầu</Typography>
                    </Stack>
                  </InputLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={formValues.startDate}
                      onChange={(newValue) => {
                        logger.log('DatePicker startDate onChange:', newValue);
                        handleStartDateChange(newValue);
                      }}
                      format="dd-MM-yyyy"
                      minDate={new Date()}
                      disabled={!formValues.isHumanLike}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          id: 'start-date',
                          placeholder: 'DD-MM-YYYY',
                          error: !!errors.startDate,
                          helperText: errors.startDate
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Grid>

              <Grid size={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Calendar size={20} />
                      <Typography>Ngày kết thúc</Typography>
                    </Stack>
                  </InputLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={formValues.endDate}
                      onChange={(newValue) => {
                        logger.log('DatePicker endDate onChange:', newValue);
                        handleEndDateChange(newValue);
                      }}
                      format="dd-MM-yyyy"
                      minDate={formValues.startDate || new Date()}
                      disabled={!formValues.isHumanLike}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          id: 'end-date',
                          error: !!errors.endDate,
                          helperText: errors.endDate,
                          placeholder: 'DD-MM-YYYY'
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Grid>
            </Grid>

            {/* Balance error message */}
            {balanceError && (
              <Grid size={12}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 1,
                    bgcolor: '#ffebee',
                    border: '1px solid #f44336',
                    color: '#c62828',
                    '& .MuiAlert-icon': {
                      color: '#d32f2f'
                    },
                    '& .MuiAlert-message': {
                      fontWeight: 500
                    }
                  }}
                >
                  {balanceError}
                </Alert>
              </Grid>
            )}

            {/* Total cost */}
            <Grid size={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  bgcolor: balanceError ? 'error.lighter' : 'success.lighter',
                  p: 2,
                  borderRadius: 2,
                  mt: 1
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Money size={24} variant="Bulk" />
                  <Typography variant="h4">Tổng chi phí:</Typography>
                </Stack>
                <Typography variant="h4" color={balanceError ? 'error.dark' : 'success.dark'} fontWeight="bold">
                  {calculateTotalCostDisplay()}đ
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={onClose} 
          startIcon={<CloseCircle />} 
          sx={{ borderRadius: '100px' }}
          disabled={isSubmitting}
        >
          Đóng
        </Button>
        {balanceError ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleOpenDepositDialog}
            endIcon={<Money />}
            sx={{ borderRadius: '100px' }}
            disabled={formValues.submissionCount <= 0 || !!errors.endDate || !!errors.startDate}
          >
            Nạp tiền
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send2 />}
            sx={{ borderRadius: '100px' }}
            disabled={isSubmitting || formValues.submissionCount <= 0 || !!errors.endDate || !!errors.startDate}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Bắt Đầu Điền Form'}
          </Button>
        )}
      </DialogActions>
    </Dialog>

    {/* Deposit Dialog - Reuse existing component */}
    <DepositDialog 
      open={showDepositDialog} 
      onClose={handleCloseDepositDialog} 
      initialAmount={getRequiredAmount()} 
    />
  </>
  );
}
