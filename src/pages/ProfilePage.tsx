
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { User, Mail, Phone, Shield, Key, Save, Edit } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/loading-spinner';

export const ProfilePage: React.FC = () => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone?.toString() || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // TODO: Implement password change
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-gray-600">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-gaza-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">
                {user?.username?.charAt(0) || 'م'}
              </span>
            </div>
            <CardTitle className="text-xl">{user?.username}</CardTitle>
            <p className="text-gray-600">مدير النظام</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 ml-2 text-gray-500" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 ml-2 text-gray-500" />
              <span>{user?.phone}</span>
            </div>
            <div className="flex items-center text-sm">
              <Shield className="w-4 h-4 ml-2 text-gray-500" />
              <span>مدير النظام</span>
            </div>
            <Separator />
            <div className="text-xs text-gray-500">
              آخر تسجيل دخول: {user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString('ar-SA') : 'غير محدد'}
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 ml-2" />
                  المعلومات الشخصية
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    'إلغاء'
                  ) : (
                    <>
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="text-right"
                />
              </div>
              {isEditing && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="bg-gaza-green hover:bg-gaza-green/90">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 ml-2" />
                تغيير كلمة المرور
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">كلمة المرور الحالية</Label>
                <Input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  className="text-right"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  className="bg-gaza-green hover:bg-gaza-green/90"
                  disabled={!passwordForm.current_password || !passwordForm.new_password || passwordForm.new_password !== passwordForm.confirm_password}
                >
                  <Key className="w-4 h-4 ml-2" />
                  تغيير كلمة المرور
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 ml-2" />
                إعدادات الأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">المصادقة الثنائية</p>
                  <p className="text-sm text-green-600">حماية إضافية لحسابك</p>
                </div>
                <Button variant="outline" size="sm">
                  تفعيل
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">سجل نشاط تسجيل الدخول</p>
                  <p className="text-sm text-blue-600">مراجعة عمليات تسجيل الدخول الأخيرة</p>
                </div>
                <Button variant="outline" size="sm">
                  عرض
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
