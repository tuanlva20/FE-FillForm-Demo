import { ReactNode } from 'react';

// material-ui
import Chip, { ChipProps } from '@mui/material/Chip';
import { SxProps, Theme } from '@mui/material/styles';

// assets
import { ErrorIcon, InProcessIcon, SuccessIcon } from 'assets/images/svg/icon';
import { Clock } from 'iconsax-react';

// types
import type { FillRequestDTO } from 'api/form';

export interface StatusChipProps {
  status: string | null | undefined;
  fillRequest?: FillRequestDTO; // Thêm prop để hiển thị queue info
  size?: ChipProps['size'];
  variant?: ChipProps['variant'];
  sx?: SxProps<Theme>;
}

const baseSx: SxProps<Theme> = { borderRadius: '16px', fontWeight: 500, pl: 1 };

export default function StatusChip({ status, fillRequest, size = 'medium', variant = 'filled', sx }: StatusChipProps) {
  const up = (status || '').toUpperCase();

  let color: ChipProps['color'] = 'warning';
  let icon: ReactNode = <Clock size={16} />;
  let label = 'Đang chờ...';

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
    label = 'Không thành công';
  } else if (up === 'QUEUED') {
    color = 'warning';
    icon = <Clock size={16} />;
    // Nếu có queue position, hiển thị trong label
    if (fillRequest?.queuePosition) {
      label = `Đang chờ... (Vị trí: ${fillRequest.queuePosition})`;
    } else {
      label = 'Đang chờ...';
    }
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


