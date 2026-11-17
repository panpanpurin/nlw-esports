import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';

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
  it('creates an ad and stores days and hours in their database format', async () => {
    const response = await request(app).post(`/games/${GAME_ID}/ads`).send(validAd).expect(201);

    expect(response.body).toMatchObject({
      gameId: GAME_ID,
      name: 'Player One',
      discord: 'player#1234',
      weekDays: '0,5,6',
      hourStart: 1080,
      hourEnd: 1350,
      useVoiceChannel: true,
    });

    const stored = await prisma.ad.findUnique({ where: { id: response.body.id } });
    expect(stored?.gameId).toBe(GAME_ID);
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
});
