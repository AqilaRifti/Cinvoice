import { CommandPaletteProvider } from '@/components/layout/command-palette-provider';
import AppSidebar from '@/components/layout/app-sidebar';
import HeaderWithMobile from '@/components/layout/header-with-mobile';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <CommandPaletteProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <InfobarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset>
            <HeaderWithMobile />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
          <InfoSidebar side='right' />
          {/* Mobile bottom navigation - only visible on mobile */}
          <MobileBottomNav />
        </InfobarProvider>
      </SidebarProvider>
    </CommandPaletteProvider>
  );
}
