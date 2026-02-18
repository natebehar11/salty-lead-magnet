import { generateGoogleFlightsUrl, getBookingUrl } from '@/lib/google-flights';

describe('generateGoogleFlightsUrl', () => {
  it('returns a URL starting with the Google Flights base', () => {
    const url = generateGoogleFlightsUrl('YYZ', 'SJO', '2026-01-03');
    expect(url).toMatch(/^https:\/\/www\.google\.com\/travel\/flights\?q=/);
  });

  it('includes origin and destination codes in the URL', () => {
    const url = generateGoogleFlightsUrl('YYZ', 'SJO', '2026-01-03');
    expect(url).toContain('YYZ');
    expect(url).toContain('SJO');
  });
});

describe('getBookingUrl', () => {
  it('returns the provided URL when it starts with http', () => {
    const result = getBookingUrl('https://kiwi.com/book/123', 'YYZ', 'SJO', '2026-01-03');
    expect(result).toBe('https://kiwi.com/book/123');
  });

  it('generates a Google Flights URL when bookingUrl is undefined', () => {
    const result = getBookingUrl(undefined, 'YYZ', 'SJO', '2026-01-03');
    expect(result).toContain('google.com/travel/flights');
  });

  it('generates a Google Flights URL when bookingUrl is empty string', () => {
    const result = getBookingUrl('', 'YYZ', 'SJO', '2026-01-03');
    expect(result).toContain('google.com/travel/flights');
  });

  it('generates a Google Flights URL when bookingUrl is "#"', () => {
    const result = getBookingUrl('#', 'YYZ', 'SJO', '2026-01-03');
    expect(result).toContain('google.com/travel/flights');
  });
});
