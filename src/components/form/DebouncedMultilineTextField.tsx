import { TextField } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type DebouncedMultilineTextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  sx?: any;
  debounceMs?: number;
  disabled?: boolean;
  helperText?: React.ReactNode;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

const DebouncedMultilineTextField: React.FC<DebouncedMultilineTextFieldProps> = React.memo(
  ({ 
    value, 
    onChange, 
    rows = 3, 
    placeholder, 
    sx, 
    debounceMs = 200, 
    disabled, 
    helperText,
    onFocus,
    onBlur
  }) => {
    const [localValue, setLocalValue] = useState<string>(value || '');
    const [isTyping, setIsTyping] = useState(false);
    const timerRef = useRef<number | null>(null);
    const onChangeRef = useRef(onChange);
    const lastValueRef = useRef<string>('');

    // Update onChange ref without triggering re-renders
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Optimized sync from parent when value prop changes
    useEffect(() => {
      if (!isTyping && value !== lastValueRef.current) {
        setLocalValue(value || '');
        lastValueRef.current = value || '';
      }
    }, [value, isTyping]);

    // Optimized debounced onChange with better performance
    const debouncedOnChange = useCallback((newValue: string) => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      
      // Only trigger onChange if value actually changed
      if (lastValueRef.current !== newValue) {
        console.log('🔍 DebouncedMultilineTextField: Setting timer for new value:', newValue, 'length:', newValue.length);
        timerRef.current = window.setTimeout(() => {
          console.log('🔍 DebouncedMultilineTextField: Timer fired, calling onChange with:', newValue);
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
      console.log('🔍 DebouncedMultilineTextField: Blur event, finalValue:', finalValue, 'length:', finalValue.length);
      if (lastValueRef.current !== finalValue) {
        console.log('🔍 DebouncedMultilineTextField: Syncing final value on blur:', finalValue);
        lastValueRef.current = finalValue;
        onChangeRef.current(finalValue);
      }
      onBlur?.(e);
    }, [onBlur]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
        }
      };
    }, []);

    return (
      <TextField
        fullWidth
        multiline
        rows={rows}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        sx={sx}
        disabled={disabled}
        helperText={helperText}
      />
    );
  }
);

DebouncedMultilineTextField.displayName = 'DebouncedMultilineTextField';

export default DebouncedMultilineTextField;


