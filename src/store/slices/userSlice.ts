import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  PaginatedResponse,
  ApiResponse 
} from '../../types/api';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface UserState {
  users: User[];
  currentUser: User | null;
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
    roleCode: string;
    isActive: boolean | null;
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: UserState = {
  users: [],
  currentUser: null,
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
    search: '',
    roleCode: '',
    isActive: null,
  },
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Get users with pagination and filters
export const getUsersAsync = createAsyncThunk(
  'users/getUsers',
  async (params: { page?: number; perPage?: number; search?: string; roleCode?: string; isActive?: boolean }, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers(params);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue((error as { message: string }).message || 'Failed to fetch users');
      }
      return rejectWithValue('Failed to fetch users');
    }
  }
);

// Search users
export const searchUsersAsync = createAsyncThunk(
  'users/searchUsers',
  async (params: { page?: number; perPage?: number; search?: string; roleCode?: string; isActive?: boolean }, { rejectWithValue }) => {
    try {
      const response = await userService.searchUsers(params);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue((error as { message: string }).message || 'Failed to search users');
      }
      return rejectWithValue('Failed to search users');
    }
  }
);

// Get user by ID
export const getUserAsync = createAsyncThunk(
  'users/getUser',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await userService.getUser(id);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue((error as { message: string }).message || 'Failed to fetch user');
      }
      return rejectWithValue('Failed to fetch user');
    }
  }
);

// Create user
export const createUserAsync = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(userData);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as { message: string; data: { data: Record<string, string[]> } };
        return rejectWithValue({
          message: apiError.message || 'Failed to create user',
          fieldErrors: apiError.data?.data || {}
        });
      }
      return rejectWithValue({
        message: 'Failed to create user',
        fieldErrors: {}
      });
    }
  }
);

// Update user
export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: number; userData: UpdateUserRequest }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, userData);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as { message: string; data: { data: Record<string, string[]> } };
        return rejectWithValue({
          message: apiError.message || 'Failed to update user',
          fieldErrors: apiError.data?.data || {}
        });
      }
      return rejectWithValue({
        message: 'Failed to update user',
        fieldErrors: {}
      });
    }
  }
);

// Delete user
export const deleteUserAsync = createAsyncThunk(
  'users/deleteUser',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await userService.deleteUser(id);
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue((error as { message: string }).message || 'Failed to delete user');
      }
      return rejectWithValue('Failed to delete user');
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

export const userSlice = createSlice({
  name: 'users',
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
    
    // Set current user
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
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
    setFilters: (state, action: PayloadAction<{ search?: string; roleCode?: string; isActive?: boolean | null }>) => {
      if (action.payload.search !== undefined) {
        state.filters.search = action.payload.search;
      }
      if (action.payload.roleCode !== undefined) {
        state.filters.roleCode = action.payload.roleCode;
      }
      if (action.payload.isActive !== undefined) {
        state.filters.isActive = action.payload.isActive;
      }
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        search: '',
        roleCode: '',
        isActive: null,
      };
      state.pagination.currentPage = 1;
    },
    
    // Reset state
    resetUserState: (state) => {
      state.users = [];
      state.currentUser = null;
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
        search: '',
        roleCode: '',
        isActive: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get users
      .addCase(getUsersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<User>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.users = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getUsersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Search users
      .addCase(searchUsersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsersAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<User>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.users = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(searchUsersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get user by ID
      .addCase(getUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserAsync.fulfilled, (state, action: PayloadAction<ApiResponse<User>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.currentUser = action.payload.data;
        }
      })
      .addCase(getUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create user
      .addCase(createUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(createUserAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ user: User }>>) => {
        state.loading = false;
        state.fieldErrors = {};
        if (action.payload.success && action.payload.data) {
          // Add new user to the list
          state.users.unshift(action.payload.data.user);
          state.pagination.total += 1;
        }
      })
      .addCase(createUserAsync.rejected, (state, action) => {
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
      
      // Update user
      .addCase(updateUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(updateUserAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ user: User }>>) => {
        state.loading = false;
        state.fieldErrors = {};
        if (action.payload.success && action.payload.data) {
          const updatedUser = action.payload.data.user;
          // Update user in the list
          const index = state.users.findIndex(user => user.user_id === updatedUser.user_id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
          // Update current user if it's the same
          if (state.currentUser?.user_id === updatedUser.user_id) {
            state.currentUser = updatedUser;
          }
        }
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
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
      
      // Delete user
      .addCase(deleteUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAsync.fulfilled, (state, action: PayloadAction<ApiResponse<Record<string, never>>>) => {
        state.loading = false;
        if (action.payload.success) {
          // Remove user from the list
          state.users = state.users.filter(user => user.user_id !== state.currentUser?.user_id);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
          state.currentUser = null;
        }
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
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
  setCurrentUser, 
  setPagination, 
  setFilters, 
  clearFilters, 
  resetUserState 
} = userSlice.actions;

export default userSlice.reducer;
