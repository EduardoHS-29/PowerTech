import type { PaginationParams } from "@/lib/types";
import {
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_DEFAULT_PER_PAGE,
  PAGINATION_MAX_PER_PAGE,
} from "@/lib/constants";

export function parsePaginationParams(
  page?: string | string[],
  perPage?: string | string[]
): PaginationParams {
  const parsedPage = Math.max(
    1,
    parseInt(Array.isArray(page) ? page[0] : (page ?? "1"), 10) ||
      PAGINATION_DEFAULT_PAGE
  );
  const parsedPerPage = Math.min(
    PAGINATION_MAX_PER_PAGE,
    Math.max(
      1,
      parseInt(
        Array.isArray(perPage) ? perPage[0] : (perPage ?? "10"),
        10
      ) || PAGINATION_DEFAULT_PER_PAGE
    )
  );
  return { page: parsedPage, perPage: parsedPerPage };
}

export function calculatePaginationMeta(
  total: number,
  { page, perPage }: PaginationParams
) {
  return {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

export function getStringParam(
  value: string | string[] | undefined
): string | undefined {
  if (!value) return undefined;
  const str = Array.isArray(value) ? value[0] : value;
  return str?.trim() || undefined;
}

// Date-only ISO strings (YYYY-MM-DD) are treated as UTC midnight by `new Date()`,
// which shifts the displayed day in UTC-negative timezones (e.g. Brazil = UTC-3).
// Parse them as local midnight instead.
function parseDate(date: Date | string): Date {
  if (date instanceof Date) return date;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(date);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseDate(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parseDate(date));
}

export function toDateInputValue(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split("T")[0];
}

export function formatPotencia(kw: number): string {
  if (kw >= 1000) {
    return `${(kw / 1000).toFixed(1)} MW`;
  }
  return `${kw} kW`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
