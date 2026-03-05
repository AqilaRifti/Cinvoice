/**
 * Hook for filtering navigation items based on user role
 * 
 * For Creditcoin Invoice Financing, navigation is filtered based on user role:
 * - Admin: Can access Admin Dashboard
 * - SMB: Can access SMB Dashboard
 * - Investor: Can access Investor Dashboard
 * - Guest: Can see all dashboards (will be prompted to connect wallet)
 * 
 * Requirements: 2.1, 2.5
 */

import { useMemo } from 'react';
import type { NavItem } from '@/types';
import { useUserRole } from './use-user-role';

export function useFilteredNavItems(items: NavItem[]): NavItem[] {
  const { role } = useUserRole();

  return useMemo(() => {
    // If user is a guest (not connected), show all items
    // They will be prompted to connect wallet when clicking
    if (role === 'guest') {
      return items;
    }

    // Filter items based on role
    return items.filter((item) => {
      // Check if item has role-based access control
      if (item.access?.role) {
        return item.access.role === role;
      }

      // If no access control specified, check by URL pattern
      const url = item.url.toLowerCase();

      if (url.includes('/admin')) {
        return role === 'admin';
      }

      if (url.includes('/smb')) {
        return role === 'smb' || role === 'admin'; // Admins can access SMB dashboard
      }

      if (url.includes('/investor')) {
        return role === 'investor' || role === 'admin'; // Admins can access Investor dashboard
      }

      // Default: show item
      return true;
    });
  }, [items, role]);
}
