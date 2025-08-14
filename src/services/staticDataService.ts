import { apiService } from './api';
import { 
  ApiResponse, 
  StaticData, 
  StaticDataGroup 
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

  // Get available static data types
  async getStaticDataTypes(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>('/static/types');
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

    const response = await apiService.get<StaticData[]>(`/static/${type}`);
    
    if (response.success) {
      this.setCache(type, response.data);
    }
    
    return response;
  }

  // Get specific static data by code
  async getStaticDataByCode(type: string, code: string): Promise<ApiResponse<StaticData>> {
    return apiService.get<StaticData>(`/static/${type}/${code}`);
  }

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
}

// Export singleton instance
export const staticDataService = StaticDataService.getInstance();
