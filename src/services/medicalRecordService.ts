import { apiService } from './api';
import { 
  ApiResponse, 
  MedicalRecord, 
  CreateMedicalRecordRequest, 
  UpdateMedicalRecordRequest, 
  PaginatedResponse,
  DailyTransfersReportResponse,
  DailyTransfersReportRequest
} from '../types/api';

// Medical Records Management Service
export class MedicalRecordService {
  private static instance: MedicalRecordService;

  private constructor() {}

  public static getInstance(): MedicalRecordService {
    if (!MedicalRecordService.instance) {
      MedicalRecordService.instance = new MedicalRecordService();
    }
    return MedicalRecordService.instance;
  }

  // List medical records with pagination and filters
  async getMedicalRecords(params: {
    page?: number;
    perPage?: number;
    // Patient filters
    patientName?: string;
    patientNationalId?: string;
    patientGender?: string;
    // Record status & type filters
    statusCode?: string;
    problemTypeCode?: string;
    // Date range filters
    createdFrom?: string;
    createdTo?: string;
    modifiedFrom?: string;
    modifiedTo?: string;
    // Transfer filters
    hasTransfers?: boolean;
    transferNotes?: string;
    // Advanced filters
    hasCompletedWorkflow?: boolean;
    // Search
    search?: string;
    // Sorting
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<PaginatedResponse<MedicalRecord>>> {
    const searchParams = new URLSearchParams();
    
    // Pagination
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('per_page', params.perPage.toString());
    
    // Patient filters
    if (params.patientName) searchParams.append('patient_name', params.patientName);
    if (params.patientNationalId) searchParams.append('patient_national_id', params.patientNationalId);
    if (params.patientGender) searchParams.append('patient_gender', params.patientGender);
    
    // Record status & type filters
    if (params.statusCode) searchParams.append('status_code', params.statusCode);
    if (params.problemTypeCode) searchParams.append('problem_type_code', params.problemTypeCode);
    
    // Date range filters
    if (params.createdFrom) searchParams.append('created_from', params.createdFrom);
    if (params.createdTo) searchParams.append('created_to', params.createdTo);
    if (params.modifiedFrom) searchParams.append('modified_from', params.modifiedFrom);
    if (params.modifiedTo) searchParams.append('modified_to', params.modifiedTo);
    
    // Transfer filters
    if (params.transferNotes) searchParams.append('transfer_notes', params.transferNotes);
    if (params.hasCompletedWorkflow !== undefined) searchParams.append('has_completed_workflow', params.hasCompletedWorkflow.toString());
    
    // Search
    if (params.search) searchParams.append('search', params.search);
    
    // Sorting
    if (params.sortBy) searchParams.append('sort_by', params.sortBy);
    if (params.sortOrder) searchParams.append('sort_order', params.sortOrder);
    
    return apiService.get<PaginatedResponse<MedicalRecord>>(`/records?${searchParams.toString()}`);
  }

  // Get medical record details by ID
  async getMedicalRecord(id: number): Promise<ApiResponse<MedicalRecord>> {
    return apiService.get<MedicalRecord>(`/records/${id}`);
  }

  // Create new medical record
  async createMedicalRecord(recordData: CreateMedicalRecordRequest): Promise<ApiResponse<{ record: MedicalRecord }>> {
    return apiService.post<{ record: MedicalRecord }>('/records', recordData);
  }

  // Update existing medical record
  async updateMedicalRecord(id: number, recordData: UpdateMedicalRecordRequest): Promise<ApiResponse<{ record: MedicalRecord }>> {
    return apiService.put<{ record: MedicalRecord }>(`/records/${id}`, recordData);
  }

  // Delete medical record
  async deleteMedicalRecord(id: number): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<{ message: string }>(`/records/${id}`);
  }

  // Get daily transfers report
  async getDailyTransfersReport(params: DailyTransfersReportRequest = {}): Promise<ApiResponse<string> | string> {
    const searchParams = new URLSearchParams();
    
    if (params.from_date) searchParams.append('from_date', params.from_date);
    if (params.to_date) searchParams.append('to_date', params.to_date);
    
    // API returns CSV directly, so we expect a string response
    // Handle both ApiResponse<string> and direct string responses
    const response = await apiService.get<string>(`/records/daily-transfers-report?${searchParams.toString()}`);
    console.log('🔍 Service response:', response);
    return response;
  }

  // Get medical records by patient
  async getMedicalRecordsByPatient(patientId: number, page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<MedicalRecord>>> {
    return apiService.get<PaginatedResponse<MedicalRecord>>(`/records?patient_id=${patientId}&page=${page}&per_page=${perPage}`);
  }

  // Get medical records by status
  async getMedicalRecordsByStatus(statusCode: string, page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<MedicalRecord>>> {
    return apiService.get<PaginatedResponse<MedicalRecord>>(`/records?status_code=${statusCode}&page=${page}&per_page=${perPage}`);
  }



  // Get medical records created by specific user
  async getMedicalRecordsByCreator(createdBy: number, page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<MedicalRecord>>> {
    return apiService.get<PaginatedResponse<MedicalRecord>>(`/records?created_by=${createdBy}&page=${page}&per_page=${perPage}`);
  }
}

// Export singleton instance
export const medicalRecordService = MedicalRecordService.getInstance();
