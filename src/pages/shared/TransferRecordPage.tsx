import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { createTransferAsync } from '../../store/slices/transferSlice';
import { getMedicalRecordAsync } from '../../store/slices/medicalRecordSlice';
import { getUsersAsync } from '../../store/slices/userSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Send, User, FileText, Search } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { useDebounce } from 'use-debounce';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { MedicalRecord } from '../../types/api';

interface TransferFormData {
  recipient_id: number | null;
  transfer_notes: string;
  status_code: string;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(value);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { users } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    setSelectedUserId(value);
    if (value) {
      const selectedUser = users.find(u => u.user_id === value);
      if (selectedUser) {
        setSearchTerm(selectedUser.full_name);
      }
    }
  }, [value, users]);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2 && !selectedUserId) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      setShowResults(false);
    }
  }, [debouncedSearchTerm, selectedUserId]);

  const handleSearch = useCallback(async (term: string) => {
    if (isSearching) return;

    setIsSearching(true);
    try {
      await dispatch(getUsersAsync({ page: 1, perPage: 50, search: term })).unwrap();
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearching(false);
    }
    setShowResults(true);
  }, [dispatch, isSearching]);

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = useCallback((user: { user_id: number; full_name: string }) => {
    onChange(user.user_id);
    setSelectedUserId(user.user_id);
    setSearchTerm(user.full_name);
    setShowResults(false);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    if (selectedUserId && newValue !== users.find(u => u.user_id === selectedUserId)?.full_name) {
      setSelectedUserId(null);
      onChange(null);
    }
  }, [selectedUserId, users, onChange]);

  const handleInputFocus = useCallback(() => {
    if (searchTerm.length >= 2 && !selectedUserId) {
      setShowResults(true);
    }
  }, [searchTerm.length, selectedUserId]);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => setShowResults(false), 200);
  }, []);

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
                    <div className="text-sm text-muted-foreground">
                      {user.username} - {user.role_code}
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

export const TransferRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();
  const dispatch = useAppDispatch();
  
  const { staticData } = useSelector((state: RootState) => state.staticData);
  const { loading } = useSelector((state: RootState) => state.transfers);
  
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  
  const [formData, setFormData] = useState<TransferFormData>({
    recipient_id: null,
    transfer_notes: '',
    status_code: 'initiated'
  });

  const statusOptions = staticData?.status || [];

  // Fetch medical record data if recordId is provided
  useEffect(() => {
    if (recordId) {
      setIsLoadingRecord(true);
      dispatch(getMedicalRecordAsync(parseInt(recordId)))
        .unwrap()
        .then((response) => {
          const record = response.data;
          setMedicalRecord(record);
          // Pre-fill form with current record status
          if (record.status_code) {
            setFormData(prev => ({
              ...prev,
              status_code: record.status_code
            }));
          }
        })
        .catch((error) => {
          console.error('Failed to fetch medical record:', error);
          toast({
            title: "خطأ في تحميل البيانات",
            description: "فشل في تحميل بيانات السجل الطبي",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoadingRecord(false);
        });
    }
  }, [recordId, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipient_id) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى اختيار المستلم",
        variant: "destructive",
      });
      return;
    }

    if (!formData.transfer_notes.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال ملاحظات التحويل",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!recordId) {
        toast({
          title: "خطأ في النموذج",
          description: "لم يتم العثور على السجل الطبي",
          variant: "destructive",
        });
        return;
      }

      await dispatch(createTransferAsync({
        record_id: parseInt(recordId),
        recipient_id: formData.recipient_id,
        transfer_notes: formData.transfer_notes,
        status_code: formData.status_code
      })).unwrap();

      toast({
        title: "تم إرسال السجل بنجاح",
        description: "تم إرسال السجل الطبي إلى المستلم",
      });

      // Navigate back to the medical record view page
      navigate('/admin/transfers');
    } catch (error) {
      toast({
        title: "خطأ في إرسال السجل",
        description: "حدث خطأ أثناء إرسال السجل الطبي",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (recordId) {
      navigate(`/admin/medical-records/${recordId}`);
    } else {
      navigate('/admin/medical-records');
    }
  };

  if (isLoadingRecord) {
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              إرسال سجل طبي
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              إرسال السجل الطبي إلى مستخدم آخر
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medical Record Info */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>معلومات السجل الطبي</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {medicalRecord ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">رقم السجل</p>
                  <p className="text-lg font-semibold text-gray-900">#{medicalRecord.record_id}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">اسم المريض</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {medicalRecord.patient?.full_name || 'غير محدد'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">المركز الصحي</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {medicalRecord.patient?.health_center?.label_ar || medicalRecord.patient?.health_center_code || 'غير محدد'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">نوع المشكلة</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {medicalRecord.problem_type?.label_ar || medicalRecord.problem_type_code || 'غير محدد'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">جاري تحميل بيانات السجل الطبي...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfer Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
              <Send className="w-5 h-5 text-gaza-green" />
              <span>تفاصيل التحويل</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Selection */}
              <div className="space-y-2">
                <Label htmlFor="recipient_id" className="text-base font-semibold">
                  المستلم <span className="text-red-500">*</span>
                </Label>
                <SearchableRecipientInput
                  value={formData.recipient_id}
                  onChange={(value) => setFormData({ ...formData, recipient_id: value })}
                  placeholder="البحث بالاسم أو اسم المستخدم..."
                />
                <p className="text-sm text-gray-500">
                  اختر المستلم الذي تريد إرسال السجل إليه
                </p>
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status_code" className="text-base font-semibold">
                  حالة السجل <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.status_code} 
                  onValueChange={(value) => setFormData({ ...formData, status_code: value })}
                >
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
                <p className="text-sm text-gray-500">
                  اختر الحالة الجديدة للسجل بعد التحويل
                </p>
              </div>

              {/* Transfer Notes */}
              <div className="space-y-2">
                <Label htmlFor="transfer_notes" className="text-base font-semibold">
                  ملاحظات التحويل <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="transfer_notes"
                  value={formData.transfer_notes}
                  onChange={(e) => setFormData({ ...formData, transfer_notes: e.target.value })}
                  placeholder="أدخل ملاحظات مفصلة حول سبب التحويل والمتطلبات..."
                  rows={16}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500">
                  اكتب ملاحظات مفصلة حول سبب التحويل والمتطلبات المطلوبة
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 space-x-reverse pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="px-6 py-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 min-w-[140px] bg-gaza-green hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {loading ? 'جاري الإرسال...' : (
                    <>
                      <Send className="w-4 h-4 ml-2" />
                      إرسال السجل
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
