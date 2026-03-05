import { NavItem } from '@/types';

/**
 * Navigation configuration for Creditcoin Invoice Financing Platform
 */
export const navItems: NavItem[] = [
  {
    title: 'SMB Dashboard',
    url: '/dashboard/smb',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['s', 's'],
    items: []
  },
  {
    title: 'Investor Dashboard',
    url: '/dashboard/investor',
    icon: 'workspace',
    isActive: false,
    shortcut: ['i', 'i'],
    items: []
  },
  {
    title: 'Admin Dashboard',
    url: '/dashboard/admin',
    icon: 'account',
    isActive: false,
    shortcut: ['a', 'a'],
    items: []
  }
];
