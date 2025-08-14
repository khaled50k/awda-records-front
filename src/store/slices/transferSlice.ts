import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transferService } from '../../services/transferService';
import { 
  RecordTransfer, 
  CreateTransferRequest, 
  UpdateTransferRequest, 
  PaginatedResponse,
  ApiResponse 
} from '../../types/api';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface TransferState {
  transfers: RecordTransfer[];
  currentTransfer: RecordTransfer | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
  filters: {
    recordId: number | null;
    senderId: number | null;
    recipientId: number | null;
    status: string;
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: TransferState = {
  transfers: [],
  currentTransfer: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
  },
  filters: {
    recordId: null,
    senderId: null,
    recipientId: null,
    status: '',
  },
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Get transfers with pagination and filters
export const getTransfersAsync = createAsyncThunk(
  'transfers/getTransfers',
  async (params: { page?: number; perPage?: number; recordId?: number; senderId?: number; recipientId?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await transferService.getTransfers(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transfers');
    }
  }
);

// Get transfers by record
export const getTransfersByRecordAsync = createAsyncThunk(
  'transfers/getTransfersByRecord',
  async (recordId: number, { rejectWithValue }) => {
    try {
      const response = await transferService.getTransfersByRecord(recordId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transfers by record');
    }
  }
);

// Get transfers by sender
export const getTransfersBySenderAsync = createAsyncThunk(
  'transfers/getTransfersBySender',
  async (senderId: number, { rejectWithValue }) => {
    try {
      const response = await transferService.getTransfersBySender(senderId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transfers by sender');
    }
  }
);

// Get transfers by recipient
export const getTransfersByRecipientAsync = createAsyncThunk(
  'transfers/getTransfersByRecipient',
  async (recipientId: number, { rejectWithValue }) => {
    try {
      const response = await transferService.getTransfersByRecipient(recipientId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transfers by recipient');
    }
  }
);

// Get pending transfers
export const getPendingTransfersAsync = createAsyncThunk(
  'transfers/getPendingTransfers',
  async (params: { page?: number; perPage?: number }, { rejectWithValue }) => {
    try {
      const response = await transferService.getPendingTransfers(params.page, params.perPage);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pending transfers');
    }
  }
);

// Get completed transfers
export const getCompletedTransfersAsync = createAsyncThunk(
  'transfers/getCompletedTransfers',
  async (params: { page?: number; perPage?: number }, { rejectWithValue }) => {
    try {
      const response = await transferService.getCompletedTransfers(params.page, params.perPage);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch completed transfers');
    }
  }
);

// Get transfer by ID
export const getTransferAsync = createAsyncThunk(
  'transfers/getTransfer',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await transferService.getTransfer(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transfer');
    }
  }
);

// Create transfer
export const createTransferAsync = createAsyncThunk(
  'transfers/createTransfer',
  async (transferData: CreateTransferRequest, { rejectWithValue }) => {
    try {
      const response = await transferService.createTransfer(transferData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create transfer');
    }
  }
);

// Update transfer
export const updateTransferAsync = createAsyncThunk(
  'transfers/updateTransfer',
  async ({ id, transferData }: { id: number; transferData: UpdateTransferRequest }, { rejectWithValue }) => {
    try {
      const response = await transferService.updateTransfer(id, transferData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update transfer');
    }
  }
);

// Delete transfer
export const deleteTransferAsync = createAsyncThunk(
  'transfers/deleteTransfer',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await transferService.deleteTransfer(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete transfer');
    }
  }
);

// Receive transfer
export const receiveTransferAsync = createAsyncThunk(
  'transfers/receiveTransfer',
  async (transferId: number, { rejectWithValue }) => {
    try {
      const response = await transferService.receiveTransfer(transferId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to receive transfer');
    }
  }
);

// Complete transfer
export const completeTransferAsync = createAsyncThunk(
  'transfers/completeTransfer',
  async (transferId: number, { rejectWithValue }) => {
    try {
      const response = await transferService.completeTransfer(transferId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete transfer');
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

export const transferSlice = createSlice({
  name: 'transfers',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set current transfer
    setCurrentTransfer: (state, action: PayloadAction<RecordTransfer>) => {
      state.currentTransfer = action.payload;
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
    setFilters: (state, action: PayloadAction<{ recordId?: number | null; senderId?: number | null; recipientId?: number | null; status?: string }>) => {
      if (action.payload.recordId !== undefined) {
        state.filters.recordId = action.payload.recordId;
      }
      if (action.payload.senderId !== undefined) {
        state.filters.senderId = action.payload.senderId;
      }
      if (action.payload.recipientId !== undefined) {
        state.filters.recipientId = action.payload.recipientId;
      }
      if (action.payload.status !== undefined) {
        state.filters.status = action.payload.status;
      }
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        recordId: null,
        senderId: null,
        recipientId: null,
        status: '',
      };
      state.pagination.currentPage = 1;
    },
    
    // Reset state
    resetTransferState: (state) => {
      state.transfers = [];
      state.currentTransfer = null;
      state.loading = false;
      state.error = null;
      state.pagination = {
        currentPage: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
      };
      state.filters = {
        recordId: null,
        senderId: null,
        recipientId: null,
        status: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get transfers
      .addCase(getTransfersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransfersAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<RecordTransfer>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.transfers = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getTransfersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get transfers by record
      .addCase(getTransfersByRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransfersByRecordAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<RecordTransfer>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.transfers = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getTransfersByRecordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get transfers by sender
      .addCase(getTransfersBySenderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransfersBySenderAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<RecordTransfer>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.transfers = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getTransfersBySenderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get transfers by recipient
      .addCase(getTransfersByRecipientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransfersByRecipientAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<RecordTransfer>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.transfers = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getTransfersByRecipientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get pending transfers
      .addCase(getPendingTransfersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingTransfersAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<RecordTransfer>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.transfers = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getPendingTransfersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get completed transfers
      .addCase(getCompletedTransfersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompletedTransfersAsync.fulfilled, (state, action: PayloadAction<ApiResponse<PaginatedResponse<RecordTransfer>>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.transfers = action.payload.data.data;
          state.pagination = {
            currentPage: action.payload.data.current_page,
            perPage: action.payload.data.per_page,
            total: action.payload.data.total,
            lastPage: action.payload.data.last_page,
          };
        }
      })
      .addCase(getCompletedTransfersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get transfer by ID
      .addCase(getTransferAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransferAsync.fulfilled, (state, action: PayloadAction<ApiResponse<RecordTransfer>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.currentTransfer = action.payload.data;
        }
      })
      .addCase(getTransferAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create transfer
      .addCase(createTransferAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransferAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ transfer: RecordTransfer }>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          // Add new transfer to the list
          state.transfers.unshift(action.payload.data.transfer);
          state.pagination.total += 1;
        }
      })
      .addCase(createTransferAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update transfer
      .addCase(updateTransferAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransferAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ transfer: RecordTransfer }>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          const updatedTransfer = action.payload.data.transfer;
          // Update transfer in the list
          const index = state.transfers.findIndex(transfer => transfer.transfer_id === updatedTransfer.transfer_id);
          if (index !== -1) {
            state.transfers[index] = updatedTransfer;
          }
          // Update current transfer if it's the same
          if (state.currentTransfer?.transfer_id === updatedTransfer.transfer_id) {
            state.currentTransfer = updatedTransfer;
          }
        }
      })
      .addCase(updateTransferAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete transfer
      .addCase(deleteTransferAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransferAsync.fulfilled, (state, action: PayloadAction<ApiResponse<Record<string, never>>>) => {
        state.loading = false;
        if (action.payload.success) {
          // Remove transfer from the list
          state.transfers = state.transfers.filter(transfer => transfer.transfer_id !== state.currentTransfer?.transfer_id);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
          state.currentTransfer = null;
        }
      })
      .addCase(deleteTransferAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Receive transfer
      .addCase(receiveTransferAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receiveTransferAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ transfer: RecordTransfer }>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          const receivedTransfer = action.payload.data.transfer;
          // Update transfer in the list
          const index = state.transfers.findIndex(transfer => transfer.transfer_id === receivedTransfer.transfer_id);
          if (index !== -1) {
            state.transfers[index] = receivedTransfer;
          }
          // Update current transfer if it's the same
          if (state.currentTransfer?.transfer_id === receivedTransfer.transfer_id) {
            state.currentTransfer = receivedTransfer;
          }
        }
      })
      .addCase(receiveTransferAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Complete transfer
      .addCase(completeTransferAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeTransferAsync.fulfilled, (state, action: PayloadAction<ApiResponse<{ transfer: RecordTransfer }>>) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          const completedTransfer = action.payload.data.transfer;
          // Update transfer in the list
          const index = state.transfers.findIndex(transfer => transfer.transfer_id === completedTransfer.transfer_id);
          if (index !== -1) {
            state.transfers[index] = completedTransfer;
          }
          // Update current transfer if it's the same
          if (state.currentTransfer?.transfer_id === completedTransfer.transfer_id) {
            state.currentTransfer = completedTransfer;
          }
        }
      })
      .addCase(completeTransferAsync.rejected, (state, action) => {
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
  setCurrentTransfer, 
  setPagination, 
  setFilters, 
  clearFilters, 
  resetTransferState 
} = transferSlice.actions;

export default transferSlice.reducer;
