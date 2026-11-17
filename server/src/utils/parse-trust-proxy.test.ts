import { describe, expect, it } from 'vitest';
import { parseTrustProxy } from './parse-trust-proxy';

describe('parseTrustProxy', () => {
  it.each([
    [undefined, false],
    ['', false],
    ['  ', false],
    ['false', false],
    ['true', true],
    ['1', 1],
    [' 2 ', 2],
    ['loopback', 'loopback'],
    ['10.0.0.0/8, 192.168.0.1', '10.0.0.0/8, 192.168.0.1'],
  ])('parses %j as %j', (input, expected) => {
    expect(parseTrustProxy(input)).toBe(expected);
  });
});
