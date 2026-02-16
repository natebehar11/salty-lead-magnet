/**
 * Generate a Google Flights deep link URL for a given flight search.
 * Used as the "View flight" booking link so users can book directly
 * on Google Flights / airline sites.
 *
 * Google Flights URL format:
 * https://www.google.com/travel/flights?q=Flights+from+{ORIGIN}+to+{DEST}+on+{DATE}
 */

export function generateGoogleFlightsUrl(
  originCode: string,
  destCode: string,
  date: string
): string {
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const query = `Flights from ${originCode} to ${destCode} on ${formattedDate}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}

/**
 * Get the best available booking URL for a flight.
 * Uses Kiwi booking URL if available, otherwise generates Google Flights link.
 */
export function getBookingUrl(
  bookingUrl: string | undefined,
  originCode: string,
  destCode: string,
  date: string
): string {
  if (bookingUrl && bookingUrl.startsWith('http')) {
    return bookingUrl;
  }
  return generateGoogleFlightsUrl(originCode, destCode, date);
}
