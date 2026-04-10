'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Button from '@/components/shared/Button';
import { cn } from '@/lib/utils';
import {
  SharedPlanFriend,
  SharedPlanAny,
  SharedPlanV2,
  SharedBoardItemData,
  SharedReaction,
} from '@/lib/shared-plans';
import {
  CATEGORY_ICONS,
  CATEGORY_ICON_FALLBACK,
  STATUS_LABELS,
} from '@/lib/constants';
import ItemReactions from '@/components/planner/ItemReactions';
import WhosIn from '@/components/planner/WhosIn';
import SharedItineraryView from '@/components/planner/SharedItineraryView';
import { usePlanPolling } from '@/hooks/usePlanPolling';

const STORAGE_KEY_PREFIX = 'salty-plan-join-';

function getJoinState(planId: string): { name: string; status: SharedPlanFriend['status'] } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${planId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveJoinState(planId: string, name: string, status: SharedPlanFriend['status']): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${planId}`, JSON.stringify({ name, status }));
  } catch { /* ignore */ }
}

function isV2(plan: SharedPlanAny): plan is SharedPlanV2 {
  return 'version' in plan && plan.version === 2;
}


// Group board items by city
function groupBoardItems(items: SharedBoardItemData[]): Map<string, SharedBoardItemData[]> {
  const groups = new Map<string, SharedBoardItemData[]>();
  for (const item of items) {
    const key = item.cityName;
    if (!groups.has(key)) groups.set(key, []);
    if (item.type !== 'city') groups.get(key)!.push(item);
  }
  return groups;
}

// Get city metadata
function getCityMeta(items: SharedBoardItemData[], cityName: string) {
  const cityItem = items.find((i) => i.type === 'city' && i.cityName === cityName);
  return {
    country: cityItem?.country || items.find((i) => i.cityName === cityName)?.country || '',
    days: cityItem?.days || 3,
    imageUrl: cityItem?.imageUrl || null,
  };
}

export default function SharedPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plan, setPlan] = useState<SharedPlanAny | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinCity, setJoinCity] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [myStatus, setMyStatus] = useState<SharedPlanFriend['status']>('interested');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [sharedViewMode, setSharedViewMode] = useState<'dream' | 'itinerary'>('dream');

  useEffect(() => {
    const saved = getJoinState(id);
    if (saved) {
      setJoinName(saved.name);
      setMyStatus(saved.status);
      setHasJoined(true);
    }
  }, [id]);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(`/api/plans?id=${id}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setPlan(data.plan);
        // Initialize view mode from creator's saved preference
        if (data.plan?.boardViewMode) {
          setSharedViewMode(data.plan.boardViewMode);
        }
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    }
    fetchPlan();
  }, [id]);

  // Poll for updates every 15s while tab is visible
  usePlanPolling({
    planId: id,
    enabled: !loading && plan !== null,
    onUpdate: setPlan,
  });

  const handleJoin = useCallback(async () => {
    if (!joinName.trim() || isJoining) return;
    setJoinError(null);
    setIsJoining(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: id, action: 'join', friendName: joinName.trim(), originCity: joinCity.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setJoinError(data.error || 'Something went wrong.'); return; }
      if (data.plan) { setPlan(data.plan); setHasJoined(true); saveJoinState(id, joinName.trim(), 'interested'); }
    } catch { setJoinError('Could not connect. Please try again.'); }
    finally { setIsJoining(false); }
  }, [joinName, joinCity, id, isJoining]);

  const handleStatusUpdate = useCallback(async (status: SharedPlanFriend['status']) => {
    if (isUpdatingStatus) return;
    const prev = myStatus;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: id, action: 'updateStatus', friendName: joinName.trim(), status }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan) { setPlan(data.plan); setMyStatus(status); saveJoinState(id, joinName.trim(), status); }
      } else { setMyStatus(prev); }
    } catch { setMyStatus(prev); }
    finally { setIsUpdatingStatus(false); }
  }, [id, joinName, myStatus, isUpdatingStatus]);

  const handleReaction = useCallback(async (itemId: string, reaction: 'love' | 'interested' | 'meh') => {
    if (!hasJoined || !joinName.trim()) return;
    try {
      const res = await fetch('/api/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: id, action: 'react', friendName: joinName.trim(), itemId, reaction }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan) setPlan(data.plan);
      }
    } catch { /* silent */ }
  }, [id, joinName, hasJoined]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-salty-cream">
        <div className="w-12 h-12 border-4 border-salty-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !plan) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-salty-cream px-6">
        <h1 className="font-display text-section text-salty-deep-teal mb-4">Plan not found</h1>
        <p className="font-body text-salty-slate/60 mb-8">This trip plan may have expired or doesn&apos;t exist.</p>
        <Button href="/quiz">Find Your Own Trip</Button>
      </div>
    );
  }

  // V2 mood board layout
  if (isV2(plan)) {
    const v2 = plan; // local const for TS narrowing inside closures
    const cityGroups = groupBoardItems(v2.boardItems);
    const cityNames = Array.from(cityGroups.keys());
    const totalItems = v2.boardItems.filter((i) => i.type !== 'city').length;
    const totalDays = v2.boardItems.filter((i) => i.type === 'city').reduce((sum, i) => sum + (i.days || 0), 0);

    function getReactionsForItem(itemId: string): SharedReaction[] {
      return v2.reactions.filter((r: SharedReaction) => r.itemId === itemId);
    }

    function getMyReaction(itemId: string): string | null {
      const r = v2.reactions.find((r: SharedReaction) => r.itemId === itemId && r.friendName.toLowerCase() === joinName.toLowerCase());
      return r?.reaction || null;
    }

    return (
      <div className="min-h-dvh bg-salty-cream py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Hero */}
            <div className="text-center mb-8">
              <p className="font-body text-sm text-salty-orange-red font-bold uppercase tracking-widest mb-2">Trip Board</p>
              <h1 className="font-display text-section text-salty-deep-teal mb-2">
                {v2.creatorName}&apos;s trip to {v2.retreatName}
              </h1>
              {v2.retreatDates && <p className="font-body text-salty-slate/60">{v2.retreatDates}</p>}
              {v2.message && <p className="font-body text-salty-deep-teal/60 italic mt-3">&ldquo;{v2.message}&rdquo;</p>}
            </div>

            {/* Trip summary */}
            <div className="flex items-center justify-center gap-4 mb-4 font-body text-sm text-salty-slate/50">
              <span>{cityNames.length} {cityNames.length === 1 ? 'city' : 'cities'}</span>
              <span className="w-1 h-1 rounded-full bg-salty-slate/20" />
              <span>{totalItems} activities</span>
              {totalDays > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-salty-slate/20" />
                  <span>{totalDays} days</span>
                </>
              )}
            </div>

            {/* View toggle — only show if plan has itinerary data */}
            {v2.beforeAfterAssignment && Object.keys(v2.beforeAfterAssignment).length > 0 && (
              <div className="flex justify-center mb-6">
                <div className="flex gap-1 bg-salty-cream rounded-full p-0.5 border border-salty-beige/30" role="tablist" aria-label="View mode">
                  {[
                    { mode: 'dream' as const, label: 'Dream Board', icon: '✨' },
                    { mode: 'itinerary' as const, label: 'Itinerary', icon: '📋' },
                  ].map(({ mode, label, icon }) => (
                    <button
                      key={mode}
                      role="tab"
                      aria-selected={sharedViewMode === mode}
                      onClick={() => setSharedViewMode(mode)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-[11px] tracking-wider uppercase transition-all',
                        sharedViewMode === mode
                          ? 'bg-white text-salty-deep-teal shadow-sm'
                          : 'text-salty-slate/40 hover:text-salty-slate/60'
                      )}
                    >
                      <span className="text-sm">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Board content */}
            {sharedViewMode === 'itinerary' && v2.beforeAfterAssignment ? (
              <div className="mb-8">
                <SharedItineraryView
                  boardItems={v2.boardItems}
                  retreatName={v2.retreatName}
                  retreatDates={v2.retreatDates}
                  beforeAfterAssignment={v2.beforeAfterAssignment}
                  reactions={v2.reactions}
                  hasJoined={hasJoined}
                  viewerName={joinName}
                  onReact={handleReaction}
                />
              </div>
            ) : (
              /* Dream board — city groups */
              <div className="space-y-6 mb-8">
                {cityNames.map((cityName) => {
                  const meta = getCityMeta(v2.boardItems, cityName);
                  const items = cityGroups.get(cityName) || [];

                  return (
                    <div key={cityName} className="rounded-2xl overflow-hidden bg-white border border-salty-beige/50">
                      {/* City hero */}
                      <div className="relative h-40 overflow-hidden">
                        {meta.imageUrl ? (
                          <Image src={meta.imageUrl} alt={cityName} fill className="object-cover" sizes="(max-width: 768px) 100vw, 640px" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-salty-deep-teal to-salty-seafoam" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="font-display text-white text-xl tracking-wider uppercase">{cityName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-body text-white/70 text-xs">{meta.country}</span>
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span className="font-body text-white/70 text-xs">{meta.days} days</span>
                          </div>
                        </div>
                      </div>

                      {/* Activity items */}
                      {items.length > 0 && (
                        <div className="p-4 space-y-2">
                          {items.map((item) => {
                            const reactions = getReactionsForItem(item.id);
                            const myReaction = getMyReaction(item.id);
                            const icon = item.activityCategory ? CATEGORY_ICONS[item.activityCategory as keyof typeof CATEGORY_ICONS] || CATEGORY_ICON_FALLBACK : CATEGORY_ICON_FALLBACK;

                            return (
                              <div key={item.id} className="flex items-start gap-2.5 py-2 px-3 rounded-xl bg-salty-cream/50">
                                <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-body text-sm font-bold text-salty-deep-teal">{item.name}</span>
                                    {item.priceRange && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-salty-beige/50 text-salty-slate/60">{item.priceRange}</span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="font-body text-xs text-salty-slate/50 mt-0.5 leading-relaxed">{item.description}</p>
                                  )}

                                  {/* Reactions */}
                                  <ItemReactions
                                    itemId={item.id}
                                    reactions={reactions}
                                    myReaction={myReaction}
                                    hasJoined={hasJoined}
                                    onReact={handleReaction}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Who's In */}
            <WhosIn creatorName={v2.creatorName} friends={v2.friends} />

            {/* Join / Status */}
            {!hasJoined ? (
              <div className="bg-salty-deep-teal rounded-2xl p-6 text-center mb-6">
                <h3 className="font-display text-lg text-white tracking-wider uppercase mb-2">Want to join?</h3>
                <p className="font-body text-sm text-white/50 mb-4">Add your name and react to activities you love.</p>
                <div className="space-y-2 max-w-sm mx-auto">
                  <input type="text" placeholder="Your name" value={joinName} onChange={(e) => setJoinName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-salty-salmon" />
                  <input type="text" placeholder="Your city (optional)" value={joinCity} onChange={(e) => setJoinCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-salty-salmon" />
                  {joinError && <p className="font-body text-sm text-salty-salmon text-center">{joinError}</p>}
                  <Button onClick={handleJoin} size="lg" disabled={!joinName.trim() || isJoining} className="w-full">
                    {isJoining ? 'Joining...' : 'Join This Trip'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-salty-beige/30 rounded-2xl p-6 text-center mb-6">
                <p className="font-display text-lg text-salty-deep-teal mb-3">You&apos;re on the list, {joinName}!</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {(['in', 'interested', 'maybe', 'out'] as const).map((s) => (
                    <button key={s} onClick={() => handleStatusUpdate(s)} disabled={isUpdatingStatus}
                      className={cn('px-4 py-2 rounded-full font-body text-sm font-bold transition-all border-2 disabled:opacity-50',
                        myStatus === s ? 'border-salty-orange-red bg-salty-orange-red/10 text-salty-orange-red' : 'border-salty-beige text-salty-slate/50 hover:border-salty-deep-teal/30')}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Button href={`/flights?retreat=${v2.retreatSlug}`} variant="primary">Search Flights</Button>
              <Button href="/quiz" variant="ghost">Take the Quiz</Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // V1 fallback (legacy plan format)
  return (
    <div className="min-h-dvh bg-salty-cream py-12 px-6">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-8">
            <p className="font-body text-sm text-salty-orange-red font-bold uppercase tracking-widest mb-2">Trip Plan</p>
            <h1 className="font-display text-hero text-salty-deep-teal mb-2">
              {plan.creatorName} is going to {plan.retreatName}
            </h1>
            {plan.retreatDates && <p className="font-body text-salty-slate/60">{plan.retreatDates}</p>}
          </div>

          {/* Legacy itinerary */}
          {plan.itinerary && plan.itinerary.cities.length > 0 && (
            <div className="bg-white rounded-2xl border border-salty-beige/50 p-6 mb-6">
              <h2 className="font-display text-xl text-salty-deep-teal mb-2">Trip Itinerary</h2>
              <p className="font-body text-sm text-salty-slate/60 mb-4">{plan.itinerary.reasoning}</p>
              <div className="space-y-4">
                {plan.itinerary.cities.map((city, i) => (
                  <div key={i} className="bg-salty-cream/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg text-salty-deep-teal">{city.name}, {city.country}</h3>
                      <span className="font-body text-xs text-salty-orange-red font-bold bg-salty-orange-red/10 px-3 py-1 rounded-full">{city.days} days</span>
                    </div>
                    {city.description && <p className="font-body text-sm text-salty-slate/60 mb-3">{city.description}</p>}
                    {city.activities.length > 0 && (
                      <div className="space-y-1.5">
                        {city.activities.map((a, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="font-body text-xs text-salty-deep-teal/30 mt-0.5">-</span>
                            <p className="font-body text-xs text-salty-deep-teal/70"><span className="font-bold">{a.name}</span>: {a.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Join */}
          {!hasJoined ? (
            <div className="bg-salty-deep-teal rounded-2xl p-6 text-center mb-6">
              <h3 className="font-display text-xl text-white mb-2">Want to join?</h3>
              <div className="space-y-2 max-w-sm mx-auto">
                <input type="text" placeholder="Your name" value={joinName} onChange={(e) => setJoinName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-salty-salmon" />
                {joinError && <p className="font-body text-sm text-salty-salmon text-center">{joinError}</p>}
                <Button onClick={handleJoin} size="lg" disabled={!joinName.trim() || isJoining} className="w-full">
                  {isJoining ? 'Joining...' : 'Join This Trip Plan'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-salty-beige/30 rounded-2xl p-6 text-center mb-6">
              <p className="font-display text-lg text-salty-deep-teal mb-3">You&apos;re on the list!</p>
              <div className="flex flex-wrap justify-center gap-2">
                {(['in', 'interested', 'maybe', 'out'] as const).map((s) => (
                  <button key={s} onClick={() => handleStatusUpdate(s)} disabled={isUpdatingStatus}
                    className={cn('px-4 py-2 rounded-full font-body text-sm font-bold transition-all border-2 disabled:opacity-50',
                      myStatus === s ? 'border-salty-orange-red bg-salty-orange-red/10 text-salty-orange-red' : 'border-salty-beige text-salty-slate/50')}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button href={`/flights?retreat=${plan.retreatSlug}`} variant="primary">Search Flights</Button>
            <Button href="/quiz" variant="ghost">Find Your Own Match</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
