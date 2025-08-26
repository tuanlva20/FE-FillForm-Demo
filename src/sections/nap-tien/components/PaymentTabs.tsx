import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import BankTransferTab from './BankTransferTab';
import SEPAYTab from './SEPAYTab';
import VNPayTab from './VNPayTab';

export default function PaymentTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none'
          }
        }}
      >
        <Tab label="Chuyển khoản & QR" />
        <Tab label="VNPAY" />
        <Tab label="SEPAY" />
      </Tabs>
      
      {activeTab === 0 && <BankTransferTab />}
      {activeTab === 1 && <VNPayTab />}
      {activeTab === 2 && <SEPAYTab />}
    </Box>
  );
}
