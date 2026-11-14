'use client';

import { BusinessScope } from '../../../../features/workspace/components/BusinessScope.tsx';

export default function BusinessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <BusinessScope>{children}</BusinessScope>;
}
