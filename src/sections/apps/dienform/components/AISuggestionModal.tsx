// AI Suggestion Modal
// Modal cho phép người dùng nhập thông số để tạo dữ liệu mẫu bằng AI

import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RemoveIcon from '@mui/icons-material/Remove';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { getAnswerAttributesWithNewStructure, validateAISuggestionRequest } from 'api/ai-suggestion';
import { FormDetailResponse } from 'api/form';
import { useMemo, useState } from 'react';
import { AISuggestionRequest } from 'types/ai-suggestion';
import { validateDistributionPercentages } from 'utils/ai-error-handler';

interface AISuggestionModalProps {
  open: boolean;
  onClose: () => void;
  formData: FormDetailResponse;
  onSubmit: (request: AISuggestionRequest) => void;
}

export default function AISuggestionModal({
  open,
  onClose,
  formData,
  onSubmit
}: AISuggestionModalProps) {
  const [sampleCount, setSampleCount] = useState<number>(2);
  const [requirements, setRequirements] = useState<AISuggestionRequest['requirements']>({
    distributionRequirements: []
  });
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    estimatedTokens: number;
    estimatedCost?: number;
    error?: string;
  } | null>(null);
  
  // State để track validation errors cho distribution requirements
  const [distributionErrors, setDistributionErrors] = useState<Map<string, string>>(new Map());
  
  // State để track việc lấy answerAttribute
  const [isGettingAnswerAttributes, setIsGettingAnswerAttributes] = useState<boolean>(false);
  const [answerAttributes, setAnswerAttributes] = useState<Map<string, any>>(new Map());
  
  // State để track các step của quá trình
  const [validationStep, setValidationStep] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [processingStep, setProcessingStep] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Bỏ auto validation - chỉ validate khi user submit

  // Validate distribution requirements
  const validateDistributionRequirements = () => {
    const newErrors = new Map<string, string>();
    
    requirements.distributionRequirements?.forEach(dist => {
      const validation = validateDistributionPercentages(dist.targetDistribution);
      if (!validation.isValid) {
        newErrors.set(dist.questionId, validation.error || 'Lỗi validation');
      }
    });
    
    setDistributionErrors(newErrors);
    return newErrors.size === 0;
  };

  // Check if all validations pass
  const isFormValid = useMemo(() => {
    return distributionErrors.size === 0;
  }, [distributionErrors]);

  // Validate khi requirements thay đổi
  useMemo(() => {
    validateDistributionRequirements();
  }, [requirements.distributionRequirements]);

    // Function để lấy answerAttribute cho tất cả câu hỏi trong một request
  const getAllAnswerAttributesForForm = async () => {
    try {
      console.log('Calling getAnswerAttributesWithNewStructure API with payload:', {
        formId: formData.id,
        sampleCount,
        requirements
      });
      
      // Gọi API để lấy tất cả answerAttribute trong một request với cấu trúc mới
      const response = await getAnswerAttributesWithNewStructure(formData.id, sampleCount, requirements);
      
      console.log('Received answerAttributes response:', response);
      
      // Kiểm tra response structure
      if (response.status === 'OK' && response.content && response.content.questionAnswerAttributes) {
        // Tạo request với response mới
        const request: AISuggestionRequest = {
          formId: formData.id,
          sampleCount,
          requirements,
          formData: {
            id: formData.id,
            name: formData.name,
            questions: formData.questions
          },
          answerAttributesResponse: response // Thêm response mới vào request
        };
        
        console.log('Submitting request with new answerAttributes response:', request);
        
        // Gọi onSubmit để xử lý tiếp
        onSubmit(request);
        
        // Hiển thị thông báo thành công
        setValidationResult({
          isValid: true,
          estimatedTokens: validationResult?.estimatedTokens || 0,
          estimatedCost: validationResult?.estimatedCost
        });
        
        // Đánh dấu step xử lý thành công
        setProcessingStep('success');
        
        // Đóng modal sau khi hoàn thành
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error('Invalid response structure from API');
      }
      
    } catch (error) {
      console.error('Error getting answerAttributes:', error);
      setProcessingStep('error');
      setValidationResult({
        isValid: false,
        estimatedTokens: 0,
        error: 'Lỗi khi lấy thông tin câu trả lời'
      });
    }
  };



    const handleSubmit = async () => {
    // Reset states
    setValidationStep('validating');
    setProcessingStep('idle');
    setValidationResult(null);
    
    try {
      console.log('Requirements being sent:', requirements);
      console.log('DistributionRequirements:', requirements.distributionRequirements);
      const result = await validateAISuggestionRequest(formData.id, sampleCount, requirements);
      
      // Debug response structure
      console.log('Raw validation result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result));
      console.log('Result.isValid:', result.isValid);
      console.log('Result.isValid type:', typeof result.isValid);
      
      // Handle different response structures
      let normalizedResult = result;
      const anyResult = result as any;
      
      // Check if response has success field instead of isValid
      if (anyResult.success !== undefined && result.isValid === undefined) {
        normalizedResult = {
          isValid: Boolean(anyResult.success),
          estimatedTokens: result.estimatedTokens || anyResult.tokens || 0,
          estimatedCost: result.estimatedCost || anyResult.cost,
          error: result.error || anyResult.message
        };
        console.log('Normalized result from success field:', normalizedResult);
      }
      // Check if response is wrapped in data field
      else if (anyResult.data && anyResult.data.isValid !== undefined) {
        normalizedResult = anyResult.data;
        console.log('Normalized result from data field:', normalizedResult);
      }
      // Check if HTTP 200 but isValid is false/undefined, consider it success
      else if (result.isValid === undefined || result.isValid === null) {
        normalizedResult = {
          isValid: true, // Assume success if 200 OK and no explicit isValid
          estimatedTokens: result.estimatedTokens || anyResult.tokens || 0,
          estimatedCost: result.estimatedCost || anyResult.cost,
          error: result.error || anyResult.message
        };
        console.log('Normalized result assuming success:', normalizedResult);
      }
      
      setValidationResult(normalizedResult);
      
      if (normalizedResult.isValid) {
        // Validation thành công - chuyển sang step tiếp theo
        setValidationStep('success');
        
        // Delay nhỏ để user thấy check mark
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('Validation successful, calling getAllAnswerAttributesForForm...');
        // Bắt đầu step xử lý answer attributes
        setProcessingStep('processing');
        await getAllAnswerAttributesForForm();
      } else {
        setValidationStep('error');
        console.log('Validation failed with result:', normalizedResult);
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Check if it's actually a successful response but axios threw error
      if (error.response?.status === 200 && error.response?.data) {
        console.log('Handling 200 response that was caught as error');
        const data = error.response.data;
        const normalizedResult = {
          isValid: Boolean(data.isValid || data.success || data.valid || true), // Default to true for 200
          estimatedTokens: data.estimatedTokens || data.tokens || 0,
          estimatedCost: data.estimatedCost || data.cost,
          error: data.error || data.message
        };
        
        setValidationResult(normalizedResult);
        
        if (normalizedResult.isValid) {
          setValidationStep('success');
          await new Promise(resolve => setTimeout(resolve, 800));
          setProcessingStep('processing');
          console.log('Success from catch block, calling getAllAnswerAttributesForForm...');
          await getAllAnswerAttributesForForm();
        }
      } else {
        setValidationStep('error');
        setValidationResult({
          isValid: false,
          estimatedTokens: 0,
          error: error.response?.data?.message || error.message || 'Lỗi khi kiểm tra yêu cầu'
        });
      }
    }
  };

  const addDistributionRequirement = (questionId: string) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question || !question.options) return;

    const newDistribution = {
      questionId,
      targetDistribution: question.options.map(opt => ({
        optionId: opt.id,
        percentage: 0 // Set giá trị mặc định là 0
      }))
    };

    setRequirements(prev => ({
      ...prev,
      distributionRequirements: [
        ...(prev.distributionRequirements || []),
        newDistribution
      ]
    }));
    
    // Validate sau khi thêm
    setTimeout(() => {
      validateDistributionRequirements();
    }, 0);
  };

  const removeDistributionRequirement = (questionId: string) => {
    setRequirements(prev => ({
      ...prev,
      distributionRequirements: prev.distributionRequirements?.filter(d => d.questionId !== questionId) || []
    }));
    
    // Clear error khi xóa
    setDistributionErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(questionId);
      return newErrors;
    });
  };

  const updateDistributionPercentage = (questionId: string, optionId: string, percentage: number) => {
    setRequirements(prev => ({
      ...prev,
      distributionRequirements: prev.distributionRequirements?.map(dist => {
        if (dist.questionId !== questionId) return dist;
        
        return {
          ...dist,
          targetDistribution: dist.targetDistribution.map(target => 
            target.optionId === optionId 
              ? { ...target, percentage }
              : target
          )
        };
      }) || []
    }));
    
    // Validate sau khi update
    setTimeout(() => {
      validateDistributionRequirements();
    }, 0);
  };

  const addRelationship = () => {
    const numericQuestions = formData.questions.filter(q => 
      q.type === 'number' || q.type === 'slider' || q.type === 'rating'
    );
    
    if (numericQuestions.length < 2) return;

    const newRelationship = {
      variable1: numericQuestions[0].id,
      variable2: numericQuestions[1].id,
      correlation: 0.5,
      relationshipType: 'positive' as const
    };

    setRequirements(prev => ({
      ...prev,
      relationships: [
        ...(prev.relationships || []),
        newRelationship
      ]
    }));
  };

  const removeRelationship = (index: number) => {
    setRequirements(prev => ({
      ...prev,
      relationships: prev.relationships?.filter((_, i) => i !== index)
    }));
  };

  const numericQuestions = formData.questions.filter(q => 
    q.type === 'number' || q.type === 'slider' || q.type === 'rating'
  );

  const choiceQuestions = formData.questions.filter(q => 
    q.type === 'radio' || q.type === 'select' || q.type === 'checkbox'
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          background: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(103,58,183,0.1)'
        }
      }}
    >
            <DialogTitle sx={{ pb: 3, background: '#673AB7', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 2, 
            background: 'rgba(255,255,255,0.15)',
            color: 'white'
          }}>
            <SmartToyIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
          AI Gợi ý - {formData.name}
        </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
          Nhập thông số để tạo dữ liệu mẫu thông minh
        </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
                    {/* Số mẫu */}
          <Box sx={{ 
            background: '#F9F9F9', 
            borderRadius: 2, 
            p: 3,
            border: '1px solid #F0F0F0'
          }}>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: '#673AB7' }}>
              Số lượng mẫu <span style={{ color: '#F44336' }}>*</span>
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
              {/* Left side - Counter */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <IconButton
                    onClick={() => setSampleCount(Math.max(1, sampleCount - 1))}
                    disabled={sampleCount <= 1 || isValidating}
                    sx={{
                      border: '1px solid #D1C4E9',
                      backgroundColor: '#F3E5F5',
                      color: '#673AB7',
                      width: 44,
                      height: 44,
                      '&:hover': {
                        backgroundColor: '#D1C4E9',
                        borderColor: '#9575CD'
                      },
                      '&:disabled': {
                        backgroundColor: '#F8F9FA',
                        color: '#BDBDBD'
                      }
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  <TextField
                    type="number"
                    value={sampleCount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 1 && value <= 1000) {
                        setSampleCount(value);
                      }
                    }}
                    inputProps={{ min: 1, max: 1000 }}
                    disabled={isValidating}
                    sx={{ 
                      width: 100,
                      '& .MuiOutlinedInput-root': {
                        textAlign: 'center',
                        borderColor: '#D1C4E9',
                        backgroundColor: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        '& input': {
                          textAlign: 'center',
                          color: '#673AB7',
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          py: 1.5
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9575CD'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#673AB7'
                        }
                      }
                    }}
                  />
                  
                  <IconButton
                    onClick={() => setSampleCount(Math.min(1000, sampleCount + 1))}
                    disabled={sampleCount >= 1000 || isValidating}
                    sx={{
                      border: '1px solid #D1C4E9',
                      backgroundColor: '#F3E5F5',
                      color: '#673AB7',
                      width: 44,
                      height: 44,
                      '&:hover': {
                        backgroundColor: '#D1C4E9',
                        borderColor: '#9575CD'
                      },
                      '&:disabled': {
                        backgroundColor: '#F8F9FA',
                        color: '#BDBDBD'
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Grid>
              
              {/* Right side - Quick select and info */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  {/* Quick select buttons */}
                  <Box>
                    <Typography variant="body2" sx={{ color: '#9575CD', mb: 1, fontWeight: 500 }}>
                      Chọn nhanh:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {[10, 50, 100, 500].map((count) => (
                        <Chip
                          key={count}
                          label={count}
                          onClick={() => setSampleCount(count)}
                          disabled={isValidating}
                          variant={sampleCount === count ? "filled" : "outlined"}
                          sx={{
                            backgroundColor: sampleCount === count ? '#673AB7' : 'white',
                            color: sampleCount === count ? 'white' : '#9575CD',
                            borderColor: sampleCount === count ? '#673AB7' : '#D1C4E9',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: sampleCount === count ? '#5E35B1' : '#F3E5F5'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  {/* Info box */}
                  <Box sx={{ 
                    background: 'white', 
                    borderRadius: 1, 
                    p: 2, 
                    border: '1px solid #E8E8E8'
                  }}>
                    <Typography variant="caption" sx={{ color: '#9575CD', display: 'block', lineHeight: 1.4 }}>
                      💡 <strong>Gợi ý:</strong> Với {sampleCount} mẫu, AI sẽ tạo dữ liệu đa dạng và phù hợp với yêu cầu của bạn.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#757575', display: 'block', mt: 0.5 }}>
                      Phạm vi: 1-1000 mẫu
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Yêu cầu thống kê */}
          {numericQuestions.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Yêu cầu thống kê (Tùy chọn)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography variant="body2" color="textSecondary">
                    Áp dụng cho các câu hỏi số liệu
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Giá trị trung bình"
                        type="number"
                        fullWidth
                        size="small"
                        value={requirements.statisticalRequirements?.mean || ''}
                        onChange={(e) => setRequirements(prev => ({
                          ...prev,
                          statisticalRequirements: {
                            ...prev.statisticalRequirements,
                            mean: e.target.value ? Number(e.target.value) : undefined
                          }
                        }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Độ lệch chuẩn"
                        type="number"
                        fullWidth
                        size="small"
                        value={requirements.statisticalRequirements?.standardDeviation || ''}
                        onChange={(e) => setRequirements(prev => ({
                          ...prev,
                          statisticalRequirements: {
                            ...prev.statisticalRequirements,
                            standardDeviation: e.target.value ? Number(e.target.value) : undefined
                          }
                        }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Giá trị tối thiểu"
                        type="number"
                        fullWidth
                        size="small"
                        value={requirements.statisticalRequirements?.minValue || ''}
                        onChange={(e) => setRequirements(prev => ({
                          ...prev,
                          statisticalRequirements: {
                            ...prev.statisticalRequirements,
                            minValue: e.target.value ? Number(e.target.value) : undefined
                          }
                        }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Giá trị tối đa"
                        type="number"
                        fullWidth
                        size="small"
                        value={requirements.statisticalRequirements?.maxValue || ''}
                        onChange={(e) => setRequirements(prev => ({
                          ...prev,
                          statisticalRequirements: {
                            ...prev.statisticalRequirements,
                            maxValue: e.target.value ? Number(e.target.value) : undefined
                          }
                        }))}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Mối quan hệ giữa các biến */}
          {numericQuestions.length >= 2 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Mối quan hệ giữa các biến (Tùy chọn)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Thiết lập mối quan hệ giữa các câu hỏi số liệu
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={addRelationship}
                      disabled={!requirements.relationships || requirements.relationships.length >= 5}
                    >
                      Thêm mối quan hệ
                    </Button>
                  </Box>
                  
                  {requirements.relationships?.map((relationship, index) => (
                    <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Biến 1</InputLabel>
                            <Select
                              value={relationship.variable1}
                              onChange={(e) => setRequirements(prev => ({
                                ...prev,
                                relationships: prev.relationships?.map((rel, i) => 
                                  i === index ? { ...rel, variable1: e.target.value } : rel
                                )
                              }))}
                            >
                              {numericQuestions.map(q => (
                                <MenuItem key={q.id} value={q.id}>{q.title}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Biến 2</InputLabel>
                            <Select
                              value={relationship.variable2}
                              onChange={(e) => setRequirements(prev => ({
                                ...prev,
                                relationships: prev.relationships?.map((rel, i) => 
                                  i === index ? { ...rel, variable2: e.target.value } : rel
                                )
                              }))}
                            >
                              {numericQuestions.map(q => (
                                <MenuItem key={q.id} value={q.id}>{q.title}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption">Mức độ tương quan: {relationship.correlation}</Typography>
                          <Slider
                            value={relationship.correlation || 0}
                            onChange={(_, value) => setRequirements(prev => ({
                              ...prev,
                              relationships: prev.relationships?.map((rel, i) => 
                                i === index ? { ...rel, correlation: value as number } : rel
                              )
                            }))}
                            min={-1}
                            max={1}
                            step={0.1}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => removeRelationship(index)}
                          >
                            Xóa
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Yêu cầu phân bố */}
          {choiceQuestions.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Yêu cầu phân bố (Tùy chọn)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography variant="body2" color="textSecondary">
                    Chọn câu hỏi để thiết lập phân bố mong muốn
                  </Typography>
                  
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {choiceQuestions.map(question => (
                      <Button
                        key={question.id}
                        variant="outlined"
                        size="small"
                        onClick={() => addDistributionRequirement(question.id)}
                        disabled={requirements.distributionRequirements?.some(d => d.questionId === question.id)}
                      >
                        {question.title}
                      </Button>
                    ))}
                  </Stack>
                
                  {requirements.distributionRequirements?.map((dist) => {
                    const question = formData.questions.find(q => q.id === dist.questionId);
                    return (
                      <Box key={dist.questionId} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2">
                            {question?.title}
                          </Typography>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removeDistributionRequirement(dist.questionId)}
                          >
                            Xóa
                          </Button>
                        </Box>
                        <Stack spacing={1}>
                          {dist.targetDistribution.map((target) => {
                            const option = question?.options?.find(opt => opt.id === target.optionId);
                            return (
                              <Box key={target.optionId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                  {option?.text}:
                                </Typography>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={target.percentage}
                                  onChange={(e) => updateDistributionPercentage(
                                    dist.questionId, 
                                    target.optionId, 
                                    Number(e.target.value)
                                  )}
                                  inputProps={{ min: 0, max: 100 }}
                                  sx={{ width: 80 }}
                                  error={distributionErrors.has(dist.questionId)}
                                />
                                <Typography variant="body2">%</Typography>
                              </Box>
                            );
                          })}
                        </Stack>
                        
                        {/* Error message cho distribution */}
                        {distributionErrors.has(dist.questionId) && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              {distributionErrors.get(dist.questionId)}
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Step indicators - chỉ hiện khi bắt đầu quá trình */}
          {(validationStep !== 'idle' || processingStep !== 'idle') && (
            <Box sx={{ mt: 2 }}>
              {/* Step 1: Validation */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {validationStep === 'validating' && (
                  <CircularProgress size={24} sx={{ color: '#673AB7' }} />
                )}
                {validationStep === 'success' && (
                  <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 24 }} />
                )}
                {validationStep === 'error' && (
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#F44336', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>!</Typography>
                  </Box>
                )}
                
                <Typography variant="body2" sx={{ 
                  color: validationStep === 'success' ? '#4CAF50' : 
                         validationStep === 'error' ? '#F44336' : 
                         validationStep === 'validating' ? '#673AB7' : '#757575',
                  fontWeight: validationStep === 'validating' || validationStep === 'success' ? 600 : 400
                }}>
                  {validationStep === 'validating' && 'Đang kiểm tra yêu cầu...'}
                  {validationStep === 'success' && 'Kiểm tra yêu cầu thành công'}
                  {validationStep === 'error' && 'Kiểm tra yêu cầu thất bại'}
                </Typography>
              </Box>

              {/* Step 2: Processing - chỉ hiện khi step 1 thành công */}
              {(validationStep === 'success' || processingStep !== 'idle') && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {processingStep === 'processing' && (
                    <CircularProgress size={24} sx={{ color: '#673AB7' }} />
                  )}
                  {processingStep === 'success' && (
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 24 }} />
                  )}
                  {processingStep === 'error' && (
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#F44336', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>!</Typography>
                    </Box>
                  )}
                  
                  <Typography variant="body2" sx={{ 
                    color: processingStep === 'success' ? '#4CAF50' : 
                           processingStep === 'error' ? '#F44336' : 
                           processingStep === 'processing' ? '#673AB7' : '#757575',
                    fontWeight: processingStep === 'processing' || processingStep === 'success' ? 600 : 400
                  }}>
                    {processingStep === 'processing' && 'Đang xử lý câu trả lời cho toàn bộ form...'}
                    {processingStep === 'success' && 'Xử lý câu trả lời thành công'}
                    {processingStep === 'error' && 'Xử lý câu trả lời thất bại'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Error message */}
          {validationResult && !validationResult.isValid && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {validationResult.error}
              </Typography>
            </Alert>
          )}

          {/* Success message */}
          {validationResult && validationResult.isValid && processingStep === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="h6">
                Tạo dữ liệu mẫu thành công!
              </Typography>
              <Typography variant="body2">
                Đã tạo dữ liệu mẫu cho các câu hỏi thành công! Ước tính: {validationResult.estimatedTokens.toLocaleString()} tokens
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          startIcon={<CloseIcon />}
          sx={{
            color: '#9575CD',
            borderColor: '#D1C4E9',
            '&:hover': {
              borderColor: '#9575CD',
              backgroundColor: '#F3E5F5'
            }
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={validationStep === 'validating' || processingStep === 'processing' ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
          disabled={validationStep === 'validating' || processingStep === 'processing' || !isFormValid}
          sx={{
            backgroundColor: '#673AB7',
            '&:hover': {
              backgroundColor: '#5E35B1'
            },
            '&:disabled': {
              backgroundColor: '#D1C4E9',
              color: '#9E9E9E'
            }
          }}
        >
          {validationStep === 'validating' ? 'Đang kiểm tra...' : 
           processingStep === 'processing' ? 'Đang xử lý...' : 
           'Tạo dữ liệu mẫu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
