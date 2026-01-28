
'use client';

import * as React from 'react';
import { AppSidebar, AppSidebarTrigger } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SourceProvider } from '@/context/source-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthProvider } from '@/context/auth-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <AuthProvider>
      <SourceProvider>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <SidebarInset className="flex-1 flex flex-col">
              {hasMounted && isMobile && (
                <header className="flex items-center p-4 border-b">
                  <AppSidebarTrigger />
                </header>
              )}
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </SourceProvider>
    </AuthProvider>
  );
}
