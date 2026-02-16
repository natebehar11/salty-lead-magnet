import { FlightSearchResults } from '@/types/flight';

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

  // Use cheapest result, estimate return as same price
  if (searchResults?.cheapest?.[0]) {
    const cheapest = searchResults.cheapest[0].price;
    return {
      amount: cheapest * 2,
      label: `~$${(cheapest * 2).toLocaleString()}`,
      isEstimated: true,
    };
  }

  return { amount: 0, label: '', isEstimated: true };
}

export function formatTotal(retreatPrice: number, flightAmount: number): string {
  const total = retreatPrice + flightAmount;
  return `~$${total.toLocaleString()}`;
}
