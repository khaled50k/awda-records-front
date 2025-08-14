import { apiService } from './api';
import { 
  ApiResponse, 
  RecordTransfer, 
  CreateTransferRequest, 
  UpdateTransferRequest, 
  PaginatedResponse 
} from '../types/api';

// Record Transfer Management Service
export class TransferService {
  private static instance: TransferService;

  private constructor() {}

  public static getInstance(): TransferService {
    if (!TransferService.instance) {
      TransferService.instance = new TransferService();
    }
    return TransferService.instance;
  }

  // List transfers with pagination and filters
  async getTransfers(params: {
    page?: number;
    perPage?: number;
    recordId?: number;
    senderId?: number;
    recipientId?: number;
    status?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<RecordTransfer>>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('per_page', params.perPage.toString());
    if (params.recordId) searchParams.append('record_id', params.recordId.toString());
    if (params.senderId) searchParams.append('sender_id', params.senderId.toString());
    if (params.recipientId) searchParams.append('recipient_id', params.recipientId.toString());
    if (params.status) searchParams.append('status', params.status);
    
    return apiService.get<PaginatedResponse<RecordTransfer>>(`/transfers?${searchParams.toString()}`);
  }

  // Get transfer details by ID
  async getTransfer(id: number): Promise<ApiResponse<RecordTransfer>> {
    return apiService.get<RecordTransfer>(`/transfers/${id}`);
  }

  // Create new transfer
  async createTransfer(transferData: CreateTransferRequest): Promise<ApiResponse<{ transfer: RecordTransfer }>> {
    return apiService.post<{ transfer: RecordTransfer }>('/transfers', transferData);
  }

  // Update existing transfer
  async updateTransfer(id: number, transferData: UpdateTransferRequest): Promise<ApiResponse<{ transfer: RecordTransfer }>> {
    return apiService.put<{ transfer: RecordTransfer }>(`/transfers/${id}`, transferData);
  }

  // Delete transfer
  async deleteTransfer(id: number): Promise<ApiResponse<Record<string, never>>> {
    return apiService.delete<Record<string, never>>(`/transfers/${id}`);
  }

  // Mark transfer as received
  async receiveTransfer(transferId: number): Promise<ApiResponse<{ transfer: RecordTransfer }>> {
    return apiService.post<{ transfer: RecordTransfer }>(`/transfers/${transferId}/receive`);
  }

  // Mark transfer as completed
  async completeTransfer(transferId: number): Promise<ApiResponse<{ transfer: RecordTransfer }>> {
    return apiService.post<{ transfer: RecordTransfer }>(`/transfers/${transferId}/complete`);
  }

  // Get transfers by record
  async getTransfersByRecord(recordId: number, page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<RecordTransfer>>> {
    return apiService.get<PaginatedResponse<RecordTransfer>>(`/transfers?record_id=${recordId}&page=${page}&per_page=${perPage}`);
  }

  // Get transfers by sender
  async getTransfersBySender(senderId: number, page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<RecordTransfer>>> {
    return apiService.get<PaginatedResponse<RecordTransfer>>(`/transfers?sender_id=${senderId}&page=${page}&per_page=${perPage}`);
  }

  // Get transfers by recipient
  async getTransfersByRecipient(recipientId: number, page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<RecordTransfer>>> {
    return apiService.get<PaginatedResponse<RecordTransfer>>(`/transfers?recipient_id=${recipientId}&page=${page}&per_page=${perPage}`);
  }

  // Get pending transfers
  async getPendingTransfers(page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<RecordTransfer>>> {
    return apiService.get<PaginatedResponse<RecordTransfer>>(`/transfers?status=pending&page=${page}&per_page=${perPage}`);
  }

  // Get completed transfers
  async getCompletedTransfers(page = 1, perPage = 15): Promise<ApiResponse<PaginatedResponse<RecordTransfer>>> {
    return apiService.get<PaginatedResponse<RecordTransfer>>(`/transfers?status=completed&page=${page}&per_page=${perPage}`);
  }
}

// Export singleton instance
export const transferService = TransferService.getInstance();
