import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FileText, Download, X, Calendar as CalendarIcon } from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { useStaticData } from '../../hooks/useStaticData';
import { STATIC_DATA_TYPES, getStaticDataLabel, StaticData } from '../../types/api';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

export const AdminReportsPage: React.FC = () => {
  const {
    availableReports,
    reportFormats,
    loading,
    generating,
    error,
    filters,
    selectedReportType,
    selectedFormat,
    handleFilterChange,
    handleClearFilters,
    handleGenerateReport,
    handleClearError,
    setReportType,
    setFormat,
    canGenerateReport,
    hasFilters
  } = useReports();

  const { staticData, loading: staticLoading } = useStaticData();

  const healthCenters: StaticData[] = staticData?.[STATIC_DATA_TYPES.HEALTH_CENTER] || [];
  const problemTypes: StaticData[] = staticData?.[STATIC_DATA_TYPES.PROBLEM_TYPE] || [];

  const parseDate = (value?: string) => (value ? new Date(value) : undefined);
  const formatDate = (d?: Date) => (d ? d.toISOString().split('T')[0] : '');

  const fromDate = parseDate(filters.from_date);
  const toDate = parseDate(filters.to_date);

  if (loading || staticLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">منشئ التقارير</h1>
        <p className="text-xl text-muted-foreground">إنشاء وتخصيص التقارير حسب احتياجاتك</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <X className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearError}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Report Builder Section */}
      <Card>
        <CardHeader className="bg-teal-50 border-b">
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-teal-800">
            <FileText className="w-6 h-6" />
            <span>منشئ التقرير</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Report Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="report-type">نوع التقرير</Label>
              <Select value={selectedReportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  {availableReports.map((report) => (
                    <SelectItem key={report.type} value={report.type}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedReportType && (
                <p className="text-sm text-muted-foreground">
                  {availableReports.find((r) => r.type === selectedReportType)?.description}
                </p>
              )}
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format">صيغة الملف</Label>
              <Select value={selectedFormat} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصيغة" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(reportFormats).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters with Calendar */}
            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-between',
                      !fromDate && 'text-muted-foreground'
                    )}
                  >
                    {fromDate ? formatDate(fromDate) : 'اختر التاريخ'}
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-0" sideOffset={4}>
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => handleFilterChange('from_date', formatDate(date))}
                    locale={undefined}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-between',
                      !toDate && 'text-muted-foreground'
                    )}
                  >
                    {toDate ? formatDate(toDate) : 'اختر التاريخ'}
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-0" sideOffset={4}>
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => handleFilterChange('to_date', formatDate(date))}
                    locale={undefined}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Health Center Filter (Select) */}
            <div className="space-y-2">
              <Label>رمز المركز الصحي</Label>
              <Select
                value={filters.health_center_code || ''}
                onValueChange={(value) => handleFilterChange('health_center_code', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركز الصحي" />
                </SelectTrigger>
                <SelectContent>
                  {healthCenters.map((hc) => (
                    <SelectItem key={hc.code} value={hc.code}>
                      {getStaticDataLabel(hc, 'ar')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Problem Type Filter (Select) */}
            <div className="space-y-2">
              <Label>نوع المشكلة</Label>
              <Select
                value={filters.problem_type_code || ''}
                onValueChange={(value) => handleFilterChange('problem_type_code', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المشكلة" />
                </SelectTrigger>
                <SelectContent>
                  {problemTypes.map((pt) => (
                    <SelectItem key={pt.code} value={pt.code}>
                      {getStaticDataLabel(pt, 'ar')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleGenerateReport}
          disabled={!canGenerateReport}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          {generating ? (
            <>
              <LoadingSpinner className="mr-2" size="sm" />
              جاري إنشاء التقرير...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              إنشاء التقرير
            </>
          )}
        </Button>

        <Button
          onClick={handleClearFilters}
          variant="outline"
          disabled={!hasFilters}
          className="px-8 py-3 text-lg"
        >
          <X className="w-5 h-5 mr-2" />
          مسح الفلاتر
        </Button>
      </div>
    </div>
  );
};
