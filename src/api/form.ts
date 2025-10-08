import axiosServices from 'utils/axios';

// Types
export interface FormCreateData {
  name: string;
  editLink: string;
}

export interface FormData {
  id: string;
  name: string;
  status: string;
  createdAt: string | null;
  editLink: string;
  statistics: any;
}

export interface FormListResponse {
  status: string;
  content: FormData[];
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  totalElements: number;
}

export interface Option {
  id: string;
  text: string;
  value: string;
  position: number;
  columnOptions?: any;
  row?: boolean;
}

export interface SectionData {
  liIndex: string;
  section_index: string;
  section_title: string;
  containerXPath: string;
  headingNormalized: string;
  section_description: string;
}

export interface Question {
  id: string;
  title: string;
  description: string | null;
  type: string;
  required: boolean;
  position: number;
  options: Option[];
  additionalData?: {
    sectionData?: SectionData;
    itemId?: string;
    itemType?: string;
    questionId?: string;
    paragraph?: string;
    scaleLow?: string;
    scaleHigh?: string;
    scaleLowLabel?: string;
    scaleHighLabel?: string;
    gridType?: string;
    questionGroupId?: string;
  };
}

export interface FormStatistic {
  id: string;
  totalSurvey: number;
  completedSurvey: number;
  failedSurvey: number;
  errorQuestion: number;
  updatedAt: string;
}

export interface FormDetailResponse {
  id: string;
  name: string;
  editLink: string;
  createdAt: string;
  status: string;
  formStatistic: FormStatistic;
  questions: Question[];
  fillRequests: FillRequestDTO[];
}

export interface AnswerDistribution {
  questionId: string;
  optionId: string | null;
  percentage: number;
  count: number;
  option: Option | null;
  valueString?: string;
  rowId?: string; // Thêm trường này để hỗ trợ grid
  positionIndex?: number; // Thêm trường này để đảm bảo thứ tự như user nhập
}

export interface FillRequestDTO {
  id?: string;
  surveyCount: number;
  pricePerSurvey: number;
  totalPrice?: number;
  createdAt?: string;
  status?: string;
  answerDistributions?: AnswerDistribution[];
  completedSurvey?: number;
  failedSurvey?: number;
  scheduledTime?: string;
  isHumanLike?: boolean;
  humanLike?: boolean;
  startDate?: string;
  endDate?: string;
  // Thêm các trường queue (optional để backward compatibility)
  queuePosition?: number;
  priority?: number;
  estimatedWaitTime?: number;
  queuedAt?: string;
  retryCount?: number;
  maxRetries?: number;
}

// New types for data filling functionality
export interface DataMappingRequest {
  formId: string;
  sheetLink: string;
}

export interface DataMappingResponse {
  questions: Question[];
  sheetColumns: string[];
  errors?: string[];
  unmappedQuestions?: string[];
  autoMappings?: AutoMapping[];
}

export interface AutoMapping {
  questionId: string;
  questionTitle: string;
  columnName: string;
  confidence: number;
}

export interface ColumnMapping {
  questionId: string;
  columnName: string | null;
}

export interface DataFillRequestDTO {
  formId: string;
  sheetLink: string;
  mappings: ColumnMapping[];
  submissionCount: number;
  pricePerSurvey: number;
  isHumanLike: boolean;
  startDate?: string;
  endDate?: string;
}

// Validate payload for fill-in-data before creating request
export interface ValidateFillInDataRequest {
  formId: string;
  sheetLink: string;
  mappings: ColumnMapping[];
}

export interface ValidateFillInDataResponse {
  valid: boolean;
  errors?: string[];
}

// Form Report Types
export interface FormReportItem {
  id: string;
  formName: string;
  formType: string;
  type: string;
  createdAt: string;
  status: string;
  statusDisplayName: string;
  completionProgress: string;
  totalCost: number;
  costPerSurvey: number;
  surveyCount: number;
  completedSurvey: number;
  failedSurvey: number;
  formUrl: string;
  formStatus: string;
  formStatusDisplayName: string;
  startDate: string;
  endDate: string;
  estimatedCompletionDate: string;
  priority: number;
  queuePosition: number | null;
  queuedAt: string | null;
  retryCount: number;
  maxRetries: number;
}

export interface FormReportResponse {
  content: FormReportItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export interface FormReportParams {
  searchTerm?: string;
  status?: string;
  formStatus?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Survey Details Types
export interface AppliedAnswer {
  questionId: string;
  questionTitle: string;
  type: 'RADIO' | 'CHECKBOX' | 'TEXT' | 'SCALE' | 'GRID';
  optionId?: string | null;
  optionText?: string | null;
  optionIds?: string[] | null;
  optionTexts?: string[] | null;
  value?: string | null;
  rowText?: string | null;
  columnText?: string | null;
}

export interface AnswersAppliedData {
  fillRequestId: string;
  executionTime: string;
  answersApplied: AppliedAnswer[];
  rowIndex: number;
  version: number;
  taskId: string;
}

export interface SurveyDetail {
  taskId: string;
  rowIndex: number;
  executionTime: string;
  actualExecutionTime: string | null;
  completionTime: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  answersApplied: AppliedAnswer[] | null; // Direct array of AppliedAnswer
  errorMessage: string | null;
  retryCount: number;
  isActualFailure: boolean;
  executionDurationMs: number | null;
  priority: number;
}

export interface SurveyStatistics {
  totalSurveys: number;
  completedCount: number;
  failedCount: number;
  pendingCount: number;
  inProgressCount: number;
  cancelledCount: number;
  averageExecutionTime: number;
  successRate: number;
}

export interface SurveyDetailsResponse {
  surveys: SurveyDetail[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  statistics: SurveyStatistics;
}

export interface SurveyDetailsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  status?: string;
}

// API endpoints
export const API_ENDPOINTS = {
  FORM: '/api/form',
  FORM_USER_ALL: '/api/form/user/all',
  DATA_MAPPING: '/api/data-mapping',
  DATA_FILL_REQUEST: '/api/fill-request/fill-in-data',
  FILL_IN_DATA_VALIDATE: '/api/fill-in-data/validate'
};

// Existing API Functions
export const createForm = async (data: FormCreateData) => {
  const response = await axiosServices.post(API_ENDPOINTS.FORM, data);
  const payload = response.data as any;
  // Safeguard: some BE endpoints may return 200 with error envelope
  // Accept common non-error statuses like OK/SUCCESS/CREATED/UPDATED/DELETED
  const status: string | undefined = typeof payload?.status === 'string' ? String(payload.status).toUpperCase() : undefined;
  const nonErrorStatuses = new Set(['OK', 'SUCCESS', 'CREATED', 'UPDATED', 'DELETED']);

  if (payload?.errorMessage) {
    throw payload;
  }
  if (status && !nonErrorStatuses.has(status)) {
    throw payload;
  }
  return payload;
};

export const getFormList = async (page: number | null = null, size: number | null = null) => {
  const params = { page, size };
  const response = await axiosServices.get(API_ENDPOINTS.FORM, { params });
  return response.data as FormListResponse;
};

// New API function to get all forms for current user (no pagination)
export const getAllUserForms = async (): Promise<FormData[]> => {
  const response = await axiosServices.get(API_ENDPOINTS.FORM_USER_ALL);
  const payload = response.data as any;
  // Support multiple shapes: array, {data: []}, or {content: []}
  if (Array.isArray(payload)) return payload as FormData[];
  if (Array.isArray(payload?.data)) return payload.data as FormData[];
  if (Array.isArray(payload?.content)) return payload.content as FormData[];
  return [] as FormData[];
};

export const getFormDetail = async (id: string) => {
  const response = await axiosServices.get(`${API_ENDPOINTS.FORM}/${id}`);
  return response.data as FormDetailResponse;
};

export const createFillRequest = async (formId: string, data: FillRequestDTO) => {
  const response = await axiosServices.post(`${API_ENDPOINTS.FORM}/${formId}/fill-request`, data);
  return response.data;
};

export const deleteForm = async (id: string) => {
  const response = await axiosServices.delete(`${API_ENDPOINTS.FORM}/${id}`);
  return response.data;
};

// New API Functions for data filling
export const checkDataMapping = async (data: DataMappingRequest): Promise<DataMappingResponse> => {
  const response = await axiosServices.post(API_ENDPOINTS.DATA_MAPPING, data);
  return response.data as DataMappingResponse;
};

export const createDataFillRequest = async (data: DataFillRequestDTO) => {
  const response = await axiosServices.post(API_ENDPOINTS.DATA_FILL_REQUEST, data);
  return response.data;
};

// Validate questions against data sheet before opening modal
export const validateFillInData = async (data: ValidateFillInDataRequest): Promise<ValidateFillInDataResponse> => {
  const response = await axiosServices.post(API_ENDPOINTS.FILL_IN_DATA_VALIDATE, data);
  const payload: any = response.data;

  // Normalize various BE response shapes to a consistent result
  if (payload?.valid === true) {
    return { valid: true };
  }

  if (typeof payload?.status === 'string') {
    const statusUpper = String(payload.status).toUpperCase();
    const contentUpper = typeof payload?.content === 'string' ? String(payload.content).toUpperCase() : undefined;

    // Case: { status: 'OK', content: 'VALID' }
    if (statusUpper === 'OK' && (contentUpper === 'VALID' || payload?.content === true)) {
      return { valid: true };
    }

    // Case: error envelope with message
    if (payload?.errorMessage) {
      return { valid: false, errors: [payload.errorMessage] };
    }
  }

  if (Array.isArray(payload?.errors)) {
    return { valid: false, errors: payload.errors };
  }

  // Fallback: attempt to cast
  return payload as ValidateFillInDataResponse;
};

export const getFormReports = async (params: FormReportParams = {}): Promise<FormReportResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.status) queryParams.append('status', params.status);
  if (params.formStatus) queryParams.append('formStatus', params.formStatus);
  if (params.type) queryParams.append('type', params.type);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

  const response = await axiosServices.get(`/api/v1/form-reports?${queryParams.toString()}`);
  return response.data.content;
};

// Survey Details API Functions
export const getSurveyDetails = async (fillRequestId: string, params: SurveyDetailsParams = {}): Promise<SurveyDetailsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDir) queryParams.append('sortDir', params.sortDir);
  if (params.status) queryParams.append('status', params.status);

  const response = await axiosServices.get(`/api/v1/fill-requests/${fillRequestId}/surveys?${queryParams.toString()}`);
  return response.data.content;
};

// Cancel Fill Request API Function
export const cancelFillRequest = async (requestId: string) => {
  const response = await axiosServices.put(`/api/fill-request/${requestId}/cancel`);
  const payload = response.data as any;
  
  // Safeguard: some BE endpoints may return 200 with error envelope
  const status: string | undefined = typeof payload?.status === 'string' ? String(payload.status).toUpperCase() : undefined;
  const nonErrorStatuses = new Set(['OK', 'SUCCESS', 'CREATED', 'UPDATED', 'DELETED']);

  if (payload?.errorMessage) {
    throw payload;
  }
  if (status && !nonErrorStatuses.has(status)) {
    throw payload;
  }
  return payload;
};
