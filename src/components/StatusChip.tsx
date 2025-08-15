import { ReactNode } from 'react';

// material-ui
import Chip, { ChipProps } from '@mui/material/Chip';
import { SxProps, Theme } from '@mui/material/styles';

// assets
import { ErrorIcon, InProcessIcon, PendingIcon, SuccessIcon } from 'assets/images/svg/icon';
import { CloseCircle } from 'iconsax-react';

export interface StatusChipProps {
  status: string | null | undefined;
  size?: ChipProps['size'];
  variant?: ChipProps['variant'];
  sx?: SxProps<Theme>;
}

const baseSx: SxProps<Theme> = { borderRadius: '16px', fontWeight: 500, pl: 1 };

export default function StatusChip({ status, size = 'medium', variant = 'filled', sx }: StatusChipProps) {
  const up = (status || '').toUpperCase();

  let color: ChipProps['color'] = 'secondary';
  let icon: ReactNode = <PendingIcon />;
  let label = 'Chưa bắt đầu';

  if (up === 'COMPLETED') {
    color = 'success';
    icon = <SuccessIcon />;
    label = 'Hoàn thành';
  } else if (up === 'IN_PROGRESS' || up === 'IN_PROCESS') {
    color = 'info';
    icon = <InProcessIcon />;
    label = 'Đang thực thi';
  } else if (up === 'FAILED') {
    color = 'error';
    icon = <ErrorIcon />;
    label = 'Lỗi';
  } else if (up === 'CANCELLED') {
    color = 'warning';
    icon = <CloseCircle size={16} />;
    label = 'Đã hủy';
  }

  return (
    <Chip
      color={color}
      icon={icon}
      label={label}
      size={size}
      variant={variant}
      sx={{ ...(baseSx as any), ...(sx as any) }}
    />
  );
}


