/**
 * Mock Flight Types
 * For fallback flight data generation
 */

export interface MockFlightConfig {
  origin: string;
  destination: string;
  dateOffset: number; // -2, -1, 0 days from retreat start
  baseDate: string;
}
