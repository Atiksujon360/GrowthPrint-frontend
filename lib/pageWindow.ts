/**
 * Page numbers to show in numbered pagination: always the first and last page, the current page and its
 * neighbours, with 'gap' markers where pages are skipped. Example (current 6 of 12): 1 … 5 6 7 … 12.
 */
export type PageToken = number | 'gap';

export function pageWindow(current: number, total: number, neighbours = 1): PageToken[] {
  const last = Math.max(1, total);
  const page = Math.min(Math.max(1, current), last);
  const pages = new Set<number>([1, last]);
  for (let p = page - neighbours; p <= page + neighbours; p++) if (p >= 1 && p <= last) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  const out: PageToken[] = [];
  sorted.forEach((p, i) => {
    if (i > 0) {
      const gap = p - sorted[i - 1];
      if (gap === 2) out.push(p - 1); // a single hidden page is shown instead of a gap
      else if (gap > 2) out.push('gap');
    }
    out.push(p);
  });
  return out;
}
