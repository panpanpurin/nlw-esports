import { MemoryStore, rateLimit } from 'express-rate-limit';

export const DISCORD_RATE_LIMIT = 30;
export const DISCORD_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const CREATE_AD_RATE_LIMIT = 10;
export const CREATE_AD_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export const discordRateLimitStore = new MemoryStore();
export const createAdRateLimitStore = new MemoryStore();

export const discordRateLimit = rateLimit({
  windowMs: DISCORD_RATE_LIMIT_WINDOW_MS,
  limit: DISCORD_RATE_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  store: discordRateLimitStore,
  message: { message: 'Too many requests, try again later' },
});

export const createAdRateLimit = rateLimit({
  windowMs: CREATE_AD_RATE_LIMIT_WINDOW_MS,
  limit: CREATE_AD_RATE_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipFailedRequests: true,
  store: createAdRateLimitStore,
  message: { message: 'Too many ads published, try again in an hour' },
});
