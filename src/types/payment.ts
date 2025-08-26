export interface BankInfo {
  accountName: string;
  accountNumber: string;
  bank: string;
  branch: string;
  content: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  description?: string;
  transactionId?: string;
}

export interface PaymentConfig {
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  supportedMethods: PaymentMethod[];
}

// SEPAY Payment Interfaces
export interface SEPAYOrderRequest {
  amount: number;
  description?: string;
}

export interface SEPAYOrderResponse {
  success: boolean;
  orderId: string;
  qrCodeUrl: string;
  amount: number;
  expiresAt: string;
}

export interface SEPAYWebhookData {
  orderId: string;
  amount: number;
  actualAmount: number;
  status: 'success' | 'failed';
  signature: string;
  timestamp: string;
}

export interface SEPAYPaymentStatus {
  orderId: string;
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'mismatch';
  amount: number;
  actualAmount?: number;
  expiresAt: string;
  createdAt: string;
}
