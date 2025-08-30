// AI Suggestion Types
// Thiết kế để dễ mapping với UI và BE, có cấu trúc rõ ràng

// Import dependencies
import { Question } from '../api/form';

// Request types - Đơn giản, dễ mapping với UI
export interface AISuggestionRequest {
  formId: string;
  sampleCount: number; // Số mẫu muốn tạo
  requirements: {
    statisticalRequirements?: {
      mean?: number;
      standardDeviation?: number;
      minValue?: number;
      maxValue?: number;
    };
    relationships?: {
      variable1: string; // questionId
      variable2: string; // questionId
      correlation?: number; // -1 đến 1
      relationshipType?: 'positive' | 'negative' | 'independent';
    }[];
    distributionRequirements?: {
      questionId: string;
      targetDistribution: {
        optionId: string;
        percentage: number;
      }[];
    }[];
  };
  formData: {
    id: string;
    name: string;
    questions: Question[];
  };
  answerAttributes?: {
    [questionId: string]: any;
  };
  answerAttributesResponse?: {
    status: string;
    content?:
      | {
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
        }
      | {
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
        }
      | {
          requestId: string;
          estimatedWaitTime: number;
          message: string;
          priority: number;
          status: string;
        }
      | {
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
  };
}

// Response types - Dễ dàng hiển thị và áp dụng vào UI
export interface AISuggestionResponse {
  success: boolean;
  data: {
    samples: FormSample[];
    statistics: SampleStatistics;
    metadata: {
      totalTokens: number;
      processingTime: number;
      modelUsed: string;
    };
  };
  error?: string;
}

export interface FormSample {
  sampleId: string;
  answers: QuestionAnswer[];
}

export interface QuestionAnswer {
  questionId: string;
  questionType: string;
  answer: string | string[] | number | null;
  answerAttribute?: {
    optionId?: string;
    optionIds?: string[]; // Cho checkbox
    optionText?: string;
    optionTexts?: string[]; // Cho checkbox
    otherText?: string;
    numericValue?: number;
    textValue?: string;
  };
}

export interface SampleStatistics {
  totalSamples: number;
  questionStats: {
    [questionId: string]: {
      mean?: number;
      standardDeviation?: number;
      distribution?: {
        [optionId: string]: number; // Số lượng chọn option này
      };
      correlation?: {
        [otherQuestionId: string]: number;
      };
    };
  };
  overallCorrelation: {
    [questionPair: string]: number; // "questionId1-questionId2"
  };
}

// Error types
export interface AISuggestionError {
  code: 'INVALID_INPUT' | 'TOKEN_LIMIT_EXCEEDED' | 'AI_SERVICE_ERROR' | 'VALIDATION_FAILED';
  message: string;
  details?: {
    field?: string;
    value?: any;
    constraint?: string;
  };
}

// Validation response
export interface AISuggestionValidationResponse {
  isValid: boolean;
  estimatedTokens: number;
  estimatedCost?: number;
  error?: string;
}
