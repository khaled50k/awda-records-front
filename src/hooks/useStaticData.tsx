import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store';
import { RootState } from '../store';
import { getStaticDataAsync } from '../store/slices/staticDataSlice';
import { LoadingSpinner } from '../components/ui/loading-spinner';

export const useStaticData = () => {
  const dispatch = useAppDispatch();
  const { staticData, loading, error } = useSelector((state: RootState) => state.staticData);

  // Fetch static data
  const fetchStaticData = useCallback(async () => {
    try {
      // Check if static data is already loaded to avoid duplicate calls
      if (staticData && Object.keys(staticData).length > 0) {
        console.log('Static data already loaded, skipping fetch');
        return;
      }
      
      console.log('Fetching static data...');
      await dispatch(getStaticDataAsync()).unwrap();
    } catch (error) {
      console.warn('Failed to fetch static data:', error);
    }
  }, [dispatch, staticData]);

  // Load static data on mount
  useEffect(() => {
    fetchStaticData();
  }, [fetchStaticData]);

  // Loading overlay component
  const LoadingOverlay = () => {
    if (!loading) return null;
    
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  };

  return {
    staticData,
    loading,
    error,
    fetchStaticData,
    LoadingOverlay,
  };
};
