import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fan Dashboard',
  description: 'Track your XP, tier progress, FAN token balance, and activity across the CricketChain ecosystem.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
