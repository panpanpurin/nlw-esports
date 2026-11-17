import { z } from 'zod';

const hourString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm');

export const createAdSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    yearsPlaying: z.number().int().min(0).max(60),
    discord: z.string().trim().min(1).max(37),
    weekDays: z.array(z.number().int().min(0).max(6)).min(1),
    hourStart: hourString,
    hourEnd: hourString,
    useVoiceChannel: z.boolean(),
  })
  .refine((ad) => ad.hourStart !== ad.hourEnd, {
    message: 'End hour must differ from start hour',
    path: ['hourEnd'],
  });

export type CreateAdInput = z.infer<typeof createAdSchema>;
