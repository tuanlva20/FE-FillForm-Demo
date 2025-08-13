import { TextField } from '@mui/material';
import React from 'react';

type DebouncedMultilineTextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  sx?: any;
  debounceMs?: number;
  disabled?: boolean;
  helperText?: React.ReactNode;
};

const DebouncedMultilineTextField: React.FC<DebouncedMultilineTextFieldProps> = React.memo(
  ({ value, onChange, rows = 3, placeholder, sx, debounceMs = 200, disabled, helperText }) => {
    const [localValue, setLocalValue] = React.useState<string>(value || '');
    const timerRef = React.useRef<number | null>(null);

    // Sync from parent when value prop changes (e.g., reset, load data)
    React.useEffect(() => {
      setLocalValue(value || '');
    }, [value]);

    // Debounce pushing changes upward to avoid re-render storms while typing
    React.useEffect(() => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        onChange(localValue);
      }, debounceMs);
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }, [localValue, onChange, debounceMs]);

    return (
      <TextField
        fullWidth
        multiline
        rows={rows}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        sx={sx}
        disabled={disabled}
        helperText={helperText}
      />
    );
  }
);

export default DebouncedMultilineTextField;


