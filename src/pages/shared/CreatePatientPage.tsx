import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { createPatientAsync } from '../../store/slices/patientSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Save, User, Hash, ArrowLeft } from 'lucide-react';
import { StaticData, CreatePatientRequest } from '../../types/api';
import { toast } from '../../hooks/use-toast';

// Main component
export const CreatePatientPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { staticData } = useSelector((state: RootState) => state.staticData);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreatePatientRequest>({
    full_name: '',
    national_id: 0,
    gender_code: '',
    health_center_code: ''
  });

  // Get options from static data
  const genderOptions = staticData?.gender || [];
  const healthCenterOptions = staticData?.health_center_type || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation - all fields are required
    if (!formData.full_name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال الاسم الكامل",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.national_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال رقم الهوية",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.gender_code) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار الجنس",
        variant: "destructive",
      });
      return;
    }

    if (!formData.health_center_code) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار المركز الصحي",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await dispatch(createPatientAsync(formData)).unwrap();
      
      toast({
        title: "تم إنشاء المريض بنجاح",
        description: "تم إضافة المريض الجديد إلى النظام",
      });
      
      // Navigate back to create medical record with the new patient selected
      navigate('/admin/medical-records/create', { 
        state: { 
          createdPatient: result.data.patient,
          nationalId: result.data.patient.national_id,
          message: 'تم إنشاء المريض بنجاح، يمكنك الآن إنشاء سجل طبي له'
        }
      });
      
    } catch (error) {
      toast({
        title: "خطأ في إنشاء المريض",
        description: "حدث خطأ أثناء إنشاء المريض",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/medical-records/create');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Content */}
      {/* Form Section */}
      <div>
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-xl">
              <User className="w-6 h-6 text-gaza-green" />
              <span>إنشاء مريض جديد</span>
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              أدخل المعلومات المطلوبة لإنشاء مريض جديد
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Full Name */}
              <div className="space-y-3">
                <Label htmlFor="full_name" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  الاسم الكامل <span className="text-red-500 text-lg">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="أدخل الاسم الكامل للمريض"
                  className="h-12 text-base"
                  required
                />
                <p className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4" />
                  <span>أدخل الاسم الكامل للمريض كما يظهر في الوثائق الرسمية</span>
                </p>
              </div>

              {/* National ID */}
              <div className="space-y-3">
                <Label htmlFor="national_id" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  رقم الهوية <span className="text-red-500 text-lg">*</span>
                </Label>
                <Input
                  id="national_id"
                  type="number"
                  value={formData.national_id || ''}
                  onChange={(e) => setFormData({ ...formData, national_id: parseInt(e.target.value) || 0 })}
                  placeholder="أدخل رقم الهوية"
                  className="h-12 text-base"
                  required
                />
                <p className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse">
                  <Hash className="w-4 h-4" />
                  <span>أدخل رقم الهوية المكون من 9 أرقام</span>
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <Label htmlFor="gender_code" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  الجنس <span className="text-red-500 text-lg">*</span>
                </Label>
                <Select
                  value={formData.gender_code}
                  onValueChange={(value) => setFormData({ ...formData, gender_code: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر الجنس" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender.code} value={gender.code}>
                        <span>{gender.label_ar}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4" />
                  <span>اختر الجنس من القائمة</span>
                </p>
              </div>

              {/* Health Center */}
              <div className="space-y-3">
                <Label htmlFor="health_center_code" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  المركز الصحي <span className="text-red-500 text-lg">*</span>
                </Label>
                <Select
                  value={formData.health_center_code}
                  onValueChange={(value) => setFormData({ ...formData, health_center_code: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر المركز الصحي" />
                  </SelectTrigger>
                  <SelectContent>
                    {healthCenterOptions.map((center) => (
                      <SelectItem key={center.code} value={center.code}>
                        <span>{center.label_ar}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse">
                  <User className="w-4 h-4" />
                  <span>اختر المركز الصحي الذي ينتمي إليه المريض</span>
                </p>
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
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  رجوع
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
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
                      حفظ المريض
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
