import { pollAISuggestionStatus } from 'api/ai-suggestion';
import { useCallback, useRef, useState } from 'react';
import { normalizeAIQueueErrorMessage } from 'utils/ai-error-handler';

interface PollingState {
  isPolling: boolean;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'IDLE';
  message?: string;
  estimatedWaitTime?: number;
  progress?: number;
  error?: string;
}

interface PollingResult {
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
  // Configurable polling interval and max duration
  const POLL_INTERVAL_MS = Number(import.meta.env.VITE_APP_AI_POLL_INTERVAL_MS || 5000);
  const MAX_MINUTES = Number(import.meta.env.VITE_APP_AI_POLL_MAX_MINUTES || 30);
  const [pollingState, setPollingState] = useState<PollingState>({
    isPolling: false,
    status: 'IDLE'
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppedRef = useRef<boolean>(false);
  // Tính số lần thử chủ yếu để ước lượng progress; không còn dùng để auto-timeout
  const maxAttemptsRef = useRef<number>(Math.max(1, Math.ceil((MAX_MINUTES * 60 * 1000) / POLL_INTERVAL_MS)));
  const attemptsRef = useRef<number>(0);

  const startPolling = useCallback(
    async (requestId: string, onComplete?: (result: PollingResult) => void, onError?: (error: string) => void) => {
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
      }

      setPollingState({
        isPolling: true,
        status: 'QUEUED',
        message: 'Đang chờ xử lý...'
      });

      attemptsRef.current = 0;
      isStoppedRef.current = false;

      const poll = async () => {
        try {
          attemptsRef.current++;

          const response = await pollAISuggestionStatus(requestId);

          // Xử lý response từ status endpoint
          const queueContent = response.content as any;
          // Chuẩn hóa status về dạng chuẩn để so sánh
          const rawStatus = (queueContent?.status || (response as any).status || '').toString();
          const normalizedStatus = rawStatus.toUpperCase();
          const queueStatus: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' =
            normalizedStatus === 'QUEUED'
              ? 'QUEUED'
              : normalizedStatus === 'PROCESSING'
                ? 'PROCESSING'
                : normalizedStatus === 'COMPLETED'
                  ? 'COMPLETED'
                  : normalizedStatus === 'FAILED'
                    ? 'FAILED'
                    : 'PROCESSING'; // Trạng thái lạ => tiếp tục polling
          const errorMessageRaw = queueContent?.errorMessage || response.error;
          const errorMessage = normalizeAIQueueErrorMessage(errorMessageRaw);

          setPollingState((prev) => ({
            ...prev,
            status: queueStatus,
            message: response.message || queueContent?.message,
            estimatedWaitTime: response.estimatedWaitTime,
            error: errorMessage
          }));

          if (queueStatus === 'COMPLETED' && response.content) {
            setPollingState((prev) => ({
              ...prev,
              isPolling: false,
              status: 'COMPLETED',
              progress: 100
            }));
            isStoppedRef.current = true;

            // Xử lý cấu trúc response với result nested
            let finalContent = response.content;
            if ('result' in response.content && response.content.result) {
              // Nếu có result nested, sử dụng result
              finalContent = response.content.result;
            }

            onComplete?.({ content: finalContent });
            return;
          }

          if (queueStatus === 'FAILED' || errorMessageRaw) {
            setPollingState((prev) => ({
              ...prev,
              isPolling: false,
              status: 'FAILED',
              error: errorMessage || 'Xử lý thất bại'
            }));
            isStoppedRef.current = true;

            onError?.(errorMessage || 'Xử lý thất bại');
            return;
          }

          // Tính progress dựa trên estimatedWaitTime
          if (response.estimatedWaitTime != null) {
            const progress = Math.min(95, Math.max(5, (attemptsRef.current / maxAttemptsRef.current) * 100));
            setPollingState((prev) => ({
              ...prev,
              progress
            }));
          }

          // Không còn auto-timeout theo thời gian; tiếp tục polling đến khi COMPLETE/FAILED hoặc người dùng đóng popup
        } catch (error: any) {
          console.error('Polling error:', error);

          // Lỗi tạm thời: giữ vòng polling tiếp tục, không auto dừng; caller có thể dừng qua stopPolling
        } finally {
          // Lên lịch lần poll tiếp theo nếu chưa dừng
          if (!isStoppedRef.current) {
            if (pollingIntervalRef.current) {
              clearTimeout(pollingIntervalRef.current);
            }
            pollingIntervalRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          }
        }
      };

      // Poll ngay lập tức lần đầu, vòng sau sẽ được schedule trong finally
      await poll();
    },
    []
  );

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isStoppedRef.current = true;

    setPollingState((prev) => ({
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
