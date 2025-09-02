import api, { apiService } from "./api";
import { AvailableReportsResponse, GenerateReportRequest } from "../types/api";

export const reportService = {
  // Get available reports
  getAvailableReports: async (): Promise<AvailableReportsResponse> => {
    try {
      const response = await apiService.get<AvailableReportsResponse>("/reports/available");
      return response.data;
    } catch (error) {
      console.error("Error fetching available reports:", error);
      throw error;
    }
  },

  // Generate report (returns file URL or blob)
  generateReport: async (request: GenerateReportRequest): Promise<any> => {
    try {
<<<<<<< HEAD
      // First try to get JSON response with file_url
      const response = await apiService.post<any>(
        '/reports/generate',
        request,
        {
          headers: { Accept: 'application/json' },
        }
      );

      // Check if response contains file_url (new format)
      if (response.data && response.data.file_url) {
        return response.data;
      }

      // Fallback to blob download (old format)
      const blob = (await apiService.post<Blob>(
        '/reports/generate',
=======
      // Use raw axios instance for binary responses
      const response = await api.post(
        "/reports/generate",
>>>>>>> 00659c4910ff6616b7169043c693ec5c2c4794b4
        request,
        {
          responseType: "blob",
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );

      return response.data as Blob;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  },

  // Download file helper
  downloadFile: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Open file URL in new window
  openFileUrl: (fileUrl: string): void => {
    try {
      // Clean the file URL by removing extra spaces and backticks
      const cleanUrl = fileUrl.trim().replace(/`/g, '');
      window.open(cleanUrl, '_blank');
    } catch (error) {
      console.error('Error opening file URL:', error);
      throw new Error('فشل في فتح رابط الملف');
    }
  },
};
