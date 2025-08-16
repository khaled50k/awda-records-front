import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { 
  getStaticDataListAsync, 
  getStaticDataTypesAsync,
  createStaticDataAsync,
  updateStaticDataAsync,
  deleteStaticDataAsync,
  toggleStaticDataStatusAsync,
  bulkUpdateStaticDataStatusAsync
} from '../../store/slices/staticDataSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { EnhancedDataTable } from '../../components/ui/enhanced-data-table';
import { Plus, Edit, Trash2, Eye, Search, Filter, RefreshCw, Database, Settings, Globe, FileText } from 'lucide-react';
import { StaticData, StaticDataCreateRequest, StaticDataUpdateRequest, StaticDataFilters, STATIC_DATA_TYPES } from '../../types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const AdminStaticDataPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { staticDataList, staticDataTypes, loading, pagination, filters } = useSelector((state: RootState) => state.staticData);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StaticData | null>(null);
  const [viewingItem, setViewingItem] = useState<StaticData | null>(null);
  const [formData, setFormData] = useState<StaticDataCreateRequest>({
    type: '',
    code: '',
    label_en: '',
    label_ar: '',
    description: '',
    is_active: true,
    metadata: {}
  });

  useEffect(() => {
    dispatch(getStaticDataListAsync({ page: 1, perPage: 15 }));
    dispatch(getStaticDataTypesAsync());
  }, [dispatch]);

  const handleCreateItem = async (data: StaticDataCreateRequest) => {
    try {
      await dispatch(createStaticDataAsync(data)).unwrap();
      setIsFormOpen(false);
      setFormData({ type: '', code: '', label_en: '', label_ar: '', description: '', is_active: true, metadata: {} });
      dispatch(getStaticDataListAsync({ page: 1, perPage: pagination.perPage }));
      toast({
        title: "تم إنشاء البيانات الثابتة بنجاح",
        description: "تم إضافة البيانات الثابتة الجديدة إلى النظام",
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء البيانات الثابتة",
        description: "حدث خطأ أثناء إنشاء البيانات الثابتة",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (data: StaticDataUpdateRequest) => {
    if (!editingItem) return;
    
    try {
      await dispatch(updateStaticDataAsync({ id: editingItem.id, recordData: data })).unwrap();
      setIsFormOpen(false);
      setEditingItem(null);
      setFormData({ type: '', code: '', label_en: '', label_ar: '', description: '', is_active: true, metadata: {} });
      dispatch(getStaticDataListAsync({ page: 1, perPage: pagination.perPage }));
      toast({
        title: "تم تحديث البيانات الثابتة بنجاح",
        description: "تم تحديث بيانات البيانات الثابتة",
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث البيانات الثابتة",
        description: "حدث خطأ أثناء تحديث البيانات الثابتة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      try {
        await dispatch(deleteStaticDataAsync(id)).unwrap();
        dispatch(getStaticDataListAsync({ page: 1, perPage: pagination.perPage }));
        toast({
          title: "تم حذف البيانات الثابتة بنجاح",
          description: "تم حذف العنصر من النظام",
        });
      } catch (error) {
        toast({
          title: "خطأ في حذف البيانات الثابتة",
          description: "حدث خطأ أثناء حذف العنصر",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await dispatch(toggleStaticDataStatusAsync(id)).unwrap();
      dispatch(getStaticDataListAsync({ page: 1, perPage: pagination.perPage }));
      toast({
        title: "تم تحديث الحالة بنجاح",
        description: "تم تغيير حالة العنصر",
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث الحالة",
        description: "حدث خطأ أثناء تغيير الحالة",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: 'type',
      label: 'النوع',
      exportable: true,
      render: (_: unknown, record: StaticData) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Database className="w-4 h-4 text-blue-600" />
          <Badge variant="outline" className="text-xs">
            {record.type}
          </Badge>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'الكود',
      exportable: true,
      render: (_: unknown, record: StaticData) => (
        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {record.code}
        </div>
      ),
    },
    {
      key: 'label_ar',
      label: 'التسمية العربية',
      exportable: true,
      render: (_: unknown, record: StaticData) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Globe className="w-4 h-4 text-green-600" />
          <span className="font-medium">{record.label_ar}</span>
        </div>
      ),
    },
    {
      key: 'label_en',
      label: 'التسمية الإنجليزية',
      exportable: true,
      render: (_: unknown, record: StaticData) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{record.label_en}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'الوصف',
      exportable: true,
      render: (_: unknown, record: StaticData) => (
        <div className="max-w-xs truncate text-sm text-muted-foreground">
          {record.description || 'لا يوجد وصف'}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'الحالة',
      exportable: true,
      render: (_: unknown, record: StaticData) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Badge className={record.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {record.is_active ? 'نشط' : 'غير نشط'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      exportable: true,
      render: (_: unknown, record: StaticData) => new Date(record.created_at).toLocaleDateString('ar-US'),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      exportable: false,
      render: (_: unknown, record: StaticData) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingItem(record)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="عرض التفاصيل"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingItem(record);
              setFormData({
                type: record.type,
                code: record.code,
                label_en: record.label_en,
                label_ar: record.label_ar,
                description: record.description || '',
                is_active: record.is_active,
                metadata: record.metadata || {}
              });
              setIsFormOpen(true);
            }}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(record.id)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            title="تغيير الحالة"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteItem(record.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Filter options for the EnhancedDataTable
  const filterOptions = [
    {
      key: 'type',
      label: 'النوع',
      type: 'select' as const,
      options: Object.entries(STATIC_DATA_TYPES).map(([key, value]) => ({
        value: value,
        label: key
      }))
    },
    {
      key: 'code',
      label: 'الكود',
      type: 'text' as const,
      placeholder: 'البحث بالكود'
    },
    {
      key: 'label_ar',
      label: 'التسمية العربية',
      type: 'text' as const,
      placeholder: 'البحث بالتسمية العربية'
    },
    {
      key: 'label_en',
      label: 'التسمية الإنجليزية',
      type: 'text' as const,
      placeholder: 'البحث بالتسمية الإنجليزية'
    },
    {
      key: 'is_active',
      label: 'الحالة',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'نشط' },
        { value: 'false', label: 'غير نشط' }
      ]
    }
  ];

  // Handle filtering
  const handleFilter = (filters: Record<string, string | number | boolean>) => {
    const params: StaticDataFilters = { page: 1, perPage: pagination.perPage };
    
    if (filters.search) {
      params.label = filters.search as string;
    }
    
    if (filters.type && filters.type !== 'all') {
      params.type = filters.type as string;
    }
    
    if (filters.code) {
      params.code = filters.code as string;
    }
    
    if (filters.label_ar) {
      params.label_ar = filters.label_ar as string;
    }
    
    if (filters.label_en) {
      params.label_en = filters.label_en as string;
    }
    
    if (filters.is_active !== undefined) {
      params.is_active = filters.is_active === 'true';
    }
    
    dispatch(getStaticDataListAsync(params));
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    dispatch(getStaticDataListAsync({ page: 1, perPage: pagination.perPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة البيانات الثابتة</h1>
          <p className="text-muted-foreground">
            إدارة أنواع البيانات الثابتة في النظام
          </p>
        </div>
        <Button onClick={() => {
          setEditingItem(null);
          setFormData({ type: '', code: '', label_en: '', label_ar: '', description: '', is_active: true, metadata: {} });
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة بيانات ثابتة جديدة
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <EnhancedDataTable
            data={staticDataList}
            columns={columns}
            loading={loading}
            pagination={{
              current_page: pagination.current_page,
              last_page: pagination.last_page,
              per_page: pagination.perPage,
              total: pagination.total
            }}
            onPageChange={(page) => dispatch(getStaticDataListAsync({ page, perPage: pagination.perPage }))}
            onFilter={handleFilter}
            onClearFilters={handleClearFilters}
            filterOptions={filterOptions}
            showFilters={true}
            showSearch={true}
            searchPlaceholder="البحث في البيانات الثابتة..."
            searchableColumns={['type', 'code', 'label_ar', 'label_en', 'description']}
            title="البيانات الثابتة"
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'تعديل البيانات الثابتة' : 'إضافة بيانات ثابتة جديدة'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'قم بتعديل بيانات البيانات الثابتة' : 'أضف بيانات ثابتة جديدة إلى النظام'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingItem) {
              handleUpdateItem(formData);
            } else {
              handleCreateItem(formData);
            }
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">النوع *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATIC_DATA_TYPES).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">الكود *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="أدخل الكود"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label_ar">التسمية العربية *</Label>
                <Input
                  id="label_ar"
                  value={formData.label_ar}
                  onChange={(e) => setFormData({ ...formData, label_ar: e.target.value })}
                  placeholder="أدخل التسمية العربية"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label_en">التسمية الإنجليزية *</Label>
                <Input
                  id="label_en"
                  value={formData.label_en}
                  onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                  placeholder="أدخل التسمية الإنجليزية"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل الوصف (اختياري)"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">نشط</Label>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'جاري الحفظ...' : editingItem ? 'تحديث' : 'إنشاء'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Item Modal */}
      <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>تفاصيل البيانات الثابتة</span>
            </DialogTitle>
          </DialogHeader>
          
          {viewingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">النوع</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    <Badge variant="outline">{viewingItem.type}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">الكود</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border font-mono">
                    {viewingItem.code}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">التسمية العربية</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    {viewingItem.label_ar}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">التسمية الإنجليزية</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    {viewingItem.label_en}
                  </div>
                </div>
              </div>
              
              {viewingItem.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">الوصف</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    {viewingItem.description}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">الحالة</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    <Badge className={viewingItem.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {viewingItem.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    {new Date(viewingItem.created_at).toLocaleDateString('ar-US')}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingItem(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
