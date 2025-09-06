
'use client';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SourceProvider } from '@/context/source-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SourceProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </SourceProvider>
  );
}
