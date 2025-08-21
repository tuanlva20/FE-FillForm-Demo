import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-imports
import AlertSnackbarWithProgress from 'components/@extended/AlertSnackbarWithProgress';
import MainCard from 'components/MainCard';
import DebouncedMultilineTextField from 'components/form/DebouncedMultilineTextField';
import PercentInput from 'components/form/PercentInput';
import { TablePagination as ReactTablePagination } from 'components/third-party/react-table';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';
import { handleFormError, testErrorStructure } from 'utils/errorHandler';
import { deduplicateAnswerDistributions, validateTextQuestionDistributions } from 'utils/formUtils';
import AILoadingDialog from './components/AILoadingDialog';
import AISuggestionModal from './components/AISuggestionModal';
import AutoFillFormModal from './components/AutoFillFormModal';
import FormDetailModal from './components/FormDetailModal';
import ScheduleFormModal from './components/ScheduleFormModal';
import ExpectedRatioFormList from './components/tabfillexpectedRatio/FormList';
import CheckboxGridPercentInput from './components/tabfillexpectedRatio/elements/CheckboxGridPercentInput';
import MultipleChoiceGridPercentInput from './components/tabfillexpectedRatio/elements/MultipleChoiceGridPercentInput';
import QuestionGroup from './components/tabfillexpectedRatio/elements/QuestionGroup';

// API
import {
  AnswerDistribution,
  createFillRequest,
  FillRequestDTO,
  FormData,
  FormDetailResponse,
  getAllUserForms,
  getFormDetail
} from 'api/form';

// iconsax-react
import { AISuggestionIcon, ErrorIcon, FormIcon } from 'assets/images/svg/icon';
import useFillRequestRealtime from 'hooks/useFillRequestRealtime';
import { InfoCircle, Refresh } from 'iconsax-react';

// types
import { AISuggestionRequest } from 'types/ai-suggestion';

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

// ==============================|| DIENFORM - FILL BY EXPECTED RATIO ||============================== //

export default function TabFillExpectedRatio() {
  // State for forms list
  const [forms, setForms] = useState<FormData[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormDetailResponse | null>(null);
  const [formLink, setFormLink] = useState<string>('');
  
  // State for question options percentages
  const [questionOptions, setQuestionOptions] = useState<Map<string, Map<string, number>>>(new Map());
  
  // State for tracking custom data checkboxes and text
  const [customData, setCustomData] = useState<Map<string, { useCustomData: boolean, data: string }>>(new Map());
  
  // State for tracking date input requirements
  const [dateInputs, setDateInputs] = useState<Map<string, { useCustomData: boolean, data: string }>>(new Map());
  
  // State for tracking Other option free text per question
  const [otherOptionInputs, setOtherOptionInputs] = useState<Map<string, string>>(new Map());
  
  // State for balance errors
  const [balanceErrors, setBalanceErrors] = useState<Map<string, string>>(new Map());
  
  // State for modals
  const [isAutoFillModalOpen, setIsAutoFillModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailFormId, setSelectedDetailFormId] = useState<number | null>(null);
  const [selectedFillRequest, setSelectedFillRequest] = useState<FillRequestDTO | null>(null);
  
  // State for loading
  const [loading, setLoading] = useState<boolean>(false);
  const [formDetailLoading, setFormDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Thêm state cho alert popup
  const [alertPopup, setAlertPopup] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  
  // Snackbar for prominent success/error display
  const [errorSnackOpen, setErrorSnackOpen] = useState<boolean>(false);
  const [errorSnackMessage, setErrorSnackMessage] = useState<string>('');
  
  // State to track if edit mode is active
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingFillRequest, setIsEditingFillRequest] = useState<boolean>(false);
  
  // Thêm state lưu giá trị grid cho từng câu hỏi
  type GridValues = Map<string, Map<string, Map<string, number>>>; // questionId -> rowId -> optionId -> percentage
  const [gridValues, setGridValues] = useState<GridValues>(new Map());
  
  // Thêm state lưu trạng thái loading cho AI gợi ý
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // State cho AI Suggestion Modal
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
  
  // State for AI data filling loading dialog
  const [isAiDataFillingLoading, setIsAiDataFillingLoading] = useState(false);
  
  // State for testing section feature
  const [showSectionTest, setShowSectionTest] = useState(false);
  const [showSimpleTest, setShowSimpleTest] = useState(false);
  
  // Pagination state
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
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
  
  // Check if there are any grid validation errors
  const hasGridErrors = useMemo(() => {
    if (!selectedForm) return false;
    
    return selectedForm.questions.some(question => {
      if (question.type !== 'multiple_choice_grid' && question.type !== 'checkbox_grid') {
        return false;
      }
      
      const grid = gridValues.get(question.id);
      if (!grid) return false;
      
      // Check if any row has total != 100%
      return Array.from(grid.values()).some(colMap => {
        const total = Array.from(colMap.values()).reduce((sum, percent) => sum + (percent || 0), 0);
        return total !== 100;
      });
    });
  }, [selectedForm, gridValues]);

  // Load form list on component mount
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const list = await getAllUserForms();
        setForms(Array.isArray(list) ? list : []);
      } catch (err: any) {
        console.error('Error fetching forms:', err);
        setError(handleFormError(err, 'fetch'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchForms();
  }, []);
  
  // Load form details when form is selected
  useEffect(() => {
    if (!selectedFormId) return;
    
    const fetchFormDetails = async () => {
      setFormDetailLoading(true);
      setError(null);
      
      try {
        const formDetails = await getFormDetail(selectedFormId);
        setSelectedForm(formDetails);
        setFormLink(formDetails.editLink);
        
        // Initialize question options percentages
        const newQuestionOptions = new Map<string, Map<string, number>>();
        const newCustomData = new Map<string, { useCustomData: boolean, data: string }>();
        const newDateInputs = new Map<string, { useCustomData: boolean, data: string }>();
        
        formDetails.questions.forEach(question => {
          const optionsMap = new Map<string, number>();
          
          question.options.forEach(option => {
            // Set default percentage to 0
            optionsMap.set(option.id, 0);
          });
          
          newQuestionOptions.set(question.id, optionsMap);
          
          // Initialize custom data state for text fields
          if (question.type === 'text') {
            newCustomData.set(question.id, { useCustomData: false, data: '' });
          }

          // Initialize date input state for date fields
          if (question.type === 'date') {
            newDateInputs.set(question.id, { useCustomData: false, data: '' });
          }
        });
        // Reset grid values for grid questions
        const newGridValues = new Map<string, Map<string, Map<string, number>>>();
        formDetails.questions.forEach(question => {
          if (question.type === 'multiple_choice_grid' || question.type === 'checkbox_grid') {
            newGridValues.set(question.id, new Map());
          }
        });
        setQuestionOptions(newQuestionOptions);
        setCustomData(newCustomData);
        setDateInputs(newDateInputs);
        setGridValues(newGridValues);
        setOtherOptionInputs(new Map());
        setIsEditing(false);
        validatePercentages(newQuestionOptions);
      } catch (err: any) {
        console.error('Error fetching form details:', err);
        setError(handleFormError(err, 'fetch'));
      } finally {
        setFormDetailLoading(false);
      }
    };
    
    fetchFormDetails();
  }, [selectedFormId]);

  // Realtime updates for fill requests of selected form
  useFillRequestRealtime(selectedFormId, setSelectedForm);
  
  // Validate that percentages for each question add up to exactly 100%
  const validatePercentages = (options: Map<string, Map<string, number>>) => {
    const newErrors = new Map<string, string>();
    
    options.forEach((optionMap, questionId) => {
      const qType = selectedForm?.questions.find(q => q.id === questionId)?.type;
      // Bỏ validate cho các loại không phải grid, không phải text/date/time
      if (
        qType === 'text' ||
        qType === 'date' ||
        qType === 'time' ||
        qType === 'multiple_choice_grid' ||
        qType === 'checkbox_grid'
      ) {
        return;
      }
      let totalPercentage = 0;
      optionMap.forEach(percentage => {
        totalPercentage += percentage || 0; // Add 0 if percentage is undefined or null
      });
      // Round to handle floating point precision issues
      const roundedTotal = Math.round(totalPercentage * 10) / 10;
      if (roundedTotal > 100) {
        newErrors.set(questionId, `Tổng tỉ lệ vượt quá 100%. Hiện tại: ${roundedTotal}%`);
      } else if (roundedTotal < 100) {
        newErrors.set(questionId, `Tổng tỉ lệ nên = 100%. Hiện tại: ${roundedTotal}%`);
      }
    });
    setBalanceErrors(newErrors);
    return newErrors.size === 0;
  };

  // NOTE: We validate immediately for realtime feedback in alert
  const validatePercentagesDebounced = useMemo(() => {
    return (opts: Map<string, Map<string, number>>) => {
      validatePercentages(opts);
    };
  }, [selectedForm]);
  
  // Handle form selection change
  const handleFormChange = (event: SelectChangeEvent) => {
    const formId = event.target.value as string;
    setSelectedFormId(formId || null);
    setSelectedForm(null);
    setFormLink('');
    setQuestionOptions(new Map());
    setCustomData(new Map());
    setDateInputs(new Map());
    setGridValues(new Map());
    setBalanceErrors(new Map());
    setIsEditing(false);
    setIsEditingFillRequest(false);
    setOtherOptionInputs(new Map());
    setPageIndex(0);
  };
  
  // Handle option percentage change
  const handlePercentageChange = (questionId: string, optionId: string, value: number) => {
    // Don't allow negative values
    if (value < 0) return;
    
    setIsEditing(true);
    const newQuestionOptions = new Map(questionOptions);
    
    if (newQuestionOptions.has(questionId)) {
      const optionMap = new Map(newQuestionOptions.get(questionId));
      optionMap.set(optionId, value);
      newQuestionOptions.set(questionId, optionMap);
      setQuestionOptions(newQuestionOptions);
      
      // Validate percentages immediately for realtime alert updates
      validatePercentagesDebounced(newQuestionOptions);
    }
  };
  
  // Handle custom data toggle change
  const handleCustomDataToggle = (questionId: string, checked: boolean) => {
    setIsEditing(true);
    const newCustomData = new Map(customData);
    
    if (newCustomData.has(questionId)) {
      const currentData = newCustomData.get(questionId)!;
      newCustomData.set(questionId, { ...currentData, useCustomData: checked });
      setCustomData(newCustomData);
    }
  };
  
  // Handle custom data text change - optimized to prevent unnecessary re-renders
  const handleCustomDataChange = useCallback((questionId: string, value: string) => {
    setIsEditing(true);
    setCustomData(prev => {
      const currentData = prev.get(questionId);
      if (!currentData) return prev;
      
      // Only update if value actually changed
      if (currentData.data === value) return prev;
      
      const newCustomData = new Map(prev);
      newCustomData.set(questionId, { ...currentData, data: value });
      return newCustomData;
    });
  }, []);

  // Handle date input toggle
  const handleDateInputToggle = (questionId: string, checked: boolean) => {
    setIsEditing(true);
    const newDateInputs = new Map(dateInputs);
    
    if (newDateInputs.has(questionId)) {
      const currentData = newDateInputs.get(questionId)!;
      newDateInputs.set(questionId, { ...currentData, useCustomData: checked });
      setDateInputs(newDateInputs);
    }
  };
  
  // Handle date input data change - optimized to prevent unnecessary re-renders
  const handleDateInputChange = useCallback((questionId: string, value: string) => {
    setIsEditing(true);
    setDateInputs(prev => {
      const currentData = prev.get(questionId);
      if (!currentData) return prev;
      
      // Only update if value actually changed
      if (currentData.data === value) return prev;
      
      const newDateInputs = new Map(prev);
      newDateInputs.set(questionId, { ...currentData, data: value });
      return newDateInputs;
    });
  }, []);
  
  // Open the auto fill form modal
  const handleOpenAutoFillModal = () => {
    setIsAutoFillModalOpen(true);
  };
  
  // Open the schedule form modal
  const handleOpenScheduleModal = (formId: string) => {
    setSelectedDetailFormId(parseInt(formId) || null);
    setIsScheduleModalOpen(true);
  };
  
  // Open the form detail modal
  const handleOpenDetailModal = (formId: string) => {
    console.log('handleOpenDetailModal called with ID:', formId);
    
    if (!selectedForm) return;
    
    // Find the fill request with the given ID - use direct string comparison
    const fillRequest = selectedForm.fillRequests.find(req => req.id === formId);
    
    console.log('Found fillRequest:', fillRequest);
    
    if (fillRequest) {
      setSelectedFillRequest(fillRequest);
      setIsDetailModalOpen(true);
    }
  };
  
  // Handle edit fill request - loads answer distributions back into the form
  const handleEditFillRequest = (formId: string) => {
    console.log('handleEditFillRequest called with ID:', formId);
    console.log('Available fillRequests:', selectedForm?.fillRequests?.map(req => ({
      id: req.id,
      hasAnswerDistributions: !!req.answerDistributions,
      answerDistributionsLength: req.answerDistributions?.length || 0
    })));
    
    if (!selectedForm) return;
    
    // Find the fill request with the given ID - use direct string comparison
    const fillRequest = selectedForm.fillRequests.find(req => req.id === formId);
    
    console.log('Found fillRequest:', fillRequest);
    console.log('answerDistributions:', fillRequest?.answerDistributions);
    console.log('answerDistributions length:', fillRequest?.answerDistributions?.length);
    
    if (!fillRequest || !fillRequest.answerDistributions || fillRequest.answerDistributions.length === 0) {
      console.log('Early return: no fillRequest or no answerDistributions or empty answerDistributions');
      return;
    }
    
    // Set to editing mode
    setIsEditing(true);
    setIsEditingFillRequest(true);
    
    // Create new question options map with values from the fill request
    const newQuestionOptions = new Map<string, Map<string, number>>();
    const newCustomData = new Map<string, { useCustomData: boolean, data: string }>();
    const newDateInputs = new Map<string, { useCustomData: boolean, data: string }>();
    const newGridValues = new Map<string, Map<string, Map<string, number>>>();
    
    // First initialize all options to 0
    selectedForm.questions.forEach(question => {
      const optionsMap = new Map<string, number>();
      
      question.options.forEach(option => {
        optionsMap.set(option.id, 0);
      });
      
      newQuestionOptions.set(question.id, optionsMap);
      
      if (question.type === 'text') {
        newCustomData.set(question.id, { useCustomData: false, data: '' });
      }
      
      if (question.type === 'date') {
        newDateInputs.set(question.id, { useCustomData: false, data: '' });
      }
      
      if (question.type === 'multiple_choice_grid' || question.type === 'checkbox_grid') {
        newGridValues.set(question.id, new Map());
      }
    });
    
    // Group distributions by question and sort by positionIndex
    const distributionsByQuestion = new Map<string, any[]>();
    fillRequest.answerDistributions.forEach(dist => {
      if (!distributionsByQuestion.has(dist.questionId)) {
        distributionsByQuestion.set(dist.questionId, []);
      }
      distributionsByQuestion.get(dist.questionId)!.push(dist);
    });
    
    // Sort each question's distributions by positionIndex
    distributionsByQuestion.forEach((dists, questionId) => {
      dists.sort((a, b) => (a.positionIndex || 0) - (b.positionIndex || 0));
    });
    
    // Process each question's distributions
    distributionsByQuestion.forEach((dists, questionId) => {
      const question = selectedForm.questions.find(q => q.id === questionId);
      if (!question) return;
      
      console.log(`Processing question ${questionId} (${question.type}):`, dists);
      
      if (question.type === 'text') {
        // For text questions, collect all valueStrings and join them
        const textLines = dists
          .filter(dist => dist.valueString)
          .map(dist => dist.valueString)
          .filter(Boolean);
        
        if (textLines.length > 0) {
          newCustomData.set(questionId, { 
            useCustomData: true, 
            data: textLines.join('\n') 
          });
        }
      } else if (question.type === 'date') {
        // For date questions, collect all valueStrings and join them
        const dateLines = dists
          .filter(dist => dist.valueString)
          .map(dist => dist.valueString)
          .filter(Boolean);
        
        if (dateLines.length > 0) {
          newDateInputs.set(questionId, { 
            useCustomData: true, 
            data: dateLines.join('\n') 
          });
        }
      } else if (question.type === 'multiple_choice_grid') {
        // For multiple choice grid questions, use option.value as keys
        const gridMap = new Map<string, Map<string, number>>();
        
        dists.forEach(dist => {
          if (dist.rowId && dist.optionId) {
            // Find row and column option by ID
            const rowOption = question.options.find(opt => opt.id === dist.rowId);
            const colOption = question.options.find(opt => opt.id === dist.optionId);
            
            if (rowOption && colOption) {
              const rowKey = rowOption.value; // Use value for multiple choice grid
              const colKey = colOption.value; // Use value for multiple choice grid
              
              if (!gridMap.has(rowKey)) {
                gridMap.set(rowKey, new Map());
              }
              const colMap = gridMap.get(rowKey)!;
              colMap.set(colKey, dist.percentage);
            }
          }
        });
        
        console.log(`Multiple choice grid map for ${questionId}:`, Array.from(gridMap.entries()));
        newGridValues.set(questionId, gridMap);
      } else if (question.type === 'checkbox_grid') {
        // For checkbox grid questions, use option.id as keys
        const gridMap = new Map<string, Map<string, number>>();
        
        dists.forEach(dist => {
          if (dist.rowId && dist.optionId) {
            // Find row and column option by ID
            const rowOption = question.options.find(opt => opt.id === dist.rowId);
            const colOption = question.options.find(opt => opt.id === dist.optionId);
            
            if (rowOption && colOption) {
              const rowKey = rowOption.id; // Use id for checkbox grid
              const colKey = colOption.id; // Use id for checkbox grid
              
              if (!gridMap.has(rowKey)) {
                gridMap.set(rowKey, new Map());
              }
              const colMap = gridMap.get(rowKey)!;
              colMap.set(colKey, dist.percentage);
            }
          }
        });
        
        console.log(`Checkbox grid map for ${questionId}:`, Array.from(gridMap.entries()));
        newGridValues.set(questionId, gridMap);
      } else {
        // For regular multiple choice questions
        dists.forEach(dist => {
          if (dist.optionId) {
            const questionMap = newQuestionOptions.get(questionId);
            if (questionMap) {
              const prev = questionMap.get(dist.optionId) || 0;
              questionMap.set(dist.optionId, prev + dist.percentage);
              newQuestionOptions.set(questionId, questionMap);
            }
          }
        });
      }
    });
    
    console.log('Setting grid values:', Array.from(newGridValues.entries()));
    console.log('Setting question options:', Array.from(newQuestionOptions.entries()));
    console.log('Setting custom data:', Array.from(newCustomData.entries()));
    console.log('Setting date inputs:', Array.from(newDateInputs.entries()));
    
    setQuestionOptions(newQuestionOptions);
    setCustomData(newCustomData);
    setDateInputs(newDateInputs);
    setGridValues(newGridValues);
    
    // Prefill Other inputs from previous fill request if present (aggregate multiple lines)
    const otherLinesMap = new Map<string, string[]>();
    fillRequest.answerDistributions.forEach((dist) => {
      let qId: string | undefined = dist.questionId;
      if (!qId && dist.option?.id) {
        const qFound = selectedForm.questions.find((q) => q.options.some((op) => op.id === dist.option!.id));
        if (qFound) qId = qFound.id;
      }
      if (!qId) return;
      const question = selectedForm.questions.find((q) => q.id === qId);
      if (!question) return;
      const optId = dist.optionId || dist.option?.id;
      const opt = question.options.find((o) => o.id === optId);
      if (opt && opt.value === '__other_option__' && typeof dist.valueString === 'string') {
        const arr = otherLinesMap.get(qId) || [];
        arr.push(dist.valueString);
        otherLinesMap.set(qId, arr);
      }
    });
    const newOtherInputs = new Map<string, string>();
    otherLinesMap.forEach((lines, qid) => newOtherInputs.set(qid, lines.join('\n')));
    setOtherOptionInputs(newOtherInputs);
    
    // Validate the percentages
    validatePercentages(newQuestionOptions);
    
    // Scroll to the top of the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle save changes
  const handleSaveChanges = async () => {
    // Implementation for saving changes
    console.log('Saving changes...');
    setIsEditing(false);
  };
  
  // Handle Other option text change - optimized to prevent unnecessary re-renders
  const handleOtherInputChange = useCallback((questionId: string, value: string) => {
    setIsEditing(true);
    setOtherOptionInputs(prev => {
      // Only update if value actually changed
      if (prev.get(questionId) === value) return prev;
      
      const next = new Map(prev);
      next.set(questionId, value);
      return next;
    });
  }, []);
  
  // Handle reset form
  const handleCancel = () => {
    // Reset form to original state
    if (selectedFormId) {
      const fetchFormDetails = async () => {
        try {
          const formDetails = await getFormDetail(selectedFormId);
          setSelectedForm(formDetails);
          
          // Reset question options percentages
          const newQuestionOptions = new Map<string, Map<string, number>>();
          const newCustomData = new Map<string, { useCustomData: boolean, data: string }>();
          const newDateInputs = new Map<string, { useCustomData: boolean, data: string }>();
          const newGridValues = new Map<string, Map<string, Map<string, number>>>();
          
          formDetails.questions.forEach(question => {
            const optionsMap = new Map<string, number>();
            
            question.options.forEach(option => {
              optionsMap.set(option.id, 0);
            });
            
            newQuestionOptions.set(question.id, optionsMap);
            
            if (question.type === 'text') {
              newCustomData.set(question.id, { useCustomData: false, data: '' });
            }

            if (question.type === 'date') {
              newDateInputs.set(question.id, { useCustomData: false, data: '' });
            }
            
            if (question.type === 'multiple_choice_grid' || question.type === 'checkbox_grid') {
              newGridValues.set(question.id, new Map());
            }
          });
          
          setQuestionOptions(newQuestionOptions);
          setCustomData(newCustomData);
          setDateInputs(newDateInputs);
          setGridValues(newGridValues);
          setOtherOptionInputs(new Map());
          setIsEditing(false);
          setIsEditingFillRequest(false);
          validatePercentages(newQuestionOptions);
        } catch (err: any) {
          console.error('Error resetting form details:', err);
          setAlertPopup({ open: true, message: handleFormError(err, 'fetch') });
        }
      };
      
      fetchFormDetails();
    }
  };
  
  // Force sync all textarea values before submitting
  const forceSyncTextareas = () => {
    console.log('🔍 Force syncing all textareas...');
    // Trigger blur events on all textareas to ensure they sync their values
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.dispatchEvent(new Event('blur', { bubbles: true }));
    });
    console.log('🔍 Force sync completed');
  };

  // Handle creating fill request
  const handleCreateFillRequest = async (formValues: {
    submissionCount: number;
    pricePerSurvey: number;
    isHumanLike: boolean;
    startDate?: Date;
    endDate?: Date;
  }) => {
    if (!selectedFormId || !selectedForm) return;
    
    // Force sync all textareas before processing
    forceSyncTextareas();
    
    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    try {
      // Prepare answer distributions
      const answerDistributions: AnswerDistribution[] = [];
      
      // Debug: Log otherOptionInputs state
      console.log('🔍 otherOptionInputs state at API call:', otherOptionInputs);
      console.log('🔍 otherOptionInputs size:', otherOptionInputs.size);
      otherOptionInputs.forEach((value, key) => {
        console.log('🔍 otherOptionInputs entry:', key, 'value:', value, 'length:', value.length);
      });
      
      // Track validation errors
      let validationErrors: string[] = [];
      
      // Add multiple-choice questions
      questionOptions.forEach((optionMap, questionId) => {
        const question = selectedForm.questions.find(q => q.id === questionId);
        
        // For multiple-choice questions
        if (question && question.type !== 'text' && question.type !== 'date') {
          optionMap.forEach((percentage, optionId) => {
            if (percentage > 0) {
              const optMeta = question.options.find((o) => o.id === optionId);
              // Skip if option id does not belong to this question (avoid cross-form/cross-question ids)
              if (!optMeta) return;
              if (optMeta.value === '__other_option__') {
                const raw = otherOptionInputs.get(questionId) || '';
                const lines = raw
                  .split('\n')
                  .map((l) => l.trim())
                  .filter((l) => l.length > 0);
                
                // Remove duplicates from lines to prevent duplicate entries
                const uniqueLines = Array.from(new Set(lines));
                
                if (uniqueLines.length > 0) {
                  const per = percentage / uniqueLines.length;
                  uniqueLines.forEach((line, index) => {
                    const payload: any = {
                      questionId,
                      optionId,
                      percentage: per,
                      valueString: line,
                      positionIndex: index
                    };
                    answerDistributions.push(payload);
                  });
                } else {
                  // No user-provided lines; let BE generate a text for the total percentage
                  const payload: any = { questionId, optionId, percentage };
                  answerDistributions.push(payload);
                }
              } else {
                // Normal non-other option
              const payload: any = { questionId, optionId, percentage };
                answerDistributions.push(payload);
              }
            }
          });
        }
      });
      

      
      // Trong handleCreateFillRequest, bổ sung logic cho grid
      selectedForm.questions.forEach(question => {
        if (question.type === 'multiple_choice_grid') {
          const gridMap = gridValues.get(question.id);
          if (gridMap) {
            // Validate that each row totals to 100%
            gridMap.forEach((colMap, rowValue) => {
              const total = Array.from(colMap.values()).reduce((sum, percent) => sum + (percent || 0), 0);
              if (total !== 100) {
                const rowOption = question.options.find(opt => opt.value === rowValue);
                validationErrors.push(`Câu hỏi "${question.title}" - "${rowOption?.text}" có tổng tỉ lệ = ${total}% (cần = 100%)`);
              }
            });
            
            gridMap.forEach((colMap, rowValue) => {
              // Map rowValue (option.value) sang rowOption.id
              const rowOption = question.options.find(opt => opt.value === rowValue && opt.value.startsWith('row'));
              if (!rowOption) return;
              colMap.forEach((percentage, colValue) => {
                // Map colValue (option.value) sang colOption.id
                const colOption = question.options.find(opt => opt.value === colValue && !opt.value.startsWith('row'));
                if (!colOption) return;
                if (percentage > 0) {
                  const payload: any = {
                    questionId: question.id,
                    rowId: rowOption.id,
                    optionId: colOption.id,
                    percentage
                  };
                  answerDistributions.push(payload);
                }
              });
            });
          }
        } else if (question.type === 'checkbox_grid') {
          const gridMap = gridValues.get(question.id);
          if (gridMap) {
            // Validate that each row totals to 100%
            gridMap.forEach((colMap, rowId) => {
              const total = Array.from(colMap.values()).reduce((sum, percent) => sum + (percent || 0), 0);
              if (total !== 100) {
                const rowOption = question.options.find(opt => opt.id === rowId);
                validationErrors.push(`Câu hỏi "${question.title}" - "${rowOption?.text}" có tổng tỉ lệ = ${total}% (cần = 100%)`);
              }
            });
            
            gridMap.forEach((colMap, rowId) => {
              colMap.forEach((percentage, optionId) => {
                if (percentage > 0) {
                  const payload: any = {
                    questionId: question.id,
                    rowId,
                    optionId,
                    percentage
                  };
                  answerDistributions.push(payload);
                }
              });
            });
          }
        } else if (question.type === 'text') {
          const customDataEntry = customData.get(question.id);
          if (customDataEntry && customDataEntry.useCustomData && customDataEntry.data.trim()) {
            const lines = customDataEntry.data
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
            
            // Remove duplicates from lines to prevent duplicate entries
            const uniqueLines = Array.from(new Set(lines));
            
            // For email fields, validate each line is a valid email
            if (question.title.toLowerCase().includes('email')) {
              const invalidEmails = uniqueLines.filter(line => !emailRegex.test(line));
              if (invalidEmails.length > 0) {
                validationErrors.push(`Câu hỏi "${question.title}" có ${invalidEmails.length} email không hợp lệ`);
              }
            }
            
            // Create a separate entry for each unique line with proper positionIndex
            uniqueLines.forEach((line, index) => {
              const payload: any = {
                questionId: question.id,
                optionId: null,
                percentage: 100 / uniqueLines.length,
                valueString: line,
                positionIndex: index
              };
              answerDistributions.push(payload);
            });
          } else {
            // Default entry with no valueString - only add if no text entries exist for this question
            const hasTextEntries = answerDistributions.some(dist => 
              dist.questionId === question.id && dist.optionId === null && dist.valueString
            );
            
            if (!hasTextEntries) {
              const payload: any = {
                questionId: question.id,
                optionId: null,
                percentage: 0
              };
              answerDistributions.push(payload);
            }
          }
        } else if (question.type === 'date') {
          const dateInputEntry = dateInputs.get(question.id);
          if (dateInputEntry && dateInputEntry.useCustomData && dateInputEntry.data.trim()) {
            const lines = dateInputEntry.data
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
            
            // Remove duplicates from lines to prevent duplicate entries
            const uniqueLines = Array.from(new Set(lines));
            
            // Validate date format
            const invalidDates = uniqueLines.filter(line => !line.match(/^\d{4}-\d{2}-\d{2}$/));
            if (invalidDates.length > 0) {
              validationErrors.push(`Câu hỏi "${question.title}" có ${invalidDates.length} ngày không đúng định dạng YYYY-MM-DD`);
            }
            
            // Create a separate entry for each unique date
            uniqueLines.forEach((line, index) => {
              const payload: any = {
                questionId: question.id,
                optionId: null,
                percentage: 100 / uniqueLines.length,
                valueString: line,
                positionIndex: index
              };
              answerDistributions.push(payload);
            });
          } else {
            // Default entry with no valueString - only add if no date entries exist for this question
            const hasDateEntries = answerDistributions.some(dist => 
              dist.questionId === question.id && dist.optionId === null && dist.valueString
            );
            
            if (!hasDateEntries) {
              const payload: any = {
                questionId: question.id,
                optionId: null,
                percentage: 0
              };
              answerDistributions.push(payload);
            }
          }
        }
      });
      
      // If there are validation errors, show them and don't submit
      if (validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
        return;
      }
      
      // Deduplicate answer distributions to prevent duplicates
      // Note: validateTextQuestionDistributions only affects text questions (optionId === null)
      // Other options (like "other" option) are handled by deduplicateAnswerDistributions
      const cleanedAnswerDistributions = validateTextQuestionDistributions(answerDistributions);
      const finalAnswerDistributions = deduplicateAnswerDistributions(cleanedAnswerDistributions);
      
      console.log('🔍 Deduplicate Debug Info:');
      console.log('Original answerDistributions count:', answerDistributions.length);
      console.log('Cleaned answerDistributions count:', cleanedAnswerDistributions.length);
      console.log('Final answerDistributions count:', finalAnswerDistributions.length);
      
      // Log details about text questions to help debug
      const textQuestions = answerDistributions.filter(d => d.optionId === null && d.valueString);
      const finalTextQuestions = finalAnswerDistributions.filter(d => d.optionId === null && d.valueString);
      console.log('Text questions before deduplicate:', textQuestions.length);
      console.log('Text questions after deduplicate:', finalTextQuestions.length);
      
      // Log details about "other" options to help debug
      const otherOptions = answerDistributions.filter(d => d.optionId && d.valueString);
      const finalOtherOptions = finalAnswerDistributions.filter(d => d.optionId && d.valueString);
      console.log('Other options before deduplicate:', otherOptions.length);
      console.log('Other options after deduplicate:', finalOtherOptions.length);
      
      if (textQuestions.length !== finalTextQuestions.length) {
        console.log('⚠️ Text duplicates found and removed!');
        console.log('Original text questions:', textQuestions);
        console.log('Final text questions:', finalTextQuestions);
      }
      
      if (otherOptions.length !== finalOtherOptions.length) {
        console.log('⚠️ Other option duplicates found and removed!');
        console.log('Original other options:', otherOptions);
        console.log('Final other options:', finalOtherOptions);
      }
      
      // Create request DTO
      const fillRequest: FillRequestDTO = {
        surveyCount: formValues.submissionCount,
        pricePerSurvey: formValues.pricePerSurvey,
        isHumanLike: formValues.isHumanLike,
        answerDistributions: finalAnswerDistributions,
        startDate: formValues.startDate?.toISOString(),
        endDate: formValues.endDate?.toISOString()
      };
      
      // Call API to save fill request
      await createFillRequest(selectedFormId, fillRequest);
      setIsAutoFillModalOpen(false);
      
      // Reset editing state
      setIsEditing(false);
      setIsEditingFillRequest(false);
      
      // Refresh form details to update the fill requests list
      if (selectedFormId) {
        setFormDetailLoading(true);
        try {
          const formDetails = await getFormDetail(selectedFormId);
          setSelectedForm(formDetails);
        } catch (err: any) {
          console.error('Error refreshing form details:', err);
          setAlertPopup({ open: true, message: handleFormError(err, 'fetch') });
        } finally {
          setFormDetailLoading(false);
        }
      }
      
      // Show success message
      setErrorSnackMessage('Tạo yêu cầu điền form thành công!');
      setErrorSnackOpen(true);
      
    } catch (err: any) {
      console.error('Error creating fill request:', err);
      testErrorStructure(err);
      const msg = handleFormError(err, 'create');
      setAlertPopup({ open: true, message: msg });
      setErrorSnackMessage(msg);
      setErrorSnackOpen(true);
    }
  };

  function randomPercentages(n: number): number[] {
    if (n <= 1) return [100];
    const cuts = Array.from({ length: n - 1 }, () => Math.random());
    cuts.sort((a, b) => a - b);
    const result = [];
    let prev = 0;
    for (let i = 0; i < cuts.length; i++) {
      result.push(Math.floor((cuts[i] - prev) * 100));
      prev = cuts[i];
    }
    result.push(Math.floor((1 - prev) * 100));
    // Điều chỉnh tổng cho đúng 100 (do làm tròn)
    let sum = result.reduce((a, b) => a + b, 0);
    while (sum < 100) { result[result.length - 1]++; sum++; }
    while (sum > 100) { result[result.length - 1]--; sum--; }
    return result;
  }

  // Handle AI gợi ý
  const handleAiSuggest = () => {
    // Giữ nguyên trạng thái validate; chỉ ẩn snackbar thông báo nếu đang mở
    setError(null);
    setErrorSnackOpen(false);
    
    setIsAISuggestionModalOpen(true);
  };

  // Handle AI suggestion result
  const handleAISuggestionSubmit = async (request: AISuggestionRequest) => {
    try {
      setIsAiLoading(true);
      setIsAISuggestionModalOpen(false); // Đóng modal AI suggestion
      
      // 🎯 Hiện loading dialog ngay sau khi đóng AI modal
      setIsAiDataFillingLoading(true);
      
      if (!selectedForm) {
        throw new Error('Không có form được chọn');
      }

      // 🚀 FIX: Sử dụng response đã có sẵn từ AISuggestionModal thay vì gọi API lại
      // Tránh gọi API trùng lặp - API đã được gọi trong AISuggestionModal
      const response = request.answerAttributesResponse;
      
      if (!response || response.status !== 'OK' || !response.content) {
        throw new Error('Phản hồi không hợp lệ từ AI service');
      }

      const { questionAnswerAttributes } = response.content;
      // Guard: ensure AI response belongs to the currently selected form
      if (response.content.formId && response.content.formId !== selectedForm.id) {
        throw new Error('Dữ liệu AI trả về thuộc form khác. Vui lòng thử lại.');
      }

      // Apply the AI suggestion results to the form states
      const newQuestionOptions = new Map(questionOptions);
      const newCustomData = new Map(customData);
      const newOtherOptionInputs = new Map(otherOptionInputs);
      const newGridValues = new Map(gridValues);

      // 🚀 PERFORMANCE OPTIMIZATION: Pre-build lookup maps for O(1) access
      const startTime = performance.now();
      
      // Build question lookup map once - O(n) -> O(1)
      const questionLookup = new Map(selectedForm.questions.map(q => [q.id, q]));
      
      // Build option lookup maps for each question - O(n*m) -> O(1)
      const optionLookupByQuestion = new Map<string, Map<string, any>>();
      selectedForm.questions.forEach(question => {
        const optionMap = new Map(question.options.map(opt => [opt.id, opt]));
        optionLookupByQuestion.set(question.id, optionMap);
      });

      questionAnswerAttributes.forEach((qaAttr: any) => {
        const { questionId, questionType, optionDistributions, sampleAnswers, gridRowDistributions } = qaAttr;
        
        // 🚀 O(1) lookup instead of O(n) .find()
        const question = questionLookup.get(questionId);
        if (!question) return;

        if (questionType === 'text') {
          // Handle text questions - update custom data with sample answers
          // 🚀 Early return with optional chaining for better performance
          if (!sampleAnswers?.length) return;
          
          newCustomData.set(questionId, {
            useCustomData: true,
            data: sampleAnswers.join('\n')
          });
        } else if (questionType === 'multiple_choice_grid') {
          // Handle multiple choice grid questions
          // MultipleChoiceGridPercentInput uses row.value and col.value as keys
          // 🚀 Early return with optional chaining
          if (!gridRowDistributions?.length) return;
          
          const questionGridMap = new Map<string, Map<string, number>>();
          // 🚀 Get pre-built option lookup for O(1) access
          const optionLookup = optionLookupByQuestion.get(questionId)!;
          
          gridRowDistributions.forEach((rowDist: any) => {
            const { rowId, columnDistributions } = rowDist;
            const rowMap = new Map<string, number>();
            
            // 🚀 O(1) lookup instead of O(n) .find()
            const rowOption = optionLookup.get(rowId);
            const rowKey = rowOption?.value || rowId;
            
            columnDistributions.forEach((colDist: any) => {
              const { optionId, percentage } = colDist;
              
              // 🚀 O(1) lookup instead of O(n) .find()
              const colOption = optionLookup.get(optionId);
              const colKey = colOption?.value || optionId;
              
              rowMap.set(colKey, percentage);
            });
            
            questionGridMap.set(rowKey, rowMap);
          });
          
          newGridValues.set(questionId, questionGridMap);
        } else if (questionType === 'checkbox_grid') {
          // Handle checkbox grid questions
          // CheckboxGridPercentInput uses row.id and col.id as keys
          // 🚀 Early return with optional chaining
          if (!gridRowDistributions?.length) return;
          
          const questionGridMap = new Map<string, Map<string, number>>();
          
          gridRowDistributions.forEach((rowDist: any) => {
            const { rowId, columnDistributions } = rowDist;
            const rowMap = new Map<string, number>();
            
            // CheckboxGridPercentInput uses row.id as key directly
            const rowKey = rowId;
            
            columnDistributions.forEach((colDist: any) => {
              const { optionId, percentage } = colDist;
              
              // CheckboxGridPercentInput uses col.id as key directly
              const colKey = optionId;
              
              rowMap.set(colKey, percentage);
            });
            
            questionGridMap.set(rowKey, rowMap);
          });
          
          newGridValues.set(questionId, questionGridMap);
        } else {
          // Handle radio, checkbox, select questions
          // 🚀 Early return with optional chaining
          if (!optionDistributions?.length) return;
          
          const optionMap = new Map<string, number>();
          let otherOptionSamples: string[] = [];
          
          optionDistributions.forEach((optDist: any) => {
            const { optionId, percentage, optionValue, sampleValues } = optDist;
            
            // Only accept option IDs that exist in the current question of the selected form
            const optionLookup = optionLookupByQuestion.get(questionId)!;
            if (!optionLookup || !optionLookup.has(optionId)) {
              return; // skip invalid/mismatched option ids
            }

            // Set percentage for the valid option
            optionMap.set(optionId, percentage);
            
            // Detect "other" option either by explicit optionValue or by lookup
            const optMeta = optionLookup.get(optionId);
            if ((optionValue === '__other_option__' || optMeta?.value === '__other_option__') && sampleValues?.length > 0) {
              otherOptionSamples = sampleValues;
            }
          });
          
          newQuestionOptions.set(questionId, optionMap);
          
          // Set other option sample values if available
          if (otherOptionSamples.length > 0) {
            newOtherOptionInputs.set(questionId, otherOptionSamples.join('\n'));
          }
        }
      });

                  // 🚀 Performance monitoring
      const processingTime = performance.now() - startTime;
      console.log(`🚀 AI data processing completed in ${processingTime.toFixed(2)}ms`);

      // 🚀 Batch state updates with startTransition for better performance
      startTransition(() => {
        setQuestionOptions(newQuestionOptions);
        setCustomData(newCustomData);
        setOtherOptionInputs(newOtherOptionInputs);
        setGridValues(newGridValues);
        setIsEditing(true);

        // Validate percentages
        validatePercentages(newQuestionOptions);
        
        // 🎯 Ẩn loading dialog sau khi điền xong với minimum display time
        const minimumLoadingTime = 1500; // 1.5 giây để user thấy được loading
        const elapsedTime = performance.now() - startTime;
        const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
        
        setTimeout(() => {
          setIsAiDataFillingLoading(false);
          setErrorSnackMessage(`AI tạo dữ liệu mẫu và điền câu trả lời lên form thành công!`);
      setErrorSnackOpen(true);
        }, remainingTime);
      });
      
    } catch (error) {
      console.error('Error processing AI suggestion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý AI gợi ý';
      
      // 🎯 Ẩn loading dialog nếu có lỗi
      setIsAiDataFillingLoading(false);
      setErrorSnackMessage(errorMessage);
      setErrorSnackOpen(true);
    } finally {
      setIsAiLoading(false);
      setIsAISuggestionModalOpen(false);
    }
  };
  
  // Function to render individual question
  const renderQuestion = useCallback((question: any) => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
          {question.title}
        </Typography>
        {question.type === 'text' ? (
          <>
            <FormControlLabel
              control={
                <Switch 
                  checked={customData.get(question.id)?.useCustomData || false} 
                  onChange={(e) => handleCustomDataToggle(question.id, e.target.checked)}
                />
              }
              label="Điền theo data của bạn"
            />
            {customData.get(question.id)?.useCustomData && (
              <DebouncedMultilineTextField
                value={customData.get(question.id)?.data || ''}
                onChange={(v) => handleCustomDataChange(question.id, v)}
                rows={4}
                placeholder="Nhập dữ liệu của bạn"
                sx={{ mt: 2 }}
                debounceMs={150}
              />
            )}
          </>
        ) : question.type === 'date' ? (
          <>
            <FormControlLabel
              control={
                <Switch 
                  checked={dateInputs.get(question.id)?.useCustomData || false} 
                  onChange={(e) => handleDateInputToggle(question.id, e.target.checked)}
                />
              }
              label="Điền theo data của bạn"
            />
            {dateInputs.get(question.id)?.useCustomData && (
              <DebouncedMultilineTextField
                value={dateInputs.get(question.id)?.data || ''}
                onChange={(v) => handleDateInputChange(question.id, v)}
                rows={4}
                placeholder="Nhập dữ liệu của bạn (mỗi dòng một ngày, định dạng YYYY-MM-DD)"
                sx={{ mt: 2 }}
                helperText="Nhập mỗi ngày trên một dòng, định dạng YYYY-MM-DD"
                debounceMs={150}
              />
            )}
          </>
        ) : question.type === 'multiple_choice_grid' ? (
          <MultipleChoiceGridPercentInput
            question={{
              ...question,
              options: question.options.map((opt: any) => ({
                ...opt,
                title: opt.text ?? '',
              })),
            }}
            value={(() => {
              const grid = gridValues.get(question.id);
              if (!grid) return {};
              const obj: Record<string, Record<string, number>> = {};
              grid.forEach((colMap, rowId) => {
                obj[rowId] = {};
                colMap.forEach((percent, colId) => {
                  obj[rowId][colId] = percent;
                });
              });
              return obj;
            })()}
            onChange={(value) => {
              setIsEditing(true);
              setGridValues(prev => {
                const newMap = new Map(prev);
                const rowMap = new Map<string, Map<string, number>>();
                Object.entries(value).forEach(([rowId, colObj]) => {
                  const colMap = new Map<string, number>();
                  Object.entries(colObj).forEach(([optionId, percent]) => {
                    colMap.set(optionId, percent);
                  });
                  rowMap.set(rowId, colMap);
                });
                newMap.set(question.id, rowMap);
                return newMap;
              });
            }}
          />
        ) : question.type === 'checkbox_grid' ? (
          <CheckboxGridPercentInput
            question={{
              ...question,
              options: question.options.map((opt: any) => ({
                ...opt,
                title: opt.text ?? '',
              })),
            }}
            value={(() => {
              const grid = gridValues.get(question.id);
              if (!grid) return {};
              const obj: Record<string, Record<string, number>> = {};
              grid.forEach((colMap, rowId) => {
                obj[rowId] = {};
                colMap.forEach((percent, colId) => {
                  obj[rowId][colId] = percent;
                });
              });
              return obj;
            })()}
            onChange={(value) => {
              setIsEditing(true);
              setGridValues(prev => {
                const newMap = new Map(prev);
                const rowMap = new Map<string, Map<string, number>>();
                Object.entries(value).forEach(([rowId, colObj]) => {
                  const colMap = new Map<string, number>();
                  Object.entries(colObj).forEach(([optionId, percent]) => {
                    colMap.set(optionId, percent);
                  });
                  rowMap.set(rowId, colMap);
                });
                newMap.set(question.id, rowMap);
                return newMap;
              });
            }}
          />
        ) : (
          <Grid container spacing={2}>
            {question.options.map((option: any) => {
              const percentage = questionOptions.get(question.id)?.get(option.id) || 0;
              const isOtherOption = option.value === '__other_option__';
              const otherOpt = question.options.find((opt: any) => opt.value === '__other_option__');
              const otherPercent = otherOpt ? (questionOptions.get(question.id)?.get(otherOpt.id) || 0) : 0;
              const showOtherTextarea = isOtherOption && otherPercent > 0;
              
              return (
                <Grid key={option.id} item xs={6} sm={3} md={2} lg={2}>
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
                        cursor: 'pointer',
                        ...(isOtherOption && {
                          fontStyle: 'italic',
                          fontWeight: 600,
                          ...(showOtherTextarea && {
                            color: 'primary.main'
                          })
                        })
                      }}
                    >
                      {option.text}
                    </Typography>
                  </Tooltip>
                  <PercentInput
                    value={percentage}
                    onChange={(value) => handlePercentageChange(
                      question.id, 
                      option.id, 
                      value
                    )}
                    error={balanceErrors.has(question.id)}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
        {/* Other option free text input */}
        {(() => {
          const otherOpt = question.options.find((opt: any) => opt.value === '__other_option__');
          const otherPercent = otherOpt ? (questionOptions.get(question.id)?.get(otherOpt.id) || 0) : 0;
          if (otherOpt && otherPercent > 0) {
            return (
              <Box sx={{ mt: 2, p: 2, border: '2px dashed', borderColor: 'primary.main', borderRadius: 2, backgroundColor: 'primary.50' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 600, 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  ✏️ Dữ liệu cho đáp án "Khác"
                </Typography>
                <DebouncedMultilineTextField
                  value={otherOptionInputs.get(question.id) || ''}
                  onChange={(v) => handleOtherInputChange(question.id, v)}
                  rows={3}
                  placeholder="Nhập dữ liệu của bạn"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderColor: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark'
                      },
                      '&.Mui-focused': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                  debounceMs={150}
                />
              </Box>
            );
          }
          return null;
        })()}
        {balanceErrors.has(question.id) && question.type !== 'date' &&
          question.type !== 'multiple_choice_grid' &&
          question.type !== 'checkbox_grid' &&
          question.type !== 'text' && (
          <Alert color="error" icon={<ErrorIcon />} sx={{ mt: 2 }}>
            {balanceErrors.get(question.id)}
          </Alert>
                 )}
       </Box>
    );
  }, [customData, dateInputs, gridValues, questionOptions, otherOptionInputs, balanceErrors, handleCustomDataToggle, handleCustomDataChange, handleDateInputToggle, handleDateInputChange, handlePercentageChange, handleOtherInputChange]);
  
  // Check if there are any balance errors
  const hasBalanceErrors = balanceErrors.size > 0;
  
  return (
    <>
      <AlertSnackbarWithProgress
        open={alertPopup.open}
        message={alertPopup.message}
        onClose={() => setAlertPopup({ open: false, message: '' })}
      />
      
      {/* Prominent error/success snackbar */}
      <AlertSnackbarWithProgress
        open={errorSnackOpen}
        message={errorSnackMessage}
        onClose={() => setErrorSnackOpen(false)}
        severity={errorSnackMessage.toLowerCase().includes('thành công') ? 'success' : 'error'}
      />
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid item xs={12}>
          <MainCard 
            title="Chọn Form muốn điền" 
            sx={MAINCARD_STYLE}
          >
            {loading ? (
              <Stack direction="row" justifyContent="center" sx={{ py: 2 }}>
                <CircularProgress />
              </Stack>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="column" sx={{ gap: 1 }}>
                    <InputLabel htmlFor="ten-form">Tên Form</InputLabel>
                    <Select 
                      size="medium" 
                      fullWidth 
                      id="ten-form" 
                      value={selectedFormId || ''} 
                      onChange={handleFormChange} 
                      MenuProps={MenuProps}
                      disabled={loading}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>- Chọn form cần điền -</em>
                      </MenuItem>
                      {forms.map((form) => (
                        <MenuItem key={form.id} value={form.id}>
                          {form.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" sx={{ gap: 1 }}>
                    <InputLabel htmlFor="form-link">Link Form</InputLabel>
                    {formLink ? (
                      <Link 
                        href={formLink} 
                        id="form-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {formLink}
                      </Link>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chọn form để xem link
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            )}
          </MainCard>
        </Grid>

        {selectedFormId && selectedForm && (
        <Grid item xs={12}>
          <MainCard title="Điền tỉ lệ mong muốn cho các đáp án" sx={MAINCARD_STYLE}>
            {formDetailLoading ? (
              <Stack direction="row" justifyContent="center" sx={{ py: 4 }}>
                <CircularProgress />
              </Stack>
            ) : error ? (
              <Alert color="error" icon={<ErrorIcon />} sx={{ py: 2 }}>{error}</Alert>
            ) : selectedForm ? (
              <>
                {isEditingFillRequest && (
                  <Alert color="info" icon={<InfoCircle variant="Bold" />} sx={{ mb: 3 }}>
                    Các giá trị tỉ lệ đã được điền từ yêu cầu điền form.
                  </Alert>
                )}
                

                
                <QuestionGroup 
                  questions={selectedForm.questions}
                  renderQuestion={renderQuestion}
                />
                
                <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    startIcon={<Refresh size={20} />}
                    onClick={handleCancel}
                    disabled={!isEditing || isAiLoading}
                    sx={{ minWidth: 140, fontWeight: 600 }}
                  >
                    Reset Form
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={isAiLoading ? <CircularProgress size={20} color="inherit" /> : <AISuggestionIcon />}
                    onClick={handleAiSuggest}
                    disabled={isAiLoading}
                    sx={{ minWidth: 160, fontWeight: 600 }}
                  >
                    {isAiLoading ? 'AI đang gợi ý...' : 'AI gợi ý'}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FormIcon />}
                    onClick={handleOpenAutoFillModal}
                    disabled={loading || selectedForm == null || balanceErrors.size > 0 || hasGridErrors || isAiLoading}
                    sx={{ minWidth: 200, fontWeight: 600 }}
                  >
                    Tạo yêu cầu điền Form
                  </Button>
                </Stack>
              </>
            ) : (
              <Typography color="textSecondary" sx={{ py: 2 }}>
                Vui lòng chọn form để xem chi tiết
              </Typography>
            )}
          </MainCard>
        </Grid>
        )}

        {selectedFormId && selectedForm && (
        <Grid item xs={12}>
          <ExpectedRatioFormList 
            onSchedule={handleOpenScheduleModal}
            onViewDetails={handleOpenDetailModal}
            onEdit={handleEditFillRequest}
            fillRequests={(selectedForm?.fillRequests || []).filter(req => (req.answerDistributions?.length || 0) > 0)}
            formName={selectedForm?.name || ''}
            formLink={formLink}
            page={pageIndex + 1}
            rowsPerPage={pageSize}
          />
          
          <Divider />
          <Box sx={{ p: 2 }}>
            <ReactTablePagination
              setPageSize={setPageSize as any}
              setPageIndex={setPageIndex as any}
              getState={getTableState as any}
              getPageCount={() => Math.ceil(((selectedForm?.fillRequests || []).filter(req => (req.answerDistributions?.length || 0) > 0).length) / pageSize)}
              initialPageSize={10}
            />
          </Box>
        </Grid>
        )}
        
        {/* Modals */}
        <AutoFillFormModal 
          open={isAutoFillModalOpen} 
          onClose={() => setIsAutoFillModalOpen(false)}
          formName={selectedForm?.name || ''}
          onSubmit={handleCreateFillRequest}
        />
        
        <ScheduleFormModal 
          open={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)}
          formId={selectedDetailFormId}
        />
        
        <FormDetailModal 
          open={isDetailModalOpen} 
          onClose={() => setIsDetailModalOpen(false)}
          fillRequest={selectedFillRequest}
          formName={selectedForm?.name || ''}
        />

        {selectedForm && (
          <AISuggestionModal
            open={isAISuggestionModalOpen}
            onClose={() => setIsAISuggestionModalOpen(false)}
            formData={selectedForm}
            onSubmit={handleAISuggestionSubmit}
          />
        )}

        {/* 🎯 AI Data Filling Loading Dialog */}
        <AILoadingDialog 
          open={isAiDataFillingLoading}
          title="Đang xử lý điền dữ liệu mẫu vào form"
          subtitle="Vui lòng chờ trong giây lát..."
        />
      </Grid>
    </>
  );
}