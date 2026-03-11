import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Trip Planner',
  description:
    'Plan your dream retreat trip with our AI travel planner. Discover amazing places before and after your SALTY retreat, and build a trip board to share.',
  openGraph: {
    title: 'AI Trip Planner | SALTY Retreats',
    description:
      'Plan your dream retreat trip with our AI travel planner. Discover amazing places and build a shareable trip board.',
    url: 'https://explore.getsaltyretreats.com/planner',
  },
  twitter: {
    title: 'AI Trip Planner | SALTY Retreats',
    description:
      'Plan your dream retreat trip with our AI travel planner. Discover amazing places and build a shareable trip board.',
  },
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
