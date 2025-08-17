import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { getTransferAsync } from '../../store/slices/transferSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, FileText, User, Hash, Send, Download, CheckCircle, Clock } from 'lucide-react';
import { RecordTransfer } from '../../types/api';
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

// Transfer status badge component
const TransferStatusBadge: React.FC<{ transfer: RecordTransfer }> = ({ transfer }) => {

    return (
      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-3 py-1">
        {transfer.medical_record?.status?.label_ar}
      </Badge>
    );
  }


  


// Main component
export const ViewTransferPage: React.FC = () => {
  const navigate = useNavigate();
  const { transferId } = useParams<{ transferId: string }>();
  const dispatch = useAppDispatch();
  
  const { currentTransfer, loading } = useSelector((state: RootState) => state.transfers);
  
  const [transfer, setTransfer] = useState<RecordTransfer | null>(null);

  useEffect(() => {
    if (transferId) {
      dispatch(getTransferAsync(parseInt(transferId)));
    }
  }, [transferId, dispatch]);

  useEffect(() => {
    if (currentTransfer) {
      setTransfer(currentTransfer);
    }
  }, [currentTransfer]);

  const handleBack = () => {
    navigate('/admin/transfers');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-lg text-muted-foreground">جاري تحميل بيانات التحويل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">التحويل غير موجود</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على التحويل المطلوب</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للتحويلات
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
              عرض التحويل
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              تفاصيل التحويل رقم: {transfer.transfer_id}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <TransferStatusBadge transfer={transfer} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Information */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
              <Send className="w-5 h-5 text-gaza-green" />
              <span>معلومات التحويل</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">رقم التحويل</p>
                <p className="text-lg font-semibold text-gray-900">#{transfer.transfer_id}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">تاريخ الإرسال</p>
                <p className="text-lg text-gray-900">{formatDate(transfer.created_at)}</p>
              </div>
              
              {transfer.received_at && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">تاريخ الاستلام</p>
                  <p className="text-lg text-gray-900">{formatDate(transfer.received_at)}</p>
                </div>
              )}
              
              {transfer.completed_at && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">تاريخ الإكمال</p>
                  <p className="text-lg text-gray-900">{formatDate(transfer.completed_at)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transfer Details */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>تفاصيل التحويل</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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

              {/* Medical Record */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">السجل الطبي</p>
                <p className="text-lg font-semibold text-gray-900">#{transfer.medical_record?.record_id || 'غير محدد'}</p>
                <p className="text-sm text-gray-500">{transfer.medical_record?.patient?.full_name || 'غير محدد'}</p>
              </div>

              {/* Status Code */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">حالة السجل</p>
                <p className="text-lg font-semibold text-gray-900">{transfer.medical_record?.status?.label_ar || 'غير محدد'}</p>
              </div>
            </div>

            {/* Transfer Notes */}
            {transfer.transfer_notes && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 mb-2">ملاحظات التحويل</p>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-lg text-gray-900">{transfer.transfer_notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medical Record Information */}
      {transfer.medical_record && (
        <Card className="mt-6">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>معلومات السجل الطبي</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">اسم المريض</p>
                <p className="text-lg font-semibold text-gray-900">{transfer.medical_record.patient?.full_name || 'غير محدد'}</p>
              </div>

              {/* Patient National ID */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">رقم الهوية</p>
                <p className="text-lg font-mono text-gray-900">{transfer.medical_record.patient?.national_id || 'غير محدد'}</p>
              </div>

              {/* Health Center */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">المركز الصحي</p>
                <p className="text-lg font-semibold text-gray-900">{transfer.medical_record.patient?.health_center?.label_ar || transfer.medical_record.patient?.health_center_code || 'غير محدد'}</p>
              </div>

              {/* Problem Type */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">نوع المشكلة</p>
                <p className="text-lg font-semibold text-gray-900">{transfer.medical_record.problem_type?.label_ar || transfer.medical_record.problem_type_code || 'غير محدد'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

             {/* Actions */}
       <div className="mt-6 flex items-center justify-end space-x-3 space-x-reverse">
       <Button
           onClick={handleBack}
           variant="outline"
           className="px-6 py-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500"
         >
           <ArrowLeft className="w-4 h-4 ml-2" />
           العودة للتحويلات
         </Button>
         <Button
           onClick={() => navigate(`/admin/medical-records/${transfer?.medical_record?.record_id}/transfer`)}
           className="px-8 py-2 min-w-[180px] bg-gaza-green hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
         >
           <Send className="w-4 h-4 ml-2" />
           إرسال إلى مستخدم آخر
         </Button>
      
       </div>
    </div>
  );
};
