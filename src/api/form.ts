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
}

export interface Question {
  id: string;
  title: string;
  description: string | null;
  type: string;
  required: boolean;
  position: number;
  options: Option[];
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
  questionId: string | null;
  optionId: string | null;
  percentage: number;
  count: number;
  option: {
    id: string;
    text: string;
  } | null;
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
  scheduledTime?: string;
  isHumanLike?: boolean;
  humanLike?: boolean;
}

// API endpoints
export const API_ENDPOINTS = {
  FORM: '/api/form'
};

// API Functions
export const createForm = async (data: FormCreateData) => {
  const response = await axiosServices.post(API_ENDPOINTS.FORM, data);
  return response.data;
};

export const getFormList = async (page: number | null = null, size: number | null = null) => {
  const params = { page, size };
  const response = await axiosServices.get(API_ENDPOINTS.FORM, { params });
  return response.data as FormListResponse;
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