import { apiService } from './api';
import { 
  AdminLoginRequest, 
  AdminLoginResponse, 
  AdminProfileUpdateRequest, 
  AdminChangePasswordRequest,
  User 
} from '../types/api';
import Cookies from 'js-cookie';

// Authentication Service
export class AuthService {
  private static instance: AuthService;
  private tokenKey = 'auth_token';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

    // Login
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    try {
      const response = await apiService.post<AdminLoginResponse>('/login', credentials);
      
      if (response.success && response.data) {
        // Store only token, user data will be fetched when needed
        this.setToken(response.data.token);
        return response.data;
      } else {
        throw new Error(response.message || 'فشل تسجيل الدخول');
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await apiService.post('/admin/logout');
    } catch (error) {
      // Even if server logout fails, clear cookies
      console.warn('Server logout failed, clearing cookies:', error);
    } finally {
      // Always clear cookies
      this.clearAuth();
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await apiService.get<User>('/profile');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'فشل في جلب بيانات الملف الشخصي');
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Update profile
  async updateProfile(data: AdminProfileUpdateRequest): Promise<User> {
    try {
      const response = await apiService.put<User>('/profile', data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'فشل في تحديث الملف الشخصي');
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Change password
  async changePassword(data: AdminChangePasswordRequest): Promise<void> {
    try {
      const response = await apiService.post('/change-password', data);
      
      if (!response.success) {
        throw new Error(response.message || 'فشل في تغيير كلمة المرور');
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Get stored token
  getToken(): string | null {
    return Cookies.get(this.tokenKey) || null;
  }

  // Set token
  setToken(token: string): void {
    // Set cookie to expire in 7 days, secure in production
    Cookies.set(this.tokenKey, token, { 
      expires: 7, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }



  // Clear authentication data
  clearAuth(): void {
    Cookies.remove(this.tokenKey);
  }

  // Refresh token (if needed)
  async refreshToken(): Promise<string> {
    try {
      const response = await apiService.post<{ token: string }>('/admin/refresh-token');
      
      if (response.success && response.data) {
        this.setToken(response.data.token);
        return response.data.token;
      } else {
        throw new Error(response.message || 'فشل في تحديث الرمز المميز');
      }
    } catch (error) {
      // If refresh fails, clear auth and redirect to login
      this.clearAuth();
      window.location.href = '/login';
      throw this.handleAuthError(error);
    }
  }

  // Validate token (check if it's still valid)
  async validateToken(): Promise<boolean> {
    try {
      const response = await apiService.get('/admin/validate-token');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Initialize auth state from cookies
  initializeAuth(): { user: User | null; token: string | null; isAuthenticated: boolean } {
    const token = this.getToken();
    
    return {
      user: null, // User will be fetched from API when needed
      token,
      isAuthenticated: !!token
    };
  }

  // Handle authentication errors
  private handleAuthError(error: unknown): Error {
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        this.clearAuth();
        return new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
      }
      
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return new Error('ليس لديك صلاحية للوصول إلى هذا المورد.');
      }
      
      if (error.message.includes('422') || error.message.includes('Validation')) {
        return new Error('بيانات غير صحيحة. يرجى التحقق من المدخلات.');
      }
      
      return error;
    }
    
    return new Error('حدث خطأ غير متوقع في المصادقة');
  }
}

// Export singleton instance
export const authService = AuthService.getInstance(); 