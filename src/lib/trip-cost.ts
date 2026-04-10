import { FlightSearchResults } from '@/types';

export interface FlightEstimate {
  amount: number;
  label: string;
  isEstimated: boolean;
}

export function getFlightEstimate(
  searchResults: FlightSearchResults | null,
  isLoading: boolean
): FlightEstimate {
  if (isLoading) {
    return { amount: 0, label: 'Searching flights...', isEstimated: true };
  }

  // Use cheapest result price directly
  // (round-trip searches already return total RT price; one-way is per-leg)
  if (searchResults?.cheapest?.[0]) {
    const cheapest = searchResults.cheapest[0].price;
    const isRT = searchResults.cheapest[0].isRoundTrip;
    return {
      amount: cheapest,
      label: `~$${cheapest.toLocaleString()}${isRT ? ' RT' : ''}`,
      isEstimated: true,
    };
  }

  return { amount: 0, label: '', isEstimated: true };
}

export function formatTotal(retreatPrice: number, flightAmount: number): string {
  const total = retreatPrice + flightAmount;
  return `~$${total.toLocaleString()}`;
}
