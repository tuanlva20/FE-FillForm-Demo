import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

// third-party
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

// assets
import { Add, Minus } from 'iconsax-react';

// types
interface ScheduleFormModalProps {
  open: boolean;
  onClose: () => void;
  formId: number | null;
}

export default function ScheduleFormModal({ open, onClose, formId }: ScheduleFormModalProps) {
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [varyByTime, setVaryByTime] = useState(true);
  const [timezone, setTimezone] = useState('Yes, Timezone: GMT+7');
  const [minInterval, setMinInterval] = useState<number>(1);
  const [maxInterval, setMaxInterval] = useState<number>(5);
  const [timeRange, setTimeRange] = useState('1-2h, 21-22h');
  const [startDate, setStartDate] = useState(new Date('2025-02-12'));
  const [selectedDay, setSelectedDay] = useState(12);

  // Handle counter buttons
  const handleIntervalChange = (isMin: boolean, increase: boolean) => {
    if (isMin) {
      setMinInterval((prev) => (increase ? prev + 1 : Math.max(1, prev - 1)));
    } else {
      setMaxInterval((prev) => (increase ? prev + 1 : Math.max(minInterval + 1, prev - 1)));
    }
  };

  const handleSave = () => {
    // Save changes logic would go here
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h4" component="div">
          Hẹn giờ điền Form
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={scheduleEnabled} onChange={() => setScheduleEnabled(!scheduleEnabled)} />}
            label="Bật/Tắt Hẹn giờ điền"
          />
        </FormGroup>

        {scheduleEnabled && (
          <>
            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={<Switch checked={varyByTime} onChange={() => setVaryByTime(!varyByTime)} />}
                label="Thay số lượng khảo sát tùy vào thời gian hiện tại trong ngày"
              />
            </FormGroup>

            {varyByTime && (
              <Box sx={{ mt: 1, mb: 3 }}>
                <Select fullWidth value={timezone} displayEmpty renderValue={(value) => value}>
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="Yes, Timezone: GMT-12">Yes, Timezone: GMT-12</MenuItem>
                  <MenuItem value="Yes, Timezone: GMT-11">Yes, Timezone: GMT-11</MenuItem>
                  <MenuItem value="Yes, Timezone: GMT-10">Yes, Timezone: GMT-10</MenuItem>
                  <MenuItem value="Yes, Timezone: GMT-9">Yes, Timezone: GMT-9</MenuItem>
                  <MenuItem value="Yes, Timezone: GMT-8">Yes, Timezone: GMT-8</MenuItem>
                  <MenuItem value="Yes, Timezone: GMT-7">Yes, Timezone: GMT-7</MenuItem>
                  <MenuItem value="Yes, Timezone: GMT-6">Yes, Timezone: GMT-6</MenuItem>
                  <MenuItem value="Yes, Timezone: GMT+7">Yes, Timezone: GMT+7</MenuItem>
                </Select>
              </Box>
            )}

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Thời gian giãn cách giữa các lần điền từ
                </Typography>
              </Grid>

              <Grid size={5}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    p: 0
                  }}
                >
                  <IconButton size="small" onClick={() => handleIntervalChange(true, false)} sx={{ borderRadius: 0 }}>
                    <Minus size={16} />
                  </IconButton>
                  <OutlinedInput
                    value={minInterval}
                    sx={{
                      width: '100%',
                      border: 'none',
                      '& fieldset': { border: 'none' },
                      '& input': { textAlign: 'center', p: 0.5 }
                    }}
                    readOnly
                  />
                  <IconButton size="small" onClick={() => handleIntervalChange(true, true)} sx={{ borderRadius: 0 }}>
                    <Add size={16} />
                  </IconButton>
                </Box>
                <Typography sx={{ textAlign: 'center' }}>phút</Typography>
              </Grid>

              <Grid size={2}>
                <Typography variant="h5" sx={{ textAlign: 'center', lineHeight: '42px' }}>
                  đến
                </Typography>
              </Grid>

              <Grid size={5}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    p: 0
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleIntervalChange(false, false)}
                    sx={{ borderRadius: 0 }}
                    disabled={maxInterval <= minInterval + 1}
                  >
                    <Minus size={16} />
                  </IconButton>
                  <OutlinedInput
                    value={maxInterval}
                    sx={{
                      width: '100%',
                      border: 'none',
                      '& fieldset': { border: 'none' },
                      '& input': { textAlign: 'center', p: 0.5 }
                    }}
                    readOnly
                  />
                  <IconButton size="small" onClick={() => handleIntervalChange(false, true)} sx={{ borderRadius: 0 }}>
                    <Add size={16} />
                  </IconButton>
                </Box>
                <Typography sx={{ textAlign: 'center' }}>phút</Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Khoảng thời gian điền trong ngày:
              </Typography>
              <Select fullWidth value={timeRange} displayEmpty renderValue={(value) => value}>
                <MenuItem value="1-2h, 21-22h">1-2h, 21-22h</MenuItem>
                <MenuItem value="2-3h, 22-23h">2-3h, 22-23h</MenuItem>
                <MenuItem value="3-4h, 23-24h">3-4h, 23-24h</MenuItem>
                <MenuItem value="4-5h, 24-25h">4-5h, 24-25h</MenuItem>
              </Select>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Ngày bắt đầu:
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setStartDate(newValue);
                      setSelectedDay(newValue.getDate());
                    }
                  }}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: {
                        startAdornment: (
                          <Typography variant="caption" sx={{ mr: 1 }}>
                            Từ ngày
                          </Typography>
                        )
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>

            <Box sx={{ mt: 2, display: 'none' }}>
              {/* This would be your calendar component */}
              <Typography variant="subtitle2">Tháng Hai 2025</Typography>
              <Grid container spacing={1}>
                {/* Calendar days would go here */}
                <Grid size={1}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: selectedDay === 12 ? 'primary.main' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedDay === 12 ? 'white' : 'inherit'
                    }}
                  >
                    12
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Lưu thay đổi
        </Button>
        <Button variant="contained" color="error" onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
