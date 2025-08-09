import { useEffect, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
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
import { handleDataMappingError, handleFormError } from 'utils/errorHandler';

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
import { ErrorIcon } from 'assets/images/svg/icon';
import { ArrowRight2, Clock, Data, InfoCircle, Warning2 } from 'iconsax-react';

// ==============================|| DIENFORM - FILL IN DATA ||============================== //

export default function TabFillInData() {
  
  // States for API interactions
  const [loading, setLoading] = useState<boolean>(false);
  const [forms, setForms] = useState<FormData[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<{ title: string; description: string } | null>(null);
  
  // State for payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isAutoFillModalOpen, setIsAutoFillModalOpen] = useState<boolean>(false);
  
  // State for form inputs
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
      } catch (err: any) {
        console.error('Error fetching forms:', err);
        const msg = handleFormError(err, 'fetch');
        setError(msg);
        setErrorAlert({ title: 'Lỗi tải danh sách form', description: msg });
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
      } catch (err: any) {
        console.error('Error fetching form details:', err);
        const msg = handleFormError(err, 'fetch');
        setError(msg);
        setErrorAlert({ title: 'Lỗi tải chi tiết form', description: msg });
      }
    };
    
    fetchFormDetails();
  }, [selectedFormId]);
  
  // Helper: build alert from data-mapping error (check)
  const buildAlertForCheckDataError = (err: any): { title: string; description: string } => {
    const data = err?.response?.data ?? err;
    if (data?.sheetAccessibilityInfo?.isAccessible === false) {
      const title = 'Lỗi link Google sheet';
      const reasons = Array.isArray(data?.errors)
        ? data.errors.join(', ')
        : (typeof data?.errors === 'string' ? data.errors : '');
      const details: string[] = [];
      if (data.sheetAccessibilityInfo?.isPublic === false) details.push('sheet không công khai');
      if (!data.sheetAccessibilityInfo?.accessMethod) details.push('không có quyền truy cập');
      const descriptionParts = [] as string[];
      if (reasons) descriptionParts.push(reasons);
      if (details.length) descriptionParts.push(`Chi tiết: ${details.join(', ')}`);
      const description = descriptionParts.join('. ');
      return { title, description: description || 'Không thể truy cập Google Sheet.' };
    }
    const message = handleDataMappingError(err, 'check');
    return { title: 'Lỗi kiểm tra dữ liệu', description: message };
  };

  // Check data function
  const handleCheckData = async () => {
    if (!selectedFormId || !sheetLink) {
      const msg = 'Vui lòng chọn form và nhập link sheet';
      setError(msg);
      setErrorAlert({ title: 'Thiếu thông tin', description: msg });
      return;
    }
    
    // Validate Google Sheets URL - more flexible pattern
    const sheetUrlPattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    
    if (!sheetUrlPattern.test(sheetLink)) {
      const msg = 'Link Google Sheet không hợp lệ. Vui lòng nhập link Google Sheets (không phải Google Forms). Ví dụ: https://docs.google.com/spreadsheets/d/1ABC123.../edit';
      setError(msg);
      setErrorAlert({ title: 'Link Google Sheet không hợp lệ', description: msg });
      return;
    }
    
    setIsCheckingData(true);
    setError(null);
    setErrorAlert(null);
    
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
      const msg = handleDataMappingError(err, 'check');
      setError(msg);
      setErrorAlert(buildAlertForCheckDataError(err));
    } finally {
      setIsCheckingData(false);
    }
  };
  
  // Handle column mapping change
  const handleMappingChange = (questionId: string, rowTitle: string | null, columnIndex: number) => {
    const newMappings = new Map(columnMappings);
    const columnName = mappingData?.sheetColumns[columnIndex] || '';
    
    if (rowTitle) {
      // For grid questions, store mapping with row title
      newMappings.set(`${questionId}:${rowTitle}`, columnName);
    } else {
      // For regular questions, store mapping directly
      newMappings.set(questionId, columnName);
    }
    
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
    if (!mappingData || !selectedFormId) return;
    
    // Validate mappings - allow empty mappings for optional questions
    const mappingArray = Array.from(columnMappings.entries()).map(([questionId, columnName]) => ({
      questionId,
      columnName: columnName || null // Allow null for unmapped questions
    }));
    
    try {
    setLoading(true);
      
      const request: DataFillRequestDTO = {
        formId: selectedFormId,
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
      setSheetLink('');
      setDataChecked(false);
      setMappingData(null);
      setColumnMappings(new Map());
      setIsAutoFillModalOpen(false);
      setError(null);
      setErrorAlert(null);
      
      // Refresh form details to update the fill requests list
      if (selectedFormId) {
        try {
          const formDetails = await getFormDetail(selectedFormId);
          setSelectedForm(formDetails);
        } catch (err: any) {
          console.error('Error refreshing form details:', err);
          // Không hiển thị lỗi ở đây vì đã tạo thành công fill request
        }
      }
      
      // Show success message
      alert('Tạo yêu cầu điền form thành công!');
      
    } catch (err: any) {
      console.error('Error creating fill request:', err);
      const msg = handleDataMappingError(err, 'create');
      setError(msg);
      setErrorAlert({ title: 'Lỗi tạo yêu cầu điền form', description: msg });
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
      const msg = 'Vui lòng kiểm tra dữ liệu trước khi tạo yêu cầu điền form.';
      setError(msg);
      setErrorAlert({ title: 'Thiếu thông tin', description: msg });
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
    setFormLink('');
    setSheetLink('');
    setDataChecked(false);
    setMappingData(null);
    setColumnMappings(new Map());
    setError(null);
    setErrorAlert(null);
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {/* Form and Sheet Link Inputs */}
      <Grid size={12}>
        <MainCard title="Điền theo data có trước" sx={MAINCARD_STYLE}>
          {errorAlert && (
            <Alert color="error" variant="border" icon={<ErrorIcon />} sx={{ mb: 2 }}>
              <AlertTitle>{errorAlert.title}</AlertTitle>
              <Typography variant="h6">{errorAlert.description}</Typography>
            </Alert>
          )}
          
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
                startIcon={!isCheckingData ? <Data size={20} color="currentColor" /> : null}
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
                <Alert color="warning" icon={<Warning2 variant="Bold" />} sx={{ mb: 3 }}>
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
                <Alert color="info" icon={<InfoCircle variant="Bold" />} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Câu hỏi không tìm thấy trong sheet:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {mappingData.unmappedQuestions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              
              {/* Header Row */}
              <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      Câu hỏi
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    {/* Empty space for arrow */}
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      Cột dữ liệu liên kết
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {mappingData.questions.map((question) => (
                <Box key={question.id} sx={{ mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 5, md: 5 }}>
                      <Typography fontWeight="500">
                        {question.title}
                        {question.required && (
                          <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                            *
                          </Typography>
                        )}
                      </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 1, md: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <ArrowRight2 size={24} />
                    </Grid>
                    
                    <Grid size={{ xs: 6, md: 6 }}>
                      <FormControl fullWidth>
                        <Select
                          value={columnMappings.get(question.id) || ''}
                          onChange={(e) => handleMappingChange(question.id, null, parseInt(e.target.value, 10))}
                          displayEmpty
                          size="small"
                        >
                          <MenuItem value="">
                            - Chọn cột dữ liệu tương ứng -
                          </MenuItem>
                          {mappingData.sheetColumns.map((column) => (
                            <MenuItem key={column} value={columnMappings.get(question.id) === column ? columnMappings.get(question.id) : column}>
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
        formName={selectedForm?.name || 'Form điền từ data'}
        onSubmit={handleCreateFillRequest}
      />
    </Grid>
  );
}
