import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, X, Download, FileText } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: string | number | boolean | undefined, record: T) => React.ReactNode;
  sortable?: boolean;
  exportable?: boolean;
}

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface EnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, string | number | boolean>) => void;
  onClearFilters?: () => void;
  filterOptions?: FilterOption[];
  className?: string;
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchableColumns?: (keyof T | string)[];
  exportEnabled?: boolean;
  onExport?: (format: 'csv' | 'pdf') => void;
  expandableRows?: boolean;
  expandedRowRender?: (row: T) => React.ReactNode;
  rowHasExpand?: (row: T) => boolean;
  getRowKey?: (row: T, index: number) => string | number;
  renderCustomFilter?: (filterKey: string, filterValue: string | number | boolean, onFilterChange: (key: string, value: string | number | boolean) => void) => React.ReactNode;
}

export function EnhancedDataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onSort,
  onFilter,
  onClearFilters,
  filterOptions = [],
  className,
  title,
  showFilters = true,
  showSearch = true,
  searchPlaceholder = "البحث في الجدول...",
  searchableColumns,
  exportEnabled = true,
  onExport,
  expandableRows = false,
  expandedRowRender,
  rowHasExpand,
  getRowKey,
  renderCustomFilter,
}: EnhancedDataTableProps<T>) {
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | string | null>(null);

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Only call onFilter if user has interacted
      if (hasUserInteracted) {
        if (searchTerm !== '') {
          const newFilters = { ...filters, search: searchTerm };
          onFilter?.(newFilters);
        } else if (debouncedSearchTerm !== '') {
          // When search is cleared, remove search from filters
          const newFilters = { ...filters };
          delete newFilters.search;
          onFilter?.(newFilters);
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, hasUserInteracted]);

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setHasUserInteracted(true);
    const newFilters = { ...filters };
    
    if (!value || value === '' || value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
    // Call onFilter immediately when filter changes
    onFilter?.(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setHasUserInteracted(true);
    setSearchTerm(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setDebouncedSearchTerm(searchTerm);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setDebouncedSearchTerm('');
    onClearFilters?.();
  };

  const getValue = (record: T, key: keyof T | string): string | number | boolean | undefined => {
    if (typeof key === 'string' && key.includes('.')) {
      const keys = key.split('.');
      let value: unknown = record;
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      return value as string | number | boolean | undefined;
    }
    return record[key as keyof T] as string | number | boolean | undefined;
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      // Generate CSV
      const headers = columns.filter(col => col.exportable !== false).map(col => col.label);
      const csvContent = [
        headers.join(','),
        ...data.map(record => 
          columns.filter(col => col.exportable !== false).map(col => {
            const value = getValue(record, col.key);
            return typeof value === 'string' ? `"${value}"` : String(value || '');
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title || 'data'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      // For PDF, we'll call the onExport callback if provided
      onExport?.(format);
    }
  };

  // Render search bar
  const renderSearchBar = () => (
    showSearch && (
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pr-10 h-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {exportEnabled && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  className="h-10 px-4 gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('pdf')}
                  className="h-10 px-4 gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
              </>
            )}
            {showFilters && (
              <Button
                variant="outline"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="h-10 px-4 gap-2"
              >
                <Filter className="h-4 w-4" />
                فلتر
              </Button>
            )}
          </div>
        </div>
        {(searchTerm || Object.keys(filters).length > 0) && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {searchTerm && (
                <span>نتائج البحث: "{searchTerm}"</span>
              )}
              {Object.keys(filters).length > 0 && (
                <span>• {Object.keys(filters).length} فلتر نشط</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  );

  // Render filter panel
  const renderFilterPanel = () => (
    showFilterPanel && showFilters && (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/20">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filterOptions.map((option) => {
              // Check if custom filter renderer exists for this option
              if (renderCustomFilter) {
                const customFilter = renderCustomFilter(option.key, filters[option.key] || '', handleFilterChange);
                if (customFilter) {
                  return <div key={option.key}>{customFilter}</div>;
                }
              }
              
              // Default filter rendering
              return (
                <div key={option.key} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {option.label}
                  </label>
                  {option.type === 'select' ? (
                    <Select
                      value={String(filters[option.key] || '')}
                      onValueChange={(value) => handleFilterChange(option.key, value)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder={option.placeholder || option.label} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {option.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-sm">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={option.type}
                      placeholder={option.placeholder || option.label}
                      value={String(filters[option.key] || '')}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      className="h-9 text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <div className="flex justify-end mt-4 pt-4 border-t border-muted-foreground/20">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-3 h-3 ml-1" />
                مسح الفلاتر
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  );

  // Render table content
  const renderTableContent = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {expandableRows && <TableHead className="w-8" />}
              {columns.map((column, index) => (
                <TableHead key={index} className="font-semibold text-sm h-12 px-4 text-right">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (expandableRows ? 1 : 0)}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner size="lg" />
                    <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (expandableRows ? 1 : 0)}
                  className="text-center py-12 text-muted-foreground text-sm"
                >
                  لا توجد بيانات للعرض
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, rowIndex) => {
                const rowKey = getRowKey ? getRowKey(record, rowIndex) : rowIndex;
                const canExpand = expandableRows && (rowHasExpand ? rowHasExpand(record) : !!expandedRowRender);
                const isExpanded = expandedRow === rowKey;
                return (
                  <React.Fragment key={rowKey}>
                    <TableRow
                      className={`hover:bg-muted/20 h-14 ${canExpand ? 'cursor-pointer' : ''}`}
                      onClick={() => canExpand ? setExpandedRow(isExpanded ? null : rowKey) : undefined}
                    >
                      {expandableRows && (
                        <TableCell className="w-8 text-center align-middle">
                          {canExpand ? (
                            <span className="inline-block">
                              {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                          ) : null}
                        </TableCell>
                      )}
                      {columns.map((column, colIndex) => {
                        const value = getValue(record, column.key);
                        return (
                          <TableCell key={colIndex} className="py-3 px-4 text-sm text-right">
                            {column.render ? column.render(value, record) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {canExpand && isExpanded && expandedRowRender && (
                      <TableRow>
                        <TableCell colSpan={columns.length + 1} className="bg-muted/10 p-0">
                          {expandedRowRender(record)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {renderSearchBar()}
        {renderFilterPanel()}
        {renderTableContent()}

        {/* Enhanced Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-sm text-muted-foreground">
              عرض {((pagination.current_page - 1) * pagination.per_page) + 1} إلى{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} من{' '}
              {pagination.total} نتيجة
            </div>
            
            <div className="flex items-center space-x-1 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(1)}
                disabled={pagination.current_page === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="h-8 px-3 text-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-1 space-x-reverse">
                {Array.from({ length: Math.min(3, pagination.last_page) }, (_, i) => {
                  const page = Math.max(1, pagination.current_page - 1) + i;
                  if (page > pagination.last_page) return null;
                  return (
                    <Button
                      key={page}
                      variant={pagination.current_page === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(page)}
                      className={`h-8 w-8 p-0 text-sm ${
                        pagination.current_page === page ? "bg-primary hover:bg-primary/90" : ""
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="h-8 px-3 text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.last_page)}
                disabled={pagination.current_page === pagination.last_page}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
