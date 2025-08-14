import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { getPatientsAsync } from '../../store/slices/patientSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Badge } from '../../components/ui/badge';
import { Users, Activity, Eye, Search, Calendar, Clock, Zap, FileText, Send, Download, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployeeDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get data from available slices
  const { patients, pagination: patientPagination } = useSelector((state: RootState) => state.patients);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await dispatch(getPatientsAsync({ page: 1, perPage: 1 })).unwrap();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // Helper: Format date to Arabic (US)
  const formatDate = (date: Date) => date.toLocaleDateString('ar-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Overview Stats using available data and mock data
  const overviewStats = [
    {
      key: 'total_patients',
      title: 'إجمالي المرضى',
      icon: <Heart className="w-5 h-5 text-red-600" />,
      color: 'text-red-600',
      value: patientPagination.total || 0,
      description: 'المرضى المسجلين في النظام'
    },
    {
      key: 'total_records',
      title: 'السجلات الطبية',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      color: 'text-blue-600',
      value: 156, // Mock data
      description: 'السجلات الطبية المتاحة'
    },
    {
      key: 'pending_transfers',
      title: 'التحويلات المعلقة',
      icon: <Send className="w-5 h-5 text-yellow-600" />,
      color: 'text-yellow-600',
      value: 5, // Mock data
      description: 'التحويلات في انتظار المعالجة'
    },
    {
      key: 'completed_today',
      title: 'مكتمل اليوم',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      color: 'text-green-600',
      value: 12, // Mock data
      description: 'المهام المكتملة اليوم'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة تحكم الموظف</h1>
          <p className="text-muted-foreground">
            مرحباً بك في النظام الطبي
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button variant="outline" onClick={handleRefresh}>
            <Clock className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <div className="text-xs text-muted-foreground">
            آخر تحديث: {lastUpdated ? formatDate(lastUpdated) : 'غير متوفر'}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => (
          <Card key={stat.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span>إجراءات سريعة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/employee/patients')}
            >
              <Heart className="w-6 h-6" />
              <span className="text-sm">عرض المرضى</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/employee/medical-records')}
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm">السجلات الطبية</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/employee/transfers')}
            >
              <Send className="w-6 h-6" />
              <span className="text-sm">إرسال سجل</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/employee/transfers')}
            >
              <Download className="w-6 h-6" />
              <span className="text-sm">استلام سجل</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee-Specific Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Calendar className="w-5 h-5 text-green-600" />
              <span>مهام اليوم</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">مراجعة سجلات المرضى</span>
                </div>
                <Badge className="bg-green-100 text-green-800">مكتمل</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">إرسال سجل طبي</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">تحديث بيانات مريض</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">قيد التنفيذ</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>النشاط الأخير</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">تم إنشاء سجل طبي جديد</span>
                <span className="text-xs text-muted-foreground">منذ 10 دقائق</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">تم إرسال سجل إلى الدكتور أحمد</span>
                <span className="text-xs text-muted-foreground">منذ 25 دقيقة</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">تم استلام سجل من قسم الأشعة</span>
                <span className="text-xs text-muted-foreground">منذ ساعة</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">تم تحديث بيانات مريض</span>
                <span className="text-xs text-muted-foreground">منذ ساعتين</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span>الإشعارات المهمة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 space-x-reverse p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">سجل طبي يحتاج مراجعة عاجلة</p>
                <p className="text-xs text-muted-foreground">مريض: أحمد محمد - رقم السجل: #12345</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse p-3 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">تذكير: اجتماع فريق العمل</p>
                <p className="text-xs text-muted-foreground">غداً الساعة 10:00 صباحاً</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
