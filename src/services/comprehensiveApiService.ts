import { authService } from './authService';
import { userService } from './userService';
import { patientService } from './patientService';
import { medicalRecordService } from './medicalRecordService';
import { transferService } from './transferService';
import { staticDataService } from './staticDataService';

// Comprehensive API Service that combines all domain services
export class ComprehensiveApiService {
  private static instance: ComprehensiveApiService;

  private constructor() {}

  public static getInstance(): ComprehensiveApiService {
    if (!ComprehensiveApiService.instance) {
      ComprehensiveApiService.instance = new ComprehensiveApiService();
    }
    return ComprehensiveApiService.instance;
  }

  // Authentication methods
  get auth() {
    return authService;
  }

  // User management methods
  get users() {
    return userService;
  }

  // Patient management methods
  get patients() {
    return patientService;
  }

  // Medical records methods
  get medicalRecords() {
    return medicalRecordService;
  }

  // Transfer methods
  get transfers() {
    return transferService;
  }

  // Static data methods
  get staticData() {
    return staticDataService;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  getToken(): string | null {
    return authService.getToken();
  }

  clearAuth(): void {
    authService.clearAuth();
  }

  // Initialize all services
  async initialize(): Promise<void> {
    try {
      // Pre-load static data for better performance
      await staticDataService.getStaticData();
    } catch (error) {
      console.warn('Failed to pre-load static data:', error);
    }
  }

  // Clear all caches
  clearAllCaches(): void {
    staticDataService.clearCache();
  }

  // Refresh all caches
  async refreshAllCaches(): Promise<void> {
    await staticDataService.refreshCache();
  }
}

// Export singleton instance
export const comprehensiveApiService = ComprehensiveApiService.getInstance();

// Export for convenience
export const api = comprehensiveApiService;
