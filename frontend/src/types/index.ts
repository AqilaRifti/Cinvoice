import { Icons } from '@/components/icons';

// ============================================================================
// Navigation Types
// ============================================================================

export interface PermissionCheck {
  permission?: string;
  plan?: string;
  feature?: string;
  role?: string;
  requireOrg?: boolean;
}

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
  access?: PermissionCheck;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

// ============================================================================
// Invoice Types
// ============================================================================

export enum InvoiceState {
  Pending = 0,
  Funded = 1,
  Repaid = 2,
  Defaulted = 3,
}

export interface Invoice {
  tokenId: number;
  faceValue: bigint;
  repaymentDate: number;
  smb: `0x${string}`;
  state: InvoiceState;
  metadataURI: string;
  creditScoreAtMinting: number;
}

export interface InvoiceMetadata {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  description: string;
  customerName: string;
  customerAddress?: string;
  items: InvoiceItem[];
  pdfHash: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ============================================================================
// Investment Types
// ============================================================================

export interface Investment {
  investor: `0x${string}`;
  purchasePrice: bigint;
  purchaseTimestamp: number;
}

export interface InvestmentWithInvoice extends Investment {
  invoice: Invoice;
  expectedReturn: bigint;
  daysUntilRepayment: number;
  roi: number; // percentage
}

// ============================================================================
// Credit Score Types
// ============================================================================

export interface CreditProfile {
  score: number;
  lastUpdated: number;
  totalInvoices: number;
  successfulRepayments: number;
  defaults: number;
}

export interface CreditScoreWithTrend extends CreditProfile {
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

// ============================================================================
// Governance Types
// ============================================================================

export enum ProposalType {
  Pause = 0,
  Unpause = 1,
  FeeAdjustment = 2,
  Whitelist = 3,
  Blacklist = 4,
  RemoveFromBlacklist = 5,
  TreasuryWithdraw = 6,
  DisputeResolution = 7,
}

export interface Proposal {
  proposalId: number;
  proposalType: ProposalType;
  target: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  approvers: `0x${string}`[];
  executed: boolean;
  createdAt: number;
}

// ============================================================================
// Platform Statistics
// ============================================================================

export interface PlatformStats {
  totalInvoices: number;
  totalVolume: bigint;
  activeInvestments: number;
  treasuryBalance: bigint;
  platformFee: number; // basis points
}

// ============================================================================
// User Role
// ============================================================================

export enum UserRole {
  SMB = 'smb',
  Investor = 'investor',
  Admin = 'admin',
  Unknown = 'unknown',
}

// ============================================================================
// Filter Types
// ============================================================================

export interface InvoiceFilters {
  state?: InvoiceState[];
  minFaceValue?: bigint;
  maxFaceValue?: bigint;
  minCreditScore?: number;
  maxCreditScore?: number;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  timestamp: number;
  value: number;
}

// ============================================================================
// Theme Types
// ============================================================================

export type ThemeName = 'claude' | 'mono' | 'neobrutualism' | 'notebook' | 'supabase' | 'vercel';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  radius: string;
  chartColors: string[];
}
