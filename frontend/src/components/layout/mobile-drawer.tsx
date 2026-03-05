'use client';

import { Icons } from '@/components/icons';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { navItems } from '@/config/nav-config';
import { useFilteredNavItems } from '@/hooks/use-nav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSelector } from '@/components/themes/theme-selector';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';

/**
 * MobileDrawer Component
 * 
 * Drawer menu for mobile navigation with full navigation items.
 * Opens from the left side on mobile devices.
 * 
 * Features:
 * - Full navigation menu
 * - Active item highlighting
 * - Theme controls
 * - Touch-friendly interface
 * 
 * Requirements: 11.2, 11.8
 */
interface MobileDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
    const pathname = usePathname();
    const filteredItems = useFilteredNavItems(navItems);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side='left' className='w-[280px] p-0'>
                <SheetHeader className='border-b p-4'>
                    <div className='flex items-center gap-2'>
                        <Icons.logo className='h-6 w-6' />
                        <SheetTitle className='text-sm font-semibold'>
                            Creditcoin Invoice
                        </SheetTitle>
                    </div>
                    <SheetDescription className='sr-only'>
                        Navigation menu
                    </SheetDescription>
                </SheetHeader>

                <div className='flex flex-col h-[calc(100vh-80px)]'>
                    {/* Navigation items */}
                    <nav className='flex-1 overflow-y-auto p-4'>
                        <div className='space-y-1'>
                            <p className='text-xs font-medium text-muted-foreground mb-2 px-2'>
                                Dashboards
                            </p>
                            {filteredItems.map((item) => {
                                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                                const isActive = pathname === item.url;

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.url}
                                        onClick={() => onOpenChange(false)}
                                        className={cn(
                                            'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 transition-all touch-manipulation',
                                            isActive
                                                ? 'bg-accent text-accent-foreground font-medium'
                                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'h-5 w-5 transition-transform',
                                                isActive && 'scale-110'
                                            )}
                                        />
                                        <span className='flex-1'>{item.title}</span>
                                        {item.label && (
                                            <span className='text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full'>
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Theme controls */}
                    <div className='border-t p-4 space-y-3'>
                        <div>
                            <p className='text-xs font-medium text-muted-foreground mb-2'>
                                Theme
                            </p>
                            <ThemeSelector />
                        </div>
                        <Separator />
                        <div className='flex items-center justify-between'>
                            <span className='text-xs font-medium text-muted-foreground'>
                                Mode
                            </span>
                            <ThemeModeToggle />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
