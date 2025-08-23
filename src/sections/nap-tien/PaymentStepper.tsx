import { Box, Button, Paper, Step, StepLabel, Stepper } from '@mui/material';
import { useState } from 'react';
import AlertInfoBox from './components/AlertInfoBox';
import PaymentTabs from './components/PaymentTabs';
import SpecialNoticeBox from './components/SpecialNoticeBox';

const steps = [
  'Chuyển khoản & QR',
  'Lưu ý đặc biệt'
];

export default function PaymentStepper() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => setActiveStep(0);

  return (
    <Paper sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: { xs: 2, md: 4 } }} elevation={2}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box>
        {activeStep === 0 && (
          <>
            <AlertInfoBox />
            <Box mt={2}>
              <PaymentTabs />
            </Box>
          </>
        )}
        {activeStep === 1 && <SpecialNoticeBox />}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3 }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Quay lại
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Tiếp tục
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleReset}>
            Làm lại
          </Button>
        )}
      </Box>
    </Paper>
  );
} 