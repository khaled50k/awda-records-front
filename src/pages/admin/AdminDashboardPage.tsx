import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { getPatientsAsync } from '../../store/slices/patientSlice';
import { StatCard } from '../../components/charts/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Badge } from '../../components/ui/badge';
import { Users, UserCheck, Activity, Eye, Search, TrendingUp, Calendar, Star, RefreshCw, Clock, Zap, Target, TrendingDown, PieChart as PieIcon, BarChart3, Gauge, Database, Server, Shield, FileText, Send } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
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
      key: 'total_users',
      title: 'إجمالي المستخدمين',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      color: 'text-blue-600',
      value: 24, // Mock data
      growth: undefined
    },
    {
      key: 'total_patients',
      title: 'إجمالي المرضى',
      icon: <Activity className="w-5 h-5 text-green-600" />,
      color: 'text-green-600',
      value: patientPagination.total || 0,
      growth: undefined
    },
    {
      key: 'total_records',
      title: 'إجمالي السجلات',
      icon: <FileText className="w-5 h-5 text-purple-600" />,
      color: 'text-purple-600',
      value: 156, // Mock data
      growth: undefined
    },
    {
      key: 'total_transfers',
      title: 'إجمالي التحويلات',
      icon: <Send className="w-5 h-5 text-orange-600" />,
      color: 'text-orange-600',
      value: 89, // Mock data
      growth: undefined
    },
    {
      key: 'active_users',
      title: 'المستخدمون النشطون',
      icon: <UserCheck className="w-5 h-5 text-cyan-600" />,
      color: 'text-cyan-600',
      value: 18, // Mock data
      growth: undefined
    },
    {
      key: 'system_status',
      title: 'حالة النظام',
      icon: <Shield className="w-5 h-5 text-indigo-600" />,
      color: 'text-indigo-600',
      value: 'مستقر',
      growth: undefined
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
          <h1 className="text-3xl font-bold tracking-tight">لوحة تحكم المدير</h1>
          <p className="text-muted-foreground">
            نظرة عامة على النظام والإحصائيات
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <div className="text-xs text-muted-foreground">
            آخر تحديث: {lastUpdated ? formatDate(lastUpdated) : 'غير متوفر'}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewStats.map((stat) => (
          <StatCard
            key={stat.key}
            title={stat.title}
            value={stat.value || 0}
            icon={stat.icon}
            color={stat.color}
            growth={stat.growth}
          />
        ))}
      </div>

      {/* Admin-Specific Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Server className="w-5 h-5 text-green-600" />
              <span>صحة النظام</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">حالة الخادم</span>
                <Badge className="bg-green-100 text-green-800">مستقر</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">المستخدمون النشطون</span>
                <span className="text-sm font-medium">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">إجمالي المرضى</span>
                <span className="text-sm font-medium">{patientPagination.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">السجلات الطبية</span>
                <span className="text-sm font-medium">156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>النشاط الأخير</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">آخر تسجيل دخول</span>
                <span className="text-sm font-medium">قبل 5 دقائق</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">آخر تحديث سجل</span>
                <span className="text-sm font-medium">قبل ساعة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">آخر تحويل</span>
                <span className="text-sm font-medium">قبل 3 ساعات</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">آخر إضافة مريض</span>
                <span className="text-sm font-medium">أمس</span>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="w-6 h-6" />
              <span>إدارة المستخدمين</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Activity className="w-6 h-6" />
              <span>إدارة المرضى</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <FileText className="w-6 h-6" />
              <span>السجلات الطبية</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Database className="w-5 h-5 text-gray-600" />
              <span>معلومات النظام</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">إحصائيات النظام</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>إجمالي المستخدمين:</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>إجمالي المرضى:</span>
                  <span className="font-medium">{patientPagination.total || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>إجمالي السجلات:</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>إجمالي التحويلات:</span>
                  <span className="font-medium">89</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">حالة النظام</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>حالة الخادم:</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">مستقر</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>آخر تحديث:</span>
                  <span className="font-medium">{lastUpdated ? formatDate(lastUpdated) : 'غير متوفر'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>إصدار النظام:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
