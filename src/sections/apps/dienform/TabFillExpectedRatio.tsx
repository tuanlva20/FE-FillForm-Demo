import { useEffect, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid'; // Changed from Grid2 to standard Grid
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';
import AutoFillFormModal from './components/AutoFillFormModal';
import FormDetailModal from './components/FormDetailModal';
import ScheduleFormModal from './components/ScheduleFormModal';
import ExpectedRatioFormList from './components/tabfillexpectedRatio/FormList';
import CheckboxGridPercentInput from './components/tabfillexpectedRatio/elements/CheckboxGridPercentInput';
import MultipleChoiceGridPercentInput from './components/tabfillexpectedRatio/elements/MultipleChoiceGridPercentInput';

// API
import {
  AnswerDistribution,
  createFillRequest,
  FillRequestDTO,
  FormData,
  FormDetailResponse,
  getFormDetail,
  getFormList
} from 'api/form';

// iconsax-react
import StarIcon from '@mui/icons-material/Star';
import { ErrorIcon } from 'assets/images/svg/icon';
import { InfoCircle } from 'iconsax-react';

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
  
  // State to track if edit mode is active
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingFillRequest, setIsEditingFillRequest] = useState<boolean>(false);
  
  // Thêm state lưu giá trị grid cho từng câu hỏi
  type GridValues = Map<string, Map<string, Map<string, number>>>; // questionId -> rowId -> optionId -> percentage
  const [gridValues, setGridValues] = useState<GridValues>(new Map());
  
  // Thêm state lưu trạng thái loading cho AI gợi ý
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Load form list on component mount
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getFormList();
        setForms(response.content);
        
        // Select first form by default if available
        if (response.content.length > 0) {
          setSelectedFormId(response.content[0].id);
        }
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError('Không thể load chi tiết Form. Vui lòng thử lại!');
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
        setIsEditing(false);
        validatePercentages(newQuestionOptions);
      } catch (err) {
        console.error('Error fetching form details:', err);
        setError('Không thể load chi tiết Form. Vui lòng thử lại!');
      } finally {
        setFormDetailLoading(false);
      }
    };
    
    fetchFormDetails();
  }, [selectedFormId]);
  
  // Validate that percentages for each question add up to exactly 100%
  const validatePercentages = (options: Map<string, Map<string, number>>) => {
    const newErrors = new Map<string, string>();
    
    options.forEach((optionMap, questionId) => {
      const qType = selectedForm?.questions.find(q => q.id === questionId)?.type;
      // Bỏ validate cho các loại không phải grid, không phải text/date/time/select
      if (
        qType === 'text' ||
        qType === 'date' ||
        qType === 'time' ||
        qType === 'multiple_choice_grid' ||
        qType === 'checkbox_grid' ||
        qType === 'select'
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
        newErrors.set(questionId, `Tổng tỉ lệ phải đạt 100%. Hiện tại: ${roundedTotal}%`);
      }
    });
    setBalanceErrors(newErrors);
    return newErrors.size === 0;
  };
  
  // Handle form selection change
  const handleFormChange = (event: SelectChangeEvent) => {
    const formId = event.target.value;
    setSelectedFormId(formId);
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
      
      // Validate percentages
      validatePercentages(newQuestionOptions);
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
  
  // Handle custom data text change
  const handleCustomDataChange = (questionId: string, value: string) => {
    setIsEditing(true);
    const newCustomData = new Map(customData);
    
    if (newCustomData.has(questionId)) {
      const currentData = newCustomData.get(questionId)!;
      newCustomData.set(questionId, { ...currentData, data: value });
      setCustomData(newCustomData);
    }
  };

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
  
  // Handle date input data change
  const handleDateInputChange = (questionId: string, value: string) => {
    setIsEditing(true);
    const newDateInputs = new Map(dateInputs);
    
    if (newDateInputs.has(questionId)) {
      const currentData = newDateInputs.get(questionId)!;
      newDateInputs.set(questionId, { ...currentData, data: value });
      setDateInputs(newDateInputs);
    }
  };
  
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
    
    if (!selectedForm) return;
    
    // Find the fill request with the given ID - use direct string comparison
    const fillRequest = selectedForm.fillRequests.find(req => req.id === formId);
    
    console.log('Found fillRequest:', fillRequest);
    
    if (!fillRequest || !fillRequest.answerDistributions) return;
    
    // Set to editing mode
    setIsEditing(true);
    setIsEditingFillRequest(true);
    
    // Create new question options map with values from the fill request
    const newQuestionOptions = new Map<string, Map<string, number>>();
    const newCustomData = new Map<string, { useCustomData: boolean, data: string }>();
    
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
    });
    
    // Then set the percentages from the fill request
    fillRequest.answerDistributions.forEach(dist => {
      // Check if dist has questionId and optionId directly
      if (dist.questionId && dist.optionId) {
        // Use existing questionId and optionId
        const questionMap = newQuestionOptions.get(dist.questionId);
        if (questionMap) {
          questionMap.set(dist.optionId, dist.percentage);
          newQuestionOptions.set(dist.questionId, questionMap);
        }
      } 
      // If no direct questionId/optionId, but has option with id
      else if (dist.option && dist.option.id) {
        // Find the question that contains this option
        selectedForm.questions.forEach(question => {
          const foundOption = question.options.find(opt => opt.id === dist.option?.id);
          if (foundOption) {
            const questionMap = newQuestionOptions.get(question.id);
            if (questionMap) {
              questionMap.set(foundOption.id, dist.percentage);
              newQuestionOptions.set(question.id, questionMap);
            }
          }
        });
      }
    });
    
    setQuestionOptions(newQuestionOptions);
    setCustomData(newCustomData);
    
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
  
  // Handle cancel
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
          });
          
          setQuestionOptions(newQuestionOptions);
          setCustomData(newCustomData);
          setDateInputs(newDateInputs);
          setIsEditing(false);
          setIsEditingFillRequest(false);
          validatePercentages(newQuestionOptions);
        } catch (err) {
          console.error('Error resetting form details:', err);
        }
      };
      
      fetchFormDetails();
    }
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
    
    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    try {
      // Prepare answer distributions
      const answerDistributions: AnswerDistribution[] = [];
      
      // Track validation errors
      let validationErrors: string[] = [];
      
      // Add multiple-choice questions
      questionOptions.forEach((optionMap, questionId) => {
        const question = selectedForm.questions.find(q => q.id === questionId);
        
        // For multiple-choice questions
        if (question && question.type !== 'text' && question.type !== 'date') {
          optionMap.forEach((percentage, optionId) => {
            if (percentage > 0) {
              answerDistributions.push({
                questionId,
                optionId,
                percentage,
                count: 0,
                option: null
              });
            }
          });
        }
      });
      
      // Add text questions with their custom data
      selectedForm.questions.forEach(question => {
        if (question.type === 'text') {
          const customDataEntry = customData.get(question.id);
          
          if (customDataEntry && customDataEntry.useCustomData && customDataEntry.data.trim()) {
            const lines = customDataEntry.data
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
            
            // For email fields, validate each line is a valid email
            if (question.title.toLowerCase().includes('email')) {
              const invalidEmails = lines.filter(line => !emailRegex.test(line));
              
              if (invalidEmails.length > 0) {
                validationErrors.push(`Câu hỏi "${question.title}" có ${invalidEmails.length} email không hợp lệ`);
              }
            }
            
            // Create a separate entry for each line
            lines.forEach(line => {
              answerDistributions.push({
                questionId: question.id,
                optionId: null,
                percentage: 100 / lines.length, // Distribute percentage evenly
                count: 0,
                option: null,
                valueString: line
              });
            });
          } else {
            // Default entry with no valueString
            answerDistributions.push({
              questionId: question.id,
              optionId: null,
              percentage: 0,
              count: 0,
              option: null
            });
          }
        } else if (question.type === 'date') {
          const dateInputEntry = dateInputs.get(question.id);
          
          if (dateInputEntry && dateInputEntry.useCustomData && dateInputEntry.data.trim()) {
            const lines = dateInputEntry.data
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
            
            // Validate date format
            const invalidDates = lines.filter(line => !line.match(/^\d{4}-\d{2}-\d{2}$/));
            if (invalidDates.length > 0) {
              validationErrors.push(`Câu hỏi "${question.title}" có ${invalidDates.length} ngày không đúng định dạng YYYY-MM-DD`);
            }
            
            // Create a separate entry for each date
            lines.forEach(line => {
              answerDistributions.push({
                questionId: question.id,
                optionId: null,
                percentage: 100 / lines.length, // Distribute percentage evenly
                count: 0,
                option: null,
                valueString: line
              });
            });
          } else {
            // Default entry with no valueString
            answerDistributions.push({
              questionId: question.id,
              optionId: null,
              percentage: 0,
              count: 0,
              option: null
            });
          }
        }
      });
      
      // Trong handleCreateFillRequest, bổ sung logic cho grid
      selectedForm.questions.forEach(question => {
        if (question.type === 'multiple_choice_grid' || question.type === 'checkbox_grid') {
          const gridMap = gridValues.get(question.id);
          if (gridMap) {
            gridMap.forEach((colMap, rowId) => {
              colMap.forEach((percentage, optionId) => {
                if (percentage > 0) {
                  answerDistributions.push({
                    questionId: question.id,
                    rowId,
                    optionId,
                    percentage,
                    count: 0,
                    option: null
                  });
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
            
            // For email fields, validate each line is a valid email
            if (question.title.toLowerCase().includes('email')) {
              const invalidEmails = lines.filter(line => !emailRegex.test(line));
              
              if (invalidEmails.length > 0) {
                validationErrors.push(`Câu hỏi "${question.title}" có ${invalidEmails.length} email không hợp lệ`);
              }
            }
            
            // Create a separate entry for each line
            lines.forEach(line => {
              answerDistributions.push({
                questionId: question.id,
                optionId: null,
                percentage: 100 / lines.length, // Distribute percentage evenly
                count: 0,
                option: null,
                valueString: line
              });
            });
          } else {
            // Default entry with no valueString
            answerDistributions.push({
              questionId: question.id,
              optionId: null,
              percentage: 0,
              count: 0,
              option: null
            });
          }
        } else if (question.type === 'date') {
          const dateInputEntry = dateInputs.get(question.id);
          
          if (dateInputEntry && dateInputEntry.useCustomData && dateInputEntry.data.trim()) {
            const lines = dateInputEntry.data
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
            
            // Validate date format
            const invalidDates = lines.filter(line => !line.match(/^\d{4}-\d{2}-\d{2}$/));
            if (invalidDates.length > 0) {
              validationErrors.push(`Câu hỏi "${question.title}" có ${invalidDates.length} ngày không đúng định dạng YYYY-MM-DD`);
            }
            
            // Create a separate entry for each date
            lines.forEach(line => {
              answerDistributions.push({
                questionId: question.id,
                optionId: null,
                percentage: 100 / lines.length, // Distribute percentage evenly
                count: 0,
                option: null,
                valueString: line
              });
            });
          } else {
            // Default entry with no valueString
            answerDistributions.push({
              questionId: question.id,
              optionId: null,
              percentage: 0,
              count: 0,
              option: null
            });
          }
        }
      });
      
      // If there are validation errors, show them and don't submit
      if (validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
        return;
      }
      
      // Create request DTO
      const fillRequest: FillRequestDTO = {
        surveyCount: formValues.submissionCount,
        pricePerSurvey: formValues.pricePerSurvey,
        isHumanLike: formValues.isHumanLike,
        answerDistributions,
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
        } catch (err) {
          console.error('Error refreshing form details:', err);
        } finally {
          setFormDetailLoading(false);
        }
      }
      
    } catch (err) {
      console.error('Error creating fill request:', err);
      setError('Failed to create fill request. Please try again later.');
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
  const handleAiSuggest = async () => {
    setIsAiLoading(true);
    await new Promise(res => setTimeout(res, 1200));
    const newQuestionOptions = new Map(questionOptions);
    const newGridValues = new Map(gridValues);
    selectedForm?.questions.forEach(question => {
      if (
        question.type === 'radio' ||
        question.type === 'combobox' ||
        question.type === 'select'
      ) {
        const options = question.options;
        if (options.length > 0) {
          const percents = randomPercentages(options.length);
          const optionMap = new Map<string, number>();
          options.forEach((opt, idx) => {
            optionMap.set(opt.id, percents[idx]);
          });
          newQuestionOptions.set(question.id, optionMap);
        }
      } else if (question.type === 'checkbox') {
        const options = question.options;
        if (options.length > 0) {
          const percents = randomPercentages(options.length);
          const optionMap = new Map<string, number>();
          options.forEach((opt, idx) => {
            optionMap.set(opt.id, percents[idx]);
          });
          newQuestionOptions.set(question.id, optionMap);
        }
      } else if (
        question.type === 'multiple_choice_grid'
      ) {
        const rows = question.options.filter(opt => opt.value && opt.value.startsWith('row'));
        const seen = new Set();
        const columns = question.options.filter(
          opt => opt.value && !opt.value.startsWith('row') && !seen.has(opt.value) && seen.add(opt.value)
        );
        const rowMap = new Map<string, Map<string, number>>();
        rows.forEach(row => {
          if (columns.length > 0) {
            const percents = randomPercentages(columns.length);
            const colMap = new Map<string, number>();
            columns.forEach((col, idx) => {
              colMap.set(col.value, percents[idx]); // Use col.value
            });
            rowMap.set(row.value, colMap); // Use row.value
          }
        });
        newGridValues.set(question.id, rowMap);
        // Đảm bảo không giữ lại state cũ ở questionOptions cho grid
        newQuestionOptions.delete(question.id);
      } else if (question.type === 'checkbox_grid') {
        const rows = question.options.filter(opt => opt.value && opt.value.startsWith('row'));
        const seen = new Set();
        const columns = question.options.filter(
          opt => opt.value && !opt.value.startsWith('row') && !seen.has(opt.value) && seen.add(opt.value)
        );
        const rowMap = new Map<string, Map<string, number>>();
        rows.forEach(row => {
          if (columns.length > 0) {
            const percents = randomPercentages(columns.length);
            const colMap = new Map<string, number>();
            columns.forEach((col, idx) => {
              colMap.set(col.id, percents[idx]);
            });
            rowMap.set(row.id, colMap);
          }
        });
        newGridValues.set(question.id, rowMap);
        newQuestionOptions.delete(question.id);
      }
    });
    setQuestionOptions(newQuestionOptions);
    setGridValues(newGridValues);
    validatePercentages(newQuestionOptions);
    setIsAiLoading(false);
  };
  
  // Check if there are any balance errors
  const hasBalanceErrors = balanceErrors.size > 0;
  
  return (
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
                  >
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
              
              {selectedForm.questions.map((question) => (
                <Box key={question.id} sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ mb: 2 }}>
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
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={customData.get(question.id)?.data || ''}
                          onChange={(e) => handleCustomDataChange(question.id, e.target.value)}
                          placeholder="Nhập dữ liệu của bạn"
                          sx={{ mt: 2 }}
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
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={dateInputs.get(question.id)?.data || ''}
                          onChange={(e) => handleDateInputChange(question.id, e.target.value)}
                          placeholder="Nhập dữ liệu của bạn (mỗi dòng một ngày, định dạng YYYY-MM-DD)"
                          sx={{ mt: 2 }}
                          helperText="Nhập mỗi ngày trên một dòng, định dạng YYYY-MM-DD"
                        />
                      )}
                    </>
                  ) : question.type === 'multiple_choice_grid' ? (
                    <MultipleChoiceGridPercentInput
                      question={{
                        ...question,
                        options: question.options.map(opt => ({
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
                        options: question.options.map(opt => ({
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
                      {question.options.map((option) => {
                        const percentage = questionOptions.get(question.id)?.get(option.id) || 0;
                        return (
                          <Grid key={option.id} item xs={6} sm={3} md={2} lg={1.5}>
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
                              value={percentage}
                              onChange={(e) => handlePercentageChange(
                                question.id, 
                                option.id, 
                                parseInt(e.target.value) || 0
                              )}
                              onFocus={e => { if (e.target.value === '0') e.target.value = ''; }}
                              InputProps={{
                                inputProps: { min: 0 },
                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                              }}
                              error={balanceErrors.has(question.id)}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                  {balanceErrors.has(question.id) && question.type !== 'date' &&
                    question.type !== 'multiple_choice_grid' &&
                    question.type !== 'checkbox_grid' &&
                    question.type !== 'text' && (
                    <Alert color="error" icon={<ErrorIcon />} sx={{ mt: 2 }}>
                      {balanceErrors.get(question.id)}
                    </Alert>
                  )}
                  <Divider sx={{ mt: 3, mb: 1 }} />
                </Box>
              ))}
              
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={handleCancel}
                  disabled={!isEditing || isAiLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={isAiLoading ? <CircularProgress size={20} color="inherit" /> : <StarIcon />}
                  onClick={handleAiSuggest}
                  disabled={isAiLoading}
                  sx={{ minWidth: 160, fontWeight: 600 }}
                >
                  {isAiLoading ? 'AI đang gợi ý...' : 'AI gợi ý'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAutoFillModal}
                  disabled={loading || selectedForm == null || balanceErrors.size > 0 || isAiLoading}
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

      <Grid item xs={12}>
        <ExpectedRatioFormList 
          onSchedule={handleOpenScheduleModal}
          onViewDetails={handleOpenDetailModal}
          onEdit={handleEditFillRequest}
          fillRequests={selectedForm?.fillRequests || []}
          formName={selectedForm?.name || ''}
          formLink={formLink}
        />
      </Grid>
      
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
    </Grid>
  );
}
