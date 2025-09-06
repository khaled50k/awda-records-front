import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { createMedicalRecordAsync, clearFieldErrors } from '../../store/slices/medicalRecordSlice';
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
import { ArrowLeft, Save, User, Hash, Building2, AlertTriangle, FileText, Send, X, Users } from 'lucide-react';
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

// Multi-select recipient input component
interface MultiSelectRecipientInputProps {
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
  users: UserType[];
  disabled?: boolean;
}

const MultiSelectRecipientInput: React.FC<MultiSelectRecipientInputProps> = ({
  value,
  onChange,
  placeholder = "البحث عن المستلمين...",
  users,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useAppDispatch();

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

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
    !value.includes(user.user_id) && (
      user.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  );

  const selectedUsers = users.filter(user => value.includes(user.user_id));

  const handleUserSelect = (user: UserType) => {
    if (!value.includes(user.user_id)) {
      onChange([...value, user.user_id]);
    }
    setSearchTerm('');
    setShowResults(false);
  };

  const handleUserRemove = (userId: number) => {
    onChange(value.filter(id => id !== userId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
  };

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="space-y-3">
      {/* Selected Recipients */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge
              key={user.user_id}
              variant="secondary"
              className="flex items-center space-x-2 space-x-reverse px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
            >
              <User className="w-3 h-3" />
              <span>{user.full_name}</span>
              <button
                type="button"
                onClick={() => handleUserRemove(user.user_id)}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
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
            {!isSearching && filteredUsers.length === 0 && searchTerm && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4">
                <div className="text-center text-sm text-muted-foreground">
                  لا توجد نتائج للبحث
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>تم اختيار {selectedUsers.length} مستلم</span>
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
  const { fieldErrors } = useSelector((state: RootState) => state.medicalRecords);
  const { isAdmin } = useRoleAccess();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateMedicalRecordRequest>({
    patient_id: 0,
    problem_type_code: '',
    danger_level_code: '',
    reviewed_party: '',
    status_code: '',
    recipient_ids: [],
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
    
    // Clear any previous field errors
    dispatch(clearFieldErrors());
    
    // Form validation - all required fields
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

    if (!formData.reviewed_party.trim()) {
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
                {fieldErrors.patient_id && (
                  <div className="text-red-500 text-sm mt-1">
                    {fieldErrors.patient_id.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
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

                                            {/* Recipients Selection - Only for Admin */}
                 {isAdmin && (
              <div className="space-y-3">
                <Label htmlFor="recipient_ids" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                     المستلمون (اختياري)
                </Label>
                <MultiSelectRecipientInput
                  value={formData.recipient_ids || []}
                     onChange={(value) => setFormData({ ...formData, recipient_ids: value })}
                  placeholder="البحث عن المستلمين..."
                  users={users}
                  disabled={false}
                />
                {fieldErrors.recipient_ids && (
                  <div className="text-red-500 text-sm mt-1">
                    {fieldErrors.recipient_ids.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse">
                  <Users className="w-4 h-4" />
                     <span>اختر المستلمين الذين سيتم إرسال السجل إليهم (اختياري للمدير)</span>
                </p>
              </div>
               )}
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
                    <SelectTrigger className={cn("h-12", fieldErrors.problem_type_code ? "border-red-500" : "")}>
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
                  {fieldErrors.problem_type_code && (
                    <div className="text-red-500 text-sm mt-1">
                      {fieldErrors.problem_type_code.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}
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
                    <SelectTrigger className={cn("h-12", fieldErrors.status_code ? "border-red-500" : "")}>
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
                  {fieldErrors.status_code && (
                    <div className="text-red-500 text-sm mt-1">
                      {fieldErrors.status_code.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Level and Reviewed Party */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Danger Level */}
                <div className="space-y-3">
                  <Label htmlFor="danger_level_code" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    مستوى الخطر <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <Select
                    value={formData.danger_level_code}
                    onValueChange={(value) => setFormData({ ...formData, danger_level_code: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={cn("h-12", fieldErrors.danger_level_code ? "border-red-500" : "")}>
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
                  {fieldErrors.danger_level_code && (
                    <div className="text-red-500 text-sm mt-1">
                      {fieldErrors.danger_level_code.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviewed Party */}
                <div className="space-y-3">
                  <Label htmlFor="reviewed_party" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    المُدقق عليه <span className="text-red-500 text-lg">*</span>
                  </Label>
                  <Input
                    id="reviewed_party"
                    value={formData.reviewed_party}
                    onChange={(e) => setFormData({ ...formData, reviewed_party: e.target.value })}
                    placeholder="أدخل المُدقق عليه..."
                    disabled={isLoading}
                    className={cn("h-12", fieldErrors.reviewed_party ? "border-red-500" : "")}
                  />
                  {fieldErrors.reviewed_party && (
                    <div className="text-red-500 text-sm mt-1">
                      {fieldErrors.reviewed_party.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse">
                    <User className="w-4 h-4" />
                    <span>أدخل اسم المُدقق عليه (مطلوب)</span>
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
                   className={cn("resize-none text-base", fieldErrors.transfer_notes ? "border-red-500" : "")}
                 />
                 {fieldErrors.transfer_notes && (
                   <div className="text-red-500 text-sm mt-1">
                     {fieldErrors.transfer_notes.map((error, index) => (
                       <div key={index}>{error}</div>
                     ))}
                   </div>
                 )}
           
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
