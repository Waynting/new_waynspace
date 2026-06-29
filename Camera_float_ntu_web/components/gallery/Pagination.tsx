"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  folderName: string;
}

export function Pagination({ currentPage, totalPages, folderName }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    // 将 folderName 分割成数组以正确构建 URL
    const folderPath = folderName.split("/").map(segment => encodeURIComponent(segment)).join("/");
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/folder/${folderPath}?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  // 计算要显示的页码
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // 如果总页数少于等于7，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);
      
      if (currentPage <= 4) {
        // 当前页在前4页
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // 当前页在后4页
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 mt-8 py-6">
      {/* 分页信息 */}
      <div className="text-sm text-muted-foreground">
        第 {currentPage} 頁，共 {totalPages} 頁
      </div>

      {/* 分页按钮 */}
      <div className="flex items-center gap-1">
        {/* 第一页按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
          aria-label="第一页"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* 上一页按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
          aria-label="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 页码按钮 */}
        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className={cn(
                  "h-9 min-w-9 px-3 transition-all",
                  isActive && "font-semibold shadow-md"
                )}
                aria-label={`第 ${pageNum} 页`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* 下一页按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
          aria-label="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 最后一页按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
          aria-label="最后一页"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

