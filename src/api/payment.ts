import { SEPAYOrderRequest, SEPAYOrderResponse, SEPAYPaymentStatus } from '../types/payment';
import axios from '../utils/axios';

export interface VNPayPaymentRequest {
  amount: number;
  description: string;
}

export interface VNPayPaymentResponse {
  success: boolean;
  qrCode?: string;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: 'pending' | 'completed' | 'failed';
  amount?: number;
  message?: string;
}

export const createVNPayPayment = async (data: VNPayPaymentRequest): Promise<VNPayPaymentResponse> => {
  const response = await axios.post('/api/payments/vnpay/create', data);
  return response.data;
};

export const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
  const response = await axios.get(`/api/payments/${paymentId}/status`);
  return response.data;
};

export const getPaymentHistory = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await axios.get('/api/payments/history', { params });
  return response.data;
};

// SEPAY Payment APIs
export const createSEPAYOrder = async (data: SEPAYOrderRequest): Promise<SEPAYOrderResponse> => {
  const response = await axios.post('/api/payments/sepay/create-order', data);
  return response.data;
};

export const checkSEPAYPaymentStatus = async (orderId: string): Promise<SEPAYPaymentStatus> => {
  const response = await axios.get(`/api/payments/sepay/${orderId}/status`);
  return response.data;
};

export const querySEPAYTransaction = async (orderId: string): Promise<SEPAYPaymentStatus> => {
  const response = await axios.post(`/api/payments/sepay/${orderId}/query`, {});
  return response.data;
};
