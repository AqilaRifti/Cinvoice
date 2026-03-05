'use client';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { queryClient } from '@/lib/query-client';
import { config } from '@/lib/wagmi';
import { ActiveThemeProvider } from '../themes/active-theme';
import { RainbowKitProviderWrapper } from '../providers/rainbowkit-provider';
import { ContractValidator } from '../providers/contract-validator';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <ActiveThemeProvider initialTheme={activeThemeValue}>
            <ContractValidator>
              <RainbowKitProviderWrapper>
                {children}
              </RainbowKitProviderWrapper>
            </ContractValidator>
          </ActiveThemeProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </>
  );
}
