'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navItems } from '@/config/nav-config';
import { useFilteredNavItems } from '@/hooks/use-nav';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { ThemeSelector } from '../themes/theme-selector';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';

/**
 * AppSidebar Component
 * 
 * Main application sidebar with the following features:
 * - Collapsible functionality (icon-only mode)
 * - Role-based navigation items
 * - Active item highlighting with animation
 * - Icon-only mode with tooltips
 * - Theme selector at bottom
 * 
 * Requirements: 2.1, 2.5, 2.6, 2.7
 */
export default function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const filteredItems = useFilteredNavItems(navItems);

  // Check if sidebar is collapsed (icon-only mode)
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible='icon' className='border-r hidden md:flex'>
      {/* Header with logo and title */}
      <SidebarHeader className='border-b'>
        <div className='flex items-center gap-2 px-4 py-3'>
          <Icons.logo className='h-6 w-6 shrink-0' />
          {!isCollapsed && (
            <span className='font-semibold text-sm truncate'>
              Creditcoin Invoice
            </span>
          )}
        </div>
      </SidebarHeader>

      {/* Main navigation content */}
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarMenu>
            {filteredItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              const isActive = pathname === item.url;

              return (
                <SidebarMenuItem key={item.title}>
                  {isCollapsed ? (
                    // Icon-only mode with tooltip
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              'transition-all duration-200',
                              isActive && 'bg-accent text-accent-foreground'
                            )}
                          >
                            <Link href={item.url}>
                              <Icon className={cn(
                                'transition-transform duration-200',
                                isActive && 'scale-110'
                              )} />
                              <span className='sr-only'>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side='right' className='flex items-center gap-2'>
                          {item.title}
                          {item.shortcut && (
                            <span className='ml-auto text-xs text-muted-foreground'>
                              {item.shortcut.join(' ')}
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    // Expanded mode
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'transition-all duration-200',
                        isActive && 'bg-accent text-accent-foreground font-medium'
                      )}
                    >
                      <Link href={item.url} className='flex items-center gap-3'>
                        <Icon className={cn(
                          'transition-transform duration-200',
                          isActive && 'scale-110'
                        )} />
                        <span className='flex-1'>{item.title}</span>
                        {item.label && (
                          <span className='ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full'>
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with theme controls */}
      <SidebarFooter className='border-t'>
        <div className='p-2 space-y-2'>
          {/* Theme selector and mode toggle */}
          {!isCollapsed ? (
            <div className='space-y-2'>
              <div className='px-2'>
                <p className='text-xs text-muted-foreground mb-2'>Theme</p>
                <ThemeSelector />
              </div>
              <Separator />
              <div className='flex items-center justify-between px-2'>
                <span className='text-xs text-muted-foreground'>Mode</span>
                <ThemeModeToggle />
              </div>
            </div>
          ) : (
            // Icon-only mode: show tooltips for theme controls
            <div className='flex flex-col items-center gap-2'>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='w-full flex justify-center'>
                      <ThemeModeToggle />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    Toggle theme mode
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </SidebarFooter>

      {/* Rail for resizing */}
      <SidebarRail />
    </Sidebar>
  );
}
