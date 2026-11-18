import { describe, expect, it } from 'vitest';
import { DEFAULT_CORS_ORIGINS, parseCorsOrigins } from './parse-cors-origins';

describe('parseCorsOrigins', () => {
  it.each([
    [undefined, DEFAULT_CORS_ORIGINS],
    ['', DEFAULT_CORS_ORIGINS],
    ['  ', DEFAULT_CORS_ORIGINS],
    ['*', true],
    ['https://duo.example.com', ['https://duo.example.com']],
    [
      ' https://duo.example.com/ , http://localhost:4173,',
      ['https://duo.example.com', 'http://localhost:4173'],
    ],
  ])('parses %j as %j', (input, expected) => {
    expect(parseCorsOrigins(input)).toEqual(expected);
  });
});
