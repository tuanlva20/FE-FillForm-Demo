import { Box, Button, Divider, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import PaymentHistory from './PaymentHistory';
import PaymentStats from './PaymentStats';
import PaymentSuccessModal from './PaymentSuccessModal';
import SEPAYTab from './SEPAYTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`payment-tabpanel-${index}`} aria-labelledby={`payment-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PaymentDemo() {
  const [tabValue, setTabValue] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleShowSuccessModal = () => {
    setShowSuccessModal(true);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" textAlign="center" mb={4} fontWeight={700}>
        Payment System Demo
      </Typography>

      <Paper sx={{ maxWidth: 1200, mx: 'auto', p: 3 }} elevation={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none'
            }
          }}
        >
          <Tab label="SEPAY Payment" />
          <Tab label="Payment History" />
          <Tab label="Payment Statistics" />
          <Tab label="Success Modal Demo" />
        </Tabs>

        <Divider sx={{ mb: 2 }} />

        <TabPanel value={tabValue} index={0}>
          <SEPAYTab />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <PaymentHistory maxHeight={500} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <PaymentStats />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h6" textAlign="center">
              Test Payment Success Modal
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={handleShowSuccessModal}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Show Success Modal
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Click the button above to see the payment success modal in action
            </Typography>
          </Stack>
        </TabPanel>
      </Paper>

      {/* Demo Success Modal */}
      <PaymentSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={500000}
        orderId="TS1234567890"
        method="SEPAY"
      />
    </Box>
  );
}
