import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import type { CreateAdRequest } from '../../../shared/api-types';
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
  it('accepts exactly the shared CreateAdRequest shape', () => {
    expectTypeOf<z.input<typeof createAdSchema>>().toEqualTypeOf<CreateAdRequest>();
  });

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
    ['name longer than 50', { name: 'a'.repeat(51) }],
    ['discord longer than 37', { discord: 'a'.repeat(38) }],
    ['yearsPlaying above 60', { yearsPlaying: 61 }],
    ['equal start and end hours', { hourStart: '20:00', hourEnd: '20:00' }],
  ])('rejects %s', (_label, override) => {
    expect(createAdSchema.safeParse({ ...validAd, ...override }).success).toBe(false);
  });

  it('accepts values at the upper limits', () => {
    const ad = { ...validAd, name: 'a'.repeat(50), discord: 'a'.repeat(37), yearsPlaying: 60 };
    expect(createAdSchema.safeParse(ad).success).toBe(true);
  });

  it('accepts an overnight range', () => {
    const ad = { ...validAd, hourStart: '22:00', hourEnd: '02:00' };
    expect(createAdSchema.safeParse(ad).success).toBe(true);
  });

  it('reports equal hours on hourEnd', () => {
    const result = createAdSchema.safeParse({ ...validAd, hourStart: '20:00', hourEnd: '20:00' });
    expect(result.success).toBe(false);
    expect(result.error && z.flattenError(result.error).fieldErrors.hourEnd).toEqual([
      'End hour must differ from start hour',
    ]);
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
