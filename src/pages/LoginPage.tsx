
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch } from '../store';
import { useSelector } from 'react-redux';
import { loginAsync, clearError } from '../store/slices/authSlice';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { RootState } from '../store';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Get auth state directly from Redux store for better control
  const { isLoading, error, user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // Clear errors when component mounts or when error changes
  useEffect(() => {
    if (error) {
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Clear form errors when user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field-specific error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'اسم المستخدم مطلوب';
    }
    
    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    dispatch(clearError());
    setFormErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      await dispatch(loginAsync(formData)).unwrap();
      // Success will be handled by the auth slice and redirect logic
    } catch (error) {
      // Error is already handled by the auth slice
      console.error('Login failed:', error);
    }
  };

  // Redirect based on user role after successful login
  if (isAuthenticated && user) {
    const redirectPath = location.state?.from || 
      (user.role_code === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gaza-green/10 to-gaza-green/5" dir="rtl">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
      
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بياناتك للوصول إلى لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className={`text-right ${formErrors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {formErrors.username && (
                  <p className="text-red-500 text-sm">{formErrors.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`text-right ${formErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {formErrors.password && (
                  <p className="text-red-500 text-sm">{formErrors.password}</p>
                )}
              </div>

              {/* Global error from auth slice */}
              {error && (
                <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gaza-green hover:bg-gaza-green/90 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="ml-2" />
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
