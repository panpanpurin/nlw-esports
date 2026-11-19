import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import {
  CREATE_AD_RATE_LIMIT,
  DISCORD_RATE_LIMIT,
  createAdRateLimitStore,
  discordRateLimitStore,
} from '../src/middlewares/rate-limits';

const GAME_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_GAME_ID = '22222222-2222-4222-8222-222222222222';
const MISSING_ID = '99999999-9999-4999-8999-999999999999';

const validAd = {
  name: 'Player One',
  yearsPlaying: 3,
  discord: 'player#1234',
  weekDays: [0, 5, 6],
  hourStart: '18:00',
  hourEnd: '22:30',
  useVoiceChannel: true,
};

beforeEach(async () => {
  await discordRateLimitStore.resetAll();
  await createAdRateLimitStore.resetAll();
  await prisma.ad.deleteMany();
  await prisma.game.deleteMany();
  await prisma.$transaction([
    prisma.game.create({
      data: { id: GAME_ID, title: 'Game One', bannerUrl: 'https://example.com/one.jpg' },
    }),
    prisma.game.create({
      data: { id: OTHER_GAME_ID, title: 'Game Two', bannerUrl: 'https://example.com/two.jpg' },
    }),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('CORS', () => {
  it('allows the web dev origin by default', async () => {
    const response = await request(app).get('/games').set('Origin', 'http://localhost:5173');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('does not allow other origins', async () => {
    const response = await request(app).get('/games').set('Origin', 'https://evil.example.com');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('security headers', () => {
  it('sets the helmet headers and hides Express', async () => {
    const response = await request(app).get('/games').expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers).toHaveProperty('content-security-policy');
    expect(response.headers).not.toHaveProperty('x-powered-by');
  });
});

describe('GET /games', () => {
  it('lists games with their ad count', async () => {
    await request(app).post(`/games/${GAME_ID}/ads`).send(validAd).expect(201);

    const response = await request(app).get('/games').expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          id: GAME_ID,
          title: 'Game One',
          bannerUrl: 'https://example.com/one.jpg',
          _count: { ads: 1 },
        },
        {
          id: OTHER_GAME_ID,
          title: 'Game Two',
          bannerUrl: 'https://example.com/two.jpg',
          _count: { ads: 0 },
        },
      ]),
    );
  });
});

describe('POST /games/:id/ads', () => {
  it('creates an ad, returns it in the API shape and stores days and hours in their database format', async () => {
    const response = await request(app).post(`/games/${GAME_ID}/ads`).send(validAd).expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'Player One',
      yearsPlaying: validAd.yearsPlaying,
      weekDays: ['0', '5', '6'],
      hourStart: '18:00',
      hourEnd: '22:30',
      useVoiceChannel: true,
    });

    const stored = await prisma.ad.findUnique({ where: { id: response.body.id } });
    expect(stored).toMatchObject({
      gameId: GAME_ID,
      discord: 'player#1234',
      weekDays: '0,5,6',
      hourStart: 1080,
      hourEnd: 1350,
    });
  });

  it('returns 404 when the game does not exist', async () => {
    const response = await request(app).post(`/games/${MISSING_ID}/ads`).send(validAd).expect(404);

    expect(response.body).toEqual({ message: 'Game not found' });
    expect(await prisma.ad.count()).toBe(0);
  });

  it('returns 400 with field issues for an invalid body', async () => {
    const response = await request(app)
      .post(`/games/${GAME_ID}/ads`)
      .send({ ...validAd, hourStart: '25:00', weekDays: [] })
      .expect(400);

    expect(response.body.message).toBe('Invalid request body');
    expect(Object.keys(response.body.issues)).toEqual(
      expect.arrayContaining(['hourStart', 'weekDays']),
    );
    expect(await prisma.ad.count()).toBe(0);
  });

  it('returns 400 for malformed JSON', async () => {
    const response = await request(app)
      .post(`/games/${GAME_ID}/ads`)
      .set('Content-Type', 'application/json')
      .send('{"name":')
      .expect(400);

    expect(response.body).toEqual({ message: 'Malformed JSON body' });
  });

  it('returns 429 after too many ads from the same client', async () => {
    for (let i = 0; i < CREATE_AD_RATE_LIMIT; i++) {
      await request(app).post(`/games/${GAME_ID}/ads`).send(validAd).expect(201);
    }

    const response = await request(app).post(`/games/${GAME_ID}/ads`).send(validAd).expect(429);

    expect(response.body).toEqual({ message: 'Too many ads published, try again in an hour' });
    expect(response.headers).toHaveProperty('ratelimit-policy');
    expect(await prisma.ad.count()).toBe(CREATE_AD_RATE_LIMIT);
  });

  it('does not count rejected ads towards the limit', async () => {
    for (let i = 0; i < CREATE_AD_RATE_LIMIT; i++) {
      await request(app)
        .post(`/games/${GAME_ID}/ads`)
        .send({ ...validAd, weekDays: [] })
        .expect(400);
    }

    await request(app).post(`/games/${GAME_ID}/ads`).send(validAd).expect(201);
  });
});

describe('GET /games/:id/ads', () => {
  it('lists ads of the game newest first, without discord', async () => {
    await request(app)
      .post(`/games/${GAME_ID}/ads`)
      .send({ ...validAd, name: 'Older' })
      .expect(201);
    await new Promise((resolve) => setTimeout(resolve, 5));
    await request(app)
      .post(`/games/${GAME_ID}/ads`)
      .send({ ...validAd, name: 'Newer', hourStart: '09:05', hourEnd: '11:00', weekDays: [1] })
      .expect(201);
    await request(app)
      .post(`/games/${OTHER_GAME_ID}/ads`)
      .send({ ...validAd, name: 'Other game' })
      .expect(201);

    const response = await request(app).get(`/games/${GAME_ID}/ads`).expect(200);

    expect(response.body.map((ad: { name: string }) => ad.name)).toEqual(['Newer', 'Older']);
    expect(response.body[0]).toEqual({
      id: expect.any(String),
      name: 'Newer',
      yearsPlaying: 3,
      weekDays: ['1'],
      hourStart: '09:05',
      hourEnd: '11:00',
      useVoiceChannel: true,
    });
    expect(response.body[0]).not.toHaveProperty('discord');
  });

  it('returns an empty list for a game without ads', async () => {
    const response = await request(app).get(`/games/${GAME_ID}/ads`).expect(200);

    expect(response.body).toEqual([]);
  });

  it('returns 404 when the game does not exist', async () => {
    const response = await request(app).get(`/games/${MISSING_ID}/ads`).expect(404);

    expect(response.body).toEqual({ message: 'Game not found' });
  });
});

describe('GET /ads/:id/discord', () => {
  it('returns the discord of the ad', async () => {
    const created = await request(app).post(`/games/${GAME_ID}/ads`).send(validAd).expect(201);

    const response = await request(app).get(`/ads/${created.body.id}/discord`).expect(200);

    expect(response.body).toEqual({ discord: 'player#1234' });
  });

  it('returns 404 when the ad does not exist', async () => {
    const response = await request(app).get(`/ads/${MISSING_ID}/discord`).expect(404);

    expect(response.body).toEqual({ message: 'Ad not found' });
  });

  it('returns 429 after too many lookups from the same client', async () => {
    const created = await request(app).post(`/games/${GAME_ID}/ads`).send(validAd).expect(201);
    const url = `/ads/${created.body.id}/discord`;

    for (let i = 0; i < DISCORD_RATE_LIMIT; i++) {
      await request(app).get(url).expect(200);
    }

    const response = await request(app).get(url).expect(429);

    expect(response.body).toEqual({ message: 'Too many requests, try again later' });
    expect(response.headers).toHaveProperty('ratelimit-policy');
  });

  it('counts each client behind the proxy separately', async () => {
    const created = await request(app).post(`/games/${GAME_ID}/ads`).send(validAd).expect(201);
    const url = `/ads/${created.body.id}/discord`;

    for (let i = 0; i < DISCORD_RATE_LIMIT; i++) {
      await request(app).get(url).set('X-Forwarded-For', '203.0.113.1').expect(200);
    }

    await request(app).get(url).set('X-Forwarded-For', '203.0.113.1').expect(429);
    await request(app).get(url).set('X-Forwarded-For', '203.0.113.2').expect(200);
  });
});
