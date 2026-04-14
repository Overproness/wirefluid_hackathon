import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Hub',
  description: 'Fan-created cricket content with on-chain tipping, sponsorships, and automated revenue splits.',
};

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
