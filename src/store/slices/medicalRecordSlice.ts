import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { medicalRecordService } from '../../services/medicalRecordService';
import { 
  MedicalRecord, 
  CreateMedicalRecordRequest, 
  UpdateMedicalRecordRequest, 
  PaginatedResponse,
  ApiResponse,
  DailyTransfersReportResponse,
  DailyTransfersReportRequest
} from '../../types/api';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface MedicalRecordState {
  medicalRecords: MedicalRecord[];
  currentRecord: MedicalRecord | null;
  dailyTransfersReport: DailyTransfersReportResponse | null;
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
    // Patient filters
    patientName: string;
    patientNationalId: string;
    patientGender: string;
    // Record status & type filters
    statusCode: string;
    problemTypeCode: string;
    healthCenterCode: string;
    // Date range filters
    createdFrom: string;
    createdTo: string;
    modifiedFrom: string;
    modifiedTo: string;
    // Transfer filters
    hasTransfers: boolean | null;
    transferNotes: string;
    // Advanced filters
    hasCompletedWorkflow: boolean | null;
    // Search
    search: string;
    // Sorting
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: MedicalRecordState = {
  medicalRecords: [],
  currentRecord: null,
  dailyTransfersReport: null,
  loading: false,
  error: null,
  fieldErrors: {},
  pagination: {
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
  },
  filters: {
    // Patient filters
    patientName: '',
    patientNationalId: '',
    patientGender: '',
    // Record status & type filters
    statusCode: '',
    problemTypeCode: '',
    healthCenterCode: '',
    // Date range filters
    createdFrom: '',
    createdTo: '',
    modifiedFrom: '',
    modifiedTo: '',
    // Transfer filters
    hasTransfers: null,
    transferNotes: '',
    // Advanced filters
    hasCompletedWorkflow: null,
    // Search
    search: '',
    // Sorting
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Get medical records with pagination and filters
export const getMedicalRecordsAsync = createAsyncThunk(
  'medicalRecords/getMedicalRecords',
  async (params: {
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
  }, { rejectWithValue }) => {
    try {
      const response = await medicalRecordService.getMedicalRecords(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch medical records';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get medical records by patient
export const getMedicalRecordsByPatientAsync = createAsyncThunk(
  'medicalRecords/getMedicalRecordsByPatient',
  async (patientId: number, { rejectWithValue }) => {
    try {
      const response = await medicalRecordService.getMedicalRecordsByPatient(patientId);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch medical records by patient';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get medical records by status
export const getMedicalRecordsByStatusAsync = createAsyncThunk(
  'medicalRecords/getMedicalRecordsByStatus',
  async (statusCode: string, { rejectWithValue }) => {
    try {
      const response = await medicalRecordService.getMedicalRecordsByStatus(statusCode);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch medical records by status';
      return rejectWithValue(errorMessage);
    }
  }
);



// Get medical records by creator
export const getMedicalRecordsByCreatorAsync = createAsyncThunk(
  'medicalRecords/getMedicalRecordsByCreator',
  async (createdBy: number, { rejectWithValue }) => {
    try {
      const response = await medicalRecordService.getMedicalRecordsByCreator(createdBy);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch medical records by creator';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get medical record by ID
export const getMedicalRecordAsync = createAsyncThunk(
  'medicalRecords/getMedicalRecord',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await medicalRecordService.getMedicalRecord(id);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch medical record';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get daily transfers report
export const getDailyTransfersReportAsync = createAsyncThunk(
  'medicalRecords/getDailyTransfersReport',
  async (params: DailyTransfersReportRequest = {}, { rejectWithValue }) => {
    try {
      const response = await medicalRecordService.getDailyTransfersReport(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch daily transfers report';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create medical record
export const createMedicalRecordAsync = createAsyncThunk(
  'medicalRecords/createMedicalRecord',
  async (recordData: CreateMedicalRecordRequest, { rejectWithValue }) => {
    try {
      const response = await medicalRecordService.createMedicalRecord(recordData);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as { message: string; data: { data: Record<string, string[]> } };
        return rejectWithValue({
          message: apiError.message || 'Failed to create medical record',
          fieldErrors: apiError.data?.data || {}
        });
      }
      return rejectWithValue({
        message: 'Failed to create medical record',
        fieldErrors: {}
      });
    }
  }
);

// Update medical record
export const updateMedicalRecordAsync = createAsyncThunk(
  'medicalRecords/updateMedicalRecord',
  async ({ id, recordData }: { id: number; recordData: UpdateMedicalRecordRequest }, { rejectWithValue }) => {
    try {
      const response = await medicalRecordService.updateMedicalRecord(id, recordData);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as { message: string; data: { data: Record<string, string[]> } };
        return rejectWithValue({
          message: apiError.message || 'Failed to update medical record',
          fieldErrors: apiError.data?.data || {}
        });
      }
      return rejectWithValue({
        message: 'Failed to update medical record',
        fieldErrors: {}
      });
    }
  }
  );

// Delete medical record
export const deleteMedicalRecordAsync = createAsyncThunk(
  'medicalRecords/deleteMedicalRecord',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await medicalRecordService.deleteMedicalRecord(id);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete medical record';
      return rejectWithValue(errorMessage);
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

export const medicalRecordSlice = createSlice({
  name: 'medicalRecords',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear field errors
    clearFieldErrors: (state) => {
      state.fieldErrors = {};
    },
    
    // Set current record
    setCurrentRecord: (state, action: PayloadAction<MedicalRecord>) => {
      state.currentRecord = action.payload;
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
    setFilters: (state, action: PayloadAction<Partial<MedicalRecordState['filters']>>) => {
      Object.assign(state.filters, action.payload);
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        // Patient filters
        patientName: '',
        patientNationalId: '',
        patientGender: '',
        // Record status & type filters
        statusCode: '',
        problemTypeCode: '',
        healthCenterCode: '',
        // Date range filters
        createdFrom: '',
        createdTo: '',
        modifiedFrom: '',
        modifiedTo: '',
        // Transfer filters
        hasTransfers: null,
        transferNotes: '',
        // Advanced filters
        hasCompletedWorkflow: null,
        // Search
        search: '',
        // Sorting
        sortBy: 'created_at',
        sortOrder: 'desc',
      };
      state.pagination.currentPage = 1;
    },
    
    // Reset state
    resetMedicalRecordState: (state) => {
      state.medicalRecords = [];
      state.currentRecord = null;
      state.loading = false;
      state.error = null;
      state.fieldErrors = {};
      state.pagination = {
        currentPage: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
      };
      state.filters = {
        // Patient filters
        patientName: '',
        patientNationalId: '',
        patientGender: '',
        // Record status & type filters
        statusCode: '',
        problemTypeCode: '',
        healthCenterCode: '',
        // Date range filters
        createdFrom: '',
        createdTo: '',
        modifiedFrom: '',
        modifiedTo: '',
        // Transfer filters
        hasTransfers: null,
        transferNotes: '',
        // Advanced filters
        hasCompletedWorkflow: null,
        // Search
        search: '',
        // Sorting
        sortBy: 'created_at',
        sortOrder: 'desc',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get medical records
      .addCase(getMedicalRecordsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicalRecordsAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<MedicalRecord>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.medicalRecords = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getMedicalRecordsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get medical records by patient
      .addCase(getMedicalRecordsByPatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicalRecordsByPatientAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<MedicalRecord>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.medicalRecords = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getMedicalRecordsByPatientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get medical records by status
      .addCase(getMedicalRecordsByStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicalRecordsByStatusAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<MedicalRecord>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.medicalRecords = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getMedicalRecordsByStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      

      
      // Get medical records by creator
      .addCase(getMedicalRecordsByCreatorAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicalRecordsByCreatorAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<MedicalRecord>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.medicalRecords = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getMedicalRecordsByCreatorAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get medical record by ID
      .addCase(getMedicalRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicalRecordAsync.fulfilled, (state, action: PayloadAction<ApiResponse<MedicalRecord>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.currentRecord = action.payload.data;
        }
      })
      .addCase(getMedicalRecordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create medical record
      .addCase(createMedicalRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(createMedicalRecordAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ record: MedicalRecord }>>) => {
        state.loading = false;
        state.fieldErrors = {};
        if (action.payload.success && action.payload.data) {
          // Add new record to the list
          state.medicalRecords.unshift(action.payload.data.record);
          state.pagination.total += 1;
        }
      })
      .addCase(createMedicalRecordAsync.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          const payload = action.payload as { message: string; fieldErrors?: Record<string, string[]> };
          state.error = payload.message;
          state.fieldErrors = payload.fieldErrors || {};
        } else {
          state.error = action.payload as string;
          state.fieldErrors = {};
        }
      })
      
      // Update medical record
      .addCase(updateMedicalRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(updateMedicalRecordAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ record: MedicalRecord }>>) => {
        state.loading = false;
        state.fieldErrors = {};
        if (action.payload.success && action.payload.data) {
          const updatedRecord = action.payload.data.record;
          // Update record in the list
          const index = state.medicalRecords.findIndex(record => record.record_id === updatedRecord.record_id);
          if (index !== -1) {
            state.medicalRecords[index] = updatedRecord;
            state.pagination.total += 1;
          }
          // Update current record if it's the same
          if (state.currentRecord?.record_id === updatedRecord.record_id) {
            state.currentRecord = updatedRecord;
          }
        }
      })
      .addCase(updateMedicalRecordAsync.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          const payload = action.payload as { message: string; fieldErrors?: Record<string, string[]> };
          state.error = payload.message;
          state.fieldErrors = payload.fieldErrors || {};
        } else {
          state.error = action.payload as string;
          state.fieldErrors = {};
        }
      })
      
      // Get daily transfers report
      .addCase(getDailyTransfersReportAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDailyTransfersReportAsync.fulfilled, (state, action: PayloadAction<DailyTransfersReportResponse>) => {
        state.loading = false;
        state.error = null;
        if (action.payload.success) {
          state.dailyTransfersReport = action.payload;
        }
      })
      .addCase(getDailyTransfersReportAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete medical record
      .addCase(deleteMedicalRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedicalRecordAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ message: string }>>) => {
        state.loading = false;
        if (action.payload.success) {
          // Remove record from the list
          state.medicalRecords = state.medicalRecords.filter(record => record.record_id !== state.currentRecord?.record_id);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
          state.currentRecord = null;
        }
      })
      .addCase(deleteMedicalRecordAsync.rejected, (state, action) => {
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
  setCurrentRecord, 
  setPagination, 
  setFilters, 
  clearFilters, 
  resetMedicalRecordState 
} = medicalRecordSlice.actions;

export default medicalRecordSlice.reducer;
