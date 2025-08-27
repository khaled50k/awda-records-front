import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  fetchAvailableReports, 
  generateReport,
  setFilter,
  clearFilters,
  setSelectedReportType,
  setSelectedFormat,
  clearError
} from '../store/slices/reportSlice';

export const useReports = () => {
  const dispatch = useAppDispatch();
  const {
    availableReports,
    reportFormats,
    loading,
    generating,
    error,
    filters,
    selectedReportType,
    selectedFormat
  } = useSelector((state: RootState) => state.reports);

  // Fetch available reports on mount
  useEffect(() => {
    dispatch(fetchAvailableReports());
  }, [dispatch]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    dispatch(setFilter({ key, value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleGenerateReport = () => {
    if (!selectedReportType) return;
    
    const request = {
      report_type: selectedReportType,
      format: selectedFormat,
      filters: filters
    };
    
    dispatch(generateReport(request));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const setReportType = (type: string) => {
    dispatch(setSelectedReportType(type));
  };

  const setFormat = (format: string) => {
    dispatch(setSelectedFormat(format));
  };

  return {
    // State
    availableReports,
    reportFormats,
    loading,
    generating,
    error,
    filters,
    selectedReportType,
    selectedFormat,
    
    // Actions
    handleFilterChange,
    handleClearFilters,
    handleGenerateReport,
    handleClearError,
    setReportType,
    setFormat,
    
    // Computed
    canGenerateReport: !!selectedReportType && !generating,
    hasFilters: Object.values(filters).some(value => value !== ''),
  };
};
