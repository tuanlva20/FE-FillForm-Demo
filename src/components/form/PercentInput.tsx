import { InputAdornment, TextField } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface PercentInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
  disabled?: boolean;
  sx?: any;
}

const PercentInput: React.FC<PercentInputProps> = React.memo(({ value, onChange, error, disabled, sx }) => {
  const [localValue, setLocalValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const onChangeRef = useRef(onChange);
  const lastValueRef = useRef<number>();

  // Update onChange ref without triggering re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync local value with prop value only when not typing
  useEffect(() => {
    if (!isTyping) {
      const displayValue = value === undefined || value === null || value < 0 ? '0' : String(value);

      // Only update if the value actually changed to prevent unnecessary re-renders
      if (localValue !== displayValue) {
        setLocalValue(displayValue);
      }
    }
  }, [value, isTyping, localValue]);

  // Optimized immediate onChange with smart debouncing
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
        onChangeRef.current(val);
        setIsTyping(false);
      }, 100);
    }
  }, []);

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
      onChangeRef.current(0);
    } else if (lastValueRef.current !== finalValue) {
      lastValueRef.current = finalValue;
      onChangeRef.current(finalValue);
    }
  }, [localValue]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // UX improvement: Clear value when focusing if it's 0, making it easier to input new values
    if (e.target.value === '0') {
      e.target.value = '';
      setLocalValue('');
      setIsTyping(true);
    }
  }, []);

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

PercentInput.displayName = 'PercentInput';

export default PercentInput;
