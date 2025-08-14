import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { staticDataService } from '../../services/staticDataService';
import { 
  StaticData, 
  StaticDataGroup,
  ApiResponse 
} from '../../types/api';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface StaticDataState {
  staticData: StaticDataGroup | null;
  staticDataTypes: string[];
  loading: boolean;
  error: string | null;
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
  staticDataTypes: [],
  loading: false,
  error: null,
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
      state.staticDataTypes = [];
      state.loading = false;
      state.error = null;
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
      
      // Get static data types
      .addCase(getStaticDataTypesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaticDataTypesAsync.fulfilled, (state, action: PayloadAction<ApiResponse<string[]>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.staticDataTypes = action.payload.data;
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
      .addCase(getStaticDataByTypeAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticData[]>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          // Cache the data - we'll need to handle the type differently
          // For now, we'll cache it under a generic key
          state.cache['static_data'] = {
            data: action.payload.data,
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
      .addCase(getStaticDataByCodeAsync.fulfilled, (state, action: PayloadAction<ApiResponse<StaticData>>) => {
        state.loading = false;
        // No caching for individual items
      })
      .addCase(getStaticDataByCodeAsync.rejected, (state, action) => {
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
  clearCache, 
  refreshCache, 
  resetStaticDataState 
} = staticDataSlice.actions;

export default staticDataSlice.reducer;
