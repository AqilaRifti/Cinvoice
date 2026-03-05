'use client';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { navItems } from '@/config/nav-config';
import { useFilteredNavItems } from '@/hooks/use-nav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * MobileBottomNav Component
 * 
 * Bottom navigation bar for mobile devices with key actions.
 * Displays on screens smaller than 768px (mobile breakpoint).
 * 
 * Features:
 * - Fixed position at bottom of screen
 * - Icon-based navigation with labels
 * - Active state highlighting
 * - Touch-friendly targets (44x44px minimum)
 * 
 * Requirements: 11.2, 11.6
 */
export function MobileBottomNav() {
    const pathname = usePathname();
    const filteredItems = useFilteredNavItems(navItems);

    // Only show on mobile (hidden on md and above)
    return (
        <nav className='fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden'>
            <div className='flex items-center justify-around px-2 py-2'>
                {filteredItems.slice(0, 4).map((item) => {
                    const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                    const isActive = pathname === item.url;

                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors touch-manipulation',
                                isActive
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-5 w-5 transition-transform',
                                    isActive && 'scale-110'
                                )}
                            />
                            <span className='text-xs font-medium truncate max-w-[60px]'>
                                {item.title.split(' ')[0]}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
