/**
 * Utility function để xử lý lỗi từ backend API
 * @param err - Error object từ axios
 * @param defaultMessage - Message mặc định nếu không có message từ backend
 * @returns Error message đã được xử lý
 */
export const handleApiError = (err: any, defaultMessage: string = 'Có lỗi xảy ra. Vui lòng thử lại.'): string => {
  console.log('Error object:', err);
  console.log('Error response:', err?.response);
  console.log('Error response data:', err?.response?.data);

  // Do axios interceptor đang trả về error.response.data trực tiếp,
  // nên cần lấy data từ nhiều khả năng khác nhau
  const responseData = (err && err.response && err.response.data) ? err.response.data : err;

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
    backendMessage = responseData.errors.map((e: any) => (typeof e === 'string' ? e : (e?.message ?? ''))).filter(Boolean).join(', ');
  } else if (typeof responseData?.errors === 'string') {
    backendMessage = responseData.errors;
  } else if (responseData?.detail) {
    backendMessage = responseData.detail;
  } else if (err?.message) {
    backendMessage = err.message;
  }

  // Nếu có message từ backend, ưu tiên sử dụng
  if (backendMessage) {
    console.log('Using backend message:', backendMessage);
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
  const data = (err && err.response && err.response.data) ? err.response.data : err;

  // Xử lý các lỗi đặc biệt cho data mapping
  const statusCode = err?.response?.status ?? err?.status;

  // BE cập nhật: khi isAccessible=false trả về 400 cùng errors và sheetAccessibilityInfo
  // Do interceptor có thể loại bỏ response wrapper, đừng phụ thuộc duy nhất vào status code
  if ((data?.sheetAccessibilityInfo && data?.sheetAccessibilityInfo?.isAccessible === false) || data?.errors) {
    // Ưu tiên hiển thị danh sách lỗi BE gửi về
    const reasons = Array.isArray(data?.errors)
      ? data.errors.join(', ')
      : (typeof data?.errors === 'string' ? data.errors : null);

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
  console.log('=== ERROR STRUCTURE TEST ===');
  console.log('Error type:', typeof err);
  console.log('Error keys:', Object.keys(err));
  console.log('Error response:', err.response);
  console.log('Error response type:', typeof err.response);
  if (err.response) {
    console.log('Response keys:', Object.keys(err.response));
    console.log('Response data:', err.response.data);
    console.log('Response data type:', typeof err.response.data);
    if (err.response.data) {
      console.log('Data keys:', Object.keys(err.response.data));
    }
  }
  console.log('Error message:', err.message);
  console.log('=== END TEST ===');
}; 