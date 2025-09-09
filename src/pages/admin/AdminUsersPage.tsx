import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { 
  getUsersAsync, 
  createUserAsync,
  updateUserAsync,
  clearFieldErrors
} from '../../store/slices/userSlice';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { EnhancedDataTable } from '../../components/ui/enhanced-data-table';
import { Plus, CheckCircle, XCircle, User, Calendar, Edit, Eye, Search, Shield, Mail, Phone } from 'lucide-react';
import { User as UserType } from '../../types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, ' - ');
};

const getStatusBadge = (user: UserType) => {
  if (user.is_active) {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs px-2 py-1">
        <CheckCircle className="w-3 h-3 ml-1" />
        نشط
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive" className="text-xs px-2 py-1">
        <XCircle className="w-3 h-3 ml-1" />
        غير نشط
      </Badge>
    );
  }
};

const getRoleBadge = (roleCode: string, staticData: { role?: Array<{ code: string; label_ar: string }> }) => {
  const role = staticData?.role?.find((r: { code: string; label_ar: string }) => r.code === roleCode);
  
  if (!role) {
    return (
      <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-1">
        <Shield className="w-3 h-3 ml-1" />
        غير محدد
      </Badge>
    );
  }

  // Define colors for different roles
  const roleColors: Record<string, string> = {
    'admin': 'bg-red-100 text-red-800',
    'employee': 'bg-blue-100 text-blue-800',
    'doctor': 'bg-purple-100 text-purple-800',
    'nurse': 'bg-green-100 text-green-800',
  };

  const color = roleColors[roleCode] || 'bg-gray-100 text-gray-800';

  return (
    <Badge className={`${color} text-xs px-2 py-1`}>
      <Shield className="w-3 h-3 ml-1" />
      {role.label_ar}
    </Badge>
  );
};

// Stats component
const StatsCards: React.FC<{ summary: { total: number; active: number; admin: number; employee: number } }> = ({ summary }) => {
  const statItems = [
    { label: 'إجمالي المستخدمين', value: summary.total, color: 'text-primary' },
    { label: 'نشط', value: summary.active, color: 'text-green-500' },
    { label: 'مديرين', value: summary.admin, color: 'text-red-500' },
    { label: 'موظفين', value: summary.employee, color: 'text-blue-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Form dialog component
interface FormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role_code: string;
    is_active: boolean;
  };
  onSubmit: (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role_code: string;
    is_active: boolean;
  }) => void;
  isLoading: boolean;
  editingUser: UserType | null;
}

// User Details Modal Component
interface UserDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
  staticData: { role?: Array<{ code: string; label_ar: string }> };
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onOpenChange,
  user,
  staticData
}) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 space-x-reverse">
            <User className="w-5 h-5 text-blue-600" />
            <span>المستخدم #{user.user_id}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Summary Card */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-900">ملخص المستخدم</h3>
              {getStatusBadge(user)}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-blue-600 text-sm font-medium">الدور</div>
                <div className="text-blue-900 font-semibold">
                  {user.role_code === 'admin' ? 'مدير' : user.role_code === 'employee' ? 'موظف' : user.role_code === 'doctor' ? 'طبيب' : user.role_code === 'nurse' ? 'ممرض' : 'غير محدد'}
                </div>
              </div>
              <div>
                <div className="text-blue-600 text-sm font-medium">تاريخ الإنشاء</div>
                <div className="text-blue-900 font-semibold text-sm">{formatDate(user.created_at)}</div>
              </div>
              <div>
                <div className="text-blue-600 text-sm font-medium">آخر تحديث</div>
                <div className="text-blue-900 font-semibold text-sm">{formatDate(user.updated_at)}</div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">المعلومات الأساسية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">الاسم الكامل</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="font-medium">{user.full_name}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">اسم المستخدم</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="font-mono">{user.username}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">البريد الإلكتروني</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">الدور</Label>
                                 <div className="mt-1 p-2 bg-gray-50 rounded border">
                   {getRoleBadge(user.role_code, staticData)}
                 </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">تفاصيل الحساب</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">رقم المستخدم</Label>
                <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                  <span className="font-mono font-bold text-blue-900">#{user.user_id}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">حالة الحساب</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {getStatusBadge(user)}
                </div>
              </div>
              {user.health_center_code && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">رمز مركز الرعاية الصحية</Label>
                  <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                    <span className="font-mono text-green-900">{user.health_center_code}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">التواريخ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="text-sm">{formatDate(user.created_at)}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">آخر تحديث</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="text-sm">{formatDate(user.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UserFormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  formData,
  onSubmit,
  isLoading,
  editingUser
}) => {
  const [form, setForm] = useState(formData);
  const { staticData } = useSelector((state: RootState) => state.staticData);
  const { fieldErrors } = useSelector((state: RootState) => state.users);

  // Update form when formData changes (for editing)
  React.useEffect(() => {
    setForm(formData);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">اسم المستخدم</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className={fieldErrors.username ? 'border-red-500' : ''}
            />
            {fieldErrors.username && (
              <div className="text-sm text-red-600">
                {fieldErrors.username.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldErrors.email ? 'border-red-500' : ''}
            />
            {fieldErrors.email && (
              <div className="text-sm text-red-600">
                {fieldErrors.email.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {editingUser ? 'كلمة المرور (اتركها فارغة إذا لم ترد تغييرها)' : 'كلمة المرور'}
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingUser}
              className={fieldErrors.password ? 'border-red-500' : ''}
            />
            {fieldErrors.password && (
              <div className="text-sm text-red-600">
                {fieldErrors.password.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">الاسم الكامل</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
              className={fieldErrors.full_name ? 'border-red-500' : ''}
            />
            {fieldErrors.full_name && (
              <div className="text-sm text-red-600">
                {fieldErrors.full_name.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role_code">الدور</Label>
            <Select value={form.role_code} onValueChange={(value) => setForm({ ...form, role_code: value })}>
              <SelectTrigger className={fieldErrors.role_code ? 'border-red-500' : ''}>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                                 {staticData?.role?.map((role) => (
                   <SelectItem key={role.code} value={role.code}>
                     {role.label_ar}
                   </SelectItem>
                 )) || []}
              </SelectContent>
            </Select>
            {fieldErrors.role_code && (
              <div className="text-sm text-red-600">
                {fieldErrors.role_code.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="is_active">نشط</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main component
export const AdminUsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { users, loading, pagination, filters, fieldErrors } = useSelector((state: RootState) => state.users);
  const { staticData } = useSelector((state: RootState) => state.staticData);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role_code: '',
    is_active: true
  });

  useEffect(() => {
    dispatch(getUsersAsync({ page: 1, perPage: 100 }));
  }, [dispatch]);

  const handleCreateUser = async (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role_code: string;
    is_active: boolean;
  }) => {
    try {
      await dispatch(createUserAsync(data)).unwrap();
      setIsFormOpen(false);
      setFormData({ username: '', email: '', password: '', full_name: '', role_code: '', is_active: true });
      dispatch(clearFieldErrors()); // Clear all field errors
      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: "تم إضافة المستخدم الجديد إلى النظام",
      });
    } catch (error) {
      // Field errors are now handled by the store and displayed in the form
      toast({
        title: "خطأ في إنشاء المستخدم",
        description: "يرجى مراجعة الأخطاء في النموذج",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role_code: string;
    is_active: boolean;
  }) => {
    if (!editingUser) return;
    
    try {
      await dispatch(updateUserAsync({ id: editingUser.user_id, userData: data })).unwrap();
      setIsFormOpen(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', full_name: '', role_code: '', is_active: true });
      dispatch(clearFieldErrors()); // Clear all field errors
      toast({
        title: "تم تحديث المستخدم بنجاح",
        description: "تم تحديث بيانات المستخدم",
      });
    } catch (error) {
      // Field errors are now handled by the store and displayed in the form
      toast({
        title: "خطأ في تحديث المستخدم",
        description: "يرجى مراجعة الأخطاء في النموذج",
        variant: "destructive",
      });
    }
  };

  const handleOpenCreateForm = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', full_name: '', role_code: '', is_active: true });
    dispatch(clearFieldErrors()); // Clear any previous errors
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't show password when editing
      full_name: user.full_name,
      role_code: user.role_code,
      is_active: user.is_active
    });
    dispatch(clearFieldErrors()); // Clear any previous errors
    setIsFormOpen(true);
  };

  

  const columns = [
    {
      key: 'username',
      label: 'اسم المستخدم',
      exportable: true,
      render: (value: any, record: UserType) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{record.username}</span>
        </div>
      ),
    },
    {
      key: 'full_name',
      label: 'الاسم الكامل',
      exportable: true,
    },
    {
      key: 'email',
      label: 'البريد الإلكتروني',
      exportable: true,
      render: (value: any, record: UserType) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span>{record.email}</span>
        </div>
      ),
    },
    {
      key: 'role.label_ar',
      label: 'الدور',
      exportable: true,
      render: (value: any, record: UserType) => getRoleBadge(record.role_code, staticData),
    },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      exportable: true,
      render: (value: any, record: UserType) => formatDate(record.created_at),
    },
    {
      key: 'status',
      label: 'الحالة',
      exportable: true,
      render: (value: any, record: UserType) => getStatusBadge(record),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      exportable: false,
      render: (value: any, record: UserType) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(record);
              setIsUserDetailsModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="عرض التفاصيل"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEditForm(record)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            title="تعديل المستخدم"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">
            إدارة المستخدمين والصلاحيات في النظام
          </p>
        </div>
        <Button onClick={handleOpenCreateForm}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards summary={{ total: pagination.total, active: users.filter(u => u.is_active).length, admin: users.filter(u => u.role_code === 'admin').length, employee: users.filter(u => u.role_code === 'employee').length }} />

 

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <EnhancedDataTable
            data={users}
            columns={columns}
            loading={loading}
            pagination={{
              current_page: pagination.currentPage,
              last_page: pagination.lastPage,
              per_page: pagination.perPage,
              total: pagination.total
            }}
            onPageChange={(page) => dispatch(getUsersAsync({ page, perPage: pagination.perPage }))}
       
            showSearch={true}
            searchPlaceholder="البحث بالاسم أو البريد الإلكتروني..."
            searchableColumns={['full_name', 'username', 'email']}
          />
        </CardContent>
      </Card>

      {/* Form Dialogs */}
      <UserFormDialog
        isOpen={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            dispatch(clearFieldErrors()); // Clear errors when modal is closed
          }
          setIsFormOpen(open);
        }}
        title={editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        formData={formData}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        isLoading={loading}
        editingUser={editingUser}
      />

             {/* User Details Modal */}
       <UserDetailsModal
         isOpen={isUserDetailsModalOpen}
         onOpenChange={setIsUserDetailsModalOpen}
         user={selectedUser}
         staticData={staticData}
       />
    </div>
  );
};
