// Utility function để format số tiền
export const formatAmount = (value: string | number): string => {
  const number = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, ''), 10) : value;
  if (!number) return '0';
  
  return number.toLocaleString('vi-VN');
};

// Utility function để parse số tiền
export const parseAmount = (formattedValue: string): number => {
  return parseInt(formattedValue.replace(/[^0-9]/g, ''), 10) || 0;
};

// Utility function để validate số tiền
export const validateAmount = (amount: number): boolean => {
  return amount >= 10000;
};

// Utility function để format số tiền hiển thị
export const formatDisplayAmount = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + ' VND';
};

// Utility function để tạo nội dung chuyển khoản
export const generateTransferContent = (content: string, amount?: number): string => {
  if (amount) {
    return `${content} - ${formatDisplayAmount(amount)}`;
  }
  return content;
};
