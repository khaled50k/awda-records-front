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
  created_at: string;
  updated_at: string;
  gender?: StaticData;
  medical_records?: MedicalRecord[];
}

export interface CreatePatientRequest {
  full_name: string;
  national_id: number;
  gender_code: string;
}

export interface UpdatePatientRequest {
  full_name?: string;
  national_id?: number;
  gender_code?: string;
}

// Medical Record Types
export interface MedicalRecord {
  record_id: number;
  patient_id: number;
  health_center_code: string;
  status_code: string;
  problem_type_code: string;
  created_by: number;
  last_modified_by: number;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  health_center?: StaticData;
  status?: StaticData;
  problem_type?: StaticData;
  creator?: User;
  last_modifier?: User;
  transfers?: RecordTransfer[];
}

export interface CreateMedicalRecordRequest {
  patient_id: number;
  recipient_id: number;
  health_center_code: string;
  problem_type_code: string;
  status_code?: string;
  transfer_notes?: string;
}

export interface UpdateMedicalRecordRequest {
  recipient_id?: number;
  health_center_code?: string;
  problem_type_code?: string;
  status_code?: string;
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

export interface CreateTransferRequest {
  record_id: number;
  recipient_id: number;
  transfer_notes?: string;
  status_code: string;
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
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StaticDataGroup {
  [type: string]: StaticData[];
}

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
