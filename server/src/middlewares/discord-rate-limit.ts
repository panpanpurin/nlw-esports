import { MemoryStore, rateLimit } from 'express-rate-limit';

export const DISCORD_RATE_LIMIT = 30;
export const DISCORD_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const discordRateLimitStore = new MemoryStore();

export const discordRateLimit = rateLimit({
  windowMs: DISCORD_RATE_LIMIT_WINDOW_MS,
  limit: DISCORD_RATE_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  store: discordRateLimitStore,
  message: { message: 'Too many requests, try again later' },
});
