export const TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 500,
  Gold: 2000,
  Platinum: 5000,
  Diamond: 15000,
} as const;

export const TIER_MULTIPLIERS = {
  Bronze: 100,
  Silver: 120,
  Gold: 150,
  Platinum: 200,
  Diamond: 300,
} as const;

export const XP_PER_ACTION = {
  MATCH_ATTENDANCE: 100,
  VOTE: 25,
  CONTENT_APPROVED: 50,
} as const;

export const RESALE_ROYALTY_BPS = 700;
export const MAX_RESALE_BPS = 11000;

export const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as const;

export const TIER_COLORS: Record<string, string> = {
  Bronze: 'text-amber-600',
  Silver: 'text-slate-300',
  Gold: 'text-yellow-400',
  Platinum: 'text-sky-300',
  Diamond: 'text-cyan-300',
};

export const TIER_BG_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-600/20',
  Silver: 'bg-slate-300/20',
  Gold: 'bg-yellow-400/20',
  Platinum: 'bg-sky-300/20',
  Diamond: 'bg-cyan-300/20',
};

export const WIRESCAN_URL = 'https://wirescan.bonk.credit';
export const WIREFLUID_RPC = 'https://evm.wirefluid.com';
export const CHAIN_ID = 92533;

export const PROPOSAL_TYPES = ['MVP Vote', 'Fan Award', 'Charity', 'General'] as const;
export const PROPOSAL_STATES = ['Active', 'Succeeded', 'Defeated', 'Executed'] as const;
export const CONTENT_STATUSES = ['Pending', 'Approved', 'Rejected'] as const;
