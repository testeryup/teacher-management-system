import React from 'react';
import { Button } from "@/components/ui/button";

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function SimplePagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: SimplePaginationProps) {
  // Always show pagination for testing purposes, comment out the return null
  // if (totalPages <= 1) return null;

  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Hiển thị {from} đến {to} trong tổng số {totalItems} kết quả
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 rounded-md text-sm hover:bg-muted"
        >
          Trước
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(i + 1)}
            className={`px-3 py-1 rounded-md text-sm ${
              currentPage === i + 1
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 rounded-md text-sm hover:bg-muted"
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
