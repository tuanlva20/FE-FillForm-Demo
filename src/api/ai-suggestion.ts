// AI Suggestion API
// Endpoint cho việc gọi AI service để tạo dữ liệu mẫu

import {
    AISuggestionRequest,
    AISuggestionResponse,
    AISuggestionValidationResponse
} from 'types/ai-suggestion';
import axiosServices from 'utils/axios';

const AI_SUGGESTION_ENDPOINT = '/api/ai-suggestion';

/**
 * Tạo dữ liệu mẫu bằng AI
 * @param request - Thông tin form và yêu cầu tạo mẫu
 * @returns Promise với kết quả AI suggestion
 */
export const generateAISuggestions = async (
  request: AISuggestionRequest
): Promise<AISuggestionResponse> => {
  const response = await axiosServices.post(AI_SUGGESTION_ENDPOINT, request);
  return response.data;
};

/**
 * Validate yêu cầu AI suggestion trước khi gửi
 * @param formId - ID của form
 * @param sampleCount - Số lượng mẫu muốn tạo
 * @param requirements - Yêu cầu thống kê (optional)
 * @returns Promise với kết quả validation
 */
export const validateAISuggestionRequest = async (
  formId: string,
  sampleCount: number,
  requirements?: AISuggestionRequest['requirements']
): Promise<AISuggestionValidationResponse> => {
  const response = await axiosServices.post(`${AI_SUGGESTION_ENDPOINT}/validate`, {
    formId,
    sampleCount,
    requirements
  });
  return response.data;
};

/**
 * Lấy answerAttribute cho mỗi câu hỏi
 * @param formId - ID của form
 * @param questionId - ID của câu hỏi
 * @param requirements - Yêu cầu thống kê (optional)
 * @returns Promise với answerAttribute
 */
export const getAnswerAttribute = async (
  formId: string,
  questionId: string,
  requirements?: AISuggestionRequest['requirements']
): Promise<{
  questionId: string;
  answerAttribute: any;
}> => {
  const response = await axiosServices.post(`${AI_SUGGESTION_ENDPOINT}/answer-attribute`, {
    formId,
    questionId,
    requirements
  });
  return response.data;
};

/**
 * Lấy tất cả answerAttribute cho toàn bộ form trong một request
 * @param formId - ID của form
 * @param sampleCount - Số lượng mẫu muốn tạo
 * @param requirements - Yêu cầu thống kê (optional)
 * @returns Promise với tất cả answerAttribute
 */
export const getAllAnswerAttributes = async (
  formId: string,
  sampleCount: number,
  requirements?: AISuggestionRequest['requirements']
): Promise<{
  [questionId: string]: any;
}> => {
  const response = await axiosServices.post(`${AI_SUGGESTION_ENDPOINT}/answer-attributes`, {
    formId,
    sampleCount,
    requirements
  });
  return response.data;
};

/**
 * Lấy answer attributes với cấu trúc response mới từ BE
 * @param formId - ID của form
 * @param sampleCount - Số lượng mẫu muốn tạo
 * @param requirements - Yêu cầu thống kê (optional)
 * @returns Promise với response mới từ BE
 */
export const getAnswerAttributesWithNewStructure = async (
  formId: string,
  sampleCount: number,
  requirements?: AISuggestionRequest['requirements']
): Promise<{
  status: string;
  content?: {
    formId: string;
    formTitle: string;
    sampleCount: number;
    questionAnswerAttributes: Array<{
      questionId: string;
      questionTitle: string;
      questionType: string;
      isRequired: boolean;
      optionDistributions: Array<{
        optionId: string;
        optionText: string;
        optionValue: string;
        percentage: number;
        sampleValues: string[];
        description: string | null;
      }>;
      sampleAnswers: string[];
      description: string | null;
    }>;
    generatedAt: string;
    requestId: string;
  } | {
    requestId: string;
    estimatedWaitTime: number;
    message: string;
    priority: number;
    status: string;
  };
  requestId?: string;
  message?: string;
  estimatedWaitTime?: number;
  priority?: number;
  pageSize?: number | null;
  pageNumber?: number | null;
  totalPages?: number | null;
  totalElements?: number | null;
}> => {
  const response = await axiosServices.post(`${AI_SUGGESTION_ENDPOINT}/answer-attributes`, {
    formId,
    sampleCount,
    requirements
  });
  return response.data;
};

/**
 * Poll status của AI suggestion request
 * @param requestId - ID của request từ queue
 * @returns Promise với status và kết quả (nếu hoàn thành)
 */
export const pollAISuggestionStatus = async (requestId: string): Promise<{
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'OK';
  message?: string;
  estimatedWaitTime?: number;
  priority?: number;
  content?: {
    formId: string;
    formTitle: string;
    sampleCount: number;
    questionAnswerAttributes: Array<{
      questionId: string;
      questionTitle: string;
      questionType: string;
      isRequired: boolean;
      optionDistributions: Array<{
        optionId: string;
        optionText: string;
        optionValue: string;
        percentage: number;
        sampleValues: string[];
        description: string | null;
      }>;
      sampleAnswers: string[];
      description: string | null;
    }>;
    generatedAt: string;
    requestId: string;
  } | {
    result: {
      formId: string;
      formTitle: string;
      sampleCount: number;
      questionAnswerAttributes: Array<{
        questionId: string;
        questionTitle: string;
        questionType: string;
        isRequired: boolean;
        optionDistributions: Array<{
          optionId: string;
          optionText: string;
          optionValue: string;
          percentage: number;
          sampleValues: string[];
          description: string | null;
        }>;
        sampleAnswers: string[];
        description: string | null;
      }>;
      generatedAt: string;
      requestId: string;
    };
    createdAt: string;
    queuedAt: string;
    maxRetries: number;
    queuePosition: number;
    requestId: string;
    retryCount: number;
    errorMessage?: string;
    priority: number;
    processingStartedAt?: string;
    processingCompletedAt?: string | null;
    status: string;
  } | {
    createdAt: string;
    queuedAt: string;
    maxRetries: number;
    queuePosition: number;
    requestId: string;
    retryCount: number;
    errorMessage?: string;
    priority: number;
    processingStartedAt?: string;
    processingCompletedAt?: string | null;
    status: string;
  };
  error?: string;
  pageSize?: number | null;
  pageNumber?: number | null;
  totalPages?: number | null;
  totalElements?: number | null;
}> => {
  const response = await axiosServices.get(`${AI_SUGGESTION_ENDPOINT}/status/${requestId}`);
  return response.data;
};

/**
 * Lấy thông tin về giới hạn và quota của AI service
 * @returns Promise với thông tin quota
 */
export const getAISuggestionQuota = async (): Promise<{
  remainingTokens: number;
  maxSamplesPerRequest: number;
  maxRequestsPerDay: number;
  usedRequestsToday: number;
}> => {
  const response = await axiosServices.get(`${AI_SUGGESTION_ENDPOINT}/quota`);
  return response.data;
};
