import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import {
  getPatientsAsync,
  getPatientAsync,
  createPatientAsync,
  updatePatientAsync,
  deletePatientAsync,
  setFilters,
  clearFilters
} from '../../store/slices/patientSlice';
import { useRoleAccess } from '../../hooks/useRoleAccess';

import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { EnhancedDataTable } from '../../components/ui/enhanced-data-table';
import { Plus, User, Edit, Eye, Search, Hash, FileText } from 'lucide-react';
import { Patient, StaticData, MedicalRecord, RecordTransfer } from '../../types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from '../../hooks/use-toast';


// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, ' - ');
};

const getGenderBadge = (genderCode: string) => {
  const genderConfig: Record<string, { color: string; label: string }> = {
    'male': { color: 'bg-blue-100 text-blue-800', label: 'ذكر' },
    'female': { color: 'bg-pink-100 text-pink-800', label: 'أنثى' },
  };

  const config = genderConfig[genderCode] || { color: 'bg-gray-100 text-gray-800', label: 'غير محدد' };

  return (
    <Badge className={`${config.color} text-xs px-2 py-1`}>
      <User className="w-3 h-3 ml-1" />
      {config.label}
    </Badge>
  );
};

// Stats component
const StatsCards: React.FC<{ summary: { total: number; male: number; female: number } }> = ({ summary }) => {
  const statItems = [
    { label: 'إجمالي المرضى', value: summary.total, color: 'text-primary' },
    { label: 'ذكر', value: summary.male, color: 'text-blue-500' },
    { label: 'أنثى', value: summary.female, color: 'text-pink-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    full_name: string;
    national_id: number;
    gender_code: string;
  };
  onSubmit: (data: { full_name: string; national_id: number; gender_code: string }) => void;
  isLoading: boolean;
  editingPatient?: Patient | null;
}

const PatientFormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  formData,
  onSubmit,
  isLoading,
  editingPatient
}) => {
  const { staticData } = useSelector((state: RootState) => state.staticData);
  const [form, setForm] = useState(formData);

  // Get genders for form dropdown
  const genders = staticData?.gender || [];

  // Update form when editingPatient changes
  React.useEffect(() => {
    if (editingPatient) {
      setForm({
        full_name: editingPatient.full_name,
        national_id: editingPatient.national_id,
        gender_code: editingPatient.gender_code
      });
    }
  }, [editingPatient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleCancel = () => {
    if (editingPatient) {
      // Reset form to original patient data
      setForm({
        full_name: editingPatient.full_name,
        national_id: editingPatient.national_id,
        gender_code: editingPatient.gender_code
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {editingPatient && (
            <DialogDescription>
              تعديل بيانات المريض: {editingPatient.full_name} (رقم الهوية: {editingPatient.national_id})
            </DialogDescription>
          )}
        </DialogHeader>

        {editingPatient && (
          <div className="p-4 bg-muted rounded-lg mb-4">
            <h4 className="font-medium mb-2">البيانات الحالية:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">الاسم:</span>
                <span className="font-medium mr-2">{editingPatient.full_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">رقم الهوية:</span>
                <span className="font-medium mr-2">{editingPatient.national_id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">الجنس:</span>
                <span className="font-medium mr-2">
                  {editingPatient.gender?.label_ar || editingPatient.gender_code}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                <span className="font-medium mr-2">{formatDate(editingPatient.created_at)}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">الاسم الكامل</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="أدخل الاسم الكامل للمريض"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="national_id">رقم الهوية</Label>
            <Input
              id="national_id"
              type="number"
              value={form.national_id}
              onChange={(e) => setForm({ ...form, national_id: parseInt(e.target.value) || 0 })}
              placeholder="أدخل رقم الهوية"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender_code">الجنس</Label>
            <Select value={form.gender_code} onValueChange={(value) => setForm({ ...form, gender_code: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الجنس" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender: StaticData) => (
                  <SelectItem key={gender.code} value={gender.code}>
                    {gender.label_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري الحفظ...' : editingPatient ? 'تحديث البيانات' : 'حفظ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Patient Details Modal Component
interface PatientDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  isOpen,
  onOpenChange,
  patient
}) => {
  if (!patient) return null;

  // Get records and transfers from the patient data
  const patientRecords = patient.medical_records || [];
  const patientTransfers = patientRecords.flatMap(record => record.transfers || []);

  // Filter state
  const [filterProblemType, setFilterProblemType] = useState<string>('all');
  const [filterHealthCenter, setFilterHealthCenter] = useState<string>('all');

  // Filter records based on selected filters
  const filteredRecords = patientRecords.filter(record => {
    const matchesProblemType = filterProblemType === 'all' ||
      (record.problem_type?.code === filterProblemType || record.problem_type_code === filterProblemType);
    const matchesHealthCenter = filterHealthCenter === 'all' ||
      (record.health_center?.code === filterHealthCenter || record.health_center_code === filterHealthCenter);

    return matchesProblemType && matchesHealthCenter;
  });

  // Get unique problem types and health center types for filter options
  const uniqueProblemTypes = Array.from(new Set(
    patientRecords.map(record => record.problem_type?.code || record.problem_type_code).filter(Boolean)
  ));
  const uniqueHealthCenters = Array.from(new Set(
    patientRecords.map(record => record.health_center?.code || record.health_center_code).filter(Boolean)
  ));



  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto "
      >
        <DialogHeader>
          <DialogTitle>تفاصيل المريض: {patient.full_name}</DialogTitle>
          <DialogDescription>
            عرض جميع السجلات الطبية والتحويلات للمريض
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{patientRecords.length}</div>
              <div className="text-sm text-muted-foreground">السجلات الطبية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{patientTransfers.length}</div>
              <div className="text-sm text-muted-foreground">إجمالي التحويلات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{patient.patient_id}</div>
              <div className="text-sm text-muted-foreground">معرف المريض</div>
            </div>
          </div>
          {/* Medical Records Summary */}
          {patientRecords.length > 0 && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">نوع المشكلة</h4>
                <div className="text-sm">
                  {(() => {
                    const firstRecord = patientRecords[0];
                    const problemType = firstRecord.problem_type?.label_ar ||
                      firstRecord.problem_type_code ||
                      'غير محدد';
                    return (
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          {problemType}
                        </Badge>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">مركز الرعاية الصحية</h4>
                <div className="text-sm">
                  {(() => {
                    const firstRecord = patientRecords[0];
                    const healthCenter = firstRecord.health_center?.label_ar ||
                      firstRecord.health_center_code ||
                      'غير محدد';
                    return (
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          {healthCenter}
                        </Badge>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">معلومات المريض</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">الاسم الكامل</Label>
                <p className="text-lg font-semibold">{patient.full_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">رقم الهوية</Label>
                <p className="text-lg">{patient.national_id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">الجنس</Label>
                <div className="mt-1">
                  {patient.gender ? (
                    <div className="space-y-1">
                      <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                        {patient.gender.label_ar}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{patient.gender.description}</p>
                    </div>
                  ) : (
                    getGenderBadge(patient.gender_code)
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</Label>
                <p className="text-lg">{formatDate(patient.created_at)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">آخر تحديث</Label>
                <p className="text-lg">{formatDate(patient.updated_at)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">معرف المريض</Label>
                <p className="text-lg font-mono">#{patient.patient_id}</p>
              </div>
            </div>
          </div>

          {/* Medical Records */}
          <div className="space-y-3">


            {patientRecords.length > 0 ? (
              <div className="space-y-4">
                {patientRecords.map((record) => (
                  <Card key={record.record_id} className="p-4">
                    <div className="space-y-3">
                      {/* Record Header */}
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="space-y-1">
                          <h4 className="text-lg font-semibold text-primary">
                            السجل الطبي #{record.record_id}
                          </h4>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm">
                            {record.health_center && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                                {record.health_center.label_ar}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {record.status && (
                            <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                              {record.status.label_ar}
                            </Badge>
                          )}

                        </div>
                      </div>

                      {/* Record Details */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">معرف المريض</Label>
                          <p className="font-semibold">#{record.patient_id}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">مركز الرعاية الصحية</Label>
                          <div className="mt-1">
                            {record.health_center ? (
                              <div className="space-y-1">
                                <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                                  {record.health_center.label_ar}
                                </Badge>
                              </div>
                            ) : (
                              <p className="font-semibold">{record.health_center_code}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">نوع المشكلة</Label>
                          <div className="mt-1">
                            {record.problem_type ? (
                              <div className="space-y-1">
                                <Badge className="bg-purple-100 text-purple-800 text-xs px-2 py-1">
                                  {record.problem_type.label_ar}
                                </Badge>
                              </div>
                            ) : (
                              <p className="font-semibold">{record.problem_type_code || 'غير محدد'}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">حالة السجل</Label>
                          <div className="mt-1">
                            {record.status ? (
                              <div className="space-y-1">
                                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                                  {record.status.label_ar}
                                </Badge>
                              </div>
                            ) : (
                              <p className="font-semibold">{record.status_code}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">أنشئ بواسطة</Label>
                          <p className="font-semibold">
                            {record.creator ? (
                              <span className="flex items-center space-x-2 space-x-reverse">
                                <span>{record.creator.full_name}</span>
                             
                              </span>
                            ) : (
                              `#${record.created_by}`
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">آخر تعديل بواسطة</Label>
                          <p className="font-semibold">
                            {record.last_modifier ? (
                              <span>{record.last_modifier.full_name}</span>
                            ) : (
                              `#${record.last_modified_by}`
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</Label>
                          <p>{formatDate(record.created_at)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">آخر تحديث</Label>
                          <p>{formatDate(record.updated_at)}</p>
                        </div>
                      </div>

                      {/* Transfers for this record */}
                      {record.transfers && record.transfers.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h5 className="font-medium text-sm text-muted-foreground border-t pt-2">
                            التحويلات المرتبطة ({record.transfers.length})
                          </h5>
                          <div className="space-y-2">
                            {record.transfers.map((transfer) => (
                              <div key={transfer.transfer_id} className="bg-muted p-3 rounded-lg">
                                <div className="space-y-3">
                                  {/* Transfer Header */}
                                  <div className="flex items-center justify-between border-b pb-2">
                                    <h6 className="font-medium text-sm">التحويل #{transfer.transfer_id}</h6>
                                    <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                                      {formatDate(transfer.created_at)}
                                    </Badge>
                                  </div>

                                  {/* Transfer Details */}
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">المرسل:</span>
                                      <div className="mt-1">
                                        {transfer.sender ? (
                                          <div className="space-y-1">
                                            <p className="font-medium">{transfer.sender.full_name}</p>
                                            <div className="flex items-center space-x-2 space-x-reverse">


                                            </div>
                                          </div>
                                        ) : (
                                          <span className="font-medium">#{transfer.sender_id}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">المستلم:</span>
                                      <div className="mt-1">
                                        {transfer.recipient ? (
                                          <div className="space-y-1">
                                            <p className="font-medium">{transfer.recipient.full_name}</p>
                                            <div className="flex items-center space-x-2 space-x-reverse">

                                            </div>
                                          </div>
                                        ) : (
                                          <span className="font-medium">#{transfer.recipient_id}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">ملاحظات:</span>
                                      <p className="font-medium mt-1 text-sm bg-white p-2 rounded border">
                                        {transfer.transfer_notes || 'لا توجد ملاحظات'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد سجلات طبية لهذا المريض</p>
              </div>
            )}
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main component
export const PatientsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients, loading, pagination, filters } = useSelector((state: RootState) => state.patients);
  const { staticData } = useSelector((state: RootState) => state.staticData);
  const { isAdmin } = useRoleAccess();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: 0,
    gender_code: ''
  });

  useEffect(() => {
    dispatch(getPatientsAsync({ page: 1, perPage: 15 }));
  }, [dispatch]);

  // Get genders for filter dropdown
  const genders = staticData?.gender || [];

  const handleCreatePatient = async (data: { full_name: string; national_id: number; gender_code: string }) => {
    try {
      await dispatch(createPatientAsync(data)).unwrap();
      setIsFormOpen(false);
      setFormData({ full_name: '', national_id: 0, gender_code: '' });
      toast({
        title: "تم إنشاء المريض بنجاح",
        description: "تم إضافة المريض الجديد إلى النظام",
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء المريض",
        description: "حدث خطأ أثناء إنشاء المريض",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePatient = async (data: { full_name: string; national_id: number; gender_code: string }) => {
    if (!editingPatient) return;

    try {
      await dispatch(updatePatientAsync({ id: editingPatient.patient_id, patientData: data })).unwrap();
      setIsFormOpen(false);
      setEditingPatient(null);
      setFormData({ full_name: '', national_id: 0, gender_code: '' });
      toast({
        title: "تم تحديث المريض بنجاح",
        description: "تم تحديث بيانات المريض",
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث المريض",
        description: "حدث خطأ أثناء تحديث المريض",
        variant: "destructive",
      });
    }
  };

  const handleViewPatient = async (patient: Patient) => {
    try {
      // Fetch detailed patient data by ID
      const result = await dispatch(getPatientAsync(patient.patient_id)).unwrap();
      if (result.data) {
        setSelectedPatient(result.data);
        setIsDetailsModalOpen(true);
      }
    } catch (error) {
      toast({
        title: "خطأ في جلب بيانات المريض",
        description: "حدث خطأ أثناء جلب تفاصيل المريض",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: 'full_name',
      label: 'الاسم الكامل',
      render: (value: any, record: Patient) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{record.full_name}</span>
        </div>
      ),
    },
    {
      key: 'national_id',
      label: 'رقم الهوية',
      render: (value: any, record: Patient) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Hash className="w-4 h-4 text-muted-foreground" />
          <span>{record.national_id}</span>
        </div>
      ),
    },
    {
      key: 'gender_code',
      label: 'الجنس',
      render: (value: any, record: Patient) => getGenderBadge(record.gender_code),
    },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      render: (value: any, record: Patient) => formatDate(record.created_at),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (value: any, record: Patient) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          {/* View button - Only visible to admins */}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewPatient(record)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="عرض التفاصيل"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingPatient(record);
              setFormData({
                full_name: record.full_name,
                national_id: record.national_id,
                gender_code: record.gender_code
              });
              setIsFormOpen(true);
            }}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
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
          <h1 className="text-3xl font-bold tracking-tight">إدارة المرضى</h1>
          <p className="text-muted-foreground">
            إدارة بيانات المرضى في النظام
          </p>
        </div>
        <Button onClick={() => {
          setEditingPatient(null);
          setFormData({ full_name: '', national_id: 0, gender_code: '' });
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة مريض جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards summary={{
        total: pagination.total,
        male: patients.filter(p => p.gender_code === 'male').length,
        female: patients.filter(p => p.gender_code === 'female').length
      }} />

    

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <EnhancedDataTable
            data={patients}
            columns={columns}
            loading={loading}
            pagination={{
              current_page: pagination.currentPage,
              last_page: pagination.lastPage,
              per_page: pagination.perPage,
              total: pagination.total
            }}
            onPageChange={(page) => dispatch(getPatientsAsync({ page, perPage: pagination.perPage }))}
            onFilter={(filters) => {
              // Handle search and filters
              const searchTerm = filters.search as string || '';
              const genderCode = filters.gender_code as string || '';
              
              if (searchTerm || genderCode) {
                dispatch(getPatientsAsync({ 
                  page: 1, 
                  perPage: pagination.perPage,
                  search: searchTerm,
                  genderCode: genderCode
                }));
              } else {
                dispatch(getPatientsAsync({ page: 1, perPage: pagination.perPage }));
              }
            }}
            onClearFilters={() => {
              dispatch(getPatientsAsync({ page: 1, perPage: pagination.perPage }));
            }}
            filterOptions={[
              {
                key: 'gender_code',
                label: 'الجنس',
                type: 'select',
                options: [
                  { value: 'all', label: 'الكل' },
                  ...genders.map(gender => ({
                    value: gender.code,
                    label: gender.label_ar
                  }))
                ]
              }
            ]}
            showSearch={true}
            searchPlaceholder="البحث بالاسم أو رقم الهوية..."
            searchableColumns={['full_name', 'national_id']}
          />
        </CardContent>
      </Card>

      {/* Form Dialogs */}
      <PatientFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingPatient ? 'تعديل المريض' : 'إضافة مريض جديد'}
        formData={formData}
        onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}
        isLoading={loading}
        editingPatient={editingPatient}
      />

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        patient={selectedPatient}
      />
    </div>
  );
};
