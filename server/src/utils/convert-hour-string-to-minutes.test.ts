import { describe, expect, it } from 'vitest';
import { convertHourStringToMinutes } from './convert-hour-string-to-minutes';

describe('convertHourStringToMinutes', () => {
  it.each([
    ['00:00', 0],
    ['00:30', 30],
    ['01:00', 60],
    ['18:45', 1125],
    ['23:59', 1439],
  ])('converts %s to %i', (input, expected) => {
    expect(convertHourStringToMinutes(input)).toBe(expected);
  });
});
