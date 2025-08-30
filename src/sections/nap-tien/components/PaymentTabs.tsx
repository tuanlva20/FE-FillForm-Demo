import { Box } from '@mui/material';
import SEPAYTab from './SEPAYTab';

interface PaymentTabsProps {
  resetKey?: number;
}

export default function PaymentTabs({ resetKey = 0 }: PaymentTabsProps) {
  return (
    <Box>
      {/* <Tabs
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
      > */}
      {/* <Tab label="Chuyển khoản & QR" />
        <Tab label="VNPAY" /> */}
      {/* <Tab label="Chuyển khoản QR" /> */}
      {/* </Tabs> */}
      <SEPAYTab resetKey={resetKey} />

      {/* {activeTab === 0 && <BankTransferTab />}
      {activeTab === 1 && <VNPayTab />} */}
      {/* {activeTab === 2 && <SEPAYTab />} */}
    </Box>
  );
}
