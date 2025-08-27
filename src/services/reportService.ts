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
      // Use the same helper as getAvailableReports, but ask axios for a blob
      const blob = (await apiService.post<Blob>(
        '/reports/generate',
        request,
        {
          // @ts-expect-error axios responseType for blob
          responseType: 'blob',
          headers: { Accept: 'application/octet-stream' },
        }
      )) as unknown as Blob;

      return blob;
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
