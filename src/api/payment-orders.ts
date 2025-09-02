import axios from 'utils/axios';

// Types
export interface PaymentOrderData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  amount: number;
  paymentType: 'DEPOSIT' | 'WITHDRAWAL' | 'PROMOTIONAL';
  paymentTypeDisplayName: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'MISMATCH' | 'OVERPAYMENT' | 'CANCELLED';
  statusDisplayName: string;
  description: string;
  transactionId: string;
  orderId: string;
  isPromotional: boolean;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOrderSearchRequest {
  page?: number;
  size?: number;
  paymentType?: 'DEPOSIT' | 'WITHDRAWAL' | 'PROMOTIONAL';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'MISMATCH' | 'OVERPAYMENT' | 'CANCELLED';
  userName?: string;
  userEmail?: string;
  isPromotional?: boolean;
  isReported?: boolean;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PaymentOrderResponse {
  status: string;
  content: PaymentOrderData[];
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  totalElements: number;
}

// API Functions
export const getPaymentOrders = async (params: {
  page?: number;
  size?: number;
  paymentType?: 'DEPOSIT' | 'WITHDRAWAL' | 'PROMOTIONAL';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'MISMATCH' | 'OVERPAYMENT' | 'CANCELLED';
  userName?: string;
  userEmail?: string;
  isPromotional?: boolean;
  isReported?: boolean;
} = {}): Promise<PaymentOrderResponse> => {
  const {
    page = 0,
    size = 10,
    paymentType,
    status,
    userName,
    userEmail,
    isPromotional,
    isReported
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  if (paymentType) queryParams.append('paymentType', paymentType);
  if (status) queryParams.append('status', status);
  if (userName) queryParams.append('userName', userName);
  if (userEmail) queryParams.append('userEmail', userEmail);
  if (isPromotional !== undefined) queryParams.append('isPromotional', isPromotional.toString());
  if (isReported !== undefined) queryParams.append('isReported', isReported.toString());

  const response = await axios.get(`/api/v1/payment-orders?${queryParams.toString()}`);
  
  // BE trả về object với cấu trúc {status, content, pageSize, pageNumber, totalPages, totalElements}
  return response.data;
};

export const searchPaymentOrders = async (searchRequest: PaymentOrderSearchRequest): Promise<PaymentOrderResponse> => {
  const response = await axios.post('/api/v1/payment-orders/search', searchRequest);
  return response.data;
};

export const getPaymentOrderById = async (id: string): Promise<PaymentOrderResponse> => {
  const response = await axios.get(`/api/v1/payment-orders/${id}`);
  return response.data;
};

export const updatePaymentOrderStatus = async (id: string, status: PaymentOrderData['status']): Promise<PaymentOrderResponse> => {
  const response = await axios.patch(`/api/v1/payment-orders/${id}/status`, { status });
  return response.data;
};

export const reportPaymentOrder = async (id: string, reason: string): Promise<PaymentOrderResponse> => {
  const response = await axios.post(`/api/v1/payment-orders/${id}/report`, { reason });
  return response.data;
};
