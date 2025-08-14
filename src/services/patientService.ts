import { apiService } from './api';
import { 
  ApiResponse, 
  Patient, 
  CreatePatientRequest, 
  UpdatePatientRequest, 
  PaginatedResponse 
} from '../types/api';

// Patient Management Service
export class PatientService {
  private static instance: PatientService;

  private constructor() {}

  public static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  // List patients with pagination and filters
  async getPatients(params: {
    page?: number;
    perPage?: number;
    search?: string;
    genderCode?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<Patient>>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('per_page', params.perPage.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.genderCode) searchParams.append('gender_code', params.genderCode);
    
    return apiService.get<PaginatedResponse<Patient>>(`/patients?${searchParams.toString()}`);
  }

  // Get patient details by ID
  async getPatient(id: number): Promise<ApiResponse<Patient>> {
    return apiService.get<Patient>(`/patients/${id}`);
  }

  // Create new patient
  async createPatient(patientData: CreatePatientRequest): Promise<ApiResponse<{ patient: Patient }>> {
    return apiService.post<{ patient: Patient }>('/patients', patientData);
  }

  // Update existing patient
  async updatePatient(id: number, patientData: UpdatePatientRequest): Promise<ApiResponse<{ patient: Patient }>> {
    return apiService.put<{ patient: Patient }>(`/patients/${id}`, patientData);
  }

  // Delete patient
  async deletePatient(id: number): Promise<ApiResponse<Record<string, never>>> {
    return apiService.delete<Record<string, never>>(`/patients/${id}`);
  }

  // Search patients by name or national ID
  async searchPatients(query: string, page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<Patient>>> {
    return apiService.get<PaginatedResponse<Patient>>(`/patients?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
  }

  // Get patients by gender
  async getPatientsByGender(genderCode: string, page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<Patient>>> {
    return apiService.get<PaginatedResponse<Patient>>(`/patients?gender_code=${genderCode}&page=${page}&per_page=${perPage}`);
  }
}

// Export singleton instance
export const patientService = PatientService.getInstance();
