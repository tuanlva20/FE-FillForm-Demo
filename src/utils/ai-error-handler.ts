// AI Error Handler Utility
// Xử lý và chuẩn hóa lỗi từ AI suggestion service
import { logger } from './logger';

/**
 * Validate tổng tỉ lệ phân bố có bằng 100% không
 * @param distributions - Array các target distribution
 * @returns Object với isValid và error message
 */
export const validateDistributionPercentages = (
  distributions: { optionId: string; percentage: number }[]
): { isValid: boolean; error?: string } => {
  if (distributions.length === 0) {
    return { isValid: true };
  }

  const totalPercentage = distributions.reduce((sum, dist) => sum + (dist.percentage || 0), 0);
  const roundedTotal = Math.round(totalPercentage * 10) / 10;

  if (roundedTotal !== 100) {
    return {
      isValid: false,
      error: `Tổng tỉ lệ nên = 100%. Hiện tại: ${roundedTotal}%`
    };
  }

  return { isValid: true };
};

/**
 * Xử lý lỗi từ AI suggestion service và trả về message thân thiện
 * @param error - Error object từ API hoặc network
 * @returns String message để hiển thị cho user
 */
export const handleAISuggestionError = (error: any): string => {
  // Nếu error có cấu trúc AISuggestionError
  if (error?.code) {
    switch (error.code) {
      case 'INVALID_INPUT':
        return `Dữ liệu đầu vào không hợp lệ${error.details?.field ? `: ${error.details.field}` : ''}`;

      case 'TOKEN_LIMIT_EXCEEDED':
        return 'Yêu cầu quá lớn. Vui lòng giảm số lượng mẫu hoặc độ phức tạp của form.';

      case 'VALIDATION_FAILED':
        return `Lỗi validation${error.details?.constraint ? `: ${error.details.constraint}` : ''}`;

      case 'AI_SERVICE_ERROR':
        return 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau ít phút.';

      default:
        return error.message || 'Lỗi không xác định từ dịch vụ AI';
    }
  }

  // Nếu error từ axios response
  if (error?.response?.data) {
    const responseData = error.response.data;

    // Nếu BE trả về error theo format chuẩn
    if (responseData.error && typeof responseData.error === 'string') {
      return responseData.error;
    }

    // Nếu BE trả về error object
    if (responseData.code) {
      return handleAISuggestionError(responseData);
    }

    // HTTP status codes
    switch (error.response.status) {
      case 400:
        return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.';
      case 401:
        return 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
      case 403:
        return 'Bạn không có quyền sử dụng tính năng AI gợi ý.';
      case 429:
        return 'Bạn đã sử dụng quá giới hạn. Vui lòng thử lại sau.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau ít phút.';
      case 503:
        return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
      default:
        return `Lỗi mạng (${error.response.status}). Vui lòng thử lại.`;
    }
  }

  // Network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
  }

  // Timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại với ít mẫu hơn.';
  }

  // Generic error message
  if (error?.message && typeof error.message === 'string') {
    return `Lỗi: ${error.message}`;
  }

  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
};

/**
 * Chuẩn hóa error message trả về trong content.errorMessage của queue status API
 * Nhận vào một chuỗi dài (thường bao gồm stack chuỗi gọi dịch vụ AI) và rút gọn, dịch thân thiện.
 */
export const normalizeAIQueueErrorMessage = (errorMessage: string | undefined | null): string => {
  if (!errorMessage || typeof errorMessage !== 'string') return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';

  const msg = errorMessage.replace(/\s+/g, ' ').trim();

  // Model overload patterns
  if (/overloaded/i.test(msg) || /UNAVAILABLE/i.test(msg) || /\b503\b/.test(msg)) {
    return 'Hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút.';
  }

  // Token/quota/limit style
  if (/quota|limit|rate limit|exceeded/i.test(msg)) {
    return 'Bạn đã đạt giới hạn sử dụng AI. Vui lòng chờ hoặc giảm yêu cầu và thử lại.';
  }

  // Trích thông điệp ngắn gọn nhất bên trong JSON nếu có
  const jsonMessageMatch = msg.match(/\"message\"\s*:\s*\"([^\"]+)\"/);
  if (jsonMessageMatch && jsonMessageMatch[1]) {
    return jsonMessageMatch[1];
  }

  // Loại bỏ tiền tố rườm rà "Failed to generate ...: Failed to ...:"
  const simplified = msg.replace(/^(Failed to [^:]+:\s*)+/i, '').trim();
  if (simplified.length > 0 && simplified.length < 240) return simplified;

  // Rút gọn nếu quá dài
  if (simplified.length > 240) {
    return simplified.slice(0, 237) + '...';
  }

  return 'Hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút.';
};

/**
 * Validate input trước khi gửi AI suggestion request
 * @param sampleCount - Số lượng mẫu
 * @param formQuestions - Danh sách câu hỏi trong form
 * @returns Object với isValid và error message
 */
export const validateAISuggestionInput = (sampleCount: number, formQuestions: any[]): { isValid: boolean; error?: string } => {
  // Kiểm tra số lượng mẫu
  if (!Number.isInteger(sampleCount) || sampleCount <= 0) {
    return { isValid: false, error: 'Số lượng mẫu phải là số nguyên dương' };
  }

  if (sampleCount > 1000) {
    return { isValid: false, error: 'Số lượng mẫu không được vượt quá 1000' };
  }

  // Kiểm tra form có câu hỏi
  if (!formQuestions || formQuestions.length === 0) {
    return { isValid: false, error: 'Form phải có ít nhất 1 câu hỏi' };
  }

  // Kiểm tra có ít nhất 1 câu hỏi có thể generate được
  const generateableQuestions = formQuestions.filter((q) =>
    ['radio', 'select', 'checkbox', 'text', 'textarea', 'number', 'email', 'phone', 'date', 'time', 'slider', 'rating'].includes(q.type)
  );

  if (generateableQuestions.length === 0) {
    return { isValid: false, error: 'Form không có câu hỏi nào có thể tạo dữ liệu mẫu' };
  }

  return { isValid: true };
};

/**
 * Log error cho debugging (chỉ trong development)
 * @param error - Error object
 * @param context - Context thông tin thêm
 */
export const logAISuggestionError = (error: any, context?: string) => {
  logger.group('🤖 AI Suggestion Error');
  if (context) {
    logger.log('Context:', context);
  }
  logger.error('Error:', error);
  if (error?.response) {
    logger.log('Response data:', error.response.data);
    logger.log('Response status:', error.response.status);
  }
  if (error?.config) {
    logger.log('Request config:', {
      url: error.config.url,
      method: error.config.method,
      data: error.config.data
    });
  }
  logger.groupEnd();
};
