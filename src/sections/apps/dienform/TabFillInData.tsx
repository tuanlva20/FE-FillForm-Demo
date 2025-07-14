import { useEffect, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';

// components
import AutoFillFormModal from './components/AutoFillFormModal';
import PaymentModal from './components/PaymentModal';
import FillRequestList from './components/tabfillindata/FillRequestList';

// API
import {
    checkDataMapping,
    createDataFillRequest,
    DataFillRequestDTO,
    DataMappingRequest,
    DataMappingResponse,
    FormData,
    FormDetailResponse,
    getFormDetail,
    getFormList
} from 'api/form';

// assets
import { ArrowRight2, Clock } from 'iconsax-react';

// ==============================|| DIENFORM - FILL IN DATA ||============================== //

export default function TabFillInData() {
  
  // States for API interactions
  const [loading, setLoading] = useState<boolean>(false);
  const [forms, setForms] = useState<FormData[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isAutoFillModalOpen, setIsAutoFillModalOpen] = useState<boolean>(false);
  
  // State for form inputs
  const [formName, setFormName] = useState<string>('');
  const [formLink, setFormLink] = useState<string>('');
  const [sheetLink, setSheetLink] = useState<string>('');
  
  // States for data checking
  const [isCheckingData, setIsCheckingData] = useState<boolean>(false);
  const [dataChecked, setDataChecked] = useState<boolean>(false);
  const [mappingData, setMappingData] = useState<DataMappingResponse | null>(null);
  const [columnMappings, setColumnMappings] = useState<Map<string, string>>(new Map());
  
  // States for form list - Updated default limit to 10
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Load forms on component mount
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      try {
        const response = await getFormList();
        setForms(response.content);
        
        // Don't select any form by default - user must choose
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError('Không thể tải danh sách form. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchForms();
  }, []);
  
  // Load form details when form is selected
  useEffect(() => {
    if (!selectedFormId) {
      setSelectedForm(null);
      setFormLink('');
      return;
    }
    
    const fetchFormDetails = async () => {
      try {
        const formDetails = await getFormDetail(selectedFormId);
        setSelectedForm(formDetails);
        setFormLink(formDetails.editLink);
      } catch (err) {
        console.error('Error fetching form details:', err);
        setError('Không thể tải chi tiết form. Vui lòng thử lại.');
      }
    };
    
    fetchFormDetails();
  }, [selectedFormId]);
  
  // Check data function
  const handleCheckData = async () => {
    if (!selectedFormId || !sheetLink) {
      setError('Vui lòng chọn form và nhập link sheet');
      return;
    }
    
    // Validate Google Sheets URL - more flexible pattern
    const sheetUrlPattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    
    if (!sheetUrlPattern.test(sheetLink)) {
      setError('Link Google Sheet không hợp lệ. Vui lòng nhập link Google Sheets (không phải Google Forms). Ví dụ: https://docs.google.com/spreadsheets/d/1ABC123.../edit');
      return;
    }
    
    setIsCheckingData(true);
    setError(null);
    
    try {
      const request: DataMappingRequest = {
        formId: selectedFormId,
        sheetLink
      };
      
      const response = await checkDataMapping(request);
      
      setMappingData(response);
      
      // Initialize column mappings
      const initialMappings = new Map<string, string>();
      
      // Auto-map columns based on similarity (if provided by backend)
      if (response.autoMappings) {
        response.autoMappings.forEach(mapping => {
          initialMappings.set(mapping.questionId, mapping.columnName);
        });
      } else {
        // Initialize with empty values for manual mapping
        response.questions.forEach(question => {
        initialMappings.set(question.id, '');
      });
      }
      
      setColumnMappings(initialMappings);
      setDataChecked(true);
      
    } catch (err: any) {
      // Handle specific error types
      if (err.response?.status === 403) {
        setError('Không thể truy cập link Google Sheet. Vui lòng đảm bảo sheet được chia sẻ công khai hoặc có quyền truy cập.');
      } else if (err.response?.status === 404) {
        setError('Không tìm thấy Google Form hoặc Sheet. Vui lòng kiểm tra lại link.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi kiểm tra dữ liệu. Vui lòng thử lại!');
      }
    } finally {
      setIsCheckingData(false);
    }
  };
  
  // Handle mapping change
  const handleMappingChange = (questionId: string, columnValue: string) => {
    const newMappings = new Map(columnMappings);
    newMappings.set(questionId, columnValue);
    setColumnMappings(newMappings);
  };
  
  // Handle create fill request
  const handleCreateFillRequest = async (formValues: {
    submissionCount: number;
    pricePerSurvey: number;
    isHumanLike: boolean;
    startDate?: Date;
    endDate?: Date;
  }) => {
    if (!mappingData) return;
    
    // Validate mappings - allow empty mappings for optional questions
    const mappingArray = Array.from(columnMappings.entries()).map(([questionId, columnName]) => ({
      questionId,
      columnName: columnName || null // Allow null for unmapped questions
    }));
    
    try {
    setLoading(true);
      
      const request: DataFillRequestDTO = {
        formName: formName || `Form điền từ data - ${new Date().toLocaleDateString('vi-VN')}`,
        formLink,
        sheetLink,
        mappings: mappingArray,
        submissionCount: formValues.submissionCount,
        pricePerSurvey: formValues.pricePerSurvey,
        isHumanLike: formValues.isHumanLike,
        startDate: formValues.startDate?.toISOString(),
        endDate: formValues.endDate?.toISOString()
      };
      
      await createDataFillRequest(request);
      
      // Reset form
      setFormName('');
      setFormLink('');
      setSheetLink('');
      setDataChecked(false);
      setMappingData(null);
      setColumnMappings(new Map());
      setIsAutoFillModalOpen(false);
      
      // Refresh form details to update the fill requests list
      if (selectedFormId) {
        const formDetails = await getFormDetail(selectedFormId);
        setSelectedForm(formDetails);
      }
      
      // Show success message
      alert('Tạo yêu cầu điền form thành công!');
      
    } catch (err: any) {
      console.error('Error creating fill request:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi tạo yêu cầu điền form. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Open payment modal
  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };
  
  // Open auto fill modal
  const handleOpenAutoFillModal = () => {
    if (!dataChecked || !mappingData) {
      setError('Vui lòng kiểm tra dữ liệu trước khi tạo yêu cầu điền form.');
      return;
    }
    setIsAutoFillModalOpen(true);
  };
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Handle form selection change
  const handleFormChange = (event: SelectChangeEvent) => {
    const formId = event.target.value;
    setSelectedFormId(formId);
    
    // Reset form inputs when changing form
    setFormName('');
    setSheetLink('');
    setDataChecked(false);
    setMappingData(null);
    setColumnMappings(new Map());
    setError(null);
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {/* Form and Sheet Link Inputs */}
      <Grid size={12}>
        <MainCard title="Điền theo data có trước" sx={MAINCARD_STYLE}>
          {error && <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              alignItems: 'center',
              '& .MuiAlert-icon': {
                marginRight: 1,
                pt: 1,
                mt: 1
              }
            }}
          >
            {error}
          </Alert>}
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="ten-form">Tên Form</InputLabel>
                <Select 
                  fullWidth 
                  id="ten-form" 
                  value={selectedFormId || ''} 
                  onChange={handleFormChange}
                  disabled={loading}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>- Chọn Form cần điền -</em>
                  </MenuItem>
                  {forms.map((form) => (
                    <MenuItem key={form.id} value={form.id}>
                      {form.name}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="link-form">Link Form</InputLabel>
                <TextField 
                  fullWidth 
                  id="link-form" 
                  placeholder="https://docs.google.com/forms/d/e/1FAlpQLSdUJNsCKqqokI1kMTrfXYWWR5ZqDH4S3-wGkczCAkhzBxzg9A/viewform" 
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  disabled={!selectedFormId}
                />
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="link-data-sheet">Link Data Sheet</InputLabel>
                <TextField 
                  fullWidth 
                  id="link-data-sheet" 
                  placeholder="https://docs.google.com/spreadsheets/d/1ABC123.../edit" 
                  value={sheetLink}
                  onChange={(e) => setSheetLink(e.target.value)}
                />
              </Stack>
            </Grid>
            
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleCheckData}
                disabled={isCheckingData || !selectedFormId || !sheetLink}
              >
                {isCheckingData ? <CircularProgress size={24} color="inherit" /> : 'Kiểm Tra Dữ Liệu'}
              </Button>
            </Grid>
          </Grid>
          
          {/* Data mapping section - shown after data check */}
          {dataChecked && mappingData && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h5" sx={{ mb: 2 }}>Thông tin cột liên kết</Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Hãy kiểm tra các câu hỏi với cột liên kết trong data
              </Typography>
              
              {/* Show data validation errors if any */}
              {mappingData.errors && mappingData.errors.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Phát hiện các vấn đề:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {mappingData.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              
              {/* Show unmapped questions if any */}
              {mappingData.unmappedQuestions && mappingData.unmappedQuestions.length > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Câu hỏi không tìm thấy trong sheet:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {mappingData.unmappedQuestions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              
              {mappingData.questions.map((question) => (
                <Box key={question.id} sx={{ mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Typography fontWeight="500">
                        Câu hỏi: {question.title}
                      </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <ArrowRight2 size={24} />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <Select
                          value={columnMappings.get(question.id) || ''}
                          onChange={(e) => handleMappingChange(question.id, e.target.value)}
                          displayEmpty
                          size="small"
                        >
                          <MenuItem value="">
                            Chọn cột dữ liệu tương ứng
                          </MenuItem>
                          {mappingData.sheetColumns.map((column) => (
                            <MenuItem key={column} value={column}>
                              {column}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Clock />}
                  onClick={handleOpenAutoFillModal}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Tạo Yêu Cầu Điền Form'}
                </Button>
              </Box>
            </>
          )}
        </MainCard>
      </Grid>
      
      {/* Fill Request List - Only show when a form is selected */}
      {selectedFormId && selectedForm && (
      <Grid size={12}>
          <FillRequestList 
            fillRequests={selectedForm.fillRequests || []}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
                page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
              />
      </Grid>
      )}
      
      {/* Modals */}
      <PaymentModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
      
      <AutoFillFormModal 
        open={isAutoFillModalOpen} 
        onClose={() => setIsAutoFillModalOpen(false)}
        formName={formName || (selectedForm?.name || 'Form điền từ data')}
        onSubmit={handleCreateFillRequest}
      />
    </Grid>
  );
}
