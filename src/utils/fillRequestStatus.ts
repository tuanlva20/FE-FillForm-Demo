import { ErrorIcon, InProcessIcon, PendingIcon, SuccessIcon } from 'assets/images/svg/icon';
import { CloseCircle } from 'iconsax-react';
import type { ReactNode } from 'react';
import { createElement } from 'react';

export type FillRequestStatus =
  | 'PENDING'
  | 'IN_PROCESS'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

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
    case 'COMPLETED':
      return { label: 'Hoàn thành', color: 'success', icon: createElement(SuccessIcon) };
    case 'IN_PROCESS':
      return { label: 'Đang thực thi', color: 'info', icon: createElement(InProcessIcon) };
    case 'PENDING':
      return { label: 'Chưa bắt đầu', color: 'secondary', icon: createElement(PendingIcon) };
    case 'FAILED':
      return { label: 'Không thành công', color: 'error', icon: createElement(ErrorIcon) };
    case 'CANCELLED':
      return { label: 'Đã hủy', color: 'warning', icon: createElement(CloseCircle, { size: 16 }) };
    default:
      return { label: 'Chưa bắt đầu', color: 'secondary', icon: createElement(PendingIcon) };
  }
}


