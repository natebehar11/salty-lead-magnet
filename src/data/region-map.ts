export const regionMap: Record<string, string> = {
  'Costa Rica': 'central-america',
  'Panama': 'central-america',
  'El Salvador': 'central-america',
  'Sri Lanka': 'south-asia',
  'Italy': 'europe',
  'Sicily': 'europe',
  'Morocco': 'north-africa',
};

export const regionLabels: Record<string, string> = {
  'central-america': 'Central America',
  'south-asia': 'South Asia',
  'europe': 'Europe',
  'north-africa': 'North Africa',
};

export function getRegionForCountry(country: string): string {
  return regionMap[country] || 'other';
}
