
// material-ui
import Chip, { ChipProps } from '@mui/material/Chip';
import { SxProps, Theme } from '@mui/material/styles';

// assets
import { Icon } from '@iconify/react';

// types
import { getPaymentStatusConfig, PaymentStatusType } from 'types/paymentStatus';

export interface PaymentStatusChipProps {
  status: PaymentStatusType;
  showIcon?: boolean;
  variant?: ChipProps['variant'];
  size?: ChipProps['size'];
  sx?: SxProps<Theme>;
}

const baseSx: SxProps<Theme> = { borderRadius: '16px', fontWeight: 500, pl: 1 };

export default function PaymentStatusChip({ 
  status, 
  showIcon = true, 
  variant = 'filled',
  size = 'medium',
  sx 
}: PaymentStatusChipProps) {
  const config = getPaymentStatusConfig(status);

  const chipStyle = {
    backgroundColor: variant === 'filled' ? config.backgroundColor : 'transparent',
    color: config.color,
    borderColor: config.color,
    fontWeight: 500,
    '& .MuiChip-icon': {
      color: config.color
    },
    '& .MuiChip-label': {
      color: config.color
    }
  };

  return (
    <Chip
      label={config.label}
      icon={showIcon ? <Icon icon={config.icon} /> : undefined}
      variant={variant}
      size={size}
      sx={{ ...(baseSx as any), ...chipStyle, ...(sx as any) }}
    />
  );
}
