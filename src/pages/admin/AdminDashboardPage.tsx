import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Users, Activity, FileText, Database, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">مرحباً بك في لوحة تحكم المدير</h1>
        <p className="text-xl text-muted-foreground">
          مرحباً بك في نظام إدارة السجلات الطبية
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2 space-x-reverse">
            <Shield className="w-8 h-8 text-blue-600" />
            <span>لوحة تحكم المدير</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="w-6 h-6" />
              <span>إدارة المستخدمين</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/admin/patients')}
            >
              <Activity className="w-6 h-6" />
              <span>إدارة المرضى</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/admin/medical-records')}
            >
              <FileText className="w-6 h-6" />
              <span>السجلات الطبية</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/admin/transfers')}
            >
              <Activity className="w-6 h-6" />
              <span>إدارة التحويلات</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/admin/static-data')}
            >
              <Database className="w-6 h-6" />
              <span>البيانات الثابتة</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/admin/reports')}
            >
              <BarChart3 className="w-6 h-6" />
              <span>التقارير</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
