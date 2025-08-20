import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import {
  loginAsync,
  logoutAsync,
  getProfileAsync,
  changePasswordAsync,
  clearError,
  initializeAuth,
} from '../store/slices/authSlice';
import { AdminLoginRequest, AdminChangePasswordRequest } from '../types/api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useSelector((state: RootState) => state.auth);



  // Login
  const login = useCallback(async (credentials: AdminLoginRequest) => {
    try {
      const result = await dispatch(loginAsync(credentials)).unwrap();
      
      // Static data is now loaded at app level, no need to fetch here
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

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
      
      // Static data is now loaded at app level, no need to fetch here
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

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
  };
};
