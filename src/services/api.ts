import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { 
  ApiResponse, 
} from '../types/api';
import Cookies from 'js-cookie';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'); // 30 seconds default

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const cookieToken = Cookies.get('auth_token');
      const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const token = cookieToken || localStorageToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

// Response interceptor to handle common responses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear auth and redirect to login
    // if (error.response?.status === 401) {
    //   // Clear cookies and redirect to login
    //   const Cookies = require('js-cookie');
    //   Cookies.remove('auth_token');
    //   window.location.href = '/login';
    // }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    // Handle 422 Validation errors
    if (error.response?.status === 422) {
      console.error('Validation error:', error.response.data);
    }
    
    // Handle 500 Server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiService = {
  // GET request
  get: async <T = unknown>(url: string, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // POST request
  post: async <T = unknown>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // PUT request
  put: async <T = unknown>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await api.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // PATCH request
  patch: async <T = unknown>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await api.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // DELETE request
  delete: async <T = unknown>(url: string, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await api.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // File upload
  upload: async <T = unknown>(url: string, formData: FormData, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post<ApiResponse<T>>(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// Error handler
const handleApiError = (error: AxiosError): Error => {
  if (error.response) {
    // Server responded with error status
    const responseData = error.response.data as Record<string, unknown>;
    const message = (responseData?.message as string) || error.message;
    const customError = new Error(message);
    (customError as Error & { status?: number; data?: unknown }).status = error.response.status;
    (customError as Error & { status?: number; data?: unknown }).data = responseData;
    return customError;
  } else if (error.request) {
    // Request was made but no response received
    return new Error('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
  } else {
    // Something else happened
    return new Error('حدث خطأ غير متوقع');
  }
};

export default api; 