/**
 * Universal Utility Functions for GrowthPrint Agency OS
 * Production-ready formatting, clipboard, CSV/JSON export, storage, and helpers.
 */

/**
 * Combines conditional class names into a single string.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a monetary number into a localized currency string.
 * @example formatCurrency(13475) => "$13,475"
 * @example formatCurrency(18500, 'USD', true) => "$18.5k"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  compact: boolean = false
): string {
  if (isNaN(amount)) return '$0';

  if (compact && Math.abs(amount) >= 1000) {
    const thousands = amount / 1000;
    return `$${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a date string, Date object, or timestamp into human-readable relative time.
 * @example formatRelativeTime('2026-10-19T18:00:00Z') => "2 hours ago"
 */
export function formatRelativeTime(dateInput: string | Date | number): string {
  if (!dateInput) return 'just now';

  const date = typeof dateInput === 'string' || typeof dateInput === 'number' 
    ? new Date(dateInput) 
    : dateInput;

  if (isNaN(date.getTime())) return 'recently';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Future dates
  if (diffInSeconds < -30) {
    const futureSeconds = Math.abs(diffInSeconds);
    if (futureSeconds < 60) return 'in a few seconds';
    if (futureSeconds < 3600) return `in ${Math.floor(futureSeconds / 60)}m`;
    if (futureSeconds < 86400) return `in ${Math.floor(futureSeconds / 3600)}h`;
    return `in ${Math.floor(futureSeconds / 86400)}d`;
  }

  // Past dates
  if (diffInSeconds < 45) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'yesterday';
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats dates into clean, standardized displays.
 */
export function formatDate(
  dateInput: string | Date | number,
  formatStyle: 'short' | 'medium' | 'long' | 'iso' = 'medium'
): string {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' 
    ? new Date(dateInput) 
    : dateInput;

  if (isNaN(date.getTime())) return 'Invalid date';

  switch (formatStyle) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    case 'long':
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    case 'iso':
      return date.toISOString().split('T')[0];
    case 'medium':
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Formats hours into clear representation.
 * @example formatHours(8.5) => "8.5 hrs"
 */
export function formatHours(hours: number): string {
  if (isNaN(hours)) return '0 hrs';
  return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)} hrs`;
}

/**
 * Formats file bytes into clean readable sizes.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Truncates text with trailing ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Converts a name or multi-word string into uppercase initials (max 2 characters).
 */
export function getInitials(name: string): string {
  if (!name) return 'GP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Converts a string to URL-safe slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Robust copy-to-clipboard function that works in iframes and older browsers.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Modern navigator.clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Fallback using textarea selection
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Exports an array of records to a downloadable CSV file directly in the browser.
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columns?: { key: keyof T; label: string }[]
): void {
  if (!rows || rows.length === 0) return;

  const cols = columns || Object.keys(rows[0]).map(k => ({ key: k, label: k }));

  // Header row
  const headerLine = cols.map(c => `"${String(c.label).replace(/"/g, '""')}"`).join(',');

  // Data rows
  const dataLines = rows.map(row => {
    return cols
      .map(c => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Exports an object or array to a downloadable JSON file.
 */
export function exportToJson(filename: string, data: any): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Safe LocalStorage wrapper with in-memory fallback for sandboxed environments.
 */
class SafeStorage {
  private memoryStore = new Map<string, string>();
  private isAvailable: boolean;

  constructor() {
    try {
      if (typeof window === 'undefined') {
        this.isAvailable = false;
        return;
      }
      const testKey = '__gp_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      this.isAvailable = true;
    } catch {
      this.isAvailable = false;
    }
  }

  getItem<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const raw = this.isAvailable 
        ? window.localStorage.getItem(key) 
        : this.memoryStore.get(key) || null;

      if (!raw) return defaultValue ?? null;
      return JSON.parse(raw);
    } catch {
      return defaultValue ?? null;
    }
  }

  setItem(key: string, value: any): boolean {
    try {
      const serialized = JSON.stringify(value);
      if (this.isAvailable) {
        window.localStorage.setItem(key, serialized);
      } else {
        this.memoryStore.set(key, serialized);
      }
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string): boolean {
    try {
      if (this.isAvailable) {
        window.localStorage.removeItem(key);
      } else {
        this.memoryStore.delete(key);
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const safeStorage = new SafeStorage();

export const storage = {
  get: <T>(key: string, defaultValue: T): T => safeStorage.getItem(key, defaultValue) ?? defaultValue,
  set: (key: string, value: unknown) => safeStorage.setItem(key, value),
  remove: (key: string) => safeStorage.removeItem(key)
};

/**
 * Debounce helper for search inputs and rapid triggers.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
}
