'use client';

import React, { useState } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import { ThemeSelector } from '../themes/theme-selector';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { NetworkStatusBadge } from './network-status-badge';
import CtaGithub from './cta-github';
import { MobileDrawer } from './mobile-drawer';
import { Button } from '../ui/button';
import { Icons } from '../icons';

/**
 * HeaderWithMobile Component
 * 
 * Header component with mobile drawer integration.
 * Shows menu button on mobile to open navigation drawer.
 * 
 * Requirements: 11.2, 11.8
 */
export default function HeaderWithMobile() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
                <div className='flex items-center gap-2 px-4'>
                    {/* Desktop sidebar trigger */}
                    <SidebarTrigger className='-ml-1 hidden md:flex' />

                    {/* Mobile menu button */}
                    <Button
                        variant='ghost'
                        size='icon'
                        className='md:hidden -ml-1'
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Icons.menu className='h-5 w-5' />
                        <span className='sr-only'>Open menu</span>
                    </Button>

                    <Separator orientation='vertical' className='mr-2 h-4' />

                    {/* Hide breadcrumbs on mobile */}
                    <div className='hidden sm:block'>
                        <Breadcrumbs />
                    </div>
                </div>

                <div className='flex items-center gap-2 px-4'>
                    <CtaGithub />
                    <div className='hidden md:flex'>
                        <SearchInput />
                    </div>
                    <NetworkStatusBadge />
                    <UserNav />

                    {/* Hide theme controls on mobile (available in drawer) */}
                    <div className='hidden md:flex items-center gap-2'>
                        <ThemeModeToggle />
                        <ThemeSelector />
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            <MobileDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        </>
    );
}
