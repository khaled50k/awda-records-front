import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { staticDataService } from '../../services/staticDataService';
import { 
  StaticData, 
  StaticDataGroup,
  StaticDataCreateRequest,
  StaticDataUpdateRequest,
  StaticDataFilters,
  StaticDataListResponse,
  StaticDataTypesResponse,
  StaticDataByTypeResponse,
  StaticDataByCodeResponse,
  StaticDataToggleStatusResponse,
  StaticDataBulkUpdateStatusRequest,
  StaticDataBulkUpdateStatusResponse,
  ApiResponse 
} from '../../types/api';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface StaticDataState {
  staticData: StaticDataGroup | null;
  staticDataList: StaticData[];
  staticDataTypes: string[];
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  filters: Partial<StaticDataFilters>;
  cache: {
    [key: string]: {
      data: StaticData[];
      timestamp: number;
      expiresAt: number;
    };
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: StaticDataState = {
  staticData: null,
  staticDataList: [],
  staticDataTypes: [],
  loading: false,
  error: null,
  fieldErrors: {},
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  },
  filters: {},
  cache: {},
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Get all static data
export const getStaticDataAsync = createAsyncThunk(
  'staticData/getStaticData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getStaticData();
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch static data';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get static data list with filtering and pagination
export const getStaticDataListAsync = createAsyncThunk(
  'staticData/getStaticDataList',
  async (filters?: StaticDataFilters, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getStaticDataList(filters);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch static data list';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get static data types
export const getStaticDataTypesAsync = createAsyncThunk(
  'staticData/getStaticDataTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getStaticDataTypes();
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch static data types';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get static data by type
export const getStaticDataByTypeAsync = createAsyncThunk(
  'staticData/getStaticDataByType',
  async (type: string, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getStaticDataByType(type);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch static data by type';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get specific static data by code
export const getStaticDataByCodeAsync = createAsyncThunk(
  'staticData/getStaticDataByCode',
  async ({ type, code }: { type: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getStaticDataByCode(type, code);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch static data by code';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get static data by ID
export const getStaticDataByIdAsync = createAsyncThunk(
  'staticData/getStaticDataById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getStaticDataById(id);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch static data by ID';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create static data
export const createStaticDataAsync = createAsyncThunk(
  'staticData/createStaticData',
  async (data: StaticDataCreateRequest, { rejectWithValue }) => {
    try {
      const response = await staticDataService.createStaticData(data);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as { message: string; data: { data: Record<string, string[]> } };
        return rejectWithValue({
          message: apiError.message || 'Failed to create static data',
          fieldErrors: apiError.data?.data || {}
        });
      }
      return rejectWithValue({
        message: 'Failed to create static data',
        fieldErrors: {}
      });
    }
  }
);

// Update static data
export const updateStaticDataAsync = createAsyncThunk(
  'staticData/updateStaticData',
  async ({ id, data }: { id: number; data: StaticDataUpdateRequest }, { rejectWithValue }) => {
    try {
      const response = await staticDataService.updateStaticData(id, data);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as { message: string; data: { data: Record<string, string[]> } };
        return rejectWithValue({
          message: apiError.message || 'Failed to update static data',
          fieldErrors: apiError.data?.data || {}
        });
      }
      return rejectWithValue({
        message: 'Failed to update static data',
        fieldErrors: {}
      });
    }
  }
);

// Toggle static data status
export const toggleStaticDataStatusAsync = createAsyncThunk(
  'staticData/toggleStaticDataStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await staticDataService.toggleStaticDataStatus(id);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle static data status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Bulk update static data status
export const bulkUpdateStaticDataStatusAsync = createAsyncThunk(
  'staticData/bulkUpdateStaticDataStatus',
  async (data: StaticDataBulkUpdateStatusRequest, { rejectWithValue }) => {
    try {
      const response = await staticDataService.bulkUpdateStaticDataStatus(data);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update static data status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete static data
export const deleteStaticDataAsync = createAsyncThunk(
  'staticData/deleteStaticData',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await staticDataService.deleteStaticData(id);
      return { id, response };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete static data';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get roles
export const getRolesAsync = createAsyncThunk(
  'staticData/getRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getRoles();
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch roles';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get genders
export const getGendersAsync = createAsyncThunk(
  'staticData/getGenders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getGenders();
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch genders';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get health center types
export const getHealthCenterTypesAsync = createAsyncThunk(
  'staticData/getHealthCenterTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getHealthCenterTypes();
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health center types';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get status types
export const getStatusTypesAsync = createAsyncThunk(
  'staticData/getStatusTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staticDataService.getStatusTypes();
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch status types';
      return rejectWithValue(errorMessage);
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

export const staticDataSlice = createSlice({
  name: 'staticData',
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
    
    // Clear cache for specific type
    clearCache: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        delete state.cache[action.payload];
      } else {
        state.cache = {};
      }
    },
    
    // Refresh cache for specific type
    refreshCache: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        delete state.cache[action.payload];
      } else {
        state.cache = {};
      }
    },
    
    // Reset state
    resetStaticDataState: (state) => {
      state.staticData = null;
      state.staticDataList = [];
      state.staticDataTypes = [];
      state.loading = false;
      state.error = null;
      state.fieldErrors = {};
      state.pagination = {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
      };
      state.filters = {};
      state.cache = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all static data
      .addCase(getStaticDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaticDataAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticDataGroup>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.staticData = action.payload.data;
          // Cache the data
          Object.entries(action.payload.data).forEach(([key, data]) => {
            state.cache[key] = {
              data,
              timestamp: Date.now(),
              expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
            };
          });
        }
      })
      .addCase(getStaticDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get static data list with filtering and pagination
      .addCase(getStaticDataListAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaticDataListAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticDataListResponse>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.staticDataList = action.payload.data.data;
          state.pagination = action.payload.data.pagination;
          state.filters = action.payload.data.filters;
        }
      })
      .addCase(getStaticDataListAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get static data types
      .addCase(getStaticDataTypesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaticDataTypesAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticDataTypesResponse>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.staticDataTypes = action.payload.data.data;
        }
      })
      .addCase(getStaticDataTypesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get static data by type
      .addCase(getStaticDataByTypeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaticDataByTypeAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticDataByTypeResponse>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          // Cache the data - we'll need to handle the type differently
          // For now, we'll cache it under a generic key
          state.cache['static_data'] = {
            data: action.payload.data.data,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
          };
        }
      })
      .addCase(getStaticDataByTypeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get specific static data by code
      .addCase(getStaticDataByCodeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaticDataByCodeAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticDataByCodeResponse>>) => {
        state.loading = false;
        // No caching for individual items
      })
      .addCase(getStaticDataByCodeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get static data by ID
      .addCase(getStaticDataByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaticDataByIdAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticData>>) => {
        state.loading = false;
        // No caching for individual items
      })
      .addCase(getStaticDataByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create static data
      .addCase(createStaticDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(createStaticDataAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticData>>) => {
        state.loading = false;
        state.fieldErrors = {};
        // No caching for individual items
      })
      .addCase(createStaticDataAsync.rejected, (state, action) => {
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
      
      // Update static data
      .addCase(updateStaticDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(updateStaticDataAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticData>>) => {
        state.loading = false;
        state.fieldErrors = {};
        // No caching for individual items
      })
      .addCase(updateStaticDataAsync.rejected, (state, action) => {
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
      
      // Toggle static data status
      .addCase(toggleStaticDataStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleStaticDataStatusAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticDataToggleStatusResponse>>) => {
        state.loading = false;
        // No caching for individual items
      })
      .addCase(toggleStaticDataStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Bulk update static data status
      .addCase(bulkUpdateStaticDataStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateStaticDataStatusAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticDataBulkUpdateStatusResponse>>) => {
        state.loading = false;
        // No caching for individual items
      })
      .addCase(bulkUpdateStaticDataStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete static data
      .addCase(deleteStaticDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaticDataAsync.fulfilled, (state, action: PayloadAction<{ id: number; response: ApiResponse<any> }>) => {
        state.loading = false;
        // No caching for individual items
      })
      .addCase(deleteStaticDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get roles
      .addCase(getRolesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRolesAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticData[]>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          // Cache the roles
          state.cache['role'] = {
            data: action.payload.data,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
          };
        }
      })
      .addCase(getRolesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get genders
      .addCase(getGendersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGendersAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticData[]>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          // Cache the genders
          state.cache['gender'] = {
            data: action.payload.data,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
          };
        }
      })
      .addCase(getGendersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get health center types
      .addCase(getHealthCenterTypesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHealthCenterTypesAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticData[]>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          // Cache the health center types
          state.cache['health_center_type'] = {
            data: action.payload.data,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
          };
        }
      })
      .addCase(getHealthCenterTypesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get status types
      .addCase(getStatusTypesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStatusTypesAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticData[]>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          // Cache the status types
          state.cache['status'] = {
            data: action.payload.data,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
          };
        }
      })
      .addCase(getStatusTypesAsync.rejected, (state, action) => {
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
  clearCache, 
  refreshCache, 
  resetStaticDataState 
} = staticDataSlice.actions;

export default staticDataSlice.reducer;
