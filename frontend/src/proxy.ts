import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy for Creditcoin Invoice Financing Platform
 * 
 * Note: Authentication is handled via Web3 wallet connections
 * No server-side auth proxy needed
 */
export function proxy(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
