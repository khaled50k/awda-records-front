import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { getPatientAsync } from '../../store/slices/patientSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, User, Hash, FileText, Send, Building2, Calendar, Edit, Plus } from 'lucide-react';
import { Patient, MedicalRecord, RecordTransfer } from '../../types/api';
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

// Gender badge component
const GenderBadge: React.FC<{ genderCode: string }> = ({ genderCode }) => {
  const getGenderColor = (code: string) => {
    switch (code) {
      case 'male':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'female':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGenderLabel = (code: string) => {
    switch (code) {
      case 'male':
        return 'ذكر';
      case 'female':
        return 'أنثى';
      default:
        return 'غير محدد';
    }
  };

  return (
    <Badge className={`${getGenderColor(genderCode)} border text-xs px-3 py-1`}>
      <User className="w-3 h-3 ml-1" />
      {getGenderLabel(genderCode)}
    </Badge>
  );
};

// Medical record status badge component
const RecordStatusBadge: React.FC<{ status: any }> = ({ status }) => {
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
    <Badge className={`${getStatusColor(status?.code || '')} border text-xs px-3 py-1`}>
      {status?.label_ar || 'غير محدد'}
    </Badge>
  );
};

// Main component
export const ViewPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const dispatch = useAppDispatch();
  
  const { currentPatient, loading } = useSelector((state: RootState) => state.patients);
  
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (patientId) {
      dispatch(getPatientAsync(parseInt(patientId)));
    }
  }, [patientId, dispatch]);

  useEffect(() => {
    if (currentPatient) {
      setPatient(currentPatient);
    }
  }, [currentPatient]);

  const handleBack = () => {
    navigate('/admin/patients');
  };

  const handleEdit = () => {
    navigate(`/admin/patients/${patientId}/edit`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-lg text-muted-foreground">جاري تحميل بيانات المريض...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">المريض غير موجود</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على المريض المطلوب</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للمرضى
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
              عرض بيانات المريض
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              المريض: {patient.full_name} - رقم الهوية: {patient.national_id}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <Button onClick={handleEdit} variant="outline" className="px-4 py-2">
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Patient Information */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
              <User className="w-5 h-5 text-gaza-green" />
              <span>معلومات المريض</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 "> 
            <div className="space-y-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">الاسم الكامل</p>
                <p className="text-lg font-semibold text-gray-900">{patient.full_name}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">رقم الهوية</p>
                <p className="text-lg font-mono text-gray-900">{patient.national_id}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">الجنس</p>
                <GenderBadge genderCode={patient.gender_code} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">المركز الصحي</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    {patient.health_center?.label_ar || patient.health_center_code || 'غير محدد'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">معرف المريض</p>
                <p className="text-lg font-mono text-gray-900">#{patient.patient_id}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">تاريخ الإنشاء</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-lg text-gray-900">{formatDate(patient.created_at)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">آخر تحديث</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-lg text-gray-900">{formatDate(patient.updated_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Summary */}
        <Card className="lg:row-span-1">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>ملخص المريض</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">
                  {patient.medical_records?.length || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">السجلات الطبية</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {patient.medical_records?.filter(record => 
                    record.transfers && record.transfers.length > 0
                  ).length || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">التحويلات</div>
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">
                  {patient.medical_records?.filter(record => 
                    record.status?.code === 'completed'
                  ).length || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">السجلات المكتملة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Records Section */}
      {patient.medical_records && patient.medical_records.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>السجلات الطبية ({patient.medical_records.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {patient.medical_records.map((record) => (
                <div key={record.record_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        السجل الطبي #{record.record_id}
                      </h4>
                      <RecordStatusBadge status={record.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      تاريخ الإنشاء: {formatDate(record.created_at)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">نوع المشكلة</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {record.problem_type?.label_ar || 'غير محدد'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">أنشأ بواسطة</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {record.creator?.full_name || 'غير محدد'}
                      </p>
                    </div>
                  </div>

                  {/* Transfers for this record */}
                  {record.transfers && record.transfers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h5 className="text-md font-semibold text-gray-800 mb-3">
                        التحويلات ({record.transfers.length})
                      </h5>
                      <div className="space-y-3">
                        {record.transfers.map((transfer, index) => (
                          <div key={transfer.transfer_id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                تحويل #{index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(transfer.created_at)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">من: </span>
                                <span className="font-medium">{transfer.sender?.full_name || 'غير محدد'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">إلى: </span>
                                <span className="font-medium">{transfer.recipient?.full_name || 'غير محدد'}</span>
                              </div>
                            </div>
                            
                            {transfer.transfer_notes && (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-700">{transfer.transfer_notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Medical Records Message */}
      {(!patient.medical_records || patient.medical_records.length === 0) && (
        <Card className="mt-6">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">لا توجد سجلات طبية</h3>
            <p className="text-muted-foreground mb-4">
              هذا المريض لا يملك أي سجلات طبية حتى الآن
            </p>
            <Button 
              onClick={() => navigate(`/admin/medical-records/create?patient_id=${patient.patient_id}`)}
              className="bg-gaza-green hover:bg-green-600 text-white"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء سجل طبي جديد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end space-x-3 space-x-reverse">
        <Button
          onClick={() => navigate(`/admin/medical-records/create?patient_id=${patient.patient_id}`)}
          className="px-8 py-2 min-w-[180px] bg-gaza-green hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <FileText className="w-4 h-4 ml-2" />
          إنشاء سجل طبي جديد
        </Button>
        <Button
          onClick={handleBack}
          variant="outline"
          className="px-6 py-2"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للمرضى
        </Button>
      </div>
    </div>
  );
};
