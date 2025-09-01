import axios from 'utils/axios';

// Types
export interface OrderData {
  id: string;
  accountName: string;
  accountType: string;
  userAvatar: string;
  userName: string;
  createdAt: string;
  depositAmount: number;
  status: string;
  statusDisplayName: string;
  transactionId: string;
  description: string;
}

export interface OrderSearchRequest {
  page?: number;
  size?: number;
  accountName?: string;
  status?: string;
  accountType?: string;
  userName?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface OrderResponse {
  status: string;
  content: OrderData[];
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  totalElements: number;
}

// API Functions
export const getOrders = async (params: {
  page?: number;
  size?: number;
  accountName?: string;
  status?: string;
  accountType?: string;
  userName?: string;
} = {}): Promise<OrderResponse> => {
  const {
    page = 0,
    size = 10,
    accountName,
    status,
    accountType,
    userName
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  if (accountName) queryParams.append('accountName', accountName);
  if (status) queryParams.append('status', status);
  if (accountType) queryParams.append('accountType', accountType);
  if (userName) queryParams.append('userName', userName);

  const response = await axios.get(`/api/v1/payment-orders?${queryParams.toString()}`);
  return response.data;
};

export const searchOrders = async (searchRequest: OrderSearchRequest): Promise<OrderResponse> => {
  const response = await axios.post('/api/v1/payment-orders/search', searchRequest);
  return response.data;
};

