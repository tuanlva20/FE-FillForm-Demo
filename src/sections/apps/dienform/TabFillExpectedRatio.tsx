import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import { MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';
import Link from '@mui/material/Link';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';
import AutoFillFormModal from './components/AutoFillFormModal';
import FormDetailModal from './components/FormDetailModal';
import ScheduleFormModal from './components/ScheduleFormModal';
import ExpectedRatioFormList from './components/tabfillexpectedRatio/FormList';

// assets

// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
};

// types
interface QuestionOption {
  id: number;
  text: string;
  fillCount: number;
}

interface FormQuestion {
  id: number;
  text: string;
  type: 'multiple_choice' | 'text' | 'checkbox';
  options: QuestionOption[];
  useCustomData: boolean;
  customData?: string;
}

interface FormData {
  id: number;
  name: string;
  link: string;
  questions: FormQuestion[];
}

// ==============================|| DIENFORM - FILL BY EXPECTED RATIO ||============================== //

export default function TabFillExpectedRatio() {
  const [formData, setFormData] = useState<FormData>({
    id: 1,
    name: 'Trả lời sự kiện',
    link: 'https://docs.google.com/forms/d/1vYWUsd5Pu-Qp6kiUDX_av7zKjfaWiBJI5tw/edit',
    questions: [
      {
        id: 1,
        text: 'Bạn có thể tham dự không?',
        type: 'multiple_choice',
        options: [
          { id: 1, text: 'Có, tôi sẽ tới dự', fillCount: 40 },
          { id: 2, text: 'Không, tôi không thể tham dự', fillCount: 40 },
          { id: 3, text: 'Tôi chưa chắc chắn', fillCount: 20 },
          { id: 4, text: 'Tôi chưa chắc chắn', fillCount: 20 },
          { id: 5, text: 'Tôi chưa chắc chắn', fillCount: 20 },
          { id: 6, text: 'Tôi chưa chắc chắn', fillCount: 20 },
          { id: 7, text: 'Tôi chưa chắc chắn', fillCount: 20 }
        ],
        useCustomData: false
      },
      {
        id: 2,
        text: 'Đánh giá các khía cạnh của sự kiện',
        type: 'multiple_choice',
        options: [
          { id: 1, text: 'Rất tốt', fillCount: 40 },
          { id: 2, text: 'Tốt', fillCount: 40 },
          { id: 3, text: 'Không tốt', fillCount: 20 }
        ],
        useCustomData: false
      },
      {
        id: 3,
        text: 'Nhận xét của bạn về sự kiện',
        type: 'text',
        options: [],
        useCustomData: true,
        customData: ''
      }
    ]
  });
  
  const [balanceError, setBalanceError] = useState<{ [key: number]: string }>({});
  const [isAutoFillModalOpen, setIsAutoFillModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  // Validate total percentage for each question doesn't exceed 100%
  useEffect(() => {
    const newErrors: { [key: number]: string } = {};
    
    formData.questions.forEach((question) => {
      if (question.type !== 'text') {
        const total = question.options.reduce((sum, option) => sum + option.fillCount, 0);
        if (total > 100) {
          newErrors[question.id] = `Tổng tỉ lệ không được vượt quá 100%. Hiện tại: ${total}%`;
        } else {
          newErrors[question.id] = '';
        }
      }
    });
    
    setBalanceError(newErrors);
  }, [formData]);

  // Handle option fill count change
  const handleOptionChange = (questionId: number, optionId: number, value: number) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const questionIndex = newData.questions.findIndex((q) => q.id === questionId);
      
      if (questionIndex !== -1) {
        const optionIndex = newData.questions[questionIndex].options.findIndex((o) => o.id === optionId);
        if (optionIndex !== -1) {
          newData.questions[questionIndex].options[optionIndex].fillCount = value;
        }
      }
      
      return newData;
    });
  };

  // Handle custom data checkbox toggle
  const handleCustomDataToggle = (questionId: number, checked: boolean) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const questionIndex = newData.questions.findIndex((q) => q.id === questionId);
      
      if (questionIndex !== -1) {
        newData.questions[questionIndex].useCustomData = checked;
      }
      
      return newData;
    });
  };

  // Handle custom data text change
  const handleCustomDataChange = (questionId: number, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const questionIndex = newData.questions.findIndex((q) => q.id === questionId);
      
      if (questionIndex !== -1) {
        newData.questions[questionIndex].customData = value;
      }
      
      return newData;
    });
  };

  // Open the auto fill form modal
  const handleOpenAutoFillModal = () => {
    setIsAutoFillModalOpen(true);
  };

  // Open the schedule form modal
  const handleOpenScheduleModal = (formId: number) => {
    setSelectedFormId(formId);
    setIsScheduleModalOpen(true);
  };

  // Open the form detail modal
  const handleOpenDetailModal = (formId: number) => {
    setSelectedFormId(formId);
    setIsDetailModalOpen(true);
  };

  // Check if there are any balance errors
  const hasBalanceErrors = Object.values(balanceError).some(error => error !== '');

  const [tenForm, setTenForm] = useState('0');

  const handleChange = (event: SelectChangeEvent<string>) => {
    setTenForm(event.target.value);
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <MainCard 
          title="Chọn Form muốn điền" 
          sx= {MAINCARD_STYLE}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="column" sx={{ gap: 1 }}>
          <InputLabel htmlFor="ten-form">Tên Form</InputLabel>
          <Select size="medium" fullWidth id="ten-form" value={tenForm} onChange={handleChange} MenuProps={MenuProps}>
            <MenuItem value="0">Tên form 1</MenuItem>
            <MenuItem value="1">Tên form 2</MenuItem>
            <MenuItem value="2">Tên form 3</MenuItem>
            <MenuItem value="3">Tên form 4</MenuItem>
            <MenuItem value="4">Tên form 5</MenuItem>
            <MenuItem value="5">Tên form 6</MenuItem>
            <MenuItem value="6">Tên form 7</MenuItem>
            <MenuItem value="10">Tên form 8</MenuItem>
          </Select>
              </Stack>
            </Grid>
            <Grid size={12}>
              <Stack direction="row" sx={{ gap: 1 }}>
          <InputLabel htmlFor="form-link">Link Form</InputLabel>
          <Link 
            href={formData.link} 
            id="form-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {formData.link}
          </Link>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard title="Điền tỉ lệ mong muốn cho các đáp án" sx={MAINCARD_STYLE}>
          {formData.questions.map((question) => (
            <Box key={question.id} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {question.text}
              </Typography>
              
              {question.type === 'text' ? (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={question.useCustomData} 
                        onChange={(e) => handleCustomDataToggle(question.id, e.target.checked)}
                      />
                    }
                    label="Điền theo Data của bạn"
                  />
                  
                  {question.useCustomData && (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={question.customData}
                      onChange={(e) => handleCustomDataChange(question.id, e.target.value)}
                      placeholder="Nhập dữ liệu của bạn"
                      sx={{ mt: 2 }}
                    />
                  )}
                </>
              ) : (
                <>
                  <Grid container spacing={2}>
                    {question.options.map((option) => (
                      <Grid key={option.id} size={{ xs: 2, sm: 1.5 }}>
                        <Tooltip 
                          title={option.text} 
                          arrow 
                          placement="top" 
                          slotProps={{
                            tooltip: {
                              sx: {
                              backgroundColor: 'gray',
                              color: 'white'
                              }
                            }
                          }}
                        >
                          <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 1, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            cursor: 'pointer' 
                          }}
                          >
                          {option.text}
                          </Typography>
                        </Tooltip>
                        <TextField
                          fullWidth
                          type="number"
                          value={option.fillCount}
                          onChange={(e) => handleOptionChange(question.id, option.id, Number(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                          }}
                          error={!!balanceError[question.id]}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  {balanceError[question.id] && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {balanceError[question.id]}
                    </FormHelperText>
                  )}
                </>
              )}
              
              <Divider sx={{ mt: 3, mb: 1 }} />
            </Box>
          ))}
          
          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
            <Button 
              variant="outlined" 
              color="secondary"
            >
              Hủy
            </Button>
            <Button 
              variant="contained"
              disabled={hasBalanceErrors}
            >
              Lưu thay đổi
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleOpenAutoFillModal}
              disabled={hasBalanceErrors}
            >
              Tạo yêu cầu điền Form
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <ExpectedRatioFormList 
          onSchedule={handleOpenScheduleModal}
          onViewDetails={handleOpenDetailModal}
        />
      </Grid>
      
      {/* Modals */}
      <AutoFillFormModal 
        open={isAutoFillModalOpen} 
        onClose={() => setIsAutoFillModalOpen(false)}
        formName={formData.name}
      />
      
      <ScheduleFormModal 
        open={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)}
        formId={selectedFormId}
      />
      
      <FormDetailModal 
        open={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        formId={selectedFormId}
      />
    </Grid>
  );
}
