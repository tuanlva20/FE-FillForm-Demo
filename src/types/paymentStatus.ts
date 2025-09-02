
export type PaymentStatusType = 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'MISMATCH' | 'OVERPAYMENT' | 'CANCELLED';

export interface PaymentStatusConfig {
  value: PaymentStatusType;
  label: string;
  title: string;
  icon: string;
  color: string;
  backgroundColor: string;
  description: string;
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatusType, PaymentStatusConfig> = {
  PENDING: {
    value: 'PENDING',
    label: 'Chờ xử lý',
    title: 'Đơn hàng đang chờ xử lý',
    icon: 'mdi:clock-outline',
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    description: 'Đơn hàng đã được tạo và đang chờ thanh toán'
  },
  COMPLETED: {
    value: 'COMPLETED',
    label: 'Hoàn thành',
    title: 'Đơn hàng đã hoàn thành',
    icon: 'mdi:check-circle-outline',
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    description: 'Đơn hàng đã được thanh toán thành công'
  },
  FAILED: {
    value: 'FAILED',
    label: 'Thất bại',
    title: 'Đơn hàng thất bại',
    icon: 'mdi:close-circle-outline',
    color: '#F44336',
    backgroundColor: '#FFEBEE',
    description: 'Đơn hàng thanh toán thất bại'
  },
  EXPIRED: {
    value: 'EXPIRED',
    label: 'Hết hạn',
    title: 'Đơn hàng đã hết hạn',
    icon: 'mdi:clock-alert-outline',
    color: '#9E9E9E',
    backgroundColor: '#F5F5F5',
    description: 'Đơn hàng đã quá hạn thanh toán'
  },
  MISMATCH: {
    value: 'MISMATCH',
    label: 'Không khớp',
    title: 'Số tiền không khớp',
    icon: 'mdi:alert-circle-outline',
    color: '#FF5722',
    backgroundColor: '#FBE9E7',
    description: 'Số tiền thanh toán không khớp với đơn hàng'
  },
  OVERPAYMENT: {
    value: 'OVERPAYMENT',
    label: 'Thanh toán thừa',
    title: 'Thanh toán vượt quá số tiền',
    icon: 'mdi:plus-circle-outline',
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    description: 'Số tiền thanh toán vượt quá giá trị đơn hàng'
  },
  CANCELLED: {
    value: 'CANCELLED',
    label: 'Hủy',
    title: 'Đơn hàng đã hủy',
    icon: 'mdi:cancel',
    color: '#9E9E9E',
    backgroundColor: '#EEEEEE',
    description: 'Đơn hàng đã bị hủy bởi người dùng hoặc hệ thống'
  }
};

export const getPaymentStatusConfig = (status: PaymentStatusType): PaymentStatusConfig => {
  return PAYMENT_STATUS_CONFIG[status];
};

export const getPaymentStatusIcon = (status: PaymentStatusType): string => {
  return PAYMENT_STATUS_CONFIG[status].icon;
};

export const getPaymentStatusColor = (status: PaymentStatusType): string => {
  return PAYMENT_STATUS_CONFIG[status].color;
};

export const getPaymentStatusLabel = (status: PaymentStatusType): string => {
  return PAYMENT_STATUS_CONFIG[status].label;
};

export const getPaymentStatusTitle = (status: PaymentStatusType): string => {
  return PAYMENT_STATUS_CONFIG[status].title;
};

export const getPaymentStatusDescription = (status: PaymentStatusType): string => {
  return PAYMENT_STATUS_CONFIG[status].description;
};

export const PAYMENT_STATUS_OPTIONS = Object.values(PAYMENT_STATUS_CONFIG).map(config => ({
  value: config.value,
  label: config.label
}));

