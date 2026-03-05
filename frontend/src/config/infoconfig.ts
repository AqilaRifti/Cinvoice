/**
 * Info configuration for Creditcoin Invoice Financing Platform
 */

interface InfoSection {
  title: string;
  description: string;
  links: Array<{ title: string; url: string }>;
}

interface InfoConfig {
  [key: string]: {
    sections: InfoSection[];
  };
}

export const infoConfig: InfoConfig = {
  smb: {
    sections: [
      {
        title: 'Overview',
        description:
          'The SMB Dashboard allows small and medium businesses to upload invoices, mint them as NFTs, and receive instant financing from investors.',
        links: []
      },
      {
        title: 'How It Works',
        description:
          'Upload your invoice to IPFS, mint it as an NFT with face value, receive funds from investors, and repay on the due date to build your on-chain credit score.',
        links: []
      }
    ]
  },
  investor: {
    sections: [
      {
        title: 'Overview',
        description:
          'The Investor Dashboard allows you to browse available invoices in the marketplace, invest in them at a discount, and earn returns when SMBs repay.',
        links: []
      },
      {
        title: 'Investment Strategy',
        description:
          'Filter invoices by credit score, repayment date, and face value. Purchase invoices at a discount based on the SMB credit score and earn the difference when repaid.',
        links: []
      }
    ]
  },
  admin: {
    sections: [
      {
        title: 'Overview',
        description:
          'The Admin Dashboard provides multi-sig governance controls for platform management, including whitelist/blacklist management, fee adjustments, and dispute resolution.',
        links: []
      },
      {
        title: 'Governance',
        description:
          'Create and vote on proposals using the multi-sig governance contract. All major platform changes require consensus from admin signers.',
        links: []
      }
    ]
  }
};
