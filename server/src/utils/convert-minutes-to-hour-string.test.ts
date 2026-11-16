import { describe, expect, it } from 'vitest';
import { convertMinutesToHourString } from './convert-minutes-to-hour-string';
import { convertHourStringToMinutes } from './convert-hour-string-to-minutes';

describe('convertMinutesToHourString', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [60, '01:00'],
    [1125, '18:45'],
    [1439, '23:59'],
  ])('converts %i to %s', (input, expected) => {
    expect(convertMinutesToHourString(input)).toBe(expected);
  });

  it('round-trips with convertHourStringToMinutes', () => {
    for (let minutes = 0; minutes < 24 * 60; minutes += 7) {
      expect(convertHourStringToMinutes(convertMinutesToHourString(minutes))).toBe(minutes);
    }
  });
});
