import { InputAdornment, TextField } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

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
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  // Sync local value with prop value
  useEffect(() => {
    if (!isTyping) {
      const displayValue = value === '' || value === undefined || value === null || Number(value) < 0 ? 0 : value;
      setLocalValue(String(displayValue));
    }
  }, [value, isTyping]);

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (val: number) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onChange(val);
          setIsTyping(false);
        }, 150); // 150ms debounce
      };
    }, [onChange]),
    [onChange]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);
    setIsTyping(true);

    let val = Number(inputValue);
    if (isNaN(val) || val < 0) val = 0;
    
    debouncedOnChange(val);
  }, [debouncedOnChange]);

  const handleBlur = useCallback(() => {
    setIsTyping(false);
    // Ensure final value is synced
    const finalValue = Number(localValue);
    if (!isNaN(finalValue) && finalValue >= 0) {
      onChange(finalValue);
    }
  }, [localValue, onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Clear 0 value when focusing, same as other inputs
    if (e.target.value === '0') {
      e.target.value = '';
      setLocalValue('');
    }
    onFocus?.(e);
  }, [onFocus]);

  return (
    <TextField
      fullWidth
      type="number"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      InputProps={{
        inputProps: { min: 0 },
        endAdornment: <InputAdornment position="end">%</InputAdornment>
      }}
      error={error}
      sx={sx}
      disabled={disabled}
    />
  );
});

CustomPercentTextField.displayName = 'CustomPercentTextField';

export default CustomPercentTextField; 