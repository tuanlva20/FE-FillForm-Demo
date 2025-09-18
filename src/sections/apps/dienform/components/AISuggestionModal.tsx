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
  Paper,
  Select,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { cancelAISuggestionRequest, getAnswerAttributesWithNewStructure, validateAISuggestionRequest } from 'api/ai-suggestion';
import { FormDetailResponse } from 'api/form';
import { useAISuggestionPolling } from 'hooks/useAISuggestionPolling';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AISuggestionRequest } from 'types/ai-suggestion';
import { normalizeAIQueueErrorMessage } from 'utils/ai-error-handler';
import { logger } from 'utils/logger';

interface AISuggestionModalProps {
  open: boolean;
  onClose: () => void;
  formData: FormDetailResponse;
  onSubmit: (request: AISuggestionRequest) => void;
}

export default function AISuggestionModal({ open, onClose, formData, onSubmit }: AISuggestionModalProps) {
  const [sampleCount, setSampleCount] = useState<number>(5);
  const [requirements, setRequirements] = useState<AISuggestionRequest['requirements']>({
    desiredPrompt: '',
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
  // Invalid field keys: `${questionId}:${optionId}` -> out of [0,100]
  const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());

  // State để track việc lấy answerAttribute
  const [isGettingAnswerAttributes, setIsGettingAnswerAttributes] = useState<boolean>(false);
  const [answerAttributes, setAnswerAttributes] = useState<Map<string, any>>(new Map());

  // State để track các step của quá trình
  const [validationStep, setValidationStep] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [processingStep, setProcessingStep] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Guard to prevent double submissions when user clicks repeatedly
  const isSubmittingRef = useRef<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Hook để xử lý polling
  const { pollingState, startPolling, stopPolling, resetPolling } = useAISuggestionPolling();

  // Track requestId hiện tại để có thể hủy khi đóng popup
  const currentRequestIdRef = useRef<string | null>(null);
  const isPollingRef = useRef<boolean>(false);
  useEffect(() => {
    isPollingRef.current = pollingState.isPolling;
  }, [pollingState.isPolling]);

  const cancelIfNeeded = useMemo(() => {
    return async () => {
      try {
        const requestId = currentRequestIdRef.current;
        if (isPollingRef.current && requestId) {
          await cancelAISuggestionRequest(requestId);
        }
      } catch (e) {
        logger.warn('Cancel AI suggestion request failed (ignored):', e);
      } finally {
        stopPolling();
        resetPolling();
        currentRequestIdRef.current = null;
      }
    };
  }, [stopPolling, resetPolling]);

  // Cleanup polling khi component unmount
  useEffect(() => {
    return () => {
      // Hủy request nếu còn đang polling khi unmount
      void cancelIfNeeded();
    };
  }, []);

  // Khi mở popup: clear các alert success/error trước đó và reset polling state nhẹ
  useEffect(() => {
    if (open) {
      setValidationResult(null);
      setValidationStep('idle');
      setProcessingStep('idle');
      stopPolling();
      resetPolling();
    }
  }, [open, stopPolling, resetPolling]);

  // Function để reset form về trạng thái ban đầu
  const resetFormToInitialState = () => {
    setSampleCount(18);
    setRequirements({
      desiredPrompt: '',
      distributionRequirements: []
    });
    setIsValidating(false);
    setValidationResult(null);
    setDistributionErrors(new Map());
    setIsGettingAnswerAttributes(false);
    setAnswerAttributes(new Map());
    setValidationStep('idle');
    setProcessingStep('idle');
    stopPolling();
    resetPolling();
  };

  // Function để xử lý lỗi AI quá tải
  const handleAIOverloadError = (errorMessage: string) => {
    // Kiểm tra nếu là lỗi AI quá tải
    const normalized = normalizeAIQueueErrorMessage(errorMessage);
    if (normalized.includes('quá tải')) {
      setValidationResult({
        isValid: false,
        estimatedTokens: 0,
        error: normalized
      });
      setValidationStep('error');
      setProcessingStep('error');
      stopPolling();
      return true;
    }
    return false;
  };

  // Function để xử lý lỗi sau khi polling AI - hiển thị thông báo chuẩn
  const handlePostPollingError = (error: any) => {
    logger.error('Post-polling error:', error);
    setProcessingStep('error');
    setValidationResult({
      isValid: false,
      estimatedTokens: 0,
      error: 'Hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút'
    });
  };

  // Function để xử lý response từ polling có thể chứa error
  const handlePollingResponse = (result: any) => {
    // Kiểm tra nếu response có errorMessage
    if (result.content?.errorMessage) {
      // Luôn hiển thị thông báo chuẩn cho bất kỳ lỗi nào từ AI
      handlePostPollingError(result.content.errorMessage);
      return false; // Đã xử lý lỗi, không tiếp tục
    }
    return true; // Tiếp tục xử lý bình thường
  };

  // Bỏ auto validation - chỉ validate khi user submit

  // Validate distribution requirements
  const validateDistributionRequirements = () => {
    const newErrors = new Map<string, string>();
    const newInvalidFieldKeys = new Set<string>();
    // Kiểm tra mỗi option 0-100 và tổng <= 100
    requirements.distributionRequirements?.forEach((dist) => {
      const total = dist.targetDistribution.reduce((sum, t) => sum + (Number.isFinite(t.percentage) ? t.percentage : 0), 0);
      dist.targetDistribution.forEach((t) => {
        if (t.percentage < 0 || t.percentage > 100 || Number.isNaN(t.percentage)) {
          newInvalidFieldKeys.add(`${dist.questionId}:${t.optionId}`);
        }
      });
      if (total > 100 + 1e-6) {
        newErrors.set(dist.questionId, 'Tổng tỷ lệ không vượt quá 100%');
      }
    });

    setDistributionErrors(newErrors);
    setInvalidFieldKeys(newInvalidFieldKeys);
    return newErrors.size === 0 && newInvalidFieldKeys.size === 0;
  };

  // Check if all validations pass
  const isFormValid = useMemo(() => {
    return distributionErrors.size === 0;
  }, [distributionErrors]);

  // Validate khi requirements thay đổi
  useEffect(() => {
    validateDistributionRequirements();
  }, [requirements.distributionRequirements]);

  // Function để lấy answerAttribute cho tất cả câu hỏi trong một request
  const getAllAnswerAttributesForForm = async () => {
    try {
      // Filter out options with 0% percentage and drop questions with no remaining targets
      const filteredRequirements = {
        ...requirements,
        distributionRequirements: (requirements.distributionRequirements
          ?.map((dist) => ({
            ...dist,
            targetDistribution: dist.targetDistribution.filter((target) => target.percentage > 0)
          }))
          .filter((dist) => dist.targetDistribution.length > 0))
      };
      
      logger.log('Calling getAnswerAttributesWithNewStructure API with payload:', {
        formId: formData.id,
        sampleCount,
        requirements: filteredRequirements
      });

      // Gọi API để lấy tất cả answerAttribute trong một request với cấu trúc mới
      const response = await getAnswerAttributesWithNewStructure(formData.id, sampleCount, filteredRequirements);

      logger.log('Received answerAttributes response:', response);

      // Kiểm tra response structure - có thể là ACCEPTED, QUEUED hoặc OK
      if (response.status === 'ACCEPTED' || response.status === 'QUEUED') {
        const requestId = response.content?.requestId || response.requestId;
        if (!requestId) {
          throw new Error('Request queued but no requestId received');
        }

        // Trường hợp queue-based processing
        logger.log('Request accepted/queued, starting polling with requestId:', requestId);

        // Bắt đầu polling
        currentRequestIdRef.current = requestId;
        startPolling(
          requestId,
          (result) => {
            // Polling thành công
            logger.log('Polling completed successfully:', result);

            // Kiểm tra nếu response có lỗi
            if (!handlePollingResponse(result)) {
              return; // Đã xử lý lỗi, không tiếp tục
            }

            // Tạo request với response từ polling
            const request: AISuggestionRequest = {
              formId: formData.id,
              sampleCount,
              requirements,
              formData: {
                id: formData.id,
                name: formData.name,
                questions: formData.questions
              },
              answerAttributesResponse: {
                status: 'OK',
                content: result.content!
              }
            };

            logger.log('Submitting request with polling result:', request);

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
          },
          (error) => {
            // Polling thất bại - sử dụng thông báo chuẩn
            handlePostPollingError(error);
          }
        );
      } else if (response.status === 'OK' && response.content && 'questionAnswerAttributes' in response.content) {
        // Trường hợp response trực tiếp (legacy)
        logger.log('Direct response received, no polling needed');

        const request: AISuggestionRequest = {
          formId: formData.id,
          sampleCount,
          requirements,
          formData: {
            id: formData.id,
            name: formData.name,
            questions: formData.questions
          },
          answerAttributesResponse: {
            status: response.status,
            content: response.content as any
          }
        };

        logger.log('Submitting request with direct response:', request);

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
    } catch (error: any) {
      logger.error('Error getting answerAttributes:', error);

      // Không hiển thị lỗi nếu response thành công nhưng có status QUEUED hoặc ACCEPTED
      if (error.response?.status === 200 && (error.response?.data?.status === 'QUEUED' || error.response?.data?.status === 'ACCEPTED')) {
        logger.log('Request queued successfully, starting polling...');

        const requestId = error.response.data.content?.requestId;
        if (requestId) {
          currentRequestIdRef.current = requestId;
          startPolling(
            requestId,
            (result) => {
              // Polling thành công
              logger.log('Polling completed successfully:', result);

              // Kiểm tra nếu response có lỗi
              if (!handlePollingResponse(result)) {
                return; // Đã xử lý lỗi, không tiếp tục
              }

              // Tạo request với response từ polling
              const request: AISuggestionRequest = {
                formId: formData.id,
                sampleCount,
                requirements,
                formData: {
                  id: formData.id,
                  name: formData.name,
                  questions: formData.questions
                },
                answerAttributesResponse: {
                  status: 'OK',
                  content: result.content!
                }
              };

              logger.log('Submitting request with polling result:', request);

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
            },
            (error) => {
              // Polling thất bại - sử dụng thông báo chuẩn
              handlePostPollingError(error);
            }
          );
        } else {
          // Kiểm tra lỗi AI quá tải từ response
          const errorMessage = error.response?.data?.content?.errorMessage || 'Lỗi khi lấy thông tin câu trả lời';
          if (handleAIOverloadError(errorMessage)) {
            return;
          }
          
          // Sử dụng thông báo chuẩn cho lỗi sau polling
          handlePostPollingError(error);
        }
      } else {
        // Kiểm tra lỗi AI quá tải từ response
        const errorMessage = error.response?.data?.content?.errorMessage || 'Lỗi khi lấy thông tin câu trả lời';
        if (handleAIOverloadError(errorMessage)) {
          return;
        }
        
        // Sử dụng thông báo chuẩn cho lỗi sau polling
        handlePostPollingError(error);
      }
    }
  };

  const handleSubmit = async () => {
    // Prevent multiple rapid clicks from triggering duplicate flows
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    // Clear previous errors and reset polling before a new submission
    stopPolling();
    resetPolling();

    // Reset states
    setValidationStep('validating');
    setProcessingStep('idle');
    setValidationResult(null);

    try {
      // Filter out options with 0% percentage and drop questions with no remaining targets
      const filteredRequirements = {
        ...requirements,
        distributionRequirements: (requirements.distributionRequirements
          ?.map((dist) => ({
            ...dist,
            targetDistribution: dist.targetDistribution.filter((target) => target.percentage > 0)
          }))
          .filter((dist) => dist.targetDistribution.length > 0))
      };
      
      logger.log('Requirements being sent:', filteredRequirements);
      logger.log('DistributionRequirements:', filteredRequirements.distributionRequirements);
      const result = await validateAISuggestionRequest(formData.id, sampleCount, filteredRequirements);

      // Debug response structure
      logger.log('Raw validation result:', result);
      logger.log('Result type:', typeof result);
      logger.log('Result keys:', Object.keys(result));
      logger.log('Result.isValid:', result.isValid);
      logger.log('Result.isValid type:', typeof result.isValid);

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
        logger.log('Normalized result from success field:', normalizedResult);
      }
      // Check if response is wrapped in data field
      else if (anyResult.data && anyResult.data.isValid !== undefined) {
        normalizedResult = anyResult.data;
        logger.log('Normalized result from data field:', normalizedResult);
      }
      // Check if HTTP 200 but isValid is false/undefined, consider it success
      else if (result.isValid === undefined || result.isValid === null) {
        normalizedResult = {
          isValid: true, // Assume success if 200 OK and no explicit isValid
          estimatedTokens: result.estimatedTokens || anyResult.tokens || 0,
          estimatedCost: result.estimatedCost || anyResult.cost,
          error: result.error || anyResult.message
        };
        logger.log('Normalized result assuming success:', normalizedResult);
      }

      setValidationResult(normalizedResult);

      if (normalizedResult.isValid) {
        // Validation thành công - chuyển sang step tiếp theo
        setValidationStep('success');

        // Delay nhỏ để user thấy check mark
        await new Promise((resolve) => setTimeout(resolve, 800));

        logger.log('Validation successful, calling getAllAnswerAttributesForForm...');
        // Bắt đầu step xử lý answer attributes
        setProcessingStep('processing');
        await getAllAnswerAttributesForForm();
      } else {
        setValidationStep('error');
        logger.log('Validation failed with result:', normalizedResult);
      }
    } catch (error: any) {
      logger.error('Validation error:', error);
      logger.error('Error response:', error.response);
      logger.error('Error data:', error.response?.data);

      // Check if it's actually a successful response but axios threw error
      if (error.response?.status === 200 && error.response?.data) {
        logger.log('Handling 200 response that was caught as error');
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
          await new Promise((resolve) => setTimeout(resolve, 800));
          setProcessingStep('processing');
          logger.log('Success from catch block, calling getAllAnswerAttributesForForm...');
          await getAllAnswerAttributesForForm();
        }
      } else {
        // Kiểm tra lỗi AI quá tải từ response
        const errorMessage = error.response?.data?.content?.errorMessage || error.response?.data?.message || error.message || 'Lỗi khi kiểm tra yêu cầu';
        if (handleAIOverloadError(errorMessage)) {
          return;
        }
        
        setValidationStep('error');
        setValidationResult({
          isValid: false,
          estimatedTokens: 0,
          error: errorMessage
        });
      }
    }
    finally {
      // Allow retry if validation failed or after finishing (modal may close soon after success)
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const addDistributionRequirement = (questionId: string) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (!question || !question.options) return;

    // Xử lý grid questions - cần lấy cả row và column options
    let targetDistribution: { optionId: string; percentage: number }[] = [];
    
    if (question.type === 'multiple_choice_grid' || question.type === 'checkbox_grid') {
      // Với grid questions, tạo distribution cho tất cả combinations của row và column
      const { rowOptions, columnOptions } = getGridOptions(question);
      
      // Tạo combinations cho grid
      rowOptions.forEach((rowOpt: any) => {
        columnOptions.forEach((colOpt: any) => {
          targetDistribution.push({
            optionId: `${rowOpt.id}_${colOpt.id}`, // Tạo unique ID cho combination
            percentage: 0
          });
        });
      });
    } else {
      // Với các loại câu hỏi thông thường
      targetDistribution = question.options.map((opt) => ({
        optionId: opt.id,
        percentage: 0
      }));
    }

    const newDistribution = {
      questionId,
      targetDistribution
    };

    setRequirements((prev) => ({
      ...prev,
      distributionRequirements: [...(prev.distributionRequirements || []), newDistribution]
    }));

    // Validation sẽ chạy qua effect phụ thuộc vào requirements
  };

  const removeDistributionRequirement = (questionId: string) => {
    setRequirements((prev) => ({
      ...prev,
      distributionRequirements: prev.distributionRequirements?.filter((d) => d.questionId !== questionId) || []
    }));

    // Clear error khi xóa
    setDistributionErrors((prev) => {
      const newErrors = new Map(prev);
      newErrors.delete(questionId);
      return newErrors;
    });
  };

  const updateDistributionPercentage = (questionId: string, optionId: string, percentage: number) => {
    setRequirements((prev) => ({
      ...prev,
      distributionRequirements:
        prev.distributionRequirements?.map((dist) => {
          if (dist.questionId !== questionId) return dist;

          return {
            ...dist,
            targetDistribution: dist.targetDistribution.map((target) => (target.optionId === optionId ? { ...target, percentage } : target))
          };
        }) || []
    }));

    // Validation sẽ chạy qua effect phụ thuộc vào requirements
  };

  const addRelationship = () => {
    const numericQuestions = formData.questions.filter((q) => q.type === 'number' || q.type === 'slider' || q.type === 'rating');

    if (numericQuestions.length < 2) return;

    const newRelationship = {
      variable1: numericQuestions[0].id,
      variable2: numericQuestions[1].id,
      correlation: 0.5,
      relationshipType: 'positive' as const
    };

    setRequirements((prev) => ({
      ...prev,
      relationships: [...(prev.relationships || []), newRelationship]
    }));
  };

  const removeRelationship = (index: number) => {
    setRequirements((prev) => ({
      ...prev,
      relationships: prev.relationships?.filter((_, i) => i !== index)
    }));
  };

  const numericQuestions = formData.questions.filter((q) => q.type === 'number' || q.type === 'slider' || q.type === 'rating');

  // Lọc tất cả câu hỏi có options (có thể phân bổ) - bao gồm cả grid questions
  const choiceQuestions = formData.questions.filter((q) => 
    q.options && q.options.length > 0 && (
      q.type === 'radio' || 
      q.type === 'select' || 
      q.type === 'checkbox' ||
      q.type === 'multiple_choice_grid' ||
      q.type === 'checkbox_grid' ||
      q.type === 'rating' ||
      q.type === 'slider' ||
      q.type === 'scale'
    )
  );

  // Helper: nhãn option cho cả grid
  const getOptionLabel = (questionId: string, optionId: string) => {
    const q = formData.questions.find((x) => x.id === questionId);
    if (!q || !q.options) return optionId;
    if (q.type === 'multiple_choice_grid' || q.type === 'checkbox_grid') {
      const [rowId, colId] = optionId.split('_');
      const rowOpt = q.options.find((o) => o.id === rowId);
      const colOpt = q.options.find((o) => o.id === colId);
      const rowText = (rowOpt as any)?.text || (rowOpt as any)?.label || rowId;
      const colText = (colOpt as any)?.text || (colOpt as any)?.label || colId;
      return `${rowText} × ${colText}`;
    }
    const opt = q.options.find((o) => o.id === optionId);
    return (opt as any)?.text || (opt as any)?.label || optionId;
  };

  // Helper: lấy row và column options cho grid questions
  const getGridOptions = (question: any) => {
    if (question.type === 'multiple_choice_grid' || question.type === 'checkbox_grid') {
      const rowOptions = question.options.filter((opt: any) => opt.value && opt.value.startsWith('row'));
      const columnOptions = question.options.filter((opt: any) => opt.value && !opt.value.startsWith('row'));
      return { rowOptions, columnOptions };
    }
    return { rowOptions: [], columnOptions: [] };
  };

  return (
    <Dialog
      open={open}
      onClose={async (_, reason) => {
        // Hủy request nếu đóng popup bằng backdrop hoặc phím Escape
        await cancelIfNeeded();
        resetFormToInitialState();
        onClose();
      }}
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
          <Box
            sx={{
              width: 40,
              height: 40,
              minWidth: 40,
              minHeight: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              p: 0,
              m: 0,
              lineHeight: 0
            }}
          >
            <SmartToyIcon sx={{ fontSize: 22 }} />
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
          <Box
            sx={{
              background: '#F9F9F9',
              borderRadius: 2,
              p: 3,
              border: '1px solid #F0F0F0'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: '#673AB7' }}>
              Số lượng mẫu <span style={{ color: '#F44336' }}>*</span>
            </Typography>

            <Grid container spacing={3} alignItems="center">
              {/* Left side - Counter */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  <IconButton
                    onClick={() => setSampleCount(Math.max(5, sampleCount - 1))}
                    disabled={sampleCount <= 5 || isValidating}
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
                      if (value >= 5 && value <= 200) {
                        setSampleCount(value);
                      }
                    }}
                    inputProps={{ min: 5, max: 200 }}
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
                    onClick={() => setSampleCount(Math.min(200, sampleCount + 1))}
                    disabled={sampleCount >= 200 || isValidating}
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
                      {[5, 10, 50, 100, 200].map((count) => (
                        <Chip
                          key={count}
                          label={count}
                          onClick={() => setSampleCount(count)}
                          disabled={isValidating}
                          variant={sampleCount === count ? 'filled' : 'outlined'}
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
                  <Box
                    sx={{
                      background: 'white',
                      borderRadius: 1,
                      p: 2,
                      border: '1px solid #E8E8E8'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#9575CD', display: 'block', lineHeight: 1.4 }}>
                      💡 <strong>Gợi ý:</strong> Với {sampleCount} mẫu, AI sẽ tạo dữ liệu đa dạng và phù hợp với yêu cầu của bạn.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#757575', display: 'block', mt: 0.5 }}>
                      Phạm vi: 5-200 mẫu
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Yêu cầu mong muốn (tuỳ chọn) */}
          <Box
            sx={{
              background: '#F9F9F9',
              borderRadius: 2,
              p: 3,
              border: '1px solid #F0F0F0'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: '#673AB7' }}>
              Yêu cầu mong muốn (Tùy chọn)
            </Typography>
            <TextField
              placeholder="Mô tả yêu cầu tổng quan bạn muốn..."
              multiline
              minRows={4}
              fullWidth
              value={requirements.desiredPrompt || ''}
              onChange={(e) =>
                setRequirements((prev) => ({
                  ...prev,
                  desiredPrompt: e.target.value
                }))
              }
            />
          </Box>

          {/* Yêu cầu thống kê (đã tạm ẩn theo yêu cầu) */}
          {false && numericQuestions.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Yêu cầu thống kê (Tùy chọn)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Nội dung bị ẩn */}
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
                              onChange={(e) =>
                                setRequirements((prev) => ({
                                  ...prev,
                                  relationships: prev.relationships?.map((rel, i) =>
                                    i === index ? { ...rel, variable1: e.target.value } : rel
                                  )
                                }))
                              }
                            >
                              {numericQuestions.map((q) => (
                                <MenuItem key={q.id} value={q.id}>
                                  {q.title}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Biến 2</InputLabel>
                            <Select
                              value={relationship.variable2}
                              onChange={(e) =>
                                setRequirements((prev) => ({
                                  ...prev,
                                  relationships: prev.relationships?.map((rel, i) =>
                                    i === index ? { ...rel, variable2: e.target.value } : rel
                                  )
                                }))
                              }
                            >
                              {numericQuestions.map((q) => (
                                <MenuItem key={q.id} value={q.id}>
                                  {q.title}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption">Mức độ tương quan: {relationship.correlation}</Typography>
                          <Slider
                            value={relationship.correlation || 0}
                            onChange={(_, value) =>
                              setRequirements((prev) => ({
                                ...prev,
                                relationships: prev.relationships?.map((rel, i) =>
                                  i === index ? { ...rel, correlation: value as number } : rel
                                )
                              }))
                            }
                            min={-1}
                            max={1}
                            step={0.1}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <Button variant="outlined" size="small" color="error" onClick={() => removeRelationship(index)}>
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

          {/* Yêu cầu phân bố (Tùy chọn) */}
          {choiceQuestions.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Yêu cầu phân bố (Tùy chọn)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', overflowX: 'visible' }}>
                    <Typography variant="body2" sx={{ color: '#757575' }}>
                      Chọn câu hỏi muốn đặt tỷ lệ (không cần đủ 100%):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                      {choiceQuestions.map((q) => {
                        const alreadyAdded = requirements.distributionRequirements?.some((d) => d.questionId === q.id);
                        return (
                          <Chip
                            key={q.id}
                            size="small"
                            label={q.title}
                            onClick={() => !alreadyAdded && addDistributionRequirement(q.id)}
                            disabled={alreadyAdded}
                            variant={alreadyAdded ? 'filled' : 'outlined'}
                            sx={{
                              backgroundColor: alreadyAdded ? '#673AB7' : 'white',
                              color: alreadyAdded ? 'white' : '#9575CD',
                              borderColor: alreadyAdded ? '#673AB7' : '#D1C4E9',
                              fontWeight: 600,
                              maxWidth: { xs: '100%', sm: 240 },
                              // Ensure label truncates nicely with ellipsis
                              '& .MuiChip-label': {
                                display: 'block',
                                maxWidth: { xs: '100%', sm: 200 },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>

                  {requirements.distributionRequirements?.map((dist) => {
                    const q = formData.questions.find((x) => x.id === dist.questionId);
                    if (!q) return null;
                    
                    // Check if this is a grid question
                    const isGridQuestion = q.type === 'multiple_choice_grid' || q.type === 'checkbox_grid';
                    
                    if (isGridQuestion) {
                      const { rowOptions, columnOptions } = getGridOptions(q);
                      
                      return (
                        <Box key={dist.questionId} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {q.title}
                            </Typography>
                            <Button size="small" color="error" variant="outlined" onClick={() => removeDistributionRequirement(dist.questionId)}>
                              Xóa
                            </Button>
                          </Box>
                          {distributionErrors.get(dist.questionId) && (
                            <Alert severity="warning" sx={{ mb: 2, py: 1, px: 1.25 }}>
                              <Typography variant="body2">{distributionErrors.get(dist.questionId)}</Typography>
                            </Alert>
                          )}
                          
                          {/* Grid Table */}
                          <TableContainer component={Paper} sx={{ mb: 2 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell />
                                  {columnOptions.map((col: any) => (
                                    <TableCell key={col.id} align="center">
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {col.text}
                                      </Typography>
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {rowOptions.map((row: any) => (
                                  <TableRow key={row.id}>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {row.text}
                                      </Typography>
                                    </TableCell>
                                    {columnOptions.map((col: any) => {
                                      const optionId = `${row.id}_${col.id}`;
                                      const targetDist = dist.targetDistribution.find(t => t.optionId === optionId);
                                      const percentage = targetDist?.percentage || 0;
                                      
                                      return (
                                        <TableCell key={col.id} align="center">
                                          <TextField
                                            size="small"
                                            type="number"
                                            value={percentage}
                                            inputProps={{ min: 0, max: 100 }}
                                            onFocus={(e) => {
                                              if (e.target.value === '0') {
                                                (e.target as HTMLInputElement).value = '';
                                              }
                                            }}
                                            onChange={(e) =>
                                              updateDistributionPercentage(
                                                dist.questionId,
                                                optionId,
                                                Math.max(0, Math.min(100, Number(e.target.value)))
                                              )
                                            }
                                            error={invalidFieldKeys.has(`${dist.questionId}:${optionId}`)}
                                            helperText={invalidFieldKeys.has(`${dist.questionId}:${optionId}`) ? '0–100%' : '%'}
                                            sx={{ width: 80 }}
                                          />
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ color: '#757575' }}>
                              Không cần đủ 100%. AI sẽ tự phân bổ phần còn lại.
                            </Typography>
                          </Box>
                        </Box>
                      );
                    }
                    
                    // Regular question display
                    return (
                      <Box key={dist.questionId} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {q.title}
                          </Typography>
                          <Button size="small" color="error" variant="outlined" onClick={() => removeDistributionRequirement(dist.questionId)}>
                            Xóa
                          </Button>
                        </Box>
                        {distributionErrors.get(dist.questionId) && (
                          <Alert severity="warning" sx={{ mb: 1, py: 1, px: 1.25 }}>
                            <Typography variant="body2">{distributionErrors.get(dist.questionId)}</Typography>
                          </Alert>
                        )}
                        <Grid container spacing={1}>
                          {dist.targetDistribution.map((t) => (
                            <Grid key={t.optionId} item xs={12} sm={6} md={4}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label={getOptionLabel(dist.questionId, t.optionId)}
                                value={t.percentage}
                                inputProps={{ min: 0, max: 100 }}
                                onFocus={(e) => {
                                  if (e.target.value === '0') {
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }}
                                onChange={(e) =>
                                  updateDistributionPercentage(
                                    dist.questionId,
                                    t.optionId,
                                    Math.max(0, Math.min(100, Number(e.target.value)))
                                  )
                                }
                                error={invalidFieldKeys.has(`${dist.questionId}:${t.optionId}`)}
                                helperText={invalidFieldKeys.has(`${dist.questionId}:${t.optionId}`) ? '0 – 100%' : '%'}
                              />
                            </Grid>
                          ))}
                        </Grid>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ color: '#757575' }}>
                            Không cần đủ 100%. AI sẽ tự phân bổ phần còn lại.
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Step indicators - chỉ hiện khi bắt đầu quá trình */}
          {(validationStep !== 'idle' || processingStep !== 'idle' || pollingState.isPolling) && (
            <Box sx={{ mt: 2 }}>
              {/* Step 1: Validation */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {validationStep === 'validating' && <CircularProgress size={24} sx={{ color: '#673AB7' }} />}
                {validationStep === 'success' && <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 24 }} />}
                {validationStep === 'error' && (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#F44336',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                      !
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      validationStep === 'success'
                        ? '#4CAF50'
                        : validationStep === 'error'
                          ? '#F44336'
                          : validationStep === 'validating'
                            ? '#673AB7'
                            : '#757575',
                    fontWeight: validationStep === 'validating' || validationStep === 'success' ? 600 : 400
                  }}
                >
                  {validationStep === 'validating' && 'Đang kiểm tra yêu cầu...'}
                  {validationStep === 'success' && 'Kiểm tra yêu cầu thành công'}
                  {validationStep === 'error' && 'Kiểm tra yêu cầu thất bại'}
                </Typography>
              </Box>

              {/* Step 2: Processing - chỉ hiện khi step 1 thành công */}
              {(validationStep === 'success' || processingStep !== 'idle' || pollingState.isPolling) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {(processingStep === 'processing' || pollingState.isPolling) && <CircularProgress size={24} sx={{ color: '#673AB7' }} />}
                  {processingStep === 'success' && <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 24 }} />}
                  {processingStep === 'error' && (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#F44336',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        !
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        processingStep === 'success'
                          ? '#4CAF50'
                          : processingStep === 'error'
                            ? '#F44336'
                            : processingStep === 'processing' || pollingState.isPolling
                              ? '#673AB7'
                              : '#757575',
                      fontWeight: processingStep === 'processing' || pollingState.isPolling || processingStep === 'success' ? 600 : 400
                    }}
                  >
                    {pollingState.isPolling && pollingState.status === 'QUEUED' && 'Đang chờ xử lý...'}
                    {pollingState.isPolling && pollingState.status === 'PROCESSING' && 'AI đang phân tích dữ liệu form...'}
                    {processingStep === 'processing' && !pollingState.isPolling && 'Đang xử lý câu trả lời cho toàn bộ form...'}
                    {processingStep === 'success' && 'Xử lý câu trả lời thành công'}
                    {processingStep === 'error' && 'Xử lý câu trả lời thất bại'}
                  </Typography>

                  {/* Hiển thị progress bar nếu đang polling */}
                  {pollingState.isPolling && pollingState.progress && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <Box
                        sx={{
                          width: `${pollingState.progress}%`,
                          height: 4,
                          backgroundColor: '#673AB7',
                          borderRadius: 2,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                  )}

                  {/* Hiển thị thông tin thời gian chờ */}
                  {pollingState.isPolling && pollingState.estimatedWaitTime && (
                    <Typography variant="caption" sx={{ color: '#757575', mt: 0.5 }}>
                      Ước tính: {pollingState.estimatedWaitTime} giây
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Error message */}
          {(validationResult && !validationResult.isValid) || (pollingState.status === 'FAILED' && pollingState.error) ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">{pollingState.error || validationResult?.error}</Typography>
            </Alert>
          ) : null}

          {/* Success message */}
          {validationResult && validationResult.isValid && (processingStep === 'success' || pollingState.status === 'COMPLETED') && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="h6">Tạo dữ liệu mẫu thành công!</Typography>
              <Typography variant="body2">
                Đã tạo dữ liệu mẫu cho các câu hỏi thành công! Ước tính: {validationResult.estimatedTokens.toLocaleString()} tokens
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={async () => {
            await cancelIfNeeded();
            // Reset form về trạng thái ban đầu
            resetFormToInitialState();
            // Đóng modal
            onClose();
          }}
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
          startIcon={
            validationStep === 'validating' || processingStep === 'processing' || pollingState.isPolling ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <AutoAwesomeIcon />
            )
          }
          disabled={isSubmitting || validationStep === 'validating' || processingStep === 'processing' || pollingState.isPolling || !isFormValid}
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
          {isSubmitting || validationStep === 'validating'
            ? 'Đang kiểm tra...'
            : processingStep === 'processing' || pollingState.isPolling
              ? 'Đang xử lý...'
              : 'Tạo dữ liệu mẫu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
