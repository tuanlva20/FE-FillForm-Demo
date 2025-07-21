import { InputAdornment, TextField } from '@mui/material';
import React from 'react';

interface CustomPercentTextFieldProps {
  value: number | string;
  onChange: (value: number) => void;
  error?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  sx?: any;
  disabled?: boolean;
}

const CustomPercentTextField: React.FC<CustomPercentTextFieldProps> = React.memo(({
  value,
  onChange,
  error,
  onFocus,
  sx,
  disabled
}) => {
  // Always show 0 if value is empty, undefined, or negative
  const displayValue = value === '' || value === undefined || value === null || Number(value) < 0 ? 0 : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (isNaN(val) || val < 0) val = 0;
    onChange(val);
  };

  return (
    <TextField
      fullWidth
      type="number"
      value={displayValue}
      onChange={handleChange}
      onFocus={onFocus}
      InputProps={{
        endAdornment: <InputAdornment position="end">%</InputAdornment>
      }}
      inputProps={{ min: 0 }}
      error={error}
      sx={sx}
      disabled={disabled}
    />
  );
});

export default CustomPercentTextField; 