import { describe, expect, it } from 'vitest';
import { createAdSchema } from './create-ad.schema';

const validAd = {
  name: 'Player One',
  yearsPlaying: 3,
  discord: 'player#1234',
  weekDays: [0, 5, 6],
  hourStart: '18:00',
  hourEnd: '22:30',
  useVoiceChannel: true,
};

describe('createAdSchema', () => {
  it('accepts a valid ad', () => {
    expect(createAdSchema.parse(validAd)).toEqual(validAd);
  });

  it('trims name and discord', () => {
    const result = createAdSchema.parse({ ...validAd, name: '  Player  ', discord: ' p#1 ' });
    expect(result.name).toBe('Player');
    expect(result.discord).toBe('p#1');
  });

  it.each([
    ['empty name', { name: '   ' }],
    ['empty discord', { discord: '' }],
    ['negative yearsPlaying', { yearsPlaying: -1 }],
    ['fractional yearsPlaying', { yearsPlaying: 1.5 }],
    ['yearsPlaying as string', { yearsPlaying: '3' }],
    ['no week days', { weekDays: [] }],
    ['week day above 6', { weekDays: [7] }],
    ['week day below 0', { weekDays: [-1] }],
    ['hour without leading zero', { hourStart: '9:00' }],
    ['hour out of range', { hourEnd: '24:00' }],
    ['minute out of range', { hourEnd: '10:60' }],
    ['useVoiceChannel as string', { useVoiceChannel: 'true' }],
  ])('rejects %s', (_label, override) => {
    expect(createAdSchema.safeParse({ ...validAd, ...override }).success).toBe(false);
  });

  it.each([
    'name',
    'yearsPlaying',
    'discord',
    'weekDays',
    'hourStart',
    'hourEnd',
    'useVoiceChannel',
  ])('requires %s', (field) => {
    const ad: Record<string, unknown> = { ...validAd };
    delete ad[field];
    expect(createAdSchema.safeParse(ad).success).toBe(false);
  });
});
