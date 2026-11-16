import { z } from 'zod';

const hourString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm');

export const createAdSchema = z.object({
  name: z.string().trim().min(1),
  yearsPlaying: z.number().int().min(0),
  discord: z.string().trim().min(1),
  weekDays: z.array(z.number().int().min(0).max(6)).min(1),
  hourStart: hourString,
  hourEnd: hourString,
  useVoiceChannel: z.boolean(),
});

export type CreateAdInput = z.infer<typeof createAdSchema>;
