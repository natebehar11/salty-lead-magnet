import { Coach } from '@/types/retreat';

export const coaches: Coach[] = [
  {
    id: 'erin',
    name: 'Erin Harris',
    title: 'Co-Founder & Lead Coach',
    certification: 'Certified Personal Trainer, RYT-200',
    bio: "Erin built SALTY because the wellness industry forgot that feeling good should actually be fun. She leads workouts that make you sweat and laugh in equal measure. When she's not coaching retreats, she's planning the next one. Every SALTY trip starts with her question: \"Will this make someone smile?\"",
    image: '/images/lifestyle-2.jpg',
  },
  {
    id: 'nate',
    name: 'Nate Behar',
    title: 'Co-Founder & Operations',
    certification: 'Former CFL Athlete, Fitness Coach',
    bio: "Nate handles the details so you don't have to. Former professional football player turned retreat architect. He's the one who knows the best restaurant in every town, negotiates the surf lesson rates, and makes sure the logistics run so smoothly you forget someone's managing them.",
    image: '/images/lifestyle-3.jpg',
  },
  {
    id: 'jules',
    name: 'Jules',
    title: 'Yoga Instructor',
    certification: 'RYT-500, Yin Yoga Specialist',
    bio: "Jules brings the calm to SALTY's storm. Her classes meet you where you are, whether that's a seasoned practitioner or someone who can barely touch their toes. She's been teaching for 8 years across four continents. Expect to feel more mobile, more grounded, and maybe a little emotional.",
    image: '/images/lifestyle-8.jpg',
  },
];

export function getCoachById(id: string): Coach | undefined {
  return coaches.find((c) => c.id === id);
}

export function getCoachesByIds(ids: string[]): Coach[] {
  return ids.map((id) => coaches.find((c) => c.id === id)).filter(Boolean) as Coach[];
}
