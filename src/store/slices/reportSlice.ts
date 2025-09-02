import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportService } from '../../services/reportService';
import { 
  Report, 
  ReportFilter, 
  AvailableReportsResponse,
  GenerateReportRequest
} from '../../types/api';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface ReportState {
  availableReports: Report[];
  reportFormats: Record<string, string>;
  loading: boolean;
  generating: boolean;
  error: string | null;
  filters: ReportFilter;
  selectedReportType: string;
  selectedFormat: string;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ReportState = {
  availableReports: [],
  reportFormats: {},
  loading: false,
  generating: false,
  error: null,
  filters: {
    from_date: '',
    to_date: '',
    health_center_code: '',
    problem_type_code: '',
  },
  selectedReportType: '',
  selectedFormat: 'csv',
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

export const fetchAvailableReports = createAsyncThunk(
  'reports/fetchAvailableReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.getAvailableReports();
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'فشل في جلب التقارير المتاحة');
    }
  }
);

export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async (request: GenerateReportRequest, { rejectWithValue }) => {
    try {
      const result = await reportService.generateReport(request);
      
      // Check if result contains file_url (new format)
      if (result && typeof result === 'object' && result.file_url) {
        return { 
          file_url: result.file_url, 
          filename: result.filename || `${request.report_type}_${new Date().toISOString().split('T')[0]}.${request.format}`,
          message: result.message
        };
      }
      
      // Handle blob format (old format)
      return { blob: result, filename: `${request.report_type}_${new Date().toISOString().split('T')[0]}.${request.format}` };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'فشل في إنشاء التقرير');
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    // Filter actions
    setFilter: (state, action: PayloadAction<{ key: keyof ReportFilter; value: string }>) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Selection actions
    setSelectedReportType: (state, action: PayloadAction<string>) => {
      state.selectedReportType = action.payload;
    },

    setSelectedFormat: (state, action: PayloadAction<string>) => {
      state.selectedFormat = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetReportState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch available reports
      .addCase(fetchAvailableReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableReports.fulfilled, (state, action: PayloadAction<AvailableReportsResponse>) => {
        state.loading = false;
        state.availableReports = action.payload.reports;
        state.reportFormats = action.payload.formats;
        if (action.payload.reports.length > 0) {
          state.selectedReportType = action.payload.reports[0].type;
        }
      })
      .addCase(fetchAvailableReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Generate report
      .addCase(generateReport.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generating = false;
        
        // Handle new format with file_url
        if (action.payload.file_url) {
          // Open the file URL in a new tab
          reportService.openFileUrl(action.payload.file_url);
        } else if (action.payload.blob) {
          // Handle old blob format
          reportService.downloadFile(action.payload.blob, action.payload.filename);
        }
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  setFilter,
  clearFilters,
  setSelectedReportType,
  setSelectedFormat,
  clearError,
  resetReportState,
} = reportSlice.actions;

export default reportSlice.reducer;
