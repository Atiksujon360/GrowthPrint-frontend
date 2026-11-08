'use client';

import Link from 'next/link';
import type { Activity } from '../model/types.ts';
import { formatRelative } from '../model/format.ts';
import { initialsOf } from '../../../lib/access.ts';

export function ActivityList({ items, businessHome }: { items: Activity[]; businessHome: string }) {
  if (items.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-ink-500">No activity yet. Changes to clients, leads and the team appear here.</p>;
  }
  return (
    <ol className="divide-y divide-ink-100">
      {items.map(a => {
        const body = (
          <>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[10px] font-semibold text-ink-700" aria-hidden="true">
              {initialsOf(a.actorName)}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="text-ink-900">{a.message}</span>
              <span className="block text-xs text-ink-500">{a.actorName} · <time dateTime={a.createdAt}>{formatRelative(a.createdAt)}</time></span>
            </span>
          </>
        );
        return (
          <li key={a.id}>
            {a.link
              ? <Link href={`${businessHome}${a.link}`} className="flex items-start gap-3 px-5 py-3 hover:bg-ink-50">{body}</Link>
              : <div className="flex items-start gap-3 px-5 py-3">{body}</div>}
          </li>
        );
      })}
    </ol>
  );
}
