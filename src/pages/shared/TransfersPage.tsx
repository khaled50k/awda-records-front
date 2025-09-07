import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import {
  getTransfersAsync,
  deleteTransferAsync,
  receiveTransferAsync,
  completeTransferAsync
} from '../../store/slices/transferSlice';
import { getMedicalRecordsAsync } from '../../store/slices/medicalRecordSlice';
import { getUsersAsync } from '../../store/slices/userSlice';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { EnhancedDataTable } from '../../components/ui/enhanced-data-table';
import { Plus, Send, Download, Eye, Trash2, Search, CheckCircle, Clock, User, FileText } from 'lucide-react';
import { RecordTransfer, MedicalRecord, User as UserType, StaticDataGroup } from '../../types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast, useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '../../components/ui/textarea';
import { useDebounce } from 'use-debounce';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface TransferStats {
  total: number;
  pending: number;
  received: number;
  replied: number;
  completed: number;
}



interface SearchableInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

interface SearchableMedicalRecordInputProps extends SearchableInputProps {
  medicalRecords: MedicalRecord[];
}

interface SearchableRecipientInputProps extends SearchableInputProps {
  users: UserType[];
}

interface TransfersPageProps {
  userRole: 'admin' | 'employee';
}

interface FormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: {
    record_id: number;
    recipient_id: number | null;
    status_code: string;
    transfer_notes: string;
  };
  onSubmit: (data: {
    record_id: number;
    recipient_id: number | null;
    status_code: string;
    transfer_notes: string;
  }) => void;
  isLoading: boolean;
  medicalRecords: MedicalRecord[];
  users: UserType[];
  staticData: StaticDataGroup | null;
  currentTransferData: RecordTransfer | null;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, ' - ');
};

const getTransferStatusBadge = (transfer: RecordTransfer): JSX.Element => {
  // Completed transfers take highest priority
  if (transfer.completed_at) {
    return (
      <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
        <CheckCircle className="w-3 h-3 ml-1" />
        مكتمل
      </Badge>
    );
  }

  // Replied transfers (received and replied but not completed)
  if (transfer.is_replied) {
    return (
      <Badge className="bg-purple-100 text-purple-800 text-xs px-2 py-1">
        <CheckCircle className="w-3 h-3 ml-1" />
        تم الرد
      </Badge>
    );
  }

  // Received transfers (received but not replied and not completed)
  if (transfer.received_at && !transfer.is_replied) {
    return (
      <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
        <Download className="w-3 h-3" />
        تم الاستلام
      </Badge>
    );
  }

  // Pending transfers (not received, not replied, not completed)
  return (
    <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1">
      <Clock className="w-3 h-3 ml-1" />
      في الانتظار
    </Badge>
  );
};

// ============================================================================
// COMPONENTS
// ============================================================================

const StatsCards: React.FC<{ summary: TransferStats }> = ({ summary }) => {
  const statItems = [
    { label: 'إجمالي التحويلات', value: summary.total, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="shadow-sm">
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const SearchableMedicalRecordInput: React.FC<SearchableMedicalRecordInputProps> = ({
  value,
  onChange,
  placeholder = "البحث عن السجل الطبي...",
  medicalRecords,
  isDisabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(value);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  useEffect(() => {
    setSelectedRecordId(value);
    if (value) {
      const selectedRecord = medicalRecords.find(r => r.record_id === value);
      if (selectedRecord) {
        setSearchTerm(`${selectedRecord.record_id} - ${selectedRecord.patient?.full_name || 'غير محدد'} (${selectedRecord.status_code || 'غير محدد'})`);
      }
    }
  }, [value, medicalRecords]);

  const filteredRecords = useMemo(() => {
    if (!debouncedSearchTerm) return medicalRecords;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return medicalRecords.filter(record =>
      record.record_id.toString().includes(searchLower) ||
      record.patient?.full_name?.toLowerCase().includes(searchLower) ||
      record.patient?.national_id?.toString().includes(searchLower)
    );
  }, [medicalRecords, debouncedSearchTerm]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    if (selectedRecordId && newValue !== `${selectedRecordId} - ${medicalRecords.find(r => r.record_id === selectedRecordId)?.patient?.full_name || 'غير محدد'} (${medicalRecords.find(r => r.record_id === selectedRecordId)?.status_code || 'غير محدد'})`) {
      setSelectedRecordId(null);
      onChange(null);
    }
  }, [selectedRecordId, medicalRecords, onChange]);

  const handleSelectRecord = useCallback((record: MedicalRecord) => {
    setSelectedRecordId(record.record_id);
    onChange(record.record_id);
    setSearchTerm(`${record.record_id} - ${record.patient?.full_name || 'غير محدد'} (${record.status_code || 'غير محدد'})`);
    setShowResults(false);
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    if (!isDisabled) {
      setShowResults(true);
    }
  }, [isDisabled]);

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
        disabled={isDisabled}
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />

      {showResults && !isDisabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div
                key={record.record_id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelectRecord(record)}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">#{record.record_id}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.patient?.full_name || 'غير محدد'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      منشئ السجل: {record.created_by || 'غير محدد'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      الحالة: {record.status_code || 'غير محدد'}
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

const SearchableRecipientInput: React.FC<SearchableRecipientInputProps> = ({
  value,
  onChange,
  placeholder = "البحث عن المستلم...",
  users
}) => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(value);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

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

  const filteredUsers = useMemo(() =>
    users.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

  const handleSelectUser = useCallback((user: UserType) => {
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

const TransferFormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  formData,
  onSubmit,
  isLoading,
  medicalRecords,
  users,
  staticData,
  currentTransferData
}) => {
  const [form, setForm] = useState(formData);
  const { toast } = useToast();

  useEffect(() => {
    setForm(formData);
  }, [formData]);

  const statusOptions = staticData?.status || [];

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!form.record_id) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى اختيار السجل الطبي",
        variant: "destructive",
      });
      return;
    }

    if (!form.recipient_id) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى اختيار المستلم",
        variant: "destructive",
      });
      return;
    }

    if (!form.status_code) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى اختيار حالة السجل",
        variant: "destructive",
      });
      return;
    }

    if (!form.transfer_notes.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال ملاحظات التحويل",
        variant: "destructive",
      });
      return;
    }

    onSubmit(form);
  }, [form, onSubmit, toast]);

  const renderRecordInfo = useCallback(() => {
    let selectedRecord = medicalRecords.find(r => r.record_id === formData.record_id);

    if (!selectedRecord && currentTransferData?.medical_record) {
      selectedRecord = currentTransferData.medical_record;
    }

    if (!selectedRecord) {
      return (
        <div className="text-muted-foreground">
          السجل رقم: {formData.record_id}
        </div>
      );
    }

    return (
      <>
        <div className="font-medium">#{selectedRecord.record_id}</div>
        <div className="text-sm text-muted-foreground">
          المريض: {selectedRecord.patient?.full_name || 'غير محدد'}
        </div>
        <div className="text-xs text-muted-foreground">
          منشئ السجل: {currentTransferData?.sender?.full_name || selectedRecord.created_by || 'غير محدد'}
        </div>
        <div className="text-xs text-muted-foreground">
          الحالة: {selectedRecord.status_code || 'غير محدد'}
        </div>
      </>
    );
  }, [formData.record_id, medicalRecords, currentTransferData]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="record_id">السجل الطبي</Label>
            {formData.record_id ? (
              <div className="p-3 bg-muted rounded-md">
                {renderRecordInfo()}
              </div>
            ) : (
              <SearchableMedicalRecordInput
                value={form.record_id}
                onChange={(value) => setForm({ ...form, record_id: value })}
                placeholder="البحث بالرقم أو اسم المريض..."
                medicalRecords={medicalRecords}
                isDisabled={false}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient_id">المستلم</Label>
            <SearchableRecipientInput
              value={form.recipient_id}
              onChange={(value) => setForm({ ...form, recipient_id: value })}
              placeholder="البحث بالاسم أو اسم المستخدم..."
              users={users}
            />
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
            <Textarea
              id="transfer_notes"
              value={form.transfer_notes || ''}
              onChange={(e) => setForm({ ...form, transfer_notes: e.target.value })}
              placeholder="ملاحظات التحويل (مطلوب)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري الإرسال...' : 'إرسال السجل'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};



const TransferActions: React.FC<{
  record: RecordTransfer;
  userRole: 'admin' | 'employee';
  onReceive: (id: number) => void;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onSend: (record: RecordTransfer) => void;
  onView: (record: RecordTransfer) => void;
}> = ({ record, userRole, onReceive, onComplete, onDelete, onSend, onView }) => {
  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onView(record)}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        title="عرض التفاصيل"
      >
        <Eye className="w-4 h-4" />
      </Button>


      {record.created_at && !record.is_replied && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSend(record)}
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          title="تحويل الملاحظة إلى صاحب العلاقة"
        >
          <Send className="w-4 h-4" />
        </Button>
      )}

    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TransfersPage: React.FC<TransfersPageProps> = ({ userRole }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transfers, loading, pagination } = useSelector((state: RootState) => state.transfers);
  const { medicalRecords } = useSelector((state: RootState) => state.medicalRecords);
  const { users } = useSelector((state: RootState) => state.users);
  const { staticData } = useSelector((state: RootState) => state.staticData);



  useEffect(() => {
    dispatch(getTransfersAsync({ page: 1, perPage: 100 }));
    dispatch(getMedicalRecordsAsync({ page: 1, perPage: 100 }));
    dispatch(getUsersAsync({ page: 1, perPage: 100 }));
  }, [dispatch]);

  const transferStats = useMemo((): TransferStats => {
    const validTransfers = transfers.filter(t => t != null); // Filter out null/undefined transfers
    const total = validTransfers.length;
    const pending = validTransfers.filter(t => !t.received_at && !t.is_replied && !t.completed_at).length;
    const received = validTransfers.filter(t => t.received_at && !t.is_replied && !t.completed_at).length;
    const replied = validTransfers.filter(t => t.is_replied && !t.completed_at).length;
    const completed = validTransfers.filter(t => t.completed_at).length;

    return { total, pending, received, replied, completed };
  }, [transfers]);



  const handleReceiveTransfer = useCallback(async (transferId: number) => {
    try {
      await dispatch(receiveTransferAsync(transferId)).unwrap();
      toast({
        title: "تم استلام السجل بنجاح",
        description: "تم تأكيد استلام السجل الطبي",
      });
    } catch (error) {
      toast({
        title: "خطأ في استلام السجل",
        description: "حدث خطأ أثناء استلام السجل الطبي",
        variant: "destructive",
      });
    }
  }, [dispatch]);

  const handleCompleteTransfer = useCallback(async (transferId: number) => {
    try {
      await dispatch(completeTransferAsync(transferId)).unwrap();
      toast({
        title: "تم إكمال التحويل بنجاح",
        description: "تم إكمال عملية التحويل",
      });
    } catch (error) {
      toast({
        title: "خطأ في إكمال التحويل",
        description: "حدث خطأ أثناء إكمال التحويل",
        variant: "destructive",
      });
    }
  }, [dispatch]);

  const handleDeleteTransfer = useCallback(async (transferId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا التحويل؟')) {
      try {
        await dispatch(deleteTransferAsync(transferId)).unwrap();
        toast({
          title: "تم حذف التحويل بنجاح",
          description: "تم حذف التحويل من النظام",
        });
      } catch (error) {
        toast({
          title: "خطأ في حذف التحويل",
          description: "حدث خطأ أثناء حذف التحويل",
          variant: "destructive",
        });
      }
    }
  }, [dispatch]);

  const handleSendTransfer = useCallback((record: RecordTransfer) => {
    navigate(`/admin/medical-records/${record.medical_record.record_id}/transfer`);
  }, [navigate]);

  const handleViewTransfer = useCallback((transfer: RecordTransfer) => {
    navigate(`/admin/transfers/${transfer.transfer_id}`);
  }, [navigate]);

  const [isViewTransferNotes, setIsViewTransferNotes] = useState(false);
  const [selectedTransferNotes, setSelectedTransferNotes] = useState<string>('');

  const handleViewTransferNotes = (notes: string) => {
    setSelectedTransferNotes(notes);
    setIsViewTransferNotes(true);
  };

  const columns = useMemo(() => [
    {
      key: 'medical_record.patient.full_name',
      label: 'اسم المريض',
      exportable: true,
      render: (_: unknown, record: RecordTransfer) => {
        const isForCurrentUser = user?.user?.username === record.recipient?.username && user?.user?.role_code === 'admin';

        return (
          <div className={`flex items-center space-x-2 space-x-reverse`}>
            <span className={`font-medium ${isForCurrentUser ? 'text-blue-700' : ''}`}>
              {record.medical_record?.patient?.full_name || 'غير محدد'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'sender.full_name',
      label: 'المرسل',
      exportable: true,
      render: (_: unknown, record: RecordTransfer) => {
        const isForCurrentUser = user?.user?.username === record.recipient?.username && user?.user?.role_code === 'admin';

        return (
          <div className={`flex items-center space-x-2 space-x-reverse`}>
            <span className={`font-medium ${isForCurrentUser ? 'text-blue-700' : ''}`}>
              {record.sender?.full_name || 'غير محدد'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'recipient.full_name',
      label: 'المستلم',
      exportable: true,
      render: (_: unknown, record: RecordTransfer) => {
        const isForCurrentUser = user?.user?.username === record.recipient?.username && user?.user?.role_code === 'admin';

        return (
          <div className={`flex items-center space-x-2 space-x-reverse`}>
            <span className={`font-medium ${isForCurrentUser ? 'text-blue-700' : ''}`}>
              {record.recipient?.full_name || 'غير محدد'}
            </span>
          </div>
        );
      },
    },

    {
      key: 'medical_record.status.label_ar',
      label: 'الحالة',
      exportable: true,
      render: (_: unknown, record: RecordTransfer) => {
        const isForCurrentUser = user?.user?.username === record.recipient?.username && user?.user?.role_code === 'admin';

        return (
          <div className={`flex items-center space-x-2 space-x-reverse`}>
            <Badge className={`text-xs px-2 py-1 ${isForCurrentUser ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-800'
              }`}>
              {record.medical_record.status?.label_ar || 'غير محدد'}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'transfer_status_code',
      label: 'حالة المستقبل',
      exportable: true,
      render: (_: unknown, record: RecordTransfer) => {
        const isForCurrentUser = user?.user?.username === record.recipient?.username && user?.user?.role_code === 'admin';

        return (
          <div className={`flex items-center space-x-2 space-x-reverse`}>


            <Badge className={`text-xs px-2 py-1 ${isForCurrentUser ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-800'
              }`}>
              {record?.medical_record?.transfer_status?.label_ar || 'غير محدد'}
            </Badge>
            {record.transfer_notes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewTransferNotes(record.transfer_notes)}
              >
                <Eye className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                />
              </Button>
            )}
          </div>
        );
      },
    },
    {
      key: 'created_at',
      label: 'تاريخ الإرسال',
      exportable: true,
      render: (_: unknown, record: RecordTransfer) => {
        const isForCurrentUser = user?.user?.username === record.recipient?.username && user?.user?.role_code === 'admin';

        return (
          <div className={`flex items-center space-x-2 space-x-reverse`}>
            <span className={isForCurrentUser ? 'text-blue-700' : ''}>
              {formatDate(record.created_at)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      exportable: false,
      render: (_: unknown, record: RecordTransfer) => (
        <TransferActions
          record={record}
          userRole={userRole}
          onReceive={handleReceiveTransfer}
          onComplete={handleCompleteTransfer}
          onDelete={handleDeleteTransfer}
          onSend={handleSendTransfer}
          onView={handleViewTransfer}
        />
      ),
    },
  ], [userRole, handleReceiveTransfer, handleCompleteTransfer, handleDeleteTransfer, handleSendTransfer, handleViewTransfer]);

  const handlePageChange = useCallback((page: number) => {
    dispatch(getTransfersAsync({ page, perPage: pagination.perPage }));
  }, [dispatch, pagination.perPage]);



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">التحويلات</h1>
          <p className="text-muted-foreground">
            إدارة جميع التحويلات في النظام
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/medical-records')}
          className="px-6 py-2 bg-gaza-green hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4 ml-2" />
          إنشاء تحويل جديد
        </Button>
      </div>

      <StatsCards summary={transferStats} />

      <Card>
        <CardContent className="p-0">
          <EnhancedDataTable
            data={transfers.filter(t => t != null)}
            columns={columns}
            loading={loading}
            pagination={{
              current_page: pagination.currentPage,
              last_page: pagination.lastPage,
              per_page: pagination.perPage,
              total: pagination.total
            }}
            onPageChange={handlePageChange}
            title="التحويلات"
          />
        </CardContent>
      </Card>

      {/* Transfer Notes Modal */}
      <Dialog open={isViewTransferNotes} onOpenChange={setIsViewTransferNotes}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>ملاحظات التحويل</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">الملاحظات:</h4>
              <div className="text-blue-800 whitespace-pre-wrap leading-relaxed">
                {selectedTransferNotes}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <span className="font-medium">ملاحظة:</span> هذه الملاحظات تم إدخالها عند إنشاء التحويل.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewTransferNotes(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
