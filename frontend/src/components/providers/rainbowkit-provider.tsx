'use client';

import { RainbowKitProvider, darkTheme, lightTheme, Theme } from '@rainbow-me/rainbowkit';
import { useTheme } from 'next-themes';
import { useState, useEffect, useMemo } from 'react';
import { useInvoiceEvents } from '@/hooks/use-contract-events';
import { useThemeConfig } from '@/components/themes/active-theme';
import '@rainbow-me/rainbowkit/styles.css';

/**
 * Event listener component that subscribes to contract events
 * and updates the UI in real-time
 */
function EventListener() {
    useInvoiceEvents();
    return null;
}

/**
 * Get custom RainbowKit theme based on active theme and light/dark mode
 */
function useRainbowKitTheme(): Theme | undefined {
    const { theme: mode } = useTheme(); // light/dark mode
    const { activeTheme } = useThemeConfig(); // active theme (vercel, claude, etc.)
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const customTheme = useMemo(() => {
        if (!mounted) return undefined;

        const isDark = mode === 'dark';
        const baseTheme = isDark ? darkTheme() : lightTheme();

        // Get CSS variables from the active theme
        const getThemeColor = (variable: string): string => {
            if (typeof window === 'undefined') return '';
            const value = getComputedStyle(document.documentElement)
                .getPropertyValue(variable)
                .trim();

            // Convert oklch to rgb for RainbowKit
            // For now, return a fallback color if oklch
            if (value.startsWith('oklch')) {
                // Use default colors from base theme
                return '';
            }
            return value;
        };

        // Create custom theme matching active theme colors
        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                accentColor: getThemeColor('--primary') || baseTheme.colors.accentColor,
                accentColorForeground: getThemeColor('--primary-foreground') || baseTheme.colors.accentColorForeground,
                actionButtonBorder: getThemeColor('--border') || baseTheme.colors.actionButtonBorder,
                actionButtonBorderMobile: getThemeColor('--border') || baseTheme.colors.actionButtonBorderMobile,
                actionButtonSecondaryBackground: getThemeColor('--secondary') || baseTheme.colors.actionButtonSecondaryBackground,
                closeButton: getThemeColor('--muted-foreground') || baseTheme.colors.closeButton,
                closeButtonBackground: getThemeColor('--muted') || baseTheme.colors.closeButtonBackground,
                connectButtonBackground: getThemeColor('--card') || baseTheme.colors.connectButtonBackground,
                connectButtonBackgroundError: getThemeColor('--destructive') || baseTheme.colors.connectButtonBackgroundError,
                connectButtonInnerBackground: getThemeColor('--card') || baseTheme.colors.connectButtonInnerBackground,
                connectButtonText: getThemeColor('--card-foreground') || baseTheme.colors.connectButtonText,
                connectButtonTextError: getThemeColor('--destructive-foreground') || baseTheme.colors.connectButtonTextError,
                connectionIndicator: getThemeColor('--primary') || baseTheme.colors.connectionIndicator,
                error: getThemeColor('--destructive') || baseTheme.colors.error,
                generalBorder: getThemeColor('--border') || baseTheme.colors.generalBorder,
                generalBorderDim: getThemeColor('--border') || baseTheme.colors.generalBorderDim,
                menuItemBackground: getThemeColor('--accent') || baseTheme.colors.menuItemBackground,
                modalBackdrop: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)',
                modalBackground: getThemeColor('--popover') || baseTheme.colors.modalBackground,
                modalBorder: getThemeColor('--border') || baseTheme.colors.modalBorder,
                modalText: getThemeColor('--popover-foreground') || baseTheme.colors.modalText,
                modalTextDim: getThemeColor('--muted-foreground') || baseTheme.colors.modalTextDim,
                modalTextSecondary: getThemeColor('--muted-foreground') || baseTheme.colors.modalTextSecondary,
                profileAction: getThemeColor('--secondary') || baseTheme.colors.profileAction,
                profileActionHover: getThemeColor('--accent') || baseTheme.colors.profileActionHover,
                profileForeground: getThemeColor('--card') || baseTheme.colors.profileForeground,
                selectedOptionBorder: getThemeColor('--ring') || baseTheme.colors.selectedOptionBorder,
                standby: getThemeColor('--muted-foreground') || baseTheme.colors.standby,
            },
            radii: {
                ...baseTheme.radii,
                actionButton: 'var(--radius)',
                connectButton: 'var(--radius)',
                menuButton: 'var(--radius)',
                modal: 'var(--radius)',
                modalMobile: 'var(--radius)',
            },
            fonts: {
                body: 'var(--font-sans)',
            },
        };
    }, [mounted, mode, activeTheme]);

    return customTheme;
}

/**
 * RainbowKit provider component that only renders on the client
 * This prevents SSR issues with WalletConnect's indexedDB usage
 */
export function RainbowKitProviderWrapper({ children }: { children: React.ReactNode }) {
    const customTheme = useRainbowKitTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading state during SSR and initial client render
    // This prevents "Transaction hooks must be used within RainbowKitProvider" errors
    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <RainbowKitProvider
            theme={customTheme}
            modalSize="compact"
            showRecentTransactions={true}
        >
            <EventListener />
            {children}
        </RainbowKitProvider>
    );
}
