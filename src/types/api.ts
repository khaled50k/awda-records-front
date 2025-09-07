// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  data?: Record<string, string[]>; // Validation errors
}

// Pagination Types
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url?: string;
    label: string;
    active: boolean;
  }>;
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

// User Types
export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role_code: string;
  health_center_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role?: StaticData;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role_code: string;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  full_name?: string;
  role_code?: string;
  is_active?: boolean;
}

// Patient Types
export interface Patient {
  patient_id: number;
  full_name: string;
  national_id: number;
  gender_code: string;
  health_center_code: string;
  created_at: string;
  updated_at: string;
  gender?: StaticData;
  health_center?: StaticData;
  medical_records?: MedicalRecord[];
}

export interface CreatePatientRequest {
  full_name: string;
  national_id: number;
  gender_code: string;
  health_center_code: string;
}

export interface UpdatePatientRequest {
  full_name?: string;
  national_id?: number;
  gender_code?: string;
  health_center_code?: string;
}

// Medical Record Types
export interface MedicalRecord {
  record_id: number;
  patient_id: number;
  status_code: string;
  problem_type_code: string;
  danger_level_code?: string;
  reviewed_party_user_id?: number;
  created_by: number;
  last_modified_by: number;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  status?: StaticData;
  problem_type?: StaticData;
  danger_level?: StaticData;
  reviewed_party?: string;
  creator?: User;
  last_modifier?: User;
  transfers?: RecordTransfer[];
}

export interface CreateMedicalRecordRequest {
  patient_id: number;
  problem_type_code: string;
  danger_level_code: string;
  reviewed_party: string;
  status_code: string;
  recipient_ids?: number[]; // Array of recipient IDs for immediate transfer
  transfer_notes: string;
}

export interface UpdateMedicalRecordRequest {
  patient_id?: number;
  recipient_id?: number;
  problem_type_code?: string;
  danger_level_code?: string;
  reviewed_party?: string;
  status_code?: string;
  transfer_status_code?: string | null;
  transfer_notes?: string;
}

// Record Transfer Types
export interface RecordTransfer {
  transfer_id: number;
  record_id: number;
  sender_id: number;
  recipient_id: number;
  transfer_notes?: string;
  status_code: string;
  transferred_at: string;
  received_at?: string;
  completed_at?: string;
  is_replied?: boolean;
  created_at: string;
  updated_at: string;
  medical_record?: MedicalRecord;
  sender?: User;
  recipient?: User;
  workflow_steps?: TransferWorkflowStep[];
}

// Daily Transfers Report Types
export interface DailyTransfersReportPatient {
  patient_id: number;
  patient_name: string;
  doctor_or_reviewed_party: string;
  'عيادات خارجية': string;
  ' مختبر': string;
  'تمريض': string;
  ' صيدلية': string;
  'خدمات الجمهور': string;
  ' أشعة': string;
  'تقارير': string;
  'أقسام وعمليات': string;
  'مخازن': string;
}

export interface DailyTransfersReportSummary {
  total_patients: number;
  total_records: number;
  total_transfers: number;
}

export interface DailyTransfersReportDateRange {
  from_date: string;
  to_date: string;
}

export interface DailyTransfersReportData {
  date_range: DailyTransfersReportDateRange;
  summary: DailyTransfersReportSummary;
  patients: DailyTransfersReportPatient[];
}

export interface DailyTransfersReportResponse {
  success: boolean;
  data: DailyTransfersReportData;
  message: string;
}

export interface DailyTransfersReportRequest {
  from_date?: string;
  to_date?: string;
}

export interface CreateTransferRequest {
  record_id: number;
  recipient_ids?: number[]; // Array of recipient IDs for transfer
  transfer_notes?: string;
  transfer_status_code: string;
}

export interface UpdateTransferRequest {
  transfer_notes?: string;
  status_code?: string;
}

export interface TransferWorkflowStep {
  step_id: number;
  transfer_id: number;
  step_type: string;
  step_status: string;
  performed_by: number;
  performed_at: string;
  notes?: string;
  performer?: User;
}

// Static Data Types
export interface StaticData {
  id: number;
  type: string;
  code: string;
  label_en: string;
  label_ar: string;
  description?: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StaticDataGroup {
  [type: string]: StaticData[];
}

// Static Data API Types
export interface StaticDataCreateRequest {
  type: string;
  code: string;
  label_en: string;
  label_ar: string;
  description?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface StaticDataUpdateRequest {
  type?: string;
  code?: string;
  label_en?: string;
  label_ar?: string;
  description?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface StaticDataFilters {
  type?: string;
  types?: string[] | string;
  code?: string;
  label?: string;
  label_en?: string;
  label_ar?: string;
  is_active?: boolean;
  description?: string;
  sort_by?: 'type' | 'code' | 'label_en' | 'label_ar' | 'is_active' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export interface StaticDataListResponse {
  data: StaticData[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  filters_applied: Partial<StaticDataFilters>;
  total_filtered: number;
}

export interface StaticDataTypesResponse {
  data: string[];
  message: string;
}

export interface StaticDataByTypeResponse {
  data: StaticData[];
  message: string;
}

export interface StaticDataByCodeResponse {
  data: StaticData;
  message: string;
}

export interface StaticDataToggleStatusResponse {
  data: {
    static_data: StaticData;
  };
  message: string;
}

export interface StaticDataBulkUpdateStatusRequest {
  ids: number[];
  is_active: boolean;
}

export interface StaticDataBulkUpdateStatusResponse {
  data: {
    updated_count: number;
  };
  message: string;
}

// API Endpoints
export const STATIC_DATA_API = {
  // List all static data with filtering
  LIST: '/static-data',
  
  // Get all unique types
  TYPES: '/static-data/types',
  
  // Get static data by ID
  SHOW: (id: number) => `/static-data/${id}`,
  
  // Create new static data
  CREATE: '/static-data',
  
  // Update static data
  UPDATE: (id: number) => `/static-data/${id}`,
  
  // Delete static data
  DELETE: (id: number) => `/static-data/${id}`,
  
  // Toggle active status
  TOGGLE_STATUS: (id: number) => `/static-data/${id}/toggle-status`,
  
  // Bulk update status
  BULK_UPDATE_STATUS: '/static-data/bulk-update-status',
  
  // Get by type
  GET_BY_TYPE: (type: string) => `/static-data/type/${type}`,
  
  // Get by type and code
  GET_BY_CODE: (type: string, code: string) => `/static-data/type/${type}/code/${code}`,
} as const;

// Common static data types
export const STATIC_DATA_TYPES = {
  ROLE: 'role',
  GENDER: 'gender',
  HEALTH_CENTER: 'health_center',
  STATUS: 'status',
  PROBLEM_TYPE: 'problem_type',
  } as const;

export type StaticDataType = typeof STATIC_DATA_TYPES[keyof typeof STATIC_DATA_TYPES];

// Utility functions
export const getStaticDataLabel = (item: StaticData, language: 'en' | 'ar' = 'en'): string => {
  return language === 'ar' ? item.label_ar : item.label_en;
};

export const filterStaticDataByType = (data: StaticData[], type: string): StaticData[] => {
  return data.filter(item => item.type === type);
};

export const getStaticDataByCode = (data: StaticData[], type: string, code: string): StaticData | undefined => {
  return data.find(item => item.type === type && item.code === code);
};

export const isStaticDataActive = (item: StaticData): boolean => {
  return item.is_active;
};

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role_code: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface RegisterResponse {
  user: User;
}

// Legacy types for backward compatibility
export type AdminLoginRequest = LoginRequest;
export type AdminLoginResponse = LoginResponse;
export type AdminProfileUpdateRequest = UpdateUserRequest;
export interface AdminChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Reports Types
export interface ReportFilter {
  from_date?: string;
  to_date?: string;
  health_center_code?: string;
  problem_type_code?: string;
}

export interface Report {
  type: string;
  name: string;
  description: string;
  supported_formats: string[];
  filters: Record<string, string>;
}

export interface ReportFormats {
  csv: string;
  excel: string;
  pdf: string;
}

export interface AvailableReportsResponse {
  reports: Report[];
  formats: ReportFormats;
}

export interface GenerateReportRequest {
  report_type: string;
  format: string;
  filters: ReportFilter;
}
