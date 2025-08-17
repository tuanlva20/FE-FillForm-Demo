import { TextField } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface TextInputProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'url';
  placeholder?: string;
  label?: string;
  helperText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  sx?: any;
  endAdornment?: React.ReactNode;
  inputProps?: any;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  debounceMs?: number;
}

const TextInput: React.FC<TextInputProps> = React.memo(({
  value,
  onChange,
  type = 'text',
  placeholder,
  label,
  helperText,
  error,
  disabled,
  sx,
  endAdornment,
  inputProps,
  onFocus,
  onBlur,
  debounceMs = 100
}) => {
  const [localValue, setLocalValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const onChangeRef = useRef(onChange);
  const lastValueRef = useRef<string>('');

  // Update onChange ref without triggering re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Optimized sync from parent when value prop changes
  useEffect(() => {
    if (!isTyping) {
      const stringValue = String(value || '');
      if (localValue !== stringValue) {
        setLocalValue(stringValue);
        lastValueRef.current = stringValue;
      }
    }
  }, [value, isTyping, localValue]);

  // Optimized debounced onChange
  const debouncedOnChange = useCallback((newValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only trigger onChange if value actually changed
    if (lastValueRef.current !== newValue) {
      timeoutRef.current = setTimeout(() => {
        lastValueRef.current = newValue;
        onChangeRef.current(newValue);
        setIsTyping(false);
      }, debounceMs);
    }
  }, [debounceMs]);

  // Optimized change handler
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsTyping(true);
    debouncedOnChange(newValue);
  }, [debouncedOnChange]);

  // Optimized focus handler
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFocus?.(e);
  }, [onFocus]);

  // Optimized blur handler
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsTyping(false);
    // Ensure final value is synced immediately on blur
    const finalValue = e.target.value;
    if (lastValueRef.current !== finalValue) {
      lastValueRef.current = finalValue;
      onChangeRef.current(finalValue);
    }
    onBlur?.(e);
  }, [onBlur]);

  // Cleanup on unmount
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
      type={type}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      label={label}
      helperText={helperText}
      error={error}
      disabled={disabled}
      sx={sx}
      InputProps={{
        ...inputProps,
        endAdornment: endAdornment
      }}
    />
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
