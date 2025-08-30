import { logger } from './logger';

export type FieldErrorMap = Record<string, string>;

export type ParsedApiError = {
  type: 'ResponseModel' | 'AuthFailure' | 'Axios' | 'Network' | 'Unknown';
  httpStatus?: number;
  status?: string; // e.g., 'BAD_REQUEST', 'CONFLICT'
  errorCode?: number;
  message: string;
  fieldErrors?: FieldErrorMap;
  raw?: any;
};

const DEFAULT_ERROR_MESSAGE = 'Có lỗi hệ thống, vui lòng thử lại sau';

function extractFieldErrors(details: any): FieldErrorMap | undefined {
  if (!details) return undefined;
  const errors = details.errors;
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const mapped: FieldErrorMap = {};
    Object.keys(errors).forEach((key) => {
      const value = (errors as any)[key];
      if (value == null) return;
      mapped[key] = typeof value === 'string' ? value : String(value);
    });
    return mapped;
  }
  return undefined;
}

export function parseApiError(error: any): ParsedApiError {
  // Already normalized ResponseModel
  if (error && typeof error === 'object' && 'status' in error && ('errorCode' in error || 'errorMessage' in error)) {
    const status = (error as any).status as string | undefined;
    const errorCode = (error as any).errorCode as number | undefined;
    const message = (error as any).errorMessage || DEFAULT_ERROR_MESSAGE;
    const fieldErrors = extractFieldErrors((error as any).errorDetails);
    return { type: 'ResponseModel', status, errorCode, message, fieldErrors, raw: error };
  }

  // AuthResponse failure shape
  if (error && typeof error === 'object' && 'success' in error && (error as any).success === false) {
    const message = (error as any).message || DEFAULT_ERROR_MESSAGE;
    return { type: 'AuthFailure', message, raw: error };
  }

  // AxiosError
  const maybeAxiosStatus = error?.response?.status;
  const maybeAxiosData = error?.response?.data;
  if (maybeAxiosStatus || maybeAxiosData) {
    // If server returned our standardized shapes inside data
    if (maybeAxiosData && typeof maybeAxiosData === 'object') {
      const parsedData = parseApiError(maybeAxiosData);
      return { ...parsedData, httpStatus: maybeAxiosStatus ?? parsedData.httpStatus };
    }
    const message = error?.message || DEFAULT_ERROR_MESSAGE;
    return { type: 'Axios', httpStatus: maybeAxiosStatus, message, raw: error };
  }

  // String or generic Error
  if (typeof error === 'string') {
    return { type: 'Unknown', message: error, raw: error };
  }
  if (error?.message) {
    return { type: 'Unknown', message: error.message, raw: error };
  }

  return { type: 'Unknown', message: DEFAULT_ERROR_MESSAGE, raw: error };
}

export function severityFromParsedError(parsed: ParsedApiError): 'warning' | 'error' {
  if (parsed.type === 'ResponseModel') {
    if (parsed.status === 'BAD_REQUEST') return 'warning';
    return 'error';
  }
  return 'error';
}

export function combineFormikErrors(parsed: ParsedApiError): FieldErrorMap {
  const fieldErrors = parsed.fieldErrors || {};
  return { ...fieldErrors, submit: parsed.message };
}

/**
 * Utility function để xử lý lỗi từ backend API
 * @param err - Error object từ axios
 * @param defaultMessage - Message mặc định nếu không có message từ backend
 * @returns Error message đã được xử lý
 */
export const handleApiError = (err: any, defaultMessage: string = 'Có lỗi xảy ra. Vui lòng thử lại.'): string => {
  logger.log('Error object:', err);
  logger.log('Error response:', err?.response);
  logger.log('Error response data:', err?.response?.data);

  // Do axios interceptor đang trả về error.response.data trực tiếp,
  // nên cần lấy data từ nhiều khả năng khác nhau
  const responseData = err && err.response && err.response.data ? err.response.data : err;

  // Kiểm tra nhiều cấu trúc response khác nhau từ backend
  let backendMessage: string | null = null;

  // Trường hợp data là string
  if (typeof responseData === 'string') {
    backendMessage = responseData;
  }
  // Các trường phổ biến
  else if (responseData?.message) {
    backendMessage = responseData.message;
  } else if (responseData?.error) {
    backendMessage = responseData.error;
  } else if (Array.isArray(responseData?.errors)) {
    backendMessage = responseData.errors
      .map((e: any) => (typeof e === 'string' ? e : (e?.message ?? '')))
      .filter(Boolean)
      .join(', ');
  } else if (typeof responseData?.errors === 'string') {
    backendMessage = responseData.errors;
  } else if (responseData?.detail) {
    backendMessage = responseData.detail;
  } else if (err?.message) {
    backendMessage = err.message;
  }

  // Nếu có message từ backend, ưu tiên sử dụng
  if (backendMessage) {
    logger.log('Using backend message:', backendMessage);
    return backendMessage;
  }

  // Xử lý theo HTTP status code (nếu có)
  const statusCode = err?.response?.status ?? err?.status;
  switch (statusCode) {
    case 400:
      return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
    case 401:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    case 403:
      return 'Bạn không có quyền thực hiện hành động này.';
    case 404:
      return 'Không tìm thấy tài nguyên yêu cầu. Vui lòng kiểm tra lại.';
    case 409:
      return 'Dữ liệu đã tồn tại hoặc xung đột. Vui lòng kiểm tra lại.';
    case 422:
      return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
    case 429:
      return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
    case 500:
      return 'Lỗi server. Vui lòng thử lại sau.';
    case 502:
      return 'Lỗi kết nối server. Vui lòng thử lại sau.';
    case 503:
      return 'Server đang bảo trì. Vui lòng thử lại sau.';
    case 504:
      return 'Hết thời gian kết nối. Vui lòng thử lại sau.';
    default:
      return defaultMessage;
  }
};

/**
 * Utility function để xử lý lỗi cụ thể cho form operations
 * @param err - Error object từ axios
 * @param operation - Tên operation (create, update, delete, fetch)
 * @returns Error message đã được xử lý
 */
export const handleFormError = (err: any, operation: 'create' | 'update' | 'delete' | 'fetch' = 'fetch'): string => {
  const operationMessages = {
    create: 'Có lỗi xảy ra khi tạo yêu cầu điền form. Vui lòng thử lại.',
    update: 'Có lỗi xảy ra khi cập nhật yêu cầu điền form. Vui lòng thử lại.',
    delete: 'Có lỗi xảy ra khi xóa yêu cầu điền form. Vui lòng thử lại.',
    fetch: 'Có lỗi xảy ra khi tải thông tin form. Vui lòng thử lại.'
  };

  return handleApiError(err, operationMessages[operation]);
};

/**
 * Utility function để xử lý lỗi cụ thể cho data mapping operations
 * @param err - Error object từ axios
 * @param operation - Tên operation (check, create)
 * @returns Error message đã được xử lý
 */
export const handleDataMappingError = (err: any, operation: 'check' | 'create' = 'check'): string => {
  const operationMessages = {
    check: 'Có lỗi xảy ra khi kiểm tra dữ liệu. Vui lòng thử lại.',
    create: 'Có lỗi xảy ra khi tạo yêu cầu điền form từ data. Vui lòng thử lại.'
  };

  // Chuẩn hóa data từ error
  const data = err && err.response && err.response.data ? err.response.data : err;

  // Xử lý các lỗi đặc biệt cho data mapping
  const statusCode = err?.response?.status ?? err?.status;

  // BE cập nhật: khi isAccessible=false trả về 400 cùng errors và sheetAccessibilityInfo
  // Do interceptor có thể loại bỏ response wrapper, đừng phụ thuộc duy nhất vào status code
  if ((data?.sheetAccessibilityInfo && data?.sheetAccessibilityInfo?.isAccessible === false) || data?.errors) {
    // Ưu tiên hiển thị danh sách lỗi BE gửi về
    const reasons = Array.isArray(data?.errors) ? data.errors.join(', ') : typeof data?.errors === 'string' ? data.errors : null;

    if (data?.sheetAccessibilityInfo?.isAccessible === false) {
      const details: string[] = [];
      if (data.sheetAccessibilityInfo?.isPublic === false) details.push('sheet không công khai');
      if (!data.sheetAccessibilityInfo?.accessMethod) details.push('không có quyền truy cập');

      const base = 'Không thể truy cập Google Sheet.';
      const reasonText = reasons ? ` Lý do: ${reasons}.` : '';
      const detailText = details.length ? ` Chi tiết: ${details.join(', ')}.` : '';
      return `${base}${reasonText}${detailText}`.trim();
    }

    // Nếu không có sheetAccessibilityInfo nhưng có reasons
    if (reasons) return reasons;
  }

  // Trường hợp cũ: trả về 403 khi không truy cập được
  if (statusCode === 403) {
    return 'Không thể truy cập link Google Sheet. Vui lòng đảm bảo sheet được chia sẻ công khai hoặc có quyền truy cập.';
  }

  return handleApiError(err, operationMessages[operation]);
};

/**
 * Test function để kiểm tra cấu trúc error object
 * @param err - Error object từ axios
 */
export const testErrorStructure = (err: any) => {
  logger.log('=== ERROR STRUCTURE TEST ===');
  logger.log('Error type:', typeof err);
  logger.log('Error keys:', Object.keys(err));
  logger.log('Error response:', err.response);
  logger.log('Error response type:', typeof err.response);
  if (err.response) {
    logger.log('Response keys:', Object.keys(err.response));
    logger.log('Response data:', err.response.data);
    logger.log('Response data type:', typeof err.response.data);
    if (err.response.data) {
      logger.log('Data keys:', Object.keys(err.response.data));
    }
  }
  logger.log('Error message:', err.message);
  logger.log('=== END TEST ===');
};
