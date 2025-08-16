import { apiService } from './api';
import { 
  ApiResponse, 
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
  STATIC_DATA_API
} from '../types/api';

// Static Data Management Service
export class StaticDataService {
  private static instance: StaticDataService;
  private cache: Map<string, StaticData[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): StaticDataService {
    if (!StaticDataService.instance) {
      StaticDataService.instance = new StaticDataService();
    }
    return StaticDataService.instance;
  }

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  // Get all static data (cached)
  async getStaticData(): Promise<ApiResponse<StaticDataGroup>> {
    const cacheKey = 'all';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: { [cacheKey]: cached } as StaticDataGroup,
        message: 'تم جلب البيانات من الذاكرة المؤقتة'
      };
    }

    const response = await apiService.get<StaticDataGroup>('/static');
    
    if (response.success) {
      this.setCache(cacheKey, response.data);
    }
    
    return response;
  }

  // Get static data with filtering and pagination
  async getStaticDataList(filters?: StaticDataFilters): Promise<ApiResponse<StaticDataListResponse>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${STATIC_DATA_API.LIST}?${queryString}` : STATIC_DATA_API.LIST;
    
    return apiService.get<StaticDataListResponse>(url);
  }

  // Get available static data types
  async getStaticDataTypes(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(STATIC_DATA_API.TYPES);
  }

  // Get static data by type (cached)
  async getStaticDataByType(type: string): Promise<ApiResponse<StaticData[]>> {
    const cached = this.getFromCache(type);
    
    if (cached) {
      return {
        success: true,
        data: cached,
        message: 'تم جلب البيانات من الذاكرة المؤقتة'
      };
    }

    const response = await apiService.get<StaticData[]>(STATIC_DATA_API.GET_BY_TYPE(type));
    
    if (response.success) {
      this.setCache(type, response.data);
    }
    
    return response;
  }

  // Get specific static data by code
  async getStaticDataByCode(type: string, code: string): Promise<ApiResponse<StaticData>> {
    return apiService.get<StaticData>(STATIC_DATA_API.GET_BY_CODE(type, code));
  }

  // Get static data by ID
  async getStaticDataById(id: number): Promise<ApiResponse<StaticData>> {
    return apiService.get<StaticData>(STATIC_DATA_API.SHOW(id));
  }

  // ============================================================================
  // CREATE OPERATIONS
  // ============================================================================

  // Create new static data
  async createStaticData(data: StaticDataCreateRequest): Promise<ApiResponse<StaticData>> {
    const response = await apiService.post<StaticData>(STATIC_DATA_API.CREATE, data);
    
    if (response.success) {
      // Clear cache for the type to ensure fresh data
      this.clearCache(data.type);
    }
    
    return response;
  }

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  // Update static data
  async updateStaticData(id: number, data: StaticDataUpdateRequest): Promise<ApiResponse<StaticData>> {
    const response = await apiService.put<StaticData>(STATIC_DATA_API.UPDATE(id), data);
    
    if (response.success) {
      // Clear cache for the type to ensure fresh data
      if (data.type) {
        this.clearCache(data.type);
      }
    }
    
    return response;
  }

  // Toggle active status
  async toggleStaticDataStatus(id: number): Promise<ApiResponse<StaticDataToggleStatusResponse>> {
    return apiService.patch<StaticDataToggleStatusResponse>(STATIC_DATA_API.TOGGLE_STATUS(id));
  }

  // Bulk update status
  async bulkUpdateStaticDataStatus(data: StaticDataBulkUpdateStatusRequest): Promise<ApiResponse<StaticDataBulkUpdateStatusResponse>> {
    return apiService.patch<StaticDataBulkUpdateStatusResponse>(STATIC_DATA_API.BULK_UPDATE_STATUS, data);
  }

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  // Delete static data
  async deleteStaticData(id: number): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(STATIC_DATA_API.DELETE(id));
    
    if (response.success) {
      // Clear all cache since we don't know which type was affected
      this.clearCache();
    }
    
    return response;
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  // Clear cache for specific type
  clearCache(type?: string): void {
    if (type) {
      this.cache.delete(type);
      this.cacheExpiry.delete(type);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  // Refresh cache for specific type
  async refreshCache(type?: string): Promise<void> {
    if (type) {
      this.clearCache(type);
      await this.getStaticDataByType(type);
    } else {
      this.clearCache();
      await this.getStaticData();
    }
  }

  // Private cache methods
  private getFromCache(key: string): StaticData[] | null {
    const cached = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }
    
    // Remove expired cache
    if (expiry && Date.now() >= expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    }
    
    return null;
  }

  private setCache(key: string, data: StaticData[] | StaticDataGroup): void {
    this.cache.set(key, Array.isArray(data) ? data : []);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  // Get cached data without API call
  getCachedData(type: string): StaticData[] | null {
    return this.getFromCache(type);
  }

  // Check if data is cached
  isCached(type: string): boolean {
    return this.getFromCache(type) !== null;
  }

  // ============================================================================
  // LEGACY METHODS (for backward compatibility)
  // ============================================================================

  // Get roles (cached)
  async getRoles(): Promise<ApiResponse<StaticData[]>> {
    return this.getStaticDataByType('role');
  }

  // Get genders (cached)
  async getGenders(): Promise<ApiResponse<StaticData[]>> {
    return this.getStaticDataByType('gender');
  }

  // Get health center types (cached)
  async getHealthCenterTypes(): Promise<ApiResponse<StaticData[]>> {
    return this.getStaticDataByType('health_center_type');
  }

  // Get status types (cached)
  async getStatusTypes(): Promise<ApiResponse<StaticData[]>> {
    return this.getStaticDataByType('status');
  }
}

// Export singleton instance
export const staticDataService = StaticDataService.getInstance();
