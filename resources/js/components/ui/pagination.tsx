import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  links: PaginationLink[];
  from: number;
  to: number;
  total: number;
}

export function Pagination({ links, from, to, total }: PaginationProps) {
  // Nếu không có links hoặc chỉ có 1 trang thì không hiển thị phân trang
  if (!links || links.length <= 3 || total <= 10) return null;

  // Loại bỏ nút Previous và Next để hiển thị riêng
  const pageLinks = links.slice(1, -1);
  const prevLink = links[0];
  const nextLink = links[links.length - 1];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-muted-foreground">
        Hiển thị <span className="font-medium">{from}</span> đến <span className="font-medium">{to}</span> trong tổng số <span className="font-medium">{total}</span> kết quả
      </div>
      <div className="flex items-center space-x-2">
        {prevLink.url ? (
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href={prevLink.url}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </Link>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            disabled
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Trước
          </Button>
        )}

        <div className="hidden sm:flex space-x-2">
          {pageLinks.map((link, i) => {
            return link.url ? (
              <Button
                key={i}
                variant={link.active ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={link.url}>
                  <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Link>
              </Button>
            ) : (
              <Button
                key={i}
                variant="outline"
                size="sm"
                disabled
              >
                <span dangerouslySetInnerHTML={{ __html: link.label }} />
              </Button>
            );
          })}
        </div>

        {nextLink.url ? (
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href={nextLink.url}>
              Tiếp
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            disabled
          >
            Tiếp
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
