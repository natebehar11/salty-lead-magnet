export interface SaltyMeter {
  adventure: number;
  culture: number;
  party: number;
  sweat: number;
  rest: number;
  groupSize: { min: number; max: number };
}

export interface RoomTier {
  id: string;
  name: string;
  priceEarlyBird: number;
  priceRegular: number;
  description: string;
  occupancy: number;
  bedType: string;
  images: string[];
  available: boolean;
}

export interface Location {
  name: string;
  region: string;
  country: string;
  countryCode: string;
  type: 'beach' | 'mountain' | 'city' | 'jungle';
  nights: number;
  features: string[];
  images: string[];
}

export interface Activity {
  name: string;
  description: string;
  icon: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  location: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  year: number;
  text: string;
  rating: number;
  retreatSlug: string;
  guestType?: 'solo' | 'couple' | 'friends' | 'group' | 'returner';
  vibeMatch?: string[];
  objectionAddressed?: 'solo_travel' | 'fitness_level' | 'worth_money' | 'food_quality' | null;
  priority?: number;
}

export interface Coach {
  id: string;
  name: string;
  title: string;
  certification: string;
  bio: string;
  image: string;
}

export interface Retreat {
  slug: string;
  destination: string;
  title: string;
  subtitle: string;
  tagline: string;
  status: 'available' | 'sold_out' | 'coming_soon' | 'tbd';
  startDate: string;
  endDate: string;
  duration: { days: number; nights: number };
  locations: Location[];
  roomTiers: RoomTier[];
  deposit: number;
  currency: string;
  lowestPrice: number;
  saltyMeter: SaltyMeter;
  heroImage: string;
  cardImage: string;
  experience: {
    paragraphs: string[];
    forYouIf: string[];
  };
  activities: Activity[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  coaches: string[];
  spotsRemaining: number | null;
  testimonialIds: string[];
  rating: { value: number; count: number };
  faq: FAQ[];
  seoTitle: string;
  metaDescription: string;
  airport: { name: string; code: string };
  visa: string;
  earlyBirdDeadline?: string;
  balanceDueDate?: string;
}
