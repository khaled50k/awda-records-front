import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { patientService } from '../../services/patientService';
import { 
  Patient, 
  CreatePatientRequest, 
  UpdatePatientRequest, 
  PaginatedResponse,
  ApiResponse 
} from '../../types/api';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface PatientState {
  patients: Patient[];
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
  filters: {
    search: string;
    genderCode: string;
    healthCenterCode: string;
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: PatientState = {
  patients: [],
  currentPatient: null,
  loading: false,
  error: null,
  fieldErrors: {},
  pagination: {
    currentPage: 1,
    perPage: 100,
    total: 0,
    lastPage: 1,
  },
  filters: {
    search: '',
    genderCode: '',
    healthCenterCode: '',
  },
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Get patients with pagination and filters
export const getPatientsAsync = createAsyncThunk(
  'patients/getPatients',
  async (params: { page?: number; perPage?: number; search?: string; genderCode?: string; healthCenterCode?: string }, { rejectWithValue }) => {
    try {
      const response = await patientService.getPatients(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch patients');
    }
  }
);

// Search patients
export const searchPatientsAsync = createAsyncThunk(
  'patients/searchPatients',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await patientService.searchPatients(query);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search patients');
    }
  }
);

// Get patients by gender
export const getPatientsByGenderAsync = createAsyncThunk(
  'patients/getPatientsByGender',
  async (genderCode: string, { rejectWithValue }) => {
    try {
      const response = await patientService.getPatientsByGender(genderCode);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch patients by gender');
    }
  }
);

// Get patients by health center
export const getPatientsByHealthCenterAsync = createAsyncThunk(
  'patients/getPatientsByHealthCenter',
  async (healthCenterCode: string, { rejectWithValue }) => {
    try {
      const response = await patientService.getPatientsByHealthCenter(healthCenterCode);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch patients by health center');
    }
  }
);

// Get patient by ID
export const getPatientAsync = createAsyncThunk(
  'patients/getPatient',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await patientService.getPatient(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch patient');
    }
  }
);

// Create patient
export const createPatientAsync = createAsyncThunk(
  'patients/createPatient',
  async (patientData: CreatePatientRequest, { rejectWithValue }) => {
    try {
      const response = await patientService.createPatient(patientData);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as Error & { data?: unknown };
        // Extract field errors from the nested structure
        let fieldErrors: Record<string, string[]> = {};
        if (apiError.data && typeof apiError.data === 'object') {
          const errorData = apiError.data as any;
          if (errorData.data && typeof errorData.data === 'object') {
            fieldErrors = errorData.data;
          }
        }
        return rejectWithValue({
          message: apiError.message || 'Failed to create patient',
          fieldErrors: fieldErrors
        });
      }
      return rejectWithValue({
        message: 'Failed to create patient',
        fieldErrors: {}
      });
    }
  }
);

// Update patient
export const updatePatientAsync = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, patientData }: { id: number; patientData: UpdatePatientRequest }, { rejectWithValue }) => {
    try {
      const response = await patientService.updatePatient(id, patientData);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as Error & { data?: unknown };
        // Extract field errors from the nested structure
        let fieldErrors: Record<string, string[]> = {};
        if (apiError.data && typeof apiError.data === 'object') {
          const errorData = apiError.data as any;
          if (errorData.data && typeof errorData.data === 'object') {
            fieldErrors = errorData.data;
          }
        }
        return rejectWithValue({
          message: apiError.message || 'Failed to update patient',
          fieldErrors: fieldErrors
        });
      }
      return rejectWithValue({
        message: 'Failed to update patient',
        fieldErrors: {}
      });
    }
  }
);

// Delete patient
export const deletePatientAsync = createAsyncThunk(
  'patients/deletePatient',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await patientService.deletePatient(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete patient');
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

export const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
      state.fieldErrors = {};
    },
    
    // Clear field errors
    clearFieldErrors: (state) => {
      state.fieldErrors = {};
    },
    
    // Set current patient
    setCurrentPatient: (state, action: PayloadAction<Patient>) => {
      state.currentPatient = action.payload;
    },
    
    // Update pagination
    setPagination: (state, action: PayloadAction<{ page?: number; perPage?: number }>) => {
      if (action.payload.page !== undefined) {
        state.pagination.currentPage = action.payload.page;
      }
      if (action.payload.perPage !== undefined) {
        state.pagination.perPage = action.payload.perPage;
      }
    },
    
    // Update filters
    setFilters: (state, action: PayloadAction<{ search?: string; genderCode?: string; healthCenterCode?: string }>) => {
      if (action.payload.search !== undefined) {
        state.filters.search = action.payload.search;
      }
      if (action.payload.genderCode !== undefined) {
        state.filters.genderCode = action.payload.genderCode;
      }
      if (action.payload.healthCenterCode !== undefined) {
        state.filters.healthCenterCode = action.payload.healthCenterCode;
      }
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        search: '',
        genderCode: '',
        healthCenterCode: '',
      };
      state.pagination.currentPage = 1;
    },
    
    // Reset state
    resetPatientState: (state) => {
      state.patients = [];
      state.currentPatient = null;
      state.loading = false;
      state.error = null;
      state.fieldErrors = {};
      state.pagination = {
        currentPage: 1,
        perPage: 100,
        total: 0,
        lastPage: 1,
      };
      state.filters = {
        search: '',
        genderCode: '',
        healthCenterCode: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get patients
      .addCase(getPatientsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientsAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<Patient>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.patients = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getPatientsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Search patients
      .addCase(searchPatientsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPatientsAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<Patient>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.patients = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(searchPatientsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get patients by gender
      .addCase(getPatientsByGenderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientsByGenderAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<Patient>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.patients = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getPatientsByGenderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get patient by ID
      .addCase(getPatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientAsync.fulfilled, (state, action: PayloadAction<ApiResponse<Patient>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.currentPatient = action.payload.data;
        }
      })
      .addCase(getPatientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create patient
      .addCase(createPatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(createPatientAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ patient: Patient }>>) => {
        state.loading = false;
        state.error = null;
        state.fieldErrors = {};
        if (action.payload.success && action.payload.data) {
          // Add new patient to the list
          state.patients.unshift(action.payload.data.patient);
          state.pagination.total += 1;
        }
      })
      .addCase(createPatientAsync.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; fieldErrors: Record<string, string[]> } | undefined;
        state.error = payload?.message || 'Failed to create patient';
        state.fieldErrors = payload?.fieldErrors || {};
      })
      
      // Update patient
      .addCase(updatePatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(updatePatientAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ patient: Patient }>>) => {
        state.loading = false;
        state.error = null;
        state.fieldErrors = {};
        if (action.payload.success && action.payload.data) {
          const updatedPatient = action.payload.data.patient;
          // Update patient in the list
          const index = state.patients.findIndex(patient => patient.patient_id === updatedPatient.patient_id);
          if (index !== -1) {
            state.patients[index] = updatedPatient;
          }
          // Update current patient if it's the same
          if (state.currentPatient?.patient_id === updatedPatient.patient_id) {
            state.currentPatient = updatedPatient;
          }
        }
      })
      .addCase(updatePatientAsync.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; fieldErrors: Record<string, string[]> } | undefined;
        state.error = payload?.message || 'Failed to update patient';
        state.fieldErrors = payload?.fieldErrors || {};
      })
      
      // Delete patient
      .addCase(deletePatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatientAsync.fulfilled, (state, action: PayloadAction<ApiResponse<Record<string, never>>>) => {
        state.loading = false;
        if (action.payload.success) {
          // Remove patient from the list
          state.patients = state.patients.filter(patient => patient.patient_id !== state.currentPatient?.patient_id);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
          state.currentPatient = null;
        }
      })
      .addCase(deletePatientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { 
  clearError, 
  clearFieldErrors,
  setCurrentPatient, 
  setPagination, 
  setFilters, 
  clearFilters, 
  resetPatientState 
} = patientSlice.actions;

export default patientSlice.reducer;
