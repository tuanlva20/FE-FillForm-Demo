import axiosServices from 'utils/axios';

// ==============================|| API - MA HOA DATA ||============================== //

export const MAHOA_API_ENDPOINT = '/api/ma-hoa';

export type EncryptStatus = 'pending' | 'processing' | 'success' | 'error' | 'canceled';

export interface CreateEncryptRequest {
  formId?: string;
  formLink?: string;
  sheetLink: string;
}

export interface EncryptItem {
  id: string;
  formId?: string | null;
  formName: string;
  formLink: string;
  sheetLink: string;
  status: EncryptStatus;
  createdAt: string;
}

export interface EncryptListResponse {
  content: EncryptItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export const createEncryptRequest = async (payload: CreateEncryptRequest): Promise<EncryptItem> => {
  const { data } = await axiosServices.post(MAHOA_API_ENDPOINT, payload);
  return data as EncryptItem;
};

export const getEncryptList = async (page: number = 0, size: number = 10): Promise<EncryptListResponse> => {
  const { data } = await axiosServices.get(MAHOA_API_ENDPOINT, { params: { page, size } });
  return data as EncryptListResponse;
};

export const deleteEncryptItem = async (id: string): Promise<void> => {
  await axiosServices.delete(`${MAHOA_API_ENDPOINT}/${id}`);
};

// For immediate download use-case: POST and receive Excel as blob (201 Created)
export const encryptAndDownload = async (payload: CreateEncryptRequest): Promise<{ blob: Blob; filename?: string }> => {
  const response = await axiosServices.post(MAHOA_API_ENDPOINT, payload, {
    responseType: 'blob',
    validateStatus: () => true
  });

  const status = (response as any).status;
  if (status && status >= 400) {
    try {
      const headers: any = (response as any).headers || {};
      const contentType: string = String(headers['content-type'] || headers.get?.('content-type') || '');
      const blob = response.data as Blob;
      const text = await blob.text();
      const parsed = contentType.includes('application/json') ? JSON.parse(text) : JSON.parse(text);
      // Ensure we always throw an object containing errorMessage and errorDetails when available
      throw parsed && typeof parsed === 'object' ? parsed : { status, message: 'Yêu cầu mã hóa thất bại' };
    } catch (e: any) {
      // If JSON.parse failed, still throw a normalized object for UI
      const fallback = { status, errorMessage: 'Dữ liệu không hợp lệ', errorDetails: undefined } as any;
      throw e && typeof e === 'object' ? e : fallback;
    }
  }

  const disposition = (response as any).headers?.['content-disposition'] || (response as any).headers?.get?.('content-disposition');
  let filename: string | undefined;
  if (typeof disposition === 'string') {
    const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    if (match) filename = decodeURIComponent(match[1] || match[2]);
  }

  return { blob: response.data as Blob, filename };
};

export type { CreateEncryptRequest as MaHoaCreateEncryptRequest };
