'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut
} from '@/components/ui/command';
import {
    IconDashboard,
    IconBriefcase,
    IconShieldCheck,
    IconFileInvoice,
    IconShoppingCart,
    IconWallet,
    IconChartBar,
    IconSettings,
    IconHome,
    IconSearch,
    IconPlus
} from '@tabler/icons-react';
import { useFilteredNavItems } from '@/hooks/use-nav';
import { navItems } from '@/config/nav-config';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const router = useRouter();
    const filteredItems = useFilteredNavItems(navItems);
    const [searchQuery, setSearchQuery] = React.useState('');

    const handleSelect = React.useCallback(
        (callback: () => void) => {
            onOpenChange(false);
            setSearchQuery('');
            callback();
        },
        [onOpenChange]
    );

    // Icon mapping for navigation items
    const iconMap: Record<string, React.ReactNode> = {
        dashboard: <IconDashboard className='h-4 w-4' />,
        workspace: <IconBriefcase className='h-4 w-4' />,
        account: <IconShieldCheck className='h-4 w-4' />,
        invoice: <IconFileInvoice className='h-4 w-4' />,
        marketplace: <IconShoppingCart className='h-4 w-4' />,
        portfolio: <IconWallet className='h-4 w-4' />,
        analytics: <IconChartBar className='h-4 w-4' />,
        settings: <IconSettings className='h-4 w-4' />,
        home: <IconHome className='h-4 w-4' />
    };

    // Quick actions based on user role
    const quickActions = [
        {
            title: 'Go to Home',
            icon: <IconHome className='h-4 w-4' />,
            action: () => router.push('/'),
            shortcut: '⌘H',
            keywords: 'home landing page'
        },
        {
            title: 'Create Invoice',
            icon: <IconPlus className='h-4 w-4' />,
            action: () => router.push('/dashboard/smb'),
            shortcut: '⌘N',
            keywords: 'new invoice mint create smb'
        },
        {
            title: 'Browse Marketplace',
            icon: <IconShoppingCart className='h-4 w-4' />,
            action: () => router.push('/dashboard/investor'),
            shortcut: '⌘M',
            keywords: 'marketplace invest buy invoices'
        },
        {
            title: 'View Portfolio',
            icon: <IconWallet className='h-4 w-4' />,
            action: () => router.push('/dashboard/investor'),
            shortcut: '⌘P',
            keywords: 'portfolio investments my invoices'
        },
        {
            title: 'Platform Analytics',
            icon: <IconChartBar className='h-4 w-4' />,
            action: () => router.push('/dashboard/admin'),
            shortcut: '⌘A',
            keywords: 'analytics stats metrics admin'
        }
    ];

    // Filter quick actions based on search query
    const filteredQuickActions = React.useMemo(() => {
        if (!searchQuery) return quickActions;

        const query = searchQuery.toLowerCase();
        return quickActions.filter(
            (action) =>
                action.title.toLowerCase().includes(query) ||
                action.keywords.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            title='Command Palette'
            description='Quick navigation and search'
        >
            <CommandInput
                placeholder='Type a command or search...'
                value={searchQuery}
                onValueChange={setSearchQuery}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {/* Navigation Section */}
                <CommandGroup heading='Navigation'>
                    {filteredItems.map((item) => {
                        // Only show items with valid URLs
                        if (item.url === '#') return null;

                        return (
                            <CommandItem
                                key={item.url}
                                value={`${item.title} ${item.url}`}
                                keywords={[item.title.toLowerCase(), 'dashboard', 'navigate']}
                                onSelect={() =>
                                    handleSelect(() => {
                                        router.push(item.url);
                                    })
                                }
                            >
                                {(item.icon && iconMap[item.icon]) || <IconSearch className='h-4 w-4' />}
                                <span>{item.title}</span>
                                {item.shortcut && item.shortcut.length > 0 && (
                                    <CommandShortcut>
                                        {item.shortcut.map((key, i) => (
                                            <kbd key={i} className='ml-1'>
                                                {key}
                                            </kbd>
                                        ))}
                                    </CommandShortcut>
                                )}
                            </CommandItem>
                        );
                    })}
                </CommandGroup>

                {/* Child Items Section */}
                {filteredItems.map((item) => {
                    if (!item.items || item.items.length === 0) return null;

                    return (
                        <React.Fragment key={`group-${item.title}`}>
                            <CommandSeparator />
                            <CommandGroup heading={item.title}>
                                {item.items.map((childItem) => (
                                    <CommandItem
                                        key={childItem.url}
                                        value={`${childItem.title} ${childItem.url}`}
                                        keywords={[
                                            childItem.title.toLowerCase(),
                                            item.title.toLowerCase()
                                        ]}
                                        onSelect={() =>
                                            handleSelect(() => {
                                                router.push(childItem.url);
                                            })
                                        }
                                    >
                                        {(childItem.icon && iconMap[childItem.icon]) || (
                                            <IconSearch className='h-4 w-4' />
                                        )}
                                        <span>{childItem.title}</span>
                                        {childItem.shortcut && childItem.shortcut.length > 0 && (
                                            <CommandShortcut>
                                                {childItem.shortcut.map((key, i) => (
                                                    <kbd key={i} className='ml-1'>
                                                        {key}
                                                    </kbd>
                                                ))}
                                            </CommandShortcut>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </React.Fragment>
                    );
                })}

                {/* Quick Actions Section */}
                {filteredQuickActions.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading='Quick Actions'>
                            {filteredQuickActions.map((action) => (
                                <CommandItem
                                    key={action.title}
                                    value={`${action.title} ${action.keywords}`}
                                    keywords={action.keywords.split(' ')}
                                    onSelect={() => handleSelect(action.action)}
                                >
                                    {action.icon}
                                    <span>{action.title}</span>
                                    {action.shortcut && (
                                        <CommandShortcut>{action.shortcut}</CommandShortcut>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </CommandDialog>
    );
}
