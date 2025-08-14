
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
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
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onSort,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getValue = (record: T, key: keyof T | string) => {
    if (typeof key === 'string' && key.includes('.')) {
      const keys = key.split('.');
      let value: any = record;
      for (const k of keys) {
        value = value?.[k];
      }
      return value;
    }
    return record[key as keyof T];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((column, index) => (
                <TableHead key={index} className="font-semibold text-gray-900">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-500"
                >
                  لا توجد بيانات للعرض
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => {
                    const value = getValue(record, column.key);
                    return (
                      <TableCell key={colIndex}>
                        {column.render ? column.render(value, record) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            عرض {((pagination.current_page - 1) * pagination.per_page) + 1} إلى{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} من{' '}
            {pagination.total} نتيجة
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(1)}
              disabled={pagination.current_page === 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            
            <div className="flex items-center space-x-1 space-x-reverse">
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={pagination.current_page === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange?.(page)}
                    className={pagination.current_page === page ? "bg-gaza-green hover:bg-gaza-green/90" : ""}
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
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.last_page)}
              disabled={pagination.current_page === pagination.last_page}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
