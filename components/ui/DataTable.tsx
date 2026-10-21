import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Inbox,
  Download
} from 'lucide-react';
import { 
  sortRows, 
  paginateRows, 
  filterRows, 
  type SortDirection 
} from '../../lib/datatable-rules.ts';
import { exportToCsv } from '../../lib/utils.ts';

export interface ColumnDef<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (info: { row: T; value: any; index: number }) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface StatusFilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor?: (item: T, index: number) => string;
  
  // Status filtering
  statusFilter?: {
    statusKey?: keyof T;
    options: StatusFilterOption[];
    value: string;
    onChange: (val: string) => void;
    label?: string;
  };

  // Search
  searchConfig?: {
    placeholder?: string;
    searchKeys?: (keyof T)[];
    defaultValue?: string;
  };

  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];
  serverSide?: boolean;
  page?: number;
  totalCount?: number;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newSize: number) => void;

  // Sorting
  defaultSortKey?: string;
  defaultSortDirection?: SortDirection;
  onSortChange?: (key: string, direction: SortDirection) => void;

  // Interactivity & Presentation
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
  actionsSlot?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showExport?: boolean;
  exportFilename?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor = (item, idx) => (item as any).id || String(idx),
  statusFilter,
  searchConfig,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  serverSide = false,
  page: externalPage,
  totalCount: externalTotalCount,
  onPageChange,
  onPageSizeChange,
  defaultSortKey,
  defaultSortDirection = 'asc',
  onSortChange,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No matching records found',
  emptySubtext = 'Try adjusting your search query or status filter.',
  actionsSlot,
  title,
  subtitle,
  showExport = true,
  exportFilename
}: DataTableProps<T>) {
  // Client-side search and sort state
  const [internalSearch, setInternalSearch] = useState(searchConfig?.defaultValue || '');
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [internalPage, setInternalPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Active page resolution
  const currentPage = serverSide && externalPage !== undefined ? externalPage : internalPage;

  // 1. Client-Side Filtering
  const filteredData = useMemo(() => {
    if (serverSide) return data;

    return filterRows(data, {
      statusKey: statusFilter?.statusKey,
      selectedStatus: statusFilter?.value,
      searchQuery: internalSearch,
      searchKeys: searchConfig?.searchKeys
    });
  }, [data, serverSide, statusFilter?.statusKey, statusFilter?.value, internalSearch, searchConfig?.searchKeys]);

  // 2. Client-Side Sorting
  const sortedData = useMemo(() => {
    if (serverSide || !sortKey) return filteredData;

    const matchedCol = columns.find(c => c.id === sortKey || c.accessorKey === sortKey);
    return sortRows(filteredData, sortKey, sortDirection, matchedCol?.accessorFn);
  }, [filteredData, serverSide, sortKey, sortDirection, columns]);

  // 3. Client-Side Pagination
  const paginationResult = useMemo(() => {
    if (serverSide) {
      const total = externalTotalCount !== undefined ? externalTotalCount : data.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const startIndex = total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
      const endIndex = Math.min(startIndex + pageSize - 1, total);
      return {
        paginatedRows: data,
        totalRows: total,
        totalPages,
        currentPage,
        pageSize,
        startIndex,
        endIndex,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      };
    }

    return paginateRows(sortedData, currentPage, pageSize);
  }, [sortedData, serverSide, data, externalTotalCount, pageSize, currentPage]);

  // Handlers
  const handleSort = (columnId: string, isSortable?: boolean) => {
    if (!isSortable) return;

    let newDirection: SortDirection = 'asc';
    if (sortKey === columnId) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortKey(columnId);
    setSortDirection(newDirection);

    if (onSortChange) {
      onSortChange(columnId, newDirection);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (serverSide) {
      if (onPageChange) onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setInternalPage(1);
    if (onPageSizeChange) onPageSizeChange(newSize);
  };

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    setInternalPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-4">
        {/* Optional Title row */}
        {(title || actionsSlot) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {title && (
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{title}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
                    {paginationResult.totalRows}
                  </span>
                </h3>
              )}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-2">
              {showExport && filteredData.length > 0 && (
                <button
                  type="button"
                  onClick={() => exportToCsv(exportFilename || title || 'agency-export', filteredData)}
                  title="Export filtered records to CSV"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export CSV</span>
                </button>
              )}
              {actionsSlot}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={internalSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchConfig?.placeholder || 'Search by keyword, client, or tag...'}
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors"
            />
            {internalSearch && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Filter Segmented Buttons */}
          {statusFilter && statusFilter.options.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 max-w-full overflow-x-auto">
              {statusFilter.options.map((opt) => {
                const isActive = statusFilter.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      statusFilter.onChange(opt.value);
                      setInternalPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                        isActive ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {opt.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table Body Area */}
      <div className="overflow-x-auto min-h-[220px] relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/90 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              {columns.map((col) => {
                const isSorted = sortKey === col.id || sortKey === col.accessorKey;
                const canSort = col.sortable !== false;
                const alignClass = 
                  col.align === 'right' 
                    ? 'text-right' 
                    : col.align === 'center' 
                    ? 'text-center' 
                    : 'text-left';

                return (
                  <th
                    key={col.id}
                    style={{ width: col.width }}
                    onClick={() => handleSort(col.id, canSort)}
                    className={`px-4 py-3 select-none ${alignClass} ${
                      canSort ? 'cursor-pointer hover:bg-slate-100/70 transition-colors' : ''
                    } ${col.className || ''}`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.header}</span>
                      {canSort && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300 hover:text-slate-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((c, cIdx) => (
                    <td key={cIdx} className="px-4 py-4">
                      <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginationResult.paginatedRows.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">{emptyMessage}</div>
                    <p className="text-[11px] text-slate-500">{emptySubtext}</p>
                    {internalSearch && (
                      <button
                        onClick={() => handleSearchChange('')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline pt-1"
                      >
                        Reset search filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              paginationResult.paginatedRows.map((row, rIdx) => {
                const rowKey = keyExtractor(row, rIdx);
                const isClickable = Boolean(onRowClick);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      isClickable ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {columns.map((col) => {
                      const rawValue = col.accessorFn 
                        ? col.accessorFn(row) 
                        : col.accessorKey 
                        ? row[col.accessorKey] 
                        : undefined;

                      const renderedContent = col.cell 
                        ? col.cell({ row, value: rawValue, index: rIdx }) 
                        : rawValue !== null && rawValue !== undefined 
                        ? String(rawValue) 
                        : '—';

                      const alignClass = 
                        col.align === 'right' 
                          ? 'text-right' 
                          : col.align === 'center' 
                          ? 'text-center' 
                          : 'text-left';

                      return (
                        <td
                          key={col.id}
                          className={`px-4 py-3.5 align-middle ${alignClass} ${col.className || ''}`}
                        >
                          {renderedContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div>
            Showing <strong className="text-slate-800 tabular-nums">{paginationResult.startIndex}</strong> to{' '}
            <strong className="text-slate-800 tabular-nums">{paginationResult.endIndex}</strong> of{' '}
            <strong className="text-slate-800 tabular-nums">{paginationResult.totalRows}</strong> records
          </div>

          {/* Rows per page dropdown */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-xs">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!paginationResult.hasPrevPage}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
            title="Previous page"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Compact page pill */}
          <span className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg tabular-nums">
            Page {paginationResult.currentPage} of {paginationResult.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!paginationResult.hasNextPage}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
            title="Next page"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
