import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { getMedicalRecordAsync } from '../../store/slices/medicalRecordSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, FileText, User, Hash, Send } from 'lucide-react';
import { MedicalRecord, StaticData } from '../../types/api';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

// Utility function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, ' - ');
};

// Status badge component
const StatusBadge: React.FC<{ status: StaticData }> = ({ status }) => {
  const getStatusColor = (code: string) => {
    switch (code) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status.code)} border text-xs px-3 py-1`}>
      {status.label_ar}
    </Badge>
  );
};

// Main component
export const ViewMedicalRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();
  const dispatch = useAppDispatch();
  
  const { currentRecord, loading } = useSelector((state: RootState) => state.medicalRecords);
  const { staticData } = useSelector((state: RootState) => state.staticData);
  
  const [record, setRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    if (recordId) {
      dispatch(getMedicalRecordAsync(parseInt(recordId)));
    }
  }, [recordId, dispatch]);

  useEffect(() => {
    if (currentRecord) {
      setRecord(currentRecord);
    }
  }, [currentRecord]);

  const handleBack = () => {
    navigate('/admin/medical-records');
  };

     if (loading) {
     return (
       <div className="max-w-7xl mx-auto">
         <div className="flex items-center justify-center min-h-[400px]">
           <div className="text-center">
             <LoadingSpinner size="lg" />
             <p className="mt-4 text-lg text-muted-foreground">جاري تحميل بيانات السجل الطبي...</p>
           </div>
         </div>
       </div>
     );
   }

  if (!record) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">السجل الطبي غير موجود</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على السجل الطبي المطلوب</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للسجلات الطبية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
             {/* Header */}
       <div className="mb-8">
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
               عرض السجل الطبي
             </h1>
             <p className="text-lg text-muted-foreground mt-2">
               تفاصيل السجل الطبي رقم: {record.record_id}
             </p>
           </div>
           
           <div className="flex items-center space-x-3 space-x-reverse">
             <StatusBadge status={record.status!} />
           </div>
         </div>
       </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Patient Information */}
         <Card className="lg:col-span-1">
           <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
             <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
               <User className="w-5 h-5 text-gaza-green" />
               <span>معلومات المريض</span>
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
             <div className="space-y-4">
               <div className="space-y-2">
                 <p className="text-sm font-medium text-gray-600">الاسم الكامل</p>
                 <p className="text-lg font-semibold text-gray-900">{record.patient?.full_name || 'غير محدد'}</p>
               </div>
               
               <div className="space-y-2">
                 <p className="text-sm font-medium text-gray-600">رقم الهوية</p>
                 <p className="text-lg font-mono text-gray-900">{record.patient?.national_id || 'غير محدد'}</p>
               </div>
               
               <div className="space-y-2">
                 <p className="text-sm font-medium text-gray-600">الجنس</p>
                 <p className="text-lg text-gray-900">
                   {record.patient?.gender_code === 'male' ? 'ذكر' : record.patient?.gender_code === 'female' ? 'أنثى' : 'غير محدد'}
                 </p>
               </div>
               
               <div className="space-y-2">
                 <p className="text-sm font-medium text-gray-600">المركز الصحي</p>
                 <p className="text-lg font-semibold text-gray-900">
                   {record.patient?.health_center?.label_ar || record.patient?.health_center_code || 'غير محدد'}
                 </p>
               </div>
             </div>
           </CardContent>
         </Card>

                 {/* Record Details */}
         <Card className="lg:col-span-2">
           <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
             <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
               <FileText className="w-5 h-5 text-blue-600" />
               <span>تفاصيل السجل الطبي</span>
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Problem Type */}
               <div className="space-y-2">
                 <p className="text-sm font-medium text-gray-600">نوع المشكلة</p>
                 <p className="text-lg font-semibold text-gray-900">{record.problem_type?.label_ar || 'غير محدد'}</p>
               </div>

               {/* Status */}
               <div className="space-y-2">
                 <p className="text-sm font-medium text-gray-600">الحالة</p>
                 <StatusBadge status={record.status!} />
               </div>

               {/* Created By */}
               <div className="space-y-2">
                 <p className="text-sm font-medium text-gray-600">تم الإنشاء بواسطة</p>
                 <p className="text-lg font-semibold text-gray-900">{record.creator?.full_name || 'غير محدد'}</p>
                 <p className="text-sm text-gray-500">@{record.creator?.username || ''}</p>
               </div>
             </div>

             {/* Timestamps */}
             <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <p className="text-sm font-medium text-gray-600">تاريخ الإنشاء</p>
                   <p className="text-lg text-gray-900">{formatDate(record.created_at)}</p>
                 </div>
                 
                 <div className="space-y-2">
                   <p className="text-sm font-medium text-gray-600">آخر تحديث</p>
                   <p className="text-lg text-gray-900">{formatDate(record.updated_at)}</p>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
      </div>

                           {/* Transfers Section */}
        {record.transfers && record.transfers.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>سجل التحويلات ({record.transfers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {record.transfers.map((transfer, index) => (
                  <div key={transfer.transfer_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">تحويل #{index + 1}</h4>
                      <p className="text-sm text-gray-500">تاريخ التحويل: {formatDate(transfer.created_at)}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sender */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">المرسل</p>
                        <p className="text-lg font-semibold text-gray-900">{transfer.sender?.full_name || 'غير محدد'}</p>
                        <p className="text-sm text-gray-500">@{transfer.sender?.username || ''}</p>
                      </div>
                      
                      {/* Recipient */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">المستلم</p>
                        <p className="text-lg font-semibold text-gray-900">{transfer.recipient?.full_name || 'غير محدد'}</p>
                        <p className="text-sm text-gray-500">@{transfer.recipient?.username || ''}</p>
                      </div>
                    </div>
                    
                    {transfer.transfer_notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-600 mb-2">ملاحظات التحويل</p>
                        <p className="text-lg text-gray-900">{transfer.transfer_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

     
       {/* Actions */}
       <div className="mt-6 flex items-center justify-end space-x-3 space-x-reverse">
         <Button
           onClick={() => navigate(`/admin/medical-records/${record.record_id}/transfer`)}
           className="px-8 py-2 min-w-[180px] bg-gaza-green hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
         >
           <Send className="w-4 h-4 ml-2" />
           إرسال إلى مستخدم آخر
         </Button>
         <Button
           onClick={handleBack}
           variant="outline"
           className="px-6 py-2"
         >
           <ArrowLeft className="w-4 h-4 ml-2" />
           العودة للسجلات الطبية
         </Button>
       </div>
    </div>
  );
};
