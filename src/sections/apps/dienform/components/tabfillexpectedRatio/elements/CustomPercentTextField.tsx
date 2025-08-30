import { InputAdornment, TextField } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CustomPercentTextFieldProps {
  value: number | string;
  onChange: (value: number) => void;
  error?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  sx?: any;
  disabled?: boolean;
}

const CustomPercentTextField: React.FC<CustomPercentTextFieldProps> = React.memo(({ value, onChange, error, onFocus, sx, disabled }) => {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastValueRef = useRef<number>();

  // Sync local value with prop value only when not typing
  useEffect(() => {
    if (!isTyping) {
      const numValue = Number(value);
      const displayValue = value === '' || value === undefined || value === null || numValue < 0 ? '0' : String(numValue);

      // Only update if the value actually changed to prevent unnecessary re-renders
      if (localValue !== displayValue) {
        setLocalValue(displayValue);
      }
    }
  }, [value, isTyping, localValue]);

  // Optimized immediate onChange with smart debouncing
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);
      setIsTyping(true);

      let val = Number(inputValue);
      if (isNaN(val) || val < 0) val = 0;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Only debounce if the value actually changed
      if (lastValueRef.current !== val) {
        lastValueRef.current = val;

        // Use shorter debounce for better responsiveness
        timeoutRef.current = setTimeout(() => {
          onChange(val);
          setIsTyping(false);
        }, 100); // Reduced from 150ms to 100ms
      }
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsTyping(false);
    const finalValue = Number(localValue);

    // UX improvement: If input is empty or invalid, set to 0
    if (localValue === '' || isNaN(finalValue) || finalValue < 0) {
      setLocalValue('0');
      lastValueRef.current = 0;
      onChange(0);
    } else if (lastValueRef.current !== finalValue) {
      lastValueRef.current = finalValue;
      onChange(finalValue);
    }
  }, [localValue, onChange]);

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // UX improvement: Clear value when focusing if it's 0, making it easier to input new values
      if (e.target.value === '0') {
        e.target.value = '';
        setLocalValue('');
        setIsTyping(true);
      }
      onFocus?.(e);
    },
    [onFocus]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
