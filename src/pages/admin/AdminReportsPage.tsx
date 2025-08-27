import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FileText, Download, Search, X } from 'lucide-react';
import { useReports } from '../../hooks/useReports';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل التقارير المتاحة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">منشئ التقارير</h1>
        <p className="text-xl text-muted-foreground">
          إنشاء وتخصيص التقارير حسب احتياجاتك
        </p>
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
                  {availableReports.find(r => r.type === selectedReportType)?.description}
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

            {/* Date Range Filters */}
            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={filters.from_date}
                onChange={(e) => handleFilterChange('from_date', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={filters.to_date}
                onChange={(e) => handleFilterChange('to_date', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Health Center Filter */}
            <div className="space-y-2">
              <Label>رمز المركز الصحي</Label>
              <Input
                type="text"
                value={filters.health_center_code}
                onChange={(e) => handleFilterChange('health_center_code', e.target.value)}
                placeholder="أدخل رمز المركز الصحي"
                className="w-full"
              />
            </div>

            {/* Problem Type Filter */}
            <div className="space-y-2">
              <Label>نوع المشكلة</Label>
              <Input
                type="text"
                value={filters.problem_type_code}
                onChange={(e) => handleFilterChange('problem_type_code', e.target.value)}
                placeholder="أدخل نوع المشكلة"
                className="w-full"
              />
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
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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

      {/* Available Reports Info */}
      {availableReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Search className="w-5 h-5" />
              <span>التقارير المتاحة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableReports.map((report) => (
                <div key={report.type} className="border rounded-lg p-4 hover:bg-gray-50">
                  <h3 className="font-semibold text-lg mb-2">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {report.supported_formats.map((format) => (
                      <span
                        key={format}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {reportFormats[format] || format}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
