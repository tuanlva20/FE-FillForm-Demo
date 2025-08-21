import { useEffect, useRef, useState } from 'react';

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
import Link from '@mui/material/Link';
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
import { TablePagination as ReactTablePagination } from 'components/third-party/react-table';
import AutoFillFormModal from './components/AutoFillFormModal';
import PaymentModal from './components/PaymentModal';
import ScheduleFormModal from './components/ScheduleFormModal';
import FillRequestList from './components/tabfillindata/FillRequestList';
import GridQuestionMapping from './components/tabfillindata/GridQuestionMapping';

// API
import {
  checkDataMapping,
  createDataFillRequest,
  DataFillRequestDTO,
  DataMappingRequest,
  DataMappingResponse,
  FormData,
  FormDetailResponse,
  getAllUserForms,
  getFormDetail
} from 'api/form';

// assets
import { ErrorIcon, FormIcon } from 'assets/images/svg/icon';
import AlertSnackbarWithProgress from 'components/@extended/AlertSnackbarWithProgress';
import useFillRequestRealtime from 'hooks/useFillRequestRealtime';
import { ArrowRight2, Data, InfoCircle, Warning2 } from 'iconsax-react';
import { fuzzyScore, normalizeForCompare } from 'utils/stringUtils';

// ==============================|| DIENFORM - FILL IN DATA ||============================== //

export default function TabFillInData() {
  // Ref for scrolling to top
  const topRef = useRef<HTMLDivElement>(null);
  
  // States for API interactions
  const [loading, setLoading] = useState<boolean>(false);
  const [forms, setForms] = useState<FormData[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<{ title: string; description: string; showEncryption?: boolean } | null>(null);
  
  // State for payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isAutoFillModalOpen, setIsAutoFillModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [selectedDetailFormId, setSelectedDetailFormId] = useState<number | null>(null);
  
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
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  // Snackbar for prominent error display
  const [errorSnackOpen, setErrorSnackOpen] = useState<boolean>(false);
  const [errorSnackMessage, setErrorSnackMessage] = useState<string>('');

  // Helpers: ensure start/end date payloads are local day markers (match ExpectedRatio behavior)
  const toLocalDateStringAtStartOfDay = (date?: Date | null): string | undefined => {
    if (!date) return undefined;
    const local = new Date(date);
    local.setHours(0, 0, 0, 0);
    const y = local.getFullYear();
    const m = String(local.getMonth() + 1).padStart(2, '0');
    const d = String(local.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}T00:00:00`;
  };
  const toLocalDateStringAtEndOfDay = (date?: Date | null): string | undefined => {
    if (!date) return undefined;
    const local = new Date(date);
    local.setHours(23, 59, 59, 999);
    const y = local.getFullYear();
    const m = String(local.getMonth() + 1).padStart(2, '0');
    const d = String(local.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}T23:59:59`;
  };
  
  // Load forms on component mount
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      try {
        const list = await getAllUserForms();
        setForms(Array.isArray(list) ? list : []);
        
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

  // Realtime updates for fill requests of selected form
  useFillRequestRealtime(selectedFormId, setSelectedForm);

  // Helper: scroll to top of component
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };
  
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

  // Helper: build alert from create fill request error
  const buildAlertForCreateFillRequestError = (err: any): { title: string; description: string; showEncryption?: boolean } => {
    const data = err?.response?.data ?? err;
    
    // Check if this is a validation error from backend
    if (data?.errorMessage) {
      return { 
        title: 'Lỗi tạo yêu cầu điền form', 
        description: data.errorMessage,
        showEncryption: true // Show encryption suggestion for validation errors
      };
    }
    
    // Fallback to generic error handling
    const message = handleDataMappingError(err, 'create');
    return { title: 'Lỗi tạo yêu cầu điền form', description: message };
  };

  // Helper: score for grid column matching (prefer explicit containment of question + row)
  const scoreGridColumnMatch = (questionTitle: string, rowTitle: string, columnName: string): number => {
    const qNorm = normalizeForCompare(questionTitle);
    const rNorm = normalizeForCompare(rowTitle);
    const cNorm = normalizeForCompare(columnName);

    if (!qNorm || !rNorm || !cNorm) return 0;

    const bothContain = cNorm.includes(qNorm) && cNorm.includes(rNorm);
    if (bothContain) return 1;

    if (cNorm.includes(rNorm)) return 0.9;
    if (cNorm.includes(qNorm)) return 0.6;

    // fallback fuzzy
    return fuzzyScore(`${qNorm} ${rNorm}`, cNorm);
  };

  // Check data function
  const handleCheckData = async () => {
    if (!selectedFormId || !sheetLink) {
      const msg = 'Vui lòng chọn form và nhập link sheet';
      setError(msg);
      setErrorAlert({ title: 'Thiếu thông tin', description: msg });
      setTimeout(() => scrollToTop(), 100);
      return;
    }
    
    // Validate Google Sheets URL - more flexible pattern
    const sheetUrlPattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    
    if (!sheetUrlPattern.test(sheetLink)) {
      const msg = 'Link Google Sheet không hợp lệ. Vui lòng nhập link Google Sheets (không phải Google Forms). Ví dụ: https://docs.google.com/spreadsheets/d/1ABC123.../edit';
      setError(msg);
      setErrorAlert({ title: 'Link Google Sheet không hợp lệ', description: msg });
      setTimeout(() => scrollToTop(), 100);
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
      }

      // Fuzzy auto-mapping for grid + non-grid (fill only empty ones)
      const SHEET_COLUMNS = response.sheetColumns || [];
      const SHEET_COLUMNS_NORM = SHEET_COLUMNS.map((c) => normalizeForCompare(c));
      const SCORE_THRESHOLD = 0.55; // conservative
      response.questions.forEach((q) => {
        const isGrid = q.type === 'multiple_choice_grid' || q.type === 'checkbox_grid';
        if (isGrid) {
          const rows = (q.options || []).filter((opt: any) => opt?.value && String(opt.value).startsWith('row'));
          rows.forEach((row: any) => {
            const key = `${q.id}:${row.text}`;
            if (initialMappings.get(key)) return;

            let bestIdx = -1;
            let bestScore = 0;
            SHEET_COLUMNS.forEach((colName, idx) => {
              const s = scoreGridColumnMatch(q.title, row.text, colName);
              if (s > bestScore) {
                bestScore = s;
                bestIdx = idx;
              }
            });
            // Hạ ngưỡng cho grid vì tên cột thường chứa dạng [Row]
            const GRID_THRESHOLD = 0.5;
            if (bestIdx >= 0 && bestScore >= GRID_THRESHOLD) {
              initialMappings.set(key, SHEET_COLUMNS[bestIdx]);
            } else {
              if (!initialMappings.has(key)) initialMappings.set(key, '');
            }
          });
        } else {
          if (initialMappings.get(q.id)) return;
          let bestIdx = -1;
          let bestScore = 0;
          const targetNorm = normalizeForCompare(q.title);
          SHEET_COLUMNS_NORM.forEach((normName, idx) => {
            const s = fuzzyScore(targetNorm, normName);
            if (s > bestScore) {
              bestScore = s;
              bestIdx = idx;
            }
          });
          if (bestIdx >= 0 && bestScore >= SCORE_THRESHOLD) {
            initialMappings.set(q.id, SHEET_COLUMNS[bestIdx]);
          } else {
            if (!initialMappings.has(q.id)) initialMappings.set(q.id, '');
          }
        }
      });
      
      setColumnMappings(initialMappings);
      setDataChecked(true);
      
    } catch (err: any) {
      // Handle specific error types
      const msg = handleDataMappingError(err, 'check');
      setError(msg);
      setErrorAlert(buildAlertForCheckDataError(err));
      setTimeout(() => scrollToTop(), 100);
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
        startDate: toLocalDateStringAtStartOfDay(formValues.startDate),
        endDate: toLocalDateStringAtEndOfDay(formValues.endDate || formValues.startDate)
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
      setErrorSnackMessage('Tạo yêu cầu điền form thành công!');
      setErrorSnackOpen(true);
      
    } catch (err: any) {
      console.error('Error creating fill request:', err);
      const errorDetails = buildAlertForCreateFillRequestError(err);
      setError(errorDetails.description);
      setErrorAlert(errorDetails);
      setErrorSnackMessage(errorDetails.description);
      setErrorSnackOpen(true);
      
      // Scroll to top to show error alert
      setTimeout(() => {
        scrollToTop();
      }, 100);
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
      setErrorSnackMessage(msg);
      setErrorSnackOpen(true);
      setTimeout(() => scrollToTop(), 100);
      return;
    }
    setIsAutoFillModalOpen(true);
  };
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPageIndex(value - 1);
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPageIndex(0);
  };

  const getTableState = () => ({
    pagination: { pageIndex, pageSize },
    columnVisibility: {},
    columnOrder: [],
    columnPinning: { left: [], right: [] },
    rowSelection: {},
    sorting: [],
    columnFilters: [],
    globalFilter: '',
    expanded: {},
    columnSizing: {},
    columnSizingInfo: {
      startOffset: null,
      columnSizingStart: [],
      isResizingColumn: false,
      deltaOffset: null,
      deltaPercentage: null,
      startSize: null
    },
    rowPinning: { top: [], bottom: [] },
    grouping: []
  } as any);

  // Enable schedule modal opening from list
  const handleOpenScheduleModal = (requestId: string) => {
    setSelectedDetailFormId(parseInt(requestId) || null);
    setIsScheduleModalOpen(true);
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
    <Grid container spacing={GRID_COMMON_SPACING} ref={topRef}>
      {/* Form and Sheet Link Inputs */}
      <Grid size={12}>
        <MainCard title="Điền theo data có trước" sx={MAINCARD_STYLE}>
          {errorAlert && (
            <Alert color="error" variant="border" icon={<ErrorIcon />} sx={{ mb: 2 }}>
              <AlertTitle>{errorAlert.title}</AlertTitle>
              <Typography variant="h6" sx={{ mb: errorAlert.showEncryption ? 2 : 0 }}>
                {errorAlert.description}
              </Typography>
              {errorAlert.showEncryption && (
                <Box sx={{ mt: 1, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1, border: '1px solid', borderColor: 'primary.light' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="primary.main" fontWeight="600">
                      💡 Gợi ý:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bạn có thể sử dụng
                    </Typography>
                    <Link 
                      href="http://localhost:3000/ma-hoa-data" 
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        fontWeight: 600, 
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Data mã hóa
                    </Link>
                    <Typography variant="body2" color="text.secondary">
                      để chuẩn hóa dữ liệu và tránh lỗi validation.
                    </Typography>
                  </Stack>
                </Box>
              )}
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

              {mappingData.questions
                .sort((a, b) => a.position - b.position)
                .map((question) => {
                const isGridQuestion = question.type === 'multiple_choice_grid' || question.type === 'checkbox_grid';
                const getColumnIndex = (columnName: string) => mappingData.sheetColumns.findIndex((c) => c === columnName);

                if (isGridQuestion) {
                  return (
                    <Box key={question.id} sx={{ mb: 3 }}>
                      <GridQuestionMapping
                        question={question as any}
                        sheetColumns={mappingData.sheetColumns}
                        columnMappings={columnMappings}
                        onMappingChange={handleMappingChange}
                      />
                    </Box>
                  );
                }

                // Non-grid question (single mapping)
                return (
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
                            value={getColumnIndex(columnMappings.get(question.id) || '')}
                            onChange={(e) => handleMappingChange(question.id, null, Number(e.target.value))}
                            displayEmpty
                            size="small"
                          >
                            <MenuItem value={-1}>
                              - Chọn cột dữ liệu tương ứng -
                            </MenuItem>
                            {mappingData.sheetColumns.map((column, idx) => (
                              <MenuItem key={`${question.id}:${column}`} value={idx}>
                                {column}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FormIcon /></Box>}
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
            fillRequests={(selectedForm.fillRequests || []).filter(
              (req) => !req.answerDistributions || req.answerDistributions.length === 0
            )}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            page={pageIndex + 1}
            rowsPerPage={pageSize}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSchedule={handleOpenScheduleModal}
          />
          
          <Divider />
          <Box sx={{ p: 2 }}>
            <ReactTablePagination
              setPageSize={setPageSize as any}
              setPageIndex={setPageIndex as any}
              getState={getTableState as any}
              getPageCount={() => Math.ceil(((selectedForm.fillRequests || []).filter(
                (req) => !req.answerDistributions || req.answerDistributions.length === 0
              ).length) / pageSize)}
              initialPageSize={10}
            />
          </Box>
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

      <ScheduleFormModal 
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        formId={selectedDetailFormId}
      />

      {/* Prominent error snackbar */}
      <AlertSnackbarWithProgress
        open={errorSnackOpen}
        message={errorSnackMessage}
        onClose={() => setErrorSnackOpen(false)}
        severity={errorSnackMessage.toLowerCase().includes('thành công') ? 'success' : 'error'}
      />
    </Grid>
  );
}
