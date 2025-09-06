'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookCopy,
  LayoutDashboard,
  MessageCircleQuestion,
  Newspaper,
  Settings,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/qa', icon: MessageCircleQuestion, label: 'Q&A' },
  { href: '/newsletter', icon: Newspaper, label: 'Newsletter' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <Sidebar
      className="border-r"
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Logo className="size-8 text-primary" />
          <div className={cn("flex flex-col", state === 'collapsed' && 'hidden')}>
            <span className="font-semibold text-lg tracking-tight font-headline">NewsFlash AI</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  asChild
                >
                  <span>
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/100" alt="User Avatar" data-ai-hint="person face" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col", state === 'collapsed' && 'hidden')}>
                <span className="text-sm font-medium text-foreground/90">Marketing Team</span>
                <span className="text-xs text-muted-foreground">demo@example.com</span>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
