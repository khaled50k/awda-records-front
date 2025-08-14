import { apiService } from './api';
import { 
  ApiResponse, 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  PaginatedResponse 
} from '../types/api';

// User Management Service
export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // List all users with pagination
  async getUsers(params: {
    page?: number;
    perPage?: number;
    search?: string;
    roleCode?: string;
    isActive?: boolean;
  } = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('per_page', params.perPage.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.roleCode) searchParams.append('role_code', params.roleCode);
    if (params.isActive !== undefined) searchParams.append('is_active', params.isActive.toString());
    
    const url = `/users?${searchParams.toString()}`;
    console.log('🔍 UserService.getUsers - Making API call to:', url);
    console.log('🔍 UserService.getUsers - Search params:', params);
    
    return apiService.get<PaginatedResponse<User>>(url);
  }

  // Get user details by ID
  async getUser(id: number): Promise<ApiResponse<User>> {
    return apiService.get<User>(`/users/${id}`);
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<{ user: User }>> {
    return apiService.post<{ user: User }>('/users', userData);
  }

  // Update existing user
  async updateUser(id: number, userData: UpdateUserRequest): Promise<ApiResponse<{ user: User }>> {
    return apiService.put<{ user: User }>(`/users/${id}`, userData);
  }

  // Delete user
  async deleteUser(id: number): Promise<ApiResponse<Record<string, never>>> {
    return apiService.delete<Record<string, never>>(`/users/${id}`);
  }

  // Search users with filters
  async searchUsers(params: {
    page?: number;
    perPage?: number;
    search?: string;
    roleCode?: string;
    isActive?: boolean;
  } = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('per_page', params.perPage.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.roleCode) searchParams.append('role_code', params.roleCode);
    if (params.isActive !== undefined) searchParams.append('is_active', params.isActive.toString());
    
    return apiService.get<PaginatedResponse<User>>(`/users?${searchParams.toString()}`);
  }
}

// Export singleton instance
export const userService = UserService.getInstance();
