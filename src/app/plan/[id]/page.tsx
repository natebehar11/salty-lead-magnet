'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/shared/Button';
import { cn } from '@/lib/utils';
import { SharedPlan, SharedPlanFriend } from '@/lib/shared-plans';

const statusIcon: Record<SharedPlanFriend['status'], string> = {
  interested: 'Interested',
  in: 'In',
  maybe: 'Maybe',
  out: 'Out',
};

const statusLabel: Record<SharedPlanFriend['status'], string> = {
  interested: 'Interested',
  in: "I'm in!",
  maybe: 'Maybe',
  out: 'Not this time',
};

export default function SharedPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plan, setPlan] = useState<SharedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinCity, setJoinCity] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [myStatus, setMyStatus] = useState<SharedPlanFriend['status']>('interested');

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(`/api/plans?id=${id}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setPlan(data.plan);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [id]);

  const handleJoin = async () => {
    if (!joinName) return;

    const res = await fetch('/api/plans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: id,
        action: 'join',
        friendName: joinName,
        originCity: joinCity,
      }),
    });

    const data = await res.json();
    if (data.plan) {
      setPlan(data.plan);
      setHasJoined(true);
    }
  };

  const handleStatusUpdate = async (status: SharedPlanFriend['status']) => {
    setMyStatus(status);

    await fetch('/api/plans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: id,
        action: 'updateStatus',
        friendName: joinName,
        status,
      }),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salty-cream">
        <div className="w-12 h-12 border-4 border-salty-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-salty-cream px-6">
        <h1 className="font-display text-section text-salty-deep-teal mb-4">
          Plan not found
        </h1>
        <p className="font-body text-salty-slate/60 mb-8">
          This trip plan may have expired or doesn&apos;t exist.
        </p>
        <Button href="/quiz">Find Your Own Trip</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-salty-cream py-12 px-6">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <p className="font-body text-sm text-salty-orange-red font-bold uppercase tracking-widest mb-2">
              Trip Plan
            </p>
            <h1 className="font-display text-hero text-salty-deep-teal mb-2">
              {plan.creatorName} is going to {plan.retreatName.split(' — ')[1] || plan.retreatName}
            </h1>
            {plan.retreatDates && (
              <p className="font-body text-salty-slate/60">{plan.retreatDates}</p>
            )}
            {plan.message && (
              <p className="font-body text-salty-deep-teal/60 italic mt-3">
                &ldquo;{plan.message}&rdquo;
              </p>
            )}
          </div>

          {/* Who's In */}
          <div className="bg-salty-cream rounded-2xl border-2 border-salty-beige p-6 mb-6">
            <h2 className="font-display text-xl text-salty-deep-teal mb-4">Who&apos;s In?</h2>

            {/* Creator */}
            <div className="flex items-center gap-3 mb-3 p-3 bg-salty-orange-red/5 rounded-xl">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-salty-orange-red text-white font-display text-xs">IN</span>
              <div className="flex-1">
                <p className="font-body text-sm text-salty-deep-teal font-bold">{plan.creatorName}</p>
                <p className="font-body text-xs text-salty-slate/40">
                  {plan.originCity ? `Flying from ${plan.originCity}` : 'Organizer'}
                </p>
              </div>
              <span className="font-body text-xs text-salty-orange-red font-bold bg-salty-orange-red/10 px-2 py-1 rounded-full">
                Organizer
              </span>
            </div>

            {/* Friends */}
            {plan.friends.map((friend, i) => (
              <div key={i} className="flex items-center gap-3 mb-2 p-3 bg-salty-sand/30 rounded-xl">
                <span className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full font-display text-xs',
                  friend.status === 'in' && 'bg-salty-forest-green text-white',
                  friend.status === 'interested' && 'bg-salty-light-blue text-salty-deep-teal',
                  friend.status === 'maybe' && 'bg-salty-yellow text-salty-deep-teal',
                  friend.status === 'out' && 'bg-salty-beige text-salty-slate'
                )}>{statusIcon[friend.status].charAt(0)}</span>
                <div className="flex-1">
                  <p className="font-body text-sm text-salty-deep-teal font-bold">{friend.name}</p>
                  <p className="font-body text-xs text-salty-slate/40">
                    {friend.originCity ? `From ${friend.originCity}` : 'Joined the plan'}
                  </p>
                </div>
                <span className={cn(
                  'font-body text-xs font-bold px-2 py-1 rounded-full',
                  friend.status === 'in' && 'text-salty-forest-green bg-salty-seafoam/20',
                  friend.status === 'interested' && 'text-salty-deep-teal bg-salty-light-blue/20',
                  friend.status === 'maybe' && 'text-salty-gold bg-salty-gold/10',
                  friend.status === 'out' && 'text-salty-slate/50 bg-salty-beige'
                )}>
                  {statusLabel[friend.status]}
                </span>
              </div>
            ))}

            {plan.friends.length === 0 && (
              <p className="font-body text-sm text-salty-slate/40 text-center py-4">
                No one else has joined yet. Be the first!
              </p>
            )}
          </div>

          {/* Join Section */}
          {!hasJoined ? (
            <div className="bg-salty-deep-teal rounded-2xl p-6 text-center mb-6">
              <h3 className="font-display text-xl text-white mb-2">Want to join?</h3>
              <p className="font-body text-sm text-white/50 mb-4">
                Add your name to let {plan.creatorName} know you&apos;re interested.
              </p>
              <div className="space-y-2 max-w-sm mx-auto">
                <input
                  type="text"
                  placeholder="Your name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-salty-salmon"
                />
                <input
                  type="text"
                  placeholder="Your city (optional)"
                  value={joinCity}
                  onChange={(e) => setJoinCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-salty-salmon"
                />
                <Button onClick={handleJoin} size="lg" disabled={!joinName} className="w-full">
                  Join This Trip Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-salty-sand/50 rounded-2xl p-6 text-center mb-6">
              <p className="font-display text-lg text-salty-deep-teal mb-3">
                You&apos;re on the list, {joinName}!
              </p>
              <p className="font-body text-sm text-salty-slate/50 mb-4">
                Update your status:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {(['in', 'interested', 'maybe', 'out'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={cn(
                      'px-4 py-2 rounded-full font-body text-sm font-bold transition-all border-2',
                      myStatus === status
                        ? 'border-salty-orange-red bg-salty-orange-red/10 text-salty-orange-red'
                        : 'border-salty-beige text-salty-slate/50 hover:border-salty-deep-teal/30'
                    )}
                  >
                    {statusLabel[status]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Button href={`/flights?retreat=${plan.retreatSlug}`} variant="primary">
              Search Flights for This Retreat
            </Button>
            <Button href="/quiz" variant="ghost">
              Find Your Own Match
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
