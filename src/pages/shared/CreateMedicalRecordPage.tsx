import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { createMedicalRecordAsync } from '../../store/slices/medicalRecordSlice';
import { getPatientsAsync } from '../../store/slices/patientSlice';
import { getUsersAsync } from '../../store/slices/userSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Save, User, Hash, Building2, AlertTriangle, FileText, Send } from 'lucide-react';
import { Patient, User as UserType, StaticData, CreateMedicalRecordRequest } from '../../types/api';
import { toast } from '../../hooks/use-toast';
import { useDebounce } from 'use-debounce';
import { cn } from '../../lib/utils';

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
    // If we have a value, find the patient and set the search term
    if (value) {
      const patient = patients.find(p => p.patient_id === value);
      if (patient) {
        setSearchTerm(patient.full_name);
      }
    }
  }, [value, patients]);

  // Search patients when user types
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

  // Auto-search when patient is created and we have national ID
  useEffect(() => {
    if (value && patients.length === 0) {
      // If we have a patient ID but no patients in the list, search for the patient
      const patient = patients.find(p => p.patient_id === value);
      if (!patient) {
        // Search for the patient by ID
        dispatch(getPatientsAsync({ 
          page: 1, 
          perPage: 50, 
          search: value.toString()
        }));
      }
    }
  }, [value, patients, dispatch]);

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    patient.national_id.toString().includes(debouncedSearchTerm)
  );

  const selectedPatient = patients.find(p => p.patient_id === selectedPatientId);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatientId(patient.patient_id);
    onChange(patient.patient_id);
    setSearchTerm(patient.full_name);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
    if (!e.target.value) {
      setSelectedPatientId(null);
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="relative">
      <Input
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      
      {showResults && (
        <>
          {isSearching && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4">
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-muted-foreground">جاري البحث...</span>
              </div>
            </div>
          )}
          {!isSearching && filteredPatients.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.patient_id}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{patient.full_name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Hash className="w-3 h-3 ml-1" />
                        {patient.national_id}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                      <span>{patient.health_center?.label_ar || patient.health_center_code || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {selectedPatient && (
        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                تم اختيار: {selectedPatient.full_name} - {selectedPatient.national_id}
              </span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-green-700 dark:text-green-300">
              <Building2 className="w-3 h-3" />
              <span>{selectedPatient.health_center?.label_ar || selectedPatient.health_center_code || 'غير محدد'}</span>
            </div>
          </div>
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
  placeholder = "البحث عن المستلم...",
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
    // If we have a value, find the user and set the search term
    if (value) {
      const user = users.find(u => u.user_id === value);
      if (user) {
        setSearchTerm(user.full_name);
      }
    }
  }, [value, users]);

  // Search users when user types
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
    user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const selectedUser = users.find(u => u.user_id === selectedUserId);

  const handleUserSelect = (user: UserType) => {
    setSelectedUserId(user.user_id);
    onChange(user.user_id);
    setSearchTerm(user.full_name);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
    if (!e.target.value) {
      setSelectedUserId(null);
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="relative">
      <Input
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      
      {showResults && (
        <>
          {isSearching && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4">
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-muted-foreground">جاري البحث...</span>
              </div>
            </div>
          )}
          {!isSearching && filteredUsers.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{user.full_name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.username}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {selectedUser && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center space-x-2 space-x-reverse">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              تم اختيار: {selectedUser.full_name} ({selectedUser.username})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
export const CreateMedicalRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { patients, loading: patientsLoading } = useSelector((state: RootState) => state.patients);
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.users);
  const { staticData } = useSelector((state: RootState) => state.staticData);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateMedicalRecordRequest>({
    patient_id: 0,
    recipient_id: 0,
    problem_type_code: '',
    danger_level_code: '',
    reviewed_party_user_id: 0,
    status_code: '',
    transfer_notes: ''
  });

  // Get options from static data
  const statusOptions = staticData?.status || [];
  const problemTypeOptions = staticData?.problem_type || [];
  const dangerLevelOptions = staticData?.danger_level || [];
  const userOptions = users || [];

  useEffect(() => {
    // Don't fetch on page load - only fetch when user starts searching
  }, [dispatch]);

  // Handle navigation state when returning from CreatePatientPage
  useEffect(() => {
    if (location.state?.createdPatient) {
      const createdPatient = location.state.createdPatient;
      const nationalId = location.state.nationalId;
      
      // Set the created patient as selected
      setFormData(prev => ({
        ...prev,
        patient_id: createdPatient.patient_id
      }));
      
      // Show success message
      if (location.state.message) {
        toast({
          title: "تم إنشاء المريض بنجاح",
          description: location.state.message,
        });
      }
      
      // Clear the navigation state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Show success message if patient was just created
  const [showPatientCreatedMessage, setShowPatientCreatedMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation - all fields are required
    if (!formData.patient_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار المريض",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.recipient_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار المستلم",
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

    if (!formData.status_code) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار الحالة",
        variant: "destructive",
      });
      return;
    }

    if (!formData.transfer_notes.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال ملاحظات التحويل",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await dispatch(createMedicalRecordAsync(formData)).unwrap();
      
      toast({
        title: "تم إنشاء السجل الطبي بنجاح",
        description: "تم إضافة السجل الطبي الجديد إلى النظام",
      });
      
      // Navigate back to medical records list
      navigate('/admin/medical-records');
      
    } catch (error) {
      toast({
        title: "خطأ في إنشاء السجل الطبي",
        description: "حدث خطأ أثناء إنشاء السجل الطبي",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/medical-records');
  };

  const isLoading = patientsLoading || usersLoading;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Content */}
      {/* Form Section */}
      <div>
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-xl">
              <FileText className="w-6 h-6 text-gaza-green" />
              <span>إنشاء سجل طبي</span>
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              أدخل المعلومات المطلوبة لإنشاء السجل الطبي الجديد
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Patient Selection */}
              <div className="space-y-3">
                <Label htmlFor="patient_id" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  المريض <span className="text-red-500 text-lg">*</span>
                </Label>
                <SearchablePatientInput
                  value={formData.patient_id || null}
                  onChange={(value) => setFormData({ ...formData, patient_id: value || 0 })}
                  placeholder="البحث بالاسم أو رقم الهوية..."
                  patients={patients}
                  disabled={false}
                />
                                 <p className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse">
                   <User className="w-4 h-4" />
                   <span>اختر المريض من القائمة أو ابحث بالاسم أو رقم الهوية</span>
                 </p>
                 <div className="flex items-center justify-between">
                   <p className="text-xs text-muted-foreground">
                     إذا لم يكن المريض موجوداً، 
                     <button
                       type="button"
                       onClick={() => navigate('/admin/patients/create')}
                       className="text-gaza-green hover:text-green-600 underline hover:no-underline transition-colors ml-1"
                     >
                       يمكنك إنشاؤه
                     </button>
                   </p>
                 </div>
                 
                                   {/* Show message when patient is created */}
                  {location.state?.createdPatient && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          تم إنشاء المريض بنجاح: {location.state.createdPatient.full_name} - {location.state.createdPatient.national_id}
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Recipient Selection */}
              <div className="space-y-3">
                <Label htmlFor="recipient_id" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  المستلم <span className="text-red-500 text-lg">*</span>
                </Label>
                <SearchableRecipientInput
                  value={formData.recipient_id || null}
                  onChange={(value) => setFormData({ ...formData, recipient_id: value || 0 })}
                  placeholder="البحث عن المستلم..."
                  users={users}
                  disabled={false}
                />
                <p className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4" />
                  <span>اختر المستلم الذي سيتم إرسال السجل إليه</span>
                </p>
              </div>
              </div>

              {/* Two Column Layout for Problem Type and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                {/* Problem Type */}
                <div className="space-y-3">
                  <Label htmlFor="problem_type_code" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    نوع المشكلة <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <Select
                    value={formData.problem_type_code}
                    onValueChange={(value) => setFormData({ ...formData, problem_type_code: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="اختر نوع المشكلة" />
                    </SelectTrigger>
                    <SelectContent>
                      {problemTypeOptions.map((problemType) => (
                        <SelectItem key={problemType.code} value={problemType.code}>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span>{problemType.label_ar}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <Label htmlFor="status_code" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    الحالة <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <Select
                    value={formData.status_code}
                    onValueChange={(value) => setFormData({ ...formData, status_code: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.code} value={status.code}>
                          <span>{status.label_ar}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Danger Level and Reviewed Party */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Danger Level */}
                <div className="space-y-3">
                  <Label htmlFor="danger_level_code" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    مستوى الخطر
                  </Label>
                  <Select
                    value={formData.danger_level_code || ''}
                    onValueChange={(value) => setFormData({ ...formData, danger_level_code: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="اختر مستوى الخطر" />
                    </SelectTrigger>
                    <SelectContent>
                      {dangerLevelOptions.map((dangerLevel) => (
                        <SelectItem key={dangerLevel.code} value={dangerLevel.code}>
                          <span>{dangerLevel.label_ar}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reviewed Party */}
                <div className="space-y-3">
                  <Label htmlFor="reviewed_party_user_id" className="text-base font-semibold text-gray-700 dark:text-gray-300">
المُدقق عليه                  </Label>
                  <SearchableRecipientInput
                    value={formData.reviewed_party_user_id || null}
                    onChange={(value) => setFormData({ ...formData, reviewed_party_user_id: value || 0 })}
                    placeholder="البحث عن المُدقق عليه..."
                    users={users}
                    disabled={false}
                  />
                  <p className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse">
                    <User className="w-4 h-4" />
                    <span>اختر المُدقق عليه </span>
                  </p>
                </div>
              </div>

              {/* Transfer Notes */}
              <div className="space-y-3">
                <Label htmlFor="transfer_notes" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  ملاحظات التحويل <span className="text-red-500 text-lg">*</span>
                </Label>
                <Textarea
                  id="transfer_notes"
                  value={formData.transfer_notes}
                  onChange={(e) => setFormData({ ...formData, transfer_notes: e.target.value })}
                  placeholder="أدخل ملاحظات التحويل..."
                  rows={10}
                  disabled={isLoading}
                  className="resize-none text-base"
                />
           
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 space-x-reverse pt-8 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="px-8 py-2 min-w-[140px] bg-gaza-green hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ السجل
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
