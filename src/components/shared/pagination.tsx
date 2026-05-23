"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  perPage,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  const pages = buildPageNumbers(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{start}</span> a{" "}
          <span className="font-medium">{end}</span> de{" "}
          <span className="font-medium">{total}</span> resultados
        </p>
        <nav className="flex items-center gap-1">
          <PaginationButton
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            ‹
          </PaginationButton>

          {pages.map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                …
              </span>
            ) : (
              <PaginationButton
                key={page}
                onClick={() => goToPage(page as number)}
                active={page === currentPage}
              >
                {page}
              </PaginationButton>
            )
          )}

          <PaginationButton
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            ›
          </PaginationButton>
        </nav>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-medium transition-colors",
        active
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-gray-100",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {children}
    </button>
  );
}

function buildPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}
