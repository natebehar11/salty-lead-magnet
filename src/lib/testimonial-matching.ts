import { Testimonial, QuizAnswers, VibePreference } from '@/types';
import { testimonials } from '@/data/testimonials';

const vibeToMatchKey: Record<VibePreference, string> = {
  adventure: 'adventure',
  culture: 'culture',
  party: 'party',
  fitness: 'fitness',
  rest: 'rest',
};

function scoreTestimonial(testimonial: Testimonial, answers: QuizAnswers): number {
  let score = 0;

  // Vibe match: +3 per overlap
  if (testimonial.vibeMatch && answers.vibes.length > 0) {
    const userVibeKeys = answers.vibes.map((v) => vibeToMatchKey[v]);
    for (const vm of testimonial.vibeMatch) {
      if (userVibeKeys.includes(vm)) score += 3;
    }
  }

  // Guest type match: +2
  if (testimonial.guestType && answers.groupStyle) {
    const guestTypeMap: Record<string, string[]> = {
      solo: ['solo'],
      couple: ['couple'],
      'small-group': ['friends', 'group'],
      'big-crew': ['group', 'friends'],
    };
    if (guestTypeMap[answers.groupStyle]?.includes(testimonial.guestType)) {
      score += 2;
    }
  }

  // Solo traveler match
  if (answers.travelingSolo && testimonial.objectionAddressed === 'solo_travel') {
    score += 2;
  }

  // Fitness concern match
  if (answers.experienceLevel === 'first-timer' && testimonial.objectionAddressed === 'fitness_level') {
    score += 2;
  }

  // Priority tiebreaker
  score += (testimonial.priority || 3) * 0.1;

  return score;
}

export function getMatchedTestimonials(
  retreatSlug: string,
  answers: QuizAnswers,
  max: number = 2
): { testimonial: Testimonial; matchReason: string }[] {
  // Get testimonials for this retreat
  let candidates = testimonials.filter((t) => t.retreatSlug === retreatSlug);

  // If no testimonials for this retreat, try cross-retreat from similar destinations
  if (candidates.length === 0) {
    // Fallback: use highest-priority testimonials from any retreat
    candidates = [...testimonials].sort((a, b) => (b.priority || 3) - (a.priority || 3)).slice(0, 4);
  }

  // Score and rank
  const scored = candidates
    .map((t) => ({ testimonial: t, score: scoreTestimonial(t, answers) }))
    .sort((a, b) => b.score - a.score);

  // If best score < 3, just show highest priority
  if (scored.length > 0 && scored[0].score < 3) {
    const best = scored[0];
    return [{ testimonial: best.testimonial, matchReason: getMatchReason(best.testimonial, answers) }];
  }

  return scored.slice(0, max).map(({ testimonial }) => ({
    testimonial,
    matchReason: getMatchReason(testimonial, answers),
  }));
}

function getMatchReason(testimonial: Testimonial, answers: QuizAnswers): string {
  if (testimonial.objectionAddressed === 'solo_travel' && answers.travelingSolo) {
    return "Matched because you're traveling solo";
  }
  if (testimonial.objectionAddressed === 'fitness_level' && answers.experienceLevel === 'first-timer') {
    return 'For guests at every fitness level';
  }
  if (testimonial.objectionAddressed === 'worth_money') {
    return 'On why it was worth every dollar';
  }
  if (testimonial.guestType === 'returner') {
    return 'From a guest who came back for more';
  }

  // Vibe-based reasons
  if (testimonial.vibeMatch) {
    const userVibeKeys = answers.vibes.map((v) => vibeToMatchKey[v]);
    for (const vm of testimonial.vibeMatch) {
      if (userVibeKeys.includes(vm)) {
        const reasonMap: Record<string, string> = {
          adventure: "Matched because you're chasing adventure",
          culture: 'Matched because you love culture',
          party: 'Matched because you love the social energy',
          fitness: 'Matched because fitness matters to you',
          rest: 'Matched because you value rest and recharge',
        };
        return reasonMap[vm] || 'What guests say about this retreat';
      }
    }
  }

  return 'What guests say about this retreat';
}
