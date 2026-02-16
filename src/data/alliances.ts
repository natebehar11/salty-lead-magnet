/**
 * Global Airline Alliances Data
 * Last Updated: 2026
 */

export interface Alliance {
  id: string;
  name: string;
  color: string;
  founded: number;
  description: string;
  airlines: string[];
}

export const alliances: Alliance[] = [
  {
    id: 'star-alliance',
    name: 'Star Alliance',
    color: '#CFB53B',
    founded: 1997,
    description: 'Largest global alliance — 26 member airlines',
    airlines: [
      'Aegean Airlines',
      'Air Canada',
      'Air China',
      'Air India',
      'Air New Zealand',
      'ANA',
      'All Nippon Airways',
      'Asiana Airlines',
      'Austrian Airlines',
      'Avianca',
      'Brussels Airlines',
      'Copa Airlines',
      'Croatia Airlines',
      'EgyptAir',
      'Ethiopian Airlines',
      'EVA Air',
      'LOT Polish Airlines',
      'Lufthansa',
      'Scandinavian Airlines',
      'SAS',
      'Shenzhen Airlines',
      'Singapore Airlines',
      'South African Airways',
      'SWISS',
      'SWISS International Air Lines',
      'TAP Air Portugal',
      'Thai Airways',
      'Turkish Airlines',
      'United Airlines',
      'United',
    ],
  },
  {
    id: 'skyteam',
    name: 'SkyTeam',
    color: '#0A3D8F',
    founded: 2000,
    description: 'Strong Europe–Asia–North America network — 18 member airlines',
    airlines: [
      'Aerolineas Argentinas',
      'Aeromexico',
      'Air Europa',
      'Air France',
      'China Airlines',
      'China Eastern Airlines',
      'China Eastern',
      'Delta Air Lines',
      'Delta',
      'Garuda Indonesia',
      'ITA Airways',
      'Kenya Airways',
      'KLM',
      'KLM Royal Dutch Airlines',
      'Korean Air',
      'Middle East Airlines',
      'Saudia',
      'TAROM',
      'Vietnam Airlines',
      'Virgin Atlantic',
      'XiamenAir',
    ],
  },
  {
    id: 'oneworld',
    name: 'Oneworld',
    color: '#8B2332',
    founded: 1999,
    description: 'Premium-focused alliance — 13 member airlines',
    airlines: [
      'Alaska Airlines',
      'American Airlines',
      'American',
      'British Airways',
      'Cathay Pacific',
      'Finnair',
      'Iberia',
      'Japan Airlines',
      'JAL',
      'Malaysia Airlines',
      'Qantas',
      'Qatar Airways',
      'Royal Air Maroc',
      'Royal Jordanian',
      'SriLankan Airlines',
    ],
  },
];

export const independentAirlines: string[] = [
  'Emirates',
  'Etihad Airways',
  'Etihad',
  'WestJet',
  'Ryanair',
  'easyJet',
  'JetBlue',
  'Air Arabia',
  'Scoot',
  'Vueling',
  'Wizz Air',
  'Southwest Airlines',
  'Southwest',
  'Spirit Airlines',
  'Spirit',
  'Frontier Airlines',
  'Frontier',
  'Norwegian',
  'Icelandair',
  'Condor',
  'Sun Country Airlines',
  'Volaris',
  'IndiGo',
  'AirAsia',
];

/**
 * Get the alliance for a given airline name.
 * Returns null if the airline isn't in any alliance.
 * Uses case-insensitive partial matching.
 */
export function getAirlineAlliance(airlineName: string): Alliance | null {
  const normalized = airlineName.toLowerCase().trim();
  for (const alliance of alliances) {
    if (alliance.airlines.some((a) => normalized.includes(a.toLowerCase()) || a.toLowerCase().includes(normalized))) {
      return alliance;
    }
  }
  return null;
}

/**
 * Check if an airline belongs to any of the selected alliances.
 * If no alliances are selected, returns true (show all).
 */
export function isAirlineInAlliances(airlineName: string, selectedAllianceIds: string[]): boolean {
  if (selectedAllianceIds.length === 0) return true;

  const alliance = getAirlineAlliance(airlineName);
  if (!alliance) return false;
  return selectedAllianceIds.includes(alliance.id);
}

/**
 * Check if a flight's airlines all belong to selected alliances.
 * For multi-airline flights, ALL airlines must be in the selected alliances.
 */
export function flightMatchesAlliances(airlines: string[], selectedAllianceIds: string[]): boolean {
  if (selectedAllianceIds.length === 0) return true;
  return airlines.every((airline) => isAirlineInAlliances(airline, selectedAllianceIds));
}
