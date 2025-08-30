import type { FillRequestDTO } from 'api/form';
import { ErrorIcon, InProcessIcon, SuccessIcon } from 'assets/images/svg/icon';
import { Clock } from 'iconsax-react';
import type { ReactNode } from 'react';
import { createElement } from 'react';

export type FillRequestStatus = 'QUEUED' | 'IN_PROCESS' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';

function normalizeStatus(status?: string): FillRequestStatus | undefined {
  if (!status) return undefined;
  const up = status.toUpperCase();
  if (up === 'IN_PROGRESS') return 'IN_PROCESS';
  return up as FillRequestStatus;
}

export function getFillRequestStatusMeta(status?: string): { label: string; color: ChipColor; icon?: ReactNode } {
  const s = normalizeStatus(status);
  switch (s) {
    case 'QUEUED':
      return {
        label: 'Đang chờ...',
        color: 'warning',
        icon: createElement(Clock, { size: 16 })
      };
    case 'COMPLETED':
      return { label: 'Hoàn thành', color: 'success', icon: createElement(SuccessIcon) };
    case 'IN_PROCESS':
      return { label: 'Đang thực thi', color: 'info', icon: createElement(InProcessIcon) };
    case 'FAILED':
      return { label: 'Không thành công', color: 'error', icon: createElement(ErrorIcon) };
    default:
      return { label: 'Đang chờ...', color: 'warning', icon: createElement(Clock, { size: 16 }) };
  }
}

// Function để hiển thị queue position trong status chip
export function getQueueStatusText(request: FillRequestDTO): string {
  if (request.status === 'QUEUED' && request.queuePosition) {
    return `Đang chờ... (Vị trí: ${request.queuePosition})`;
  }
  return getFillRequestStatusMeta(request.status).label;
}
