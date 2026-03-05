'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAccount, useDisconnect } from 'wagmi';
import { creditcoinTestnet } from '@/lib/wagmi';
import { IconCopy, IconExternalLink, IconLogout, IconChevronDown } from '@tabler/icons-react';
import { toast } from 'sonner';

export function WalletConnectButton() {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            toast.success('Address copied to clipboard');
        }
    };

    const handleViewOnExplorer = () => {
        if (address) {
            const explorerUrl = `${creditcoinTestnet.blockExplorers?.default.url}/address/${address}`;
            window.open(explorerUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleDisconnect = () => {
        disconnect();
        toast.info('Wallet disconnected');
    };

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain: connectedChain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
            }) => {
                const ready = mounted;
                const connected = ready && account && connectedChain;

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button onClick={openConnectModal} variant="default">
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (connectedChain.unsupported || connectedChain.id !== creditcoinTestnet.id) {
                                return (
                                    <Button onClick={openChainModal} variant="destructive">
                                        Wrong Network
                                    </Button>
                                );
                            }

                            return (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                            <span className="hidden sm:inline">{account.displayName}</span>
                                            <span className="sm:hidden">{account.displayName.slice(0, 6)}</span>
                                            {account.displayBalance && (
                                                <span className="hidden md:inline text-muted-foreground">
                                                    ({account.displayBalance})
                                                </span>
                                            )}
                                            <IconChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium">Wallet</p>
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    {account.address}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
                                            <IconCopy className="mr-2 h-4 w-4" />
                                            <span>Copy Address</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleViewOnExplorer} className="cursor-pointer">
                                            <IconExternalLink className="mr-2 h-4 w-4" />
                                            <span>View on Explorer</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive focus:text-destructive">
                                            <IconLogout className="mr-2 h-4 w-4" />
                                            <span>Disconnect</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}
