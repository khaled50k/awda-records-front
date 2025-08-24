import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { 
  getMedicalRecordAsync, 
  updateMedicalRecordAsync, 
  clearFieldErrors 
} from '../../store/slices/medicalRecordSlice';
import { getPatientsAsync } from '../../store/slices/patientSlice';
import { getUsersAsync } from '../../store/slices/userSlice';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Save, User, Hash, Building2, AlertTriangle, FileText, Send, Edit, Clock, CheckCircle } from 'lucide-react';
import { MedicalRecord, Patient, User as UserType, StaticData, UpdateMedicalRecordRequest } from '../../types/api';
import { toast } from '../../hooks/use-toast';
import { useDebounce } from 'use-debounce';
import { cn } from '../../lib/utils';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

// Searchable patient input component
interface SearchablePatientInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  patients: Patient[];
  disabled?: boolean;
}

const SearchablePatientInput: React.FC<SearchablePatientInputProps> = ({
  value,
  onChange,
  placeholder = "البحث بالاسم أو رقم الهوية...",
  patients,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(value);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useAppDispatch();

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  useEffect(() => {
    setSelectedPatientId(value);
    if (value) {
      const patient = patients.find(p => p.patient_id === value);
      if (patient) {
        setSearchTerm(patient.full_name);
      }
    }
  }, [value, patients]);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
      setIsSearching(true);
      dispatch(getPatientsAsync({ 
        page: 1, 
        perPage: 50, 
        search: debouncedSearchTerm 
      })).finally(() => {
        setIsSearching(false);
      });
    } else {
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, dispatch]);

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    patient.national_id.toString().includes(debouncedSearchTerm)
  );

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatientId(patient.patient_id);
    onChange(patient.patient_id);
    setSearchTerm(patient.full_name);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (selectedPatientId && newValue !== patients.find(p => p.patient_id === selectedPatientId)?.full_name) {
      setSelectedPatientId(null);
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && !selectedPatientId) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="pr-10"
        disabled={disabled}
      />
      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isSearching ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              جاري البحث...
            </div>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div
                key={patient.patient_id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{patient.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      <Hash className="w-3 h-3 inline ml-1" />
                      {patient.national_id}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-muted-foreground">
              لا توجد نتائج
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Searchable recipient input component
interface SearchableRecipientInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  users: UserType[];
  disabled?: boolean;
}

const SearchableRecipientInput: React.FC<SearchableRecipientInputProps> = ({
  value,
  onChange,
  placeholder = "البحث بالاسم أو اسم المستخدم...",
  users,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(value);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useAppDispatch();

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  useEffect(() => {
    setSelectedUserId(value);
    if (value) {
      const user = users.find(u => u.user_id === value);
      if (user) {
        setSearchTerm(user.full_name);
      }
    }
  }, [value, users]);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
      setIsSearching(true);
      dispatch(getUsersAsync({ 
        page: 1, 
        perPage: 50, 
        search: debouncedSearchTerm 
      })).finally(() => {
        setIsSearching(false);
      });
    } else {
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, dispatch]);

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(debouncedSearchTerm)
  );

  const handleUserSelect = (user: UserType) => {
    setSelectedUserId(user.user_id);
    onChange(user.user_id);
    setSearchTerm(user.full_name);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (selectedUserId && newValue !== users.find(u => u.user_id === selectedUserId)?.full_name) {
      setSelectedUserId(null);
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && !selectedUserId) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="pr-10"
        disabled={disabled}
      />
      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isSearching ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              جاري البحث...
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.user_id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-muted-foreground">
              لا توجد نتائج
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main component
export const EditMedicalRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();
  const dispatch = useAppDispatch();
  const { isAdmin } = useRoleAccess();
  
  const { currentRecord, loading } = useSelector((state: RootState) => state.medicalRecords);
  const { patients, loading: patientsLoading } = useSelector((state: RootState) => state.patients);
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.users);
  const { staticData } = useSelector((state: RootState) => state.staticData);
  
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateMedicalRecordRequest>({
    patient_id: undefined,
    recipient_id: undefined,
    problem_type_code: '',
    danger_level_code: '',
    reviewed_party: '',
    status_code: '',
    transfer_status_code: null,
    transfer_notes: ''
  });

  useEffect(() => {
    if (recordId) {
      dispatch(getMedicalRecordAsync(parseInt(recordId)));
    }
  }, [recordId, dispatch]);

  useEffect(() => {
    if (currentRecord) {
      setRecord(currentRecord);
      // Initialize form data with current record values
      setFormData({
        patient_id: currentRecord.patient_id,
        recipient_id: currentRecord.transfers && currentRecord.transfers.length > 0 
          ? currentRecord.transfers[currentRecord.transfers.length - 1].recipient_id 
          : undefined,
        problem_type_code: currentRecord.problem_type_code,
        danger_level_code: currentRecord.danger_level_code || '',
        reviewed_party: currentRecord.reviewed_party || '',
        status_code: currentRecord.status_code,
        transfer_status_code: currentRecord.transfers && currentRecord.transfers.length > 0 
          ? currentRecord.transfers[currentRecord.transfers.length - 1].status_code 
          : null,
        transfer_notes: currentRecord.transfers && currentRecord.transfers.length > 0 
          ? currentRecord.transfers[currentRecord.transfers.length - 1].transfer_notes || ''
          : ''
      });
    }
  }, [currentRecord]);

  useEffect(() => {
    // Load initial data
    dispatch(getPatientsAsync({ page: 1, perPage: 100 }));
    dispatch(getUsersAsync({ page: 1, perPage: 100 }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(clearFieldErrors());
    
    // Form validation
    if (!formData.patient_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار المريض",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.problem_type_code) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار نوع المشكلة",
        variant: "destructive",
      });
      return;
    }

    if (!formData.danger_level_code) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار مستوى الخطر",
        variant: "destructive",
      });
      return;
    }

    if (!formData.reviewed_party?.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال المُدقق عليه",
        variant: "destructive",
      });
      return;
    }

    if (!formData.status_code) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار الحالة",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await dispatch(updateMedicalRecordAsync({ 
        id: parseInt(recordId!), 
        recordData: formData 
      })).unwrap();
      
      toast({
        title: "تم تحديث السجل الطبي بنجاح",
        description: "تم تحديث بيانات السجل الطبي",
      });
      
      navigate('/admin/medical-records');
      
    } catch (error) {
      toast({
        title: "خطأ في تحديث السجل الطبي",
        description: "حدث خطأ أثناء تحديث السجل الطبي",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/medical-records');
  };

  if (loading || patientsLoading || usersLoading) {
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
          <Button onClick={handleCancel} variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للسجلات الطبية
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = patientsLoading || usersLoading;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تعديل السجل الطبي</h1>
          <p className="text-muted-foreground">
            تعديل بيانات السجل الطبي: {record.patient?.full_name}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للسجلات الطبية
        </Button>
      </div>

      {/* Current Record Info */}
      <Card className="mb-6 shadow-sm border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 space-x-reverse mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">معلومات السجل الحالي</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">رقم السجل:</span>
              <span className="mr-2 font-bold">#{record.record_id}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">الحالة:</span>
              <Badge className="mr-2 bg-blue-100 text-blue-800">
                {record.status?.label_ar || 'غير محدد'}
              </Badge>
            </div>
            <div>
              <span className="text-blue-600 font-medium">نوع المشكلة:</span>
              <Badge className="mr-2 bg-purple-100 text-purple-800">
                {record.problem_type?.label_ar || 'غير محدد'}
              </Badge>
            </div>
            <div>
              <span className="text-blue-600 font-medium">مستوى الخطر:</span>
              <Badge className="mr-2 bg-orange-100 text-orange-800">
                {record.danger_level?.label_ar || 'غير محدد'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <div>
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-xl">
              <Edit className="w-6 h-6 text-gaza-green" />
              <span>تعديل بيانات السجل الطبي</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">معلومات المريض</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_id">المريض</Label>
                    <SearchablePatientInput
                      value={formData.patient_id || null}
                      onChange={(value) => setFormData({ ...formData, patient_id: value || undefined })}
                      placeholder="البحث بالاسم أو رقم الهوية..."
                      patients={patients}
                      disabled={!isAdmin} // Only admins can change patient
                    />
                    {record.patient && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>المريض الحالي: {record.patient.full_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="health_center">مركز الصحي</Label>
                    <div className="p-3 bg-gray-50 rounded border">
                      <span className="font-medium">
                        {record.patient?.health_center?.label_ar || record.patient?.health_center_code || 'غير محدد'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Record Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">تفاصيل السجل</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="problem_type_code">نوع المشكلة</Label>
                    <Select 
                      value={formData.problem_type_code} 
                      onValueChange={(value) => setFormData({ ...formData, problem_type_code: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المشكلة" />
                      </SelectTrigger>
                      <SelectContent>
                        {staticData?.problem_type?.map((problemType) => (
                          <SelectItem key={problemType.code} value={problemType.code}>
                            {problemType.label_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="danger_level_code">مستوى الخطر</Label>
                    <Select 
                      value={formData.danger_level_code} 
                      onValueChange={(value) => setFormData({ ...formData, danger_level_code: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مستوى الخطر" />
                      </SelectTrigger>
                      <SelectContent>
                        {staticData?.danger_level?.map((dangerLevel) => (
                          <SelectItem key={dangerLevel.code} value={dangerLevel.code}>
                            {dangerLevel.label_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status_code">حالة السجل</Label>
                    <Select 
                      value={formData.status_code} 
                      onValueChange={(value) => setFormData({ ...formData, status_code: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {staticData?.status?.map((status) => (
                          <SelectItem key={status.code} value={status.code}>
                            {status.label_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewed_party">المُدقق عليه</Label>
                    <Input
                      id="reviewed_party"
                      value={formData.reviewed_party || ''}
                      onChange={(e) => setFormData({ ...formData, reviewed_party: e.target.value })}
                      placeholder="أدخل اسم المُدقق عليه"
                    />
                  </div>
                </div>
              </div>

              {/* Transfer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">معلومات التحويل</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient_id">المستلم</Label>
                    <SearchableRecipientInput
                      value={formData.recipient_id || null}
                      onChange={(value) => setFormData({ ...formData, recipient_id: value })}
                      placeholder="البحث بالاسم أو اسم المستخدم..."
                      users={users}
                    />
                    {record.transfers && record.transfers.length > 0 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>المستلم الحالي: {record.transfers[record.transfers.length - 1].recipient?.full_name || 'غير محدد'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transfer_status_code">حالة التحويل</Label>
                    <Select 
                      value={formData.transfer_status_code || ''} 
                      onValueChange={(value) => setFormData({ ...formData, transfer_status_code: value || null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة التحويل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">بدون حالة</SelectItem>
                        {staticData?.status?.map((status) => (
                          <SelectItem key={status.code} value={status.code}>
                            {status.label_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer_notes">ملاحظات التحويل</Label>
                  <Textarea
                    id="transfer_notes"
                    value={formData.transfer_notes || ''}
                    onChange={(e) => setFormData({ ...formData, transfer_notes: e.target.value })}
                    placeholder="ملاحظات إضافية حول التحويل..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-2 space-x-reverse pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="ml-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
