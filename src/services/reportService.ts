import api, { apiService } from './api';
import { 
  AvailableReportsResponse, 
  GenerateReportRequest, 
} from '../types/api';

export const reportService = {
  // Get available reports
  getAvailableReports: async (): Promise<AvailableReportsResponse> => {
    try {
      const response = await apiService.get<AvailableReportsResponse>('/reports/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available reports:', error);
      throw error;
    }
  },

  // Generate report (downloadable file)
  generateReport: async (request: GenerateReportRequest): Promise<Blob> => {
    try {
      const response = await api.post<Blob>(
        '/reports/generate',
        request,
        {
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
        }
      );

      // Axios with responseType 'blob' returns the blob in response.data
      return response.data as unknown as Blob;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // Download file helper
  downloadFile: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
