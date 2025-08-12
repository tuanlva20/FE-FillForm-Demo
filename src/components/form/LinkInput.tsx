import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { SxProps } from '@mui/material/styles';
import { ExportSquare } from 'iconsax-react';
import React from 'react';

export type LinkInputProps = {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: SxProps;
};

const isHttpUrl = (v: string): boolean => /^https?:\/\//i.test(v.trim());

export default function LinkInput({ id, placeholder, value, onChange, disabled, readOnly, size = 'small', fullWidth = true, sx }: LinkInputProps) {
  const canOpen = isHttpUrl(value);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canOpen) return;
    window.open(value, '_blank', 'noopener,noreferrer');
  };

  return (
    <TextField
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      inputProps={{ readOnly }}
      size={size}
      fullWidth={fullWidth}
      sx={sx}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end" sx={{ pointerEvents: 'auto' }}>
            <Tooltip title={canOpen ? 'Mở link trong tab mới' : 'Nhập link hợp lệ để mở'}>
              {/* color=primary for visibility; disableRipple when cannot open */}
              <span>
                <IconButton
                  size="small"
                  onClick={handleOpen}
                  disabled={!canOpen}
                  sx={() => ({
                    cursor: canOpen ? 'pointer' : 'not-allowed',
                  })}
                >
                  <ExportSquare size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
  );
}


