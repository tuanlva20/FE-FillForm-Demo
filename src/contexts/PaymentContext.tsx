import { createContext, useContext, useState, ReactNode } from 'react';

interface PaymentContextType {
  showPaymentPopup: boolean;
  paymentAmount: number;
  currentStepper: string | null;
  showPaymentSuccess: (amount: number) => void;
  hidePaymentSuccess: () => void;
  setCurrentStepper: (stepper: string | null) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [currentStepper, setCurrentStepper] = useState<string | null>(null);

  const showPaymentSuccess = (amount: number) => {
    setPaymentAmount(amount);
    setShowPaymentPopup(true);
  };

  const hidePaymentSuccess = () => {
    setShowPaymentPopup(false);
    setPaymentAmount(0);
  };

  return (
    <PaymentContext.Provider
      value={{
        showPaymentPopup,
        paymentAmount,
        currentStepper,
        showPaymentSuccess,
        hidePaymentSuccess,
        setCurrentStepper,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
