import type { Metadata } from 'next';
import { getPlan } from '@/lib/shared-plans';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const plan = await getPlan(id);
  if (!plan) {
    return {
      title: 'Trip Plan Not Found',
    };
  }

  const isV2 = 'version' in plan && plan.version === 2;
  const itemCount = isV2 ? plan.boardItems.filter((i) => i.type !== 'city').length : 0;
  const title = `${plan.creatorName}'s trip to ${plan.retreatName}`;
  const description = isV2
    ? `Join the trip board — ${itemCount} activities to explore. React to the ones you love!`
    : `Join ${plan.creatorName}'s trip to ${plan.retreatName}. See the plan and add your name.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://explore.getsaltyretreats.com/plan/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function PlanLayout({ children }: Props) {
  return children;
}
