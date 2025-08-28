import { pollAISuggestionStatus } from 'api/ai-suggestion';
import { useCallback, useRef, useState } from 'react';

interface PollingState {
  isPolling: boolean;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'IDLE';
  message?: string;
  estimatedWaitTime?: number;
  progress?: number;
  error?: string;
}

interface PollingResult {
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
}

export const useAISuggestionPolling = () => {
  const [pollingState, setPollingState] = useState<PollingState>({
    isPolling: false,
    status: 'IDLE'
  });
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxAttemptsRef = useRef<number>(60); // Tối đa 5 phút (60 * 5 giây)
  const attemptsRef = useRef<number>(0);

  const startPolling = useCallback(async (requestId: string, onComplete?: (result: PollingResult) => void, onError?: (error: string) => void) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setPollingState({
      isPolling: true,
      status: 'QUEUED',
      message: 'Đang chờ xử lý...'
    });

    attemptsRef.current = 0;

    const poll = async () => {
      try {
        attemptsRef.current++;
        
        const response = await pollAISuggestionStatus(requestId);
        
        // Xử lý response từ status endpoint
        const queueContent = response.content as any;
        const queueStatus = queueContent?.status || response.status;
        const errorMessage = queueContent?.errorMessage || response.error;
        
        setPollingState(prev => ({
          ...prev,
          status: queueStatus,
          message: response.message || queueContent?.message,
          estimatedWaitTime: response.estimatedWaitTime,
          error: errorMessage
        }));

        if (queueStatus === 'COMPLETED' && response.content) {
          setPollingState(prev => ({
            ...prev,
            isPolling: false,
            status: 'COMPLETED',
            progress: 100
          }));
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          // Xử lý cấu trúc response với result nested
          let finalContent = response.content;
          if ('result' in response.content && response.content.result) {
            // Nếu có result nested, sử dụng result
            finalContent = response.content.result;
          }
          
          onComplete?.({ content: finalContent });
          return;
        }

        if (queueStatus === 'FAILED' || errorMessage) {
          setPollingState(prev => ({
            ...prev,
            isPolling: false,
            status: 'FAILED',
            error: errorMessage || 'Xử lý thất bại'
          }));
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          onError?.(errorMessage || 'Xử lý thất bại');
          return;
        }

        // Tính progress dựa trên estimatedWaitTime
        if (response.estimatedWaitTime) {
          const progress = Math.min(95, Math.max(5, (attemptsRef.current / maxAttemptsRef.current) * 100));
          setPollingState(prev => ({
            ...prev,
            progress
          }));
        }

        // Kiểm tra số lần thử tối đa
        if (attemptsRef.current >= maxAttemptsRef.current) {
          setPollingState(prev => ({
            ...prev,
            isPolling: false,
            status: 'FAILED',
            error: 'Hết thời gian chờ xử lý'
          }));
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          onError?.('Hết thời gian chờ xử lý');
          return;
        }

      } catch (error: any) {
        console.error('Polling error:', error);
        
        if (attemptsRef.current >= maxAttemptsRef.current) {
          setPollingState(prev => ({
            ...prev,
            isPolling: false,
            status: 'FAILED',
            error: 'Lỗi kết nối hoặc hết thời gian chờ'
          }));
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          onError?.('Lỗi kết nối hoặc hết thời gian chờ');
          return;
        }
      }
    };

    // Poll ngay lập tức lần đầu
    await poll();

    // Sau đó poll mỗi 5 giây
    pollingIntervalRef.current = setInterval(poll, 5000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setPollingState(prev => ({
      ...prev,
      isPolling: false
    }));
  }, []);

  const resetPolling = useCallback(() => {
    stopPolling();
    setPollingState({
      isPolling: false,
      status: 'IDLE'
    });
    attemptsRef.current = 0;
  }, [stopPolling]);

  return {
    pollingState,
    startPolling,
    stopPolling,
    resetPolling
  };
};
