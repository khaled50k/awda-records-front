import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '../types/api';

// Hook for API calls with loading states and error handling
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  autoFetch: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const response = await apiCall();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'حدث خطأ غير متوقع');
      }
    } catch (err: any) {
      // Don't set error if request was aborted
      if (err.name === 'AbortError') {
        return;
      }
      
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiCall]);

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    refreshing,
    refetch,
    reset,
    setData,
    setError
  };
}

// Hook for API calls that return paginated data
export function usePaginatedApi<T>(
  apiCall: (page: number, perPage: number) => Promise<ApiResponse<T>>,
  initialPage: number = 1,
  initialPerPage: number = 15,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNum: number = page, pageSize: number = perPage) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall(pageNum, pageSize);
      
      if (response.success) {
        setData(response.data);
        setTotal(response.data.total || 0);
        setHasMore(response.data.current_page < response.data.last_page);
      } else {
        setError(response.message || 'حدث خطأ غير متوقع');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, [apiCall, page, perPage]);

  const nextPage = useCallback(() => {
    if (hasMore && !loading) {
      const nextPageNum = page + 1;
      setPage(nextPageNum);
      fetchData(nextPageNum, perPage);
    }
  }, [hasMore, loading, page, perPage, fetchData]);

  const prevPage = useCallback(() => {
    if (page > 1 && !loading) {
      const prevPageNum = page - 1;
      setPage(prevPageNum);
      fetchData(prevPageNum, perPage);
    }
  }, [page, loading, perPage, fetchData]);

  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1 && pageNum !== page && !loading) {
      setPage(pageNum);
      fetchData(pageNum, perPage);
    }
  }, [page, loading, perPage, fetchData]);

  const changePerPage = useCallback((newPerPage: number) => {
    if (newPerPage !== perPage && !loading) {
      setPerPage(newPerPage);
      setPage(1); // Reset to first page
      fetchData(1, newPerPage);
    }
  }, [perPage, loading, fetchData]);

  const refresh = useCallback(() => {
    fetchData(page, perPage);
  }, [fetchData, page, perPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    page,
    perPage,
    total,
    hasMore,
    nextPage,
    prevPage,
    goToPage,
    changePerPage,
    refresh,
    setData,
    setError
  };
}

// Hook for form submission with loading state
export function useApiSubmit<T, R>(
  apiCall: (data: T) => Promise<ApiResponse<R>>,
  onSuccess?: (data: R) => void,
  onError?: (error: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: T) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall(data);
      
      if (response.success) {
        onSuccess?.(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'حدث خطأ غير متوقع';
        setError(errorMsg);
        onError?.(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'حدث خطأ غير متوقع';
      setError(errorMsg);
      onError?.(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    submit,
    loading,
    error,
    reset
  };
}
