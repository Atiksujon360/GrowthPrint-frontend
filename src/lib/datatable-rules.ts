/**
 * Pure helper functions for the reusable DataTable:
 * - Sorting with support for strings, numbers, dates, and nulls
 * - Pagination math and window calculations
 * - Multi-field text filtering and status filtering
 */

export type SortDirection = 'asc' | 'desc';

/**
 * Compares two values safely for ascending order
 */
export function compareValues(a: any, b: any): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  // Number comparison
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Date comparison if string matches ISO date format
  if (typeof a === 'string' && typeof b === 'string') {
    const isDateA = /^\d{4}-\d{2}-\d{2}/.test(a);
    const isDateB = /^\d{4}-\d{2}-\d{2}/.test(b);
    if (isDateA && isDateB) {
      const timeA = new Date(a).getTime();
      const timeB = new Date(b).getTime();
      if (!isNaN(timeA) && !isNaN(timeB)) {
        return timeA - timeB;
      }
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }

  // Boolean
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return (a ? 1 : 0) - (b ? 1 : 0);
  }

  return String(a).localeCompare(String(b));
}

/**
 * Sorts an array of items by a specific key or accessor
 */
export function sortRows<T>(
  items: T[],
  sortKey: keyof T | string | null,
  direction: SortDirection = 'asc',
  customAccessor?: (item: T) => any
): T[] {
  if (!sortKey && !customAccessor) return [...items];

  const sorted = [...items].sort((rowA, rowB) => {
    const valA = customAccessor ? customAccessor(rowA) : (rowA as any)[sortKey as string];
    const valB = customAccessor ? customAccessor(rowB) : (rowB as any)[sortKey as string];
    const comparison = compareValues(valA, valB);
    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export interface PaginationResult<T> {
  paginatedRows: T[];
  totalRows: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Computes pagination slice and metadata
 */
export function paginateRows<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginationResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const totalRows = items.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / safePageSize));
  const validPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (validPage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, totalRows);
  const paginatedRows = items.slice(startIndex, endIndex);

  return {
    paginatedRows,
    totalRows,
    totalPages,
    currentPage: validPage,
    pageSize: safePageSize,
    startIndex: totalRows > 0 ? startIndex + 1 : 0,
    endIndex,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1
  };
}

/**
 * Filters rows based on status and search query across specified keys
 */
export function filterRows<T>(
  items: T[],
  options: {
    statusKey?: keyof T;
    selectedStatus?: string;
    searchQuery?: string;
    searchKeys?: (keyof T)[];
  }
): T[] {
  const { statusKey, selectedStatus, searchQuery, searchKeys } = options;
  const cleanQuery = searchQuery?.trim().toLowerCase();

  return items.filter((item) => {
    // 1. Status Filter
    if (statusKey && selectedStatus && selectedStatus !== 'ALL') {
      const itemStatus = String((item as any)[statusKey]);
      if (itemStatus !== selectedStatus) {
        return false;
      }
    }

    // 2. Search Query Filter
    if (cleanQuery) {
      if (searchKeys && searchKeys.length > 0) {
        const matchesAnyKey = searchKeys.some((k) => {
          const val = (item as any)[k];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(cleanQuery);
        });
        if (!matchesAnyKey) return false;
      } else {
        // Fallback: search all primitive values in object
        const values = Object.values(item as any);
        const matches = values.some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(cleanQuery);
        });
        if (!matches) return false;
      }
    }

    return true;
  });
}
