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
