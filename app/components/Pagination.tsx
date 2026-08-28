"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show (e.g. 1 2 3 4 5)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        start = 1;
        end = 5;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#2d4734] text-xs text-[#a39b8b]">
      {/* Left: Total Items & Items Per Page Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span>แสดงจำนวน:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1); // Reset to page 1 when pageSize changes
            }}
            className="bg-[#121c15] text-[#f3efe6] px-2.5 py-1.5 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3] font-medium"
          >
            <option value={10}>10 รายการ/หน้า</option>
            <option value={25}>25 รายการ/หน้า</option>
            <option value={50}>50 รายการ/หน้า</option>
            <option value={100}>100 รายการ/หน้า</option>
          </select>
        </div>

        <span>
          แสดง <strong className="text-[#f3efe6] font-semibold">{startItem} - {endItem}</strong> จากทั้งหมด{" "}
          <strong className="text-[#98c9a3] font-bold">{totalItems}</strong> รายการ
        </span>
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#18241c] border border-[#2d4734] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="หน้าแรกสุด"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#18241c] border border-[#2d4734] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="หน้าก่อนหน้า"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-[#a39b8b]">
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-[32px] px-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#98c9a3] text-[#0f1712] border border-[#98c9a3] shadow-md"
                    : "bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#18241c] border border-[#2d4734]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#18241c] border border-[#2d4734] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="หน้าถัดไป"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#18241c] border border-[#2d4734] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="หน้าสุดท้าย"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
