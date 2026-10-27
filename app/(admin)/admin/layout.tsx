'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '../../../store/hooks.ts';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isSessionValidating } = useAppSelector(state => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  // Don't protect the login page itself
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoginPage) return;
    if (!isSessionValidating && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isSessionValidating, router, isMounted, isLoginPage]);

  if (!isMounted || isSessionValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFD]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  return <>{children}</>;
}
