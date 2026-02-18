import {
  formatCurrency,
  formatDateRange,
  formatShortDate,
  cn,
  formatDuration,
  convertAndFormatCurrency,
} from '@/lib/utils';

describe('formatCurrency', () => {
  it('returns "TBD" for 0', () => {
    expect(formatCurrency(0)).toBe('TBD');
  });

  it('formats USD correctly', () => {
    expect(formatCurrency(2399, 'USD')).toBe('$2,399');
  });

  it('formats CAD correctly', () => {
    expect(formatCurrency(3000, 'CAD')).toBe('CA$3,000');
  });

  it('formats EUR correctly', () => {
    expect(formatCurrency(1500, 'EUR')).toContain('1,500');
  });

  it('formats GBP correctly', () => {
    expect(formatCurrency(1200, 'GBP')).toContain('1,200');
  });
});

describe('formatDuration', () => {
  it('returns "0m" for 0 minutes', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('returns minutes only when under 60', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('returns hours only when evenly divisible', () => {
    expect(formatDuration(60)).toBe('1h');
  });

  it('returns hours and minutes for mixed values', () => {
    expect(formatDuration(375)).toBe('6h 15m');
  });
});

describe('formatDateRange', () => {
  it('formats same-month range', () => {
    expect(formatDateRange('2026-02-12', '2026-02-21')).toBe('February 12-21, 2026');
  });

  it('formats different-month range', () => {
    expect(formatDateRange('2026-01-28', '2026-02-05')).toBe('January 28 - February 5, 2026');
  });
});

describe('formatShortDate', () => {
  it('formats a date string to short format', () => {
    expect(formatShortDate('2026-03-15')).toBe('Mar 15');
  });
});

describe('cn', () => {
  it('joins truthy class strings', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('filters out false, null, and undefined values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});

describe('convertAndFormatCurrency', () => {
  it('returns TBD for 0 amount', () => {
    const result = convertAndFormatCurrency(0, 'CAD', 1.36);
    expect(result.converted).toBe('TBD');
    expect(result.original).toBe('TBD');
    expect(result.isConverted).toBe(false);
  });

  it('returns isConverted false when rate is 1 (USD)', () => {
    const result = convertAndFormatCurrency(2399, 'USD', 1);
    expect(result.isConverted).toBe(false);
    expect(result.converted).toBe('$2,399');
    expect(result.original).toBe('$2,399');
  });

  it('converts and marks isConverted true for CAD with rate 1.36', () => {
    const result = convertAndFormatCurrency(2399, 'CAD', 1.36);
    expect(result.isConverted).toBe(true);
    expect(result.converted).toContain('3,263');
    expect(result.original).toBe('$2,399');
  });
});
