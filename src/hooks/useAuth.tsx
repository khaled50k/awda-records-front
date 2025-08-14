import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch, store } from '../store';
import {
  loginAsync,
  logoutAsync,
  getProfileAsync,
  changePasswordAsync,
  clearError,
  initializeAuth,
} from '../store/slices/authSlice';
import { getStaticDataAsync } from '../store/slices/staticDataSlice';
import { AdminLoginRequest, AdminChangePasswordRequest } from '../types/api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  // Fetch static data
  const fetchStaticData = useCallback(async () => {
    try {
      // Check if static data is already loaded to avoid duplicate calls
      const currentState = store.getState();
      if (currentState.staticData.staticData && Object.keys(currentState.staticData.staticData).length > 0) {
        console.log('Static data already loaded, skipping fetch');
        return;
      }
      
      console.log('Fetching static data...');
      await dispatch(getStaticDataAsync()).unwrap();
    } catch (error) {
      console.warn('Failed to fetch static data:', error);
    }
  }, [dispatch]);

  // Login
  const login = useCallback(async (credentials: AdminLoginRequest) => {
    try {
      const result = await dispatch(loginAsync(credentials)).unwrap();
      
      // After successful login, fetch static data
      await fetchStaticData();
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch, fetchStaticData]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  // Get profile
  const getProfile = useCallback(async () => {
    try {
      const result = await dispatch(getProfileAsync()).unwrap();
      
      // After getting profile, fetch static data if not already loaded
      await fetchStaticData();
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch, fetchStaticData]);

  // Change password
  const changePassword = useCallback(async (data: AdminChangePasswordRequest) => {
    try {
      await dispatch(changePasswordAsync(data)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  // Clear error
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Initialize auth
  const initializeAuthState = useCallback(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return {
    // State
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,

    // Actions
    login,
    logout,
    getProfile,
    changePassword,
    clearAuthError,
    initializeAuthState,
    fetchStaticData,
  };
};
