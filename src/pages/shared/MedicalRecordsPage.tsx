import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { 
  getMedicalRecordsAsync, 
  createMedicalRecordAsync,
  updateMedicalRecordAsync,
  deleteMedicalRecordAsync,
  setFilters, 
  clearFilters 
} from '../../store/slices/medicalRecordSlice';
import { getPatientsAsync } from '../../store/slices/patientSlice';
import { getUsersAsync } from '../../store/slices/userSlice';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { EnhancedDataTable } from '../../components/ui/enhanced-data-table';
import { Plus, FileText, Calendar, Edit, Eye, Search, Send, Download, User, Hash, X, ArrowRightLeft, Users, Clock } from 'lucide-react';
import { MedicalRecord, Patient, User as UserType, StaticData } from '../../types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar as CalendarIcon } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { toast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../lib/utils';


// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, ' - ');
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { color: string; label: string }> = {
    'active': { color: 'bg-green-100 text-green-800', label: 'نشط' },
    'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'في الانتظار' },
    'completed': { color: 'bg-blue-100 text-blue-800', label: 'مكتمل' },
    'archived': { color: 'bg-gray-100 text-gray-800', label: 'مؤرشف' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: 'غير محدد' };

  return (
    <Badge className={`${config.color} text-xs px-2 py-1`}>
      {config.label}
    </Badge>
  );
};

// Stats component
const StatsCards: React.FC<{ medicalRecords: MedicalRecord[] }> = ({ medicalRecords }) => {
  // Calculate counts from actual data
  const total = medicalRecords.length;
  const active = medicalRecords.filter(record => record.status_code === 'active').length;
  const pending = medicalRecords.filter(record => record.status_code === 'pending').length;
  const completed = medicalRecords.filter(record => record.status_code === 'completed').length;
  const initiated = medicalRecords.filter(record => record.status_code === 'initiated').length;

  const statItems = [
    { label: 'إجمالي السجلات', value: total, color: 'text-primary' },
 ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

// Searchable recipient input component
interface SearchableRecipientInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}

const SearchableRecipientInput: React.FC<SearchableRecipientInputProps> = ({
  value,
  onChange,
  placeholder = "البحث عن المستلم..."
}) => {
  const dispatch = useAppDispatch();
  const { users } = useSelector((state: RootState) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(value);
  // Use debounced search term with 500ms delay
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Search users when debounced term changes, but only if not already selected
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2 && !selectedUserId) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      setShowResults(false);
    }
  }, [debouncedSearchTerm, selectedUserId]);

  // Update selected user when value prop changes
  useEffect(() => {
    setSelectedUserId(value);
    if (value) {
      const selectedUser = users.find(u => u.user_id === value);
      if (selectedUser) {
        setSearchTerm(selectedUser.full_name);
      }
    }
  }, [value, users]);

  // Search users when typing
  const handleSearch = async (term: string) => {
    if (isSearching) return; // Prevent multiple simultaneous requests
    
    setIsSearching(true);
    try {
      await dispatch(getUsersAsync({ page: 1, perPage: 50, search: term })).unwrap();
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearching(false);
    }
    setShowResults(true);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user: UserType) => {
    onChange(user.user_id);
    setSelectedUserId(user.user_id);
    setSearchTerm(user.full_name);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Clear selection if user starts typing again
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
    // Delay hiding results to allow click events
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
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      
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
                onClick={() => handleSelectUser(user)}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">{user.username}</div>
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

// Searchable patient input component
interface SearchablePatientInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}

const SearchablePatientInput: React.FC<SearchablePatientInputProps> = ({
  value,
  onChange,
  placeholder = "البحث عن المريض..."
}) => {
  const dispatch = useAppDispatch();
  const { patients } = useSelector((state: RootState) => state.patients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(value);

  // Use debounced search term with 500ms delay
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Search patients when debounced term changes, but only if not already selected
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2 && !selectedPatientId) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      setShowResults(false);
    }
  }, [debouncedSearchTerm, selectedPatientId]);

  // Update selected patient when value prop changes
  useEffect(() => {
    setSelectedPatientId(value);
    if (value) {
      const selectedPatient = patients.find(p => p.patient_id === value);
      if (selectedPatient) {
        setSearchTerm(selectedPatient.full_name);
      }
    }
  }, [value, patients]);

  // Search patients when typing
  const handleSearch = async (term: string) => {
    if (isSearching) return; // Prevent multiple simultaneous requests
    
    setIsSearching(true);
    try {
      await dispatch(getPatientsAsync({ page: 1, perPage: 50, search: term })).unwrap();
    } catch (error) {
      console.error('Failed to search patients:', error);
    } finally {
      setIsSearching(false);
    }
    setShowResults(true);
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.national_id.toString().includes(searchTerm)
  );

  const handleSelectPatient = (patient: Patient) => {
    onChange(patient.patient_id);
    setSelectedPatientId(patient.patient_id);
    setSearchTerm(patient.full_name);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Clear selection if user starts typing again
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
    // Delay hiding results to allow click events
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
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      
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
                onClick={() => handleSelectPatient(patient)}
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

// Form dialog component
interface FormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: {
    patient_id: number;
    recipient_id: number | null;
    health_center_code: string;
    status_code: string;
    problem_type_code: string;
    transfer_notes: string;
  };
  onSubmit: (data: {
    patient_id: number;
    recipient_id: number | null;
    health_center_code: string;
    status_code: string;
    problem_type_code: string;
    transfer_notes: string;
  }) => void;
  isLoading: boolean;
  patients: Patient[];
}

const RecordFormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  formData,
  onSubmit,
  isLoading,
  patients
}) => {
  const dispatch = useAppDispatch();
  const { staticData } = useSelector((state: RootState) => state.staticData);
  const [form, setForm] = useState(formData);

  // Get status options from static data
  const statusOptions = staticData?.status || [];
  // Get problem type options from static data
  const problemTypeOptions = staticData?.problem_type || [];
  // Get health center options from static data
  const healthCenterOptions = staticData?.health_center_type || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!form.patient_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار المريض",
        variant: "destructive",
      });
      return;
    }
    
    if (!form.health_center_code) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار مركز الرعاية الصحية",
        variant: "destructive",
      });
      return;
    }
    
    if (!form.problem_type_code) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار نوع المشكلة",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">المريض</Label>
            <SearchablePatientInput
              value={form.patient_id}
              onChange={(value) => setForm({ ...form, patient_id: value || 0 })}
              placeholder="البحث بالاسم أو الرقم الوطني..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient_id">المستلم</Label>
            <SearchableRecipientInput
              value={form.recipient_id}
              onChange={(value) => setForm({ ...form, recipient_id: value })}
              placeholder="البحث بالاسم أو اسم المستخدم..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="health_center_code">مركز الرعاية الصحية *</Label>
            <Select value={form.health_center_code} onValueChange={(value) => setForm({ ...form, health_center_code: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر مركز الرعاية الصحية" />
              </SelectTrigger>
              <SelectContent>
                {healthCenterOptions.map((center) => (
                  <SelectItem key={center.code} value={center.code}>
                    {center.label_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem_type_code">نوع المشكلة</Label>
            <Select value={form.problem_type_code} onValueChange={(value) => setForm({ ...form, problem_type_code: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المشكلة" />
              </SelectTrigger>
              <SelectContent>
                {problemTypeOptions.map((problemType) => (
                  <SelectItem key={problemType.code} value={problemType.code}>
                    {problemType.label_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_code">حالة السجل</Label>
            <Select value={form.status_code} onValueChange={(value) => setForm({ ...form, status_code: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.code} value={status.code}>
                    {status.label_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer_notes">ملاحظات التحويل</Label>
            <textarea
              id="transfer_notes"
              value={form.transfer_notes || ''}
              onChange={(e) => setForm({ ...form, transfer_notes: e.target.value })}
              placeholder="ملاحظات إضافية (اختياري)"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Custom Calendar Filter Component
interface CalendarFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

const CalendarFilter: React.FC<CalendarFilterProps> = ({ value, onChange, placeholder, label }) => {
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onChange(format(selectedDate, 'yyyy-MM-dd'));
    } else {
      onChange('');
    }
    setIsOpen(false); // Close popup after selection
  };

  const handleClear = () => {
    setDate(undefined);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Input
              type="text"
              value={date ? format(date, 'yyyy-MM-dd') : ''}
              placeholder={placeholder}
              className="pr-20 h-9 text-sm cursor-pointer"
              readOnly
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarIcon
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              locale={ar}
            />
          </PopoverContent>
        </Popover>
        
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
        
        {date && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground w-4 h-4 cursor-pointer"
            title="مسح التاريخ"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// View Record Modal Component
interface ViewRecordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: MedicalRecord | null;
}

const ViewRecordModal: React.FC<ViewRecordModalProps> = ({ isOpen, onOpenChange, record }) => {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 space-x-reverse">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>السجل الطبي #{record.record_id}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Record Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-900">ملخص السجل</h3>
              <Badge className="bg-blue-100 text-blue-800">
                {record.status?.label_ar || 'غير محدد'}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-blue-600 text-sm font-medium">نوع المشكلة</div>
                <div className="text-blue-900 font-semibold">{record.problem_type?.label_ar || 'غير محدد'}</div>
              </div>
              <div>
                <div className="text-blue-600 text-sm font-medium">نوع المركز</div>
                <div className="text-blue-900 font-semibold">{record.health_center?.label_ar || 'غير محدد'}</div>
              </div>
              <div>
                <div className="text-blue-600 text-sm font-medium">التحويلات</div>
                <div className="text-blue-900 font-semibold">{record.transfers?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">معلومات المريض</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">اسم المريض</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="font-medium">{record.patient?.full_name || 'غير محدد'}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">الرقم الوطني</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="font-mono">{record.patient?.national_id || 'غير محدد'}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">الجنس</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <Badge variant="secondary">
                    {record.patient?.gender_code === 'male' ? 'ذكر' : record.patient?.gender_code === 'female' ? 'أنثى' : 'غير محدد'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">تاريخ إنشاء الملف</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="text-sm">{formatDate(record.patient?.created_at || '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Record Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">تفاصيل السجل</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">رقم السجل</Label>
                <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                  <span className="font-mono font-bold text-blue-900">#{record.record_id}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">نوع المشكلة</Label>
                <div className="mt-1 p-2 bg-purple-50 rounded border border-purple-200">
                  <Badge className="bg-purple-100 text-purple-800">
                    {record.problem_type?.label_ar || 'غير محدد'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">حالة السجل</Label>
                <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                  <Badge className="bg-blue-100 text-blue-800">
                    {record.status?.label_ar || 'غير محدد'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">مركز الرعاية الصحية</Label>
                <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                  <Badge variant="outline" className="border-green-300 text-green-800">
                    {record.health_center?.label_ar || 'غير محدد'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Transfers */}
          {record.transfers && record.transfers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">التحويلات ({record.transfers.length})</h3>
              <div className="space-y-3">
                {record.transfers.map((transfer, index) => (
                  <div key={transfer.transfer_id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">تحويل #{index + 1}</h4>
                      <Badge variant="outline">
                        {transfer.status_code === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">المرسل</Label>
                        <div className="mt-1 p-2 bg-white rounded border">
                          <span className="font-medium">{transfer.sender?.full_name || 'غير محدد'}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {transfer.sender?.role_code === 'admin' ? 'مدير' : 'موظف'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">المستلم</Label>
                        <div className="mt-1 p-2 bg-white rounded border">
                          <span className="font-medium">{transfer.recipient?.full_name || 'غير محدد'}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {transfer.recipient?.role_code === 'admin' ? 'مدير' : 'موظف'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">تاريخ التحويل</Label>
                        <div className="mt-1 p-2 bg-white rounded border">
                          <span className="text-sm">{formatDate(transfer.created_at)}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">آخر تحديث</Label>
                        <div className="mt-1 p-2 bg-white rounded border">
                          <span className="text-sm">{formatDate(transfer.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {transfer.transfer_notes && (
                      <div className="mt-3">
                        <Label className="text-sm font-medium text-gray-600">ملاحظات التحويل</Label>
                        <div className="mt-1 p-3 bg-white rounded border">
                          <p className="text-sm text-gray-700">{transfer.transfer_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">معلومات المستخدمين</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">أنشأ بواسطة</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border">
                  <div className="font-medium">{record.creator?.full_name || 'غير محدد'}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    @{record.creator?.username}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {record.creator?.role_code === 'admin' ? 'مدير' : 'موظف'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">آخر تعديل بواسطة</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border">
                  <div className="font-medium">{record.last_modifier?.full_name || 'غير محدد'}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    @{record.last_modifier?.username}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {record.last_modifier?.role_code === 'admin' ? 'مدير' : 'موظف'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">التواريخ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="text-sm">{formatDate(record.created_at)}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">آخر تحديث</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className="text-sm">{formatDate(record.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component
interface MedicalRecordsPageProps {
  userRole: 'admin' | 'employee';
}

export const MedicalRecordsPage: React.FC<MedicalRecordsPageProps> = ({ userRole }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { medicalRecords, loading, pagination, filters } = useSelector((state: RootState) => state.medicalRecords);
  const { patients } = useSelector((state: RootState) => state.patients);
  const { staticData } = useSelector((state: RootState) => state.staticData);


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState({
    patient_id: 0,
    recipient_id: null as number | null,
    health_center_code: '',
    status_code: 'initiated',
    problem_type_code: '',
    transfer_notes: ''
  });

  useEffect(() => {
    dispatch(getMedicalRecordsAsync({ page: 1, perPage: 15 }));
    dispatch(getPatientsAsync({ page: 1, perPage: 100 })); // Fetch all patients for the select
    dispatch(getUsersAsync({ page: 1, perPage: 100 })); // Fetch all users for the recipient search
  }, [dispatch]);

  const handleCreateRecord = async (data: typeof formData) => {
    try {
      // Transform data to match API requirements
      const apiData = {
        patient_id: data.patient_id,
        recipient_id: data.recipient_id,
        health_center_code: data.health_center_code,
        problem_type_code: data.problem_type_code,
        status_code: data.status_code,
        transfer_notes: data.transfer_notes
      };
      
      await dispatch(createMedicalRecordAsync(apiData)).unwrap();
      setIsFormOpen(false);
      setFormData({ 
        patient_id: 0, 
        recipient_id: null, 
        health_center_code: '', 
        status_code: 'initiated', 
        problem_type_code: '', 
        transfer_notes: '' 
      });
      toast({
        title: "تم إنشاء السجل الطبي بنجاح",
        description: "تم إضافة السجل الطبي الجديد إلى النظام",
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء السجل الطبي",
        description: "حدث خطأ أثناء إنشاء السجل الطبي",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRecord = async (data: typeof formData) => {
    if (!editingRecord) return;
    
    try {
      // Transform data to match API requirements
      const apiData = {
        recipient_id: data.recipient_id,
        health_center_code: data.health_center_code,
        problem_type_code: data.problem_type_code,
        status_code: data.status_code,
        transfer_notes: data.transfer_notes
      };
      
      await dispatch(updateMedicalRecordAsync({ id: editingRecord.record_id, recordData: apiData })).unwrap();
      setIsFormOpen(false);
      setEditingRecord(null);
      setFormData({ 
        patient_id: 0, 
        recipient_id: null, 
        health_center_code: '', 
        status_code: 'initiated', 
        problem_type_code: '', 
        transfer_notes: '' 
      });
      toast({
        title: "تم تحديث السجل الطبي بنجاح",
        description: "تم تحديث بيانات السجل الطبي",
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث السجل الطبي",
        description: "حدث خطأ أثناء تحديث السجل الطبي",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: 'patient.full_name',
      label: 'اسم المريض',
      render: (_: unknown, record: MedicalRecord) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{record.patient?.full_name || 'غير محدد'}</span>
        </div>
      ),
    },
    {
      key: 'transfers.recipient.full_name',
      label: 'اسم المستلم',
      render: (_: unknown, record: MedicalRecord) => {
        const latestTransfer = record.transfers && record.transfers.length > 0 
          ? record.transfers[record.transfers.length - 1] 
          : null;
        
        return (
          <div className="flex items-center space-x-2 space-x-reverse">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {latestTransfer?.recipient?.full_name || 'لم يتم التحويل بعد'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status.label_ar',
      label: 'حالة السجل',
      render: (_: unknown, record: MedicalRecord) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
            {record.status?.label_ar || 'غير محدد'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'problem_type.label_ar',
      label: 'نوع المشكلة',
      render: (_: unknown, record: MedicalRecord) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Badge className="bg-purple-100 text-purple-800 text-xs px-2 py-1">
            {record.problem_type?.label_ar || 'غير محدد'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'health_center_type.label_ar',
      label: 'مركز الرعاية الصحية',
      render: (_: unknown, record: MedicalRecord) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
            {record.health_center?.label_ar || 'غير محدد'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      render: (_: unknown, record: MedicalRecord) => formatDate(record.created_at),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (_: unknown, record: MedicalRecord) => (
        <div className="flex items-center space-x-2 space-x-reverse">
         {userRole === 'admin' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/medical-records/${record.record_id}`)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="عرض في صفحة منفصلة"
          >
            <Eye className="w-4 h-4" />
          </Button>
         )}          
   
        </div>
      ),
    },
  ];

  // Filter options for the EnhancedDataTable
  const filterOptions = [
    // Patient filters
    {
      key: 'patient_name',
      label: 'اسم المريض',
      type: 'text' as const,
      placeholder: 'البحث باسم المريض'
    },
    {
      key: 'patient_national_id',
      label: 'الرقم الوطني',
      type: 'text' as const,
      placeholder: 'أدخل الرقم الوطني'
    },
    {
      key: 'patient_gender',
      label: 'الجنس',
      type: 'select' as const,
      options: staticData?.gender?.map(gender => ({
        value: gender.code,
        label: gender.label_ar
      })) || []
    },
    // Record status & type filters
    {
      key: 'status_code',
      label: 'الحالة',
      type: 'select' as const,
      options: staticData?.status?.map(status => ({
        value: status.code,
        label: status.label_ar
      })) || []
    },
    {
      key: 'problem_type_code',
      label: 'نوع المشكلة',
      type: 'select' as const,
      options: staticData?.problem_type?.map(problemType => ({
        value: problemType.code,
        label: problemType.label_ar
      })) || []
    },
    {
      key: 'health_center_code',
      label: 'مركز الرعاية الصحية',
      type: 'select' as const,
      options: staticData?.health_center_type?.map(center => ({
        value: center.code,
        label: center.label_ar
      })) || []
    },
    // Date range filters
    {
      key: 'created_from',
      label: 'تاريخ الإنشاء من',
      type: 'date' as const,
      placeholder: 'من تاريخ'
    },
    {
      key: 'created_to',
      label: 'تاريخ الإنشاء إلى',
      type: 'date' as const,
      placeholder: 'إلى تاريخ'
    },
    {
      key: 'modified_from',
      label: 'تاريخ التعديل من',
      type: 'date' as const,
      placeholder: 'من تاريخ'
    },
    {
      key: 'modified_to',
      label: 'تاريخ التعديل إلى',
      type: 'date' as const,
      placeholder: 'إلى تاريخ'
    },
    // Transfer filters
    {
      key: 'has_transfers',
      label: 'لديه تحويلات',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'نعم' },
        { value: 'false', label: 'لا' }
      ]
    },
    {
      key: 'transfer_notes',
      label: 'ملاحظات التحويل',
      type: 'text' as const,
      placeholder: 'البحث في ملاحظات التحويل'
    },
    // Advanced filters
    {
      key: 'has_completed_workflow',
      label: 'مكتمل في سير العمل',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'نعم' },
        { value: 'false', label: 'لا' }
      ]
    }
  ];

  // Custom filter renderer for date fields
  const renderCustomFilter = (filterKey: string, filterValue: string | number | boolean, onFilterChange: (key: string, value: string | number | boolean) => void) => {
    if (filterKey.includes('_from') || filterKey.includes('_to')) {
      return (
        <CalendarFilter
          value={filterValue as string}
          onChange={(value) => onFilterChange(filterKey, value)}
          placeholder={filterOptions.find(f => f.key === filterKey)?.placeholder || ''}
          label={filterOptions.find(f => f.key === filterKey)?.label || ''}
        />
      );
    }
    return null;
  };

  // Handle filtering
  const handleFilter = (filters: Record<string, string | number | boolean>) => {
    const params: Record<string, string | number | boolean> = { page: 1, perPage: pagination.perPage };
    
    // Map filter keys to service parameters
    if (filters.search) {
      params.search = filters.search;
    }
    
    // Patient filters
    if (filters.patient_name) {
      params.patientName = filters.patient_name;
    }
    if (filters.patient_national_id) {
      params.patientNationalId = filters.patient_national_id;
    }
    if (filters.patient_gender && filters.patient_gender !== 'all') {
      params.patientGender = filters.patient_gender;
    }
    
    // Record status & type filters
    if (filters.status_code && filters.status_code !== 'all') {
      params.statusCode = filters.status_code;
    }
    if (filters.problem_type_code && filters.problem_type_code !== 'all') {
      params.problemTypeCode = filters.problem_type_code;
    }
    if (filters.health_center_code && filters.health_center_code !== 'all') {
      params.healthCenterCode = filters.health_center_code;
    }
    
    // Date range filters
    if (filters.created_from) {
      params.createdFrom = filters.created_from;
    }
    if (filters.created_to) {
      params.createdTo = filters.created_to;
    }
    if (filters.modified_from) {
      params.modifiedFrom = filters.modified_from;
    }
    if (filters.modified_to) {
      params.modifiedTo = filters.modified_to;
    }
    
    // Transfer filters
    if (filters.has_transfers !== undefined) {
      params.hasTransfers = filters.has_transfers === 'true';
    }
    if (filters.transfer_notes) {
      params.transferNotes = filters.transfer_notes;
    }
    
    // Advanced filters
    if (filters.has_completed_workflow !== undefined) {
      params.hasCompletedWorkflow = filters.has_completed_workflow === 'true';
    }
    
    // Dispatch the action with mapped parameters
    dispatch(getMedicalRecordsAsync(params));
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    // Clear filters in the store
    dispatch(clearFilters());
    // Refresh data with default parameters
    dispatch(getMedicalRecordsAsync({ page: 1, perPage: pagination.perPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">السجلات الطبية</h1>
          <p className="text-muted-foreground">
            إدارة السجلات الطبية والملفات الصحية
          </p>
        </div>
        <Button onClick={() => navigate('/admin/medical-records/create')}>
          <Plus className="w-4 h-4 ml-2" />
          إنشاء سجل طبي جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards medicalRecords={medicalRecords} />

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <EnhancedDataTable
            data={medicalRecords}
            columns={columns}
            loading={loading}
            pagination={{
              current_page: pagination.currentPage,
              last_page: pagination.lastPage,
              per_page: pagination.perPage,
              total: pagination.total
            }}
            onPageChange={(page) => dispatch(getMedicalRecordsAsync({ page, perPage: pagination.perPage }))}
            onFilter={handleFilter}
            onClearFilters={handleClearFilters}
            filterOptions={filterOptions}
            showFilters={true}
            showSearch={true}
            searchPlaceholder="البحث في السجلات الطبية..."
            searchableColumns={['patient.full_name', 'status.label_ar', 'transfers.recipient.full_name']}
            title="السجلات الطبية"
            renderCustomFilter={renderCustomFilter}
          />
        </CardContent>
      </Card>

      {/* Form Dialogs */}
      <RecordFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingRecord ? 'تعديل السجل الطبي' : 'إنشاء سجل طبي جديد'}
        formData={formData}
        onSubmit={editingRecord ? handleUpdateRecord : handleCreateRecord}
        isLoading={loading}
        patients={patients}
      />

      {/* View Record Modal */}
      <ViewRecordModal
        isOpen={!!viewingRecord}
        onOpenChange={(open) => !open && setViewingRecord(null)}
        record={viewingRecord}
      />
    </div>
  );
};
