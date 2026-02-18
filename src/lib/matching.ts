import { Retreat, SaltyMeter, QuizAnswers, QuizResult, VibePreference, RoomPreference } from '@/types';
import { getRegionForCountry } from '@/data/region-map';

const vibeToMeterKey: Record<VibePreference, keyof Omit<SaltyMeter, 'groupSize'>> = {
  adventure: 'adventure',
  culture: 'culture',
  party: 'party',
  fitness: 'sweat',
  rest: 'rest',
};

// Room preference → price tier mapping (aligned with new budget ranges)
const roomPriceTiers: Record<RoomPreference, { min: number; max: number }> = {
  dorm: { min: 0, max: 2000 },
  triple: { min: 2000, max: 2400 },
  premium: { min: 2300, max: 2800 },
  single: { min: 2800, max: 99999 },
};

function calculateVibeScore(meter: SaltyMeter, vibes: VibePreference[]): number {
  if (vibes.length === 0) return 50;
  const scores = vibes.map((vibe) => meter[vibeToMeterKey[vibe]]);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 10);
}

function calculateRoomScore(retreat: Retreat, roomPref: RoomPreference | null): number {
  if (!roomPref) return 50;
  if (retreat.lowestPrice === 0) return 50; // TBD pricing

  const tier = roomPriceTiers[roomPref];

  // Check if the retreat has the actual room tier available
  if (retreat.roomTiers.length > 0) {
    const hasMatchingTier = retreat.roomTiers.some((rt) => {
      const price = rt.priceEarlyBird || rt.priceRegular;
      return price >= tier.min && price <= tier.max && rt.available;
    });
    if (hasMatchingTier) return 100;

    // Check if any tier is close
    const closestPrice = retreat.roomTiers
      .filter((rt) => rt.available)
      .map((rt) => rt.priceEarlyBird || rt.priceRegular)
      .sort((a, b) => Math.abs(a - (tier.min + tier.max) / 2) - Math.abs(b - (tier.min + tier.max) / 2))[0];

    if (closestPrice) {
      const overBy = Math.abs(closestPrice - (tier.min + tier.max) / 2) / ((tier.max - tier.min) || 1000);
      if (overBy <= 0.5) return 80;
      if (overBy <= 1.0) return 60;
      return 40;
    }
  }

  // Fallback to lowestPrice comparison
  if (retreat.lowestPrice >= tier.min && retreat.lowestPrice <= tier.max) return 100;
  if (retreat.lowestPrice < tier.min) return 90; // Under budget = great
  const overBy = (retreat.lowestPrice - tier.max) / tier.max;
  if (overBy <= 0.1) return 70;
  if (overBy <= 0.2) return 50;
  return 30;
}

// Graceful date score degradation (handoff fix)
// Exact month = 100, adjacent = 60, 2 months away = 30, flexible = 80, no match = 20
function calculateDateScore(startDate: string, availability: string[]): number {
  if (availability.length === 0) return 50;
  if (availability.includes('flexible')) return 80;

  const retreatMonth = startDate.substring(0, 7); // "2026-02"

  if (availability.includes(retreatMonth)) return 100;

  const retreatDate = new Date(startDate + 'T00:00:00');

  // Check adjacent months (±1)
  const prevMonth = new Date(retreatDate);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const nextMonth = new Date(retreatDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const prevKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
  const nextKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

  if (availability.includes(prevKey) || availability.includes(nextKey)) return 60;

  // Check 2 months away (±2)
  const prev2 = new Date(retreatDate);
  prev2.setMonth(prev2.getMonth() - 2);
  const next2 = new Date(retreatDate);
  next2.setMonth(next2.getMonth() + 2);

  const prev2Key = `${prev2.getFullYear()}-${String(prev2.getMonth() + 1).padStart(2, '0')}`;
  const next2Key = `${next2.getFullYear()}-${String(next2.getMonth() + 1).padStart(2, '0')}`;

  if (availability.includes(prev2Key) || availability.includes(next2Key)) return 30;

  // No match at all — soft floor instead of 0
  return 20;
}

// Softened region scoring (handoff fix)
// Match = 100, surprise-me = 80, no preference = 50, non-match = 45
function calculateRegionScore(retreat: Retreat, regions: string[]): number {
  if (regions.length === 0) return 50;
  if (regions.includes('surprise-me')) return 80;

  const country = retreat.locations[0]?.country || retreat.destination;
  const retreatRegion = getRegionForCountry(country);

  return regions.includes(retreatRegion) ? 100 : 45;
}

// Activity score with 30-point hard penalty for zero matches (handoff fix)
function calculateActivityScore(retreat: Retreat, mustHaves: string[]): number {
  if (mustHaves.length === 0) return 50;

  const retreatActivities = retreat.activities.map((a) => a.name.toLowerCase());
  const retreatFeatures = retreat.locations.flatMap((l) => l.features.map((f) => f.toLowerCase()));
  const meter = retreat.saltyMeter;
  const allText = [...retreatActivities, ...retreatFeatures].join(' ');

  let matches = 0;
  for (const need of mustHaves) {
    switch (need) {
      case 'surfing':
        if (allText.includes('surf')) matches++;
        break;
      case 'yoga':
        if (allText.includes('yoga')) matches++;
        break;
      case 'nightlife':
        if (meter.party >= 7) matches++;
        break;
      case 'hiking':
        if (allText.includes('hik') || retreat.locations.some((l) => l.type === 'mountain')) matches++;
        break;
      case 'food':
        if (allText.includes('food') || allText.includes('cook') || meter.culture >= 7) matches++;
        break;
      case 'culture':
        if (meter.culture >= 7 || allText.includes('cultur') || allText.includes('tour')) matches++;
        break;
      case 'fitness':
        if (meter.sweat >= 6 || allText.includes('fitness') || allText.includes('workout')) matches++;
        break;
      case 'beach':
        if (retreat.locations.some((l) => l.type === 'beach') || allText.includes('beach')) matches++;
        break;
      case 'photography':
        if (meter.adventure >= 7 || meter.culture >= 7) matches++;
        break;
      case 'wellness':
        if (meter.rest >= 6 || allText.includes('wellness') || allText.includes('spa')) matches++;
        break;
    }
  }

  const baseScore = Math.round((matches / mustHaves.length) * 100);

  // Hard penalty: if a retreat scores 0 on must-haves, apply -30 penalty
  // This makes the penalty function as a soft filter rather than killing the retreat entirely
  if (matches === 0) return -30; // Will be applied as a penalty in final calculation

  return baseScore;
}

function calculatePartyRestScore(meter: SaltyMeter, partyVsRest: number): number {
  const retreatRatio = (meter.party / (meter.party + meter.rest)) * 10;
  const diff = Math.abs(partyVsRest - retreatRatio);
  return Math.max(0, Math.round(100 - diff * 12));
}

function generateWhyMatch(
  retreat: Retreat,
  breakdown: QuizResult['breakdown'],
  answers: QuizAnswers
): string[] {
  const reasons: string[] = [];

  if (breakdown.vibeScore >= 70) {
    const matchedVibes = answers.vibes
      .filter((v) => retreat.saltyMeter[vibeToMeterKey[v]] >= 7)
      .map((v) => v.charAt(0).toUpperCase() + v.slice(1));
    if (matchedVibes.length > 0) {
      reasons.push(`High ${matchedVibes.join(' & ')} vibes — exactly what you asked for`);
    }
  }

  if (breakdown.roomScore >= 80 && retreat.lowestPrice > 0) {
    reasons.push(`Great room options starting at $${retreat.lowestPrice.toLocaleString()}`);
  }

  if (breakdown.dateScore >= 80) {
    reasons.push('Available when you can travel');
  } else if (breakdown.dateScore >= 50) {
    reasons.push('Close to your preferred travel dates');
  }

  if (breakdown.activityScore >= 70 && answers.mustHaves.length > 0) {
    reasons.push('Hits your must-have activities');
  }

  if (retreat.spotsRemaining !== null && retreat.spotsRemaining <= 10) {
    reasons.push(`Only ${retreat.spotsRemaining} spots left`);
  }

  if (answers.travelingSolo) {
    reasons.push('Solo-traveler friendly (65% of guests come solo)');
  }

  // Ensure at least 2 reasons
  if (reasons.length < 2) {
    if (retreat.rating.value >= 4.8) {
      reasons.push(`Rated ${retreat.rating.value}/5 by past guests`);
    }
    if (retreat.locations.length > 1) {
      reasons.push(`Multi-destination: ${retreat.locations.map((l) => l.region).join(' + ')}`);
    }
  }

  return reasons.slice(0, 4);
}

export function calculateMatch(retreat: Retreat, answers: QuizAnswers): QuizResult {
  const activityScore = calculateActivityScore(retreat, answers.mustHaves);

  const breakdown = {
    vibeScore: calculateVibeScore(retreat.saltyMeter, answers.vibes),
    roomScore: calculateRoomScore(retreat, answers.roomPreference),
    dateScore: calculateDateScore(retreat.startDate, answers.availability),
    regionScore: calculateRegionScore(retreat, answers.regions),
    activityScore: Math.max(0, activityScore), // Store as 0 minimum for display
    partyRestScore: calculatePartyRestScore(retreat.saltyMeter, answers.partyVsRest),
  };

  // Weighted composite: vibes 30%, room 20%, date 15%, region 15%, activity 10%, partyRest 10%
  let matchScore = Math.round(
    breakdown.vibeScore * 0.3 +
    breakdown.roomScore * 0.2 +
    breakdown.dateScore * 0.15 +
    breakdown.regionScore * 0.15 +
    breakdown.activityScore * 0.1 +
    breakdown.partyRestScore * 0.1
  );

  // Apply must-have hard penalty if score was -30 (zero matches)
  if (activityScore < 0) {
    matchScore = matchScore + activityScore; // Subtract 30 points
  }

  const whyMatch = generateWhyMatch(retreat, breakdown, answers);

  return {
    retreat,
    matchScore: Math.min(99, Math.max(5, matchScore)),
    breakdown,
    whyMatch,
  };
}

export function calculateAllMatches(allRetreats: Retreat[], answers: QuizAnswers): QuizResult[] {
  const now = new Date();
  return allRetreats
    .filter((r) => r.status !== 'sold_out')
    .filter((r) => new Date(r.endDate + 'T23:59:59') >= now)
    .map((retreat) => calculateMatch(retreat, answers))
    .sort((a, b) => b.matchScore - a.matchScore);
}
