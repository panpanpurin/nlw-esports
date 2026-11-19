import { Router } from 'express';
import type { Ad, Game } from '../../../shared/api-types';
import { prisma } from '../lib/prisma';
import { HttpError } from '../errors/http-error';
import { asyncHandler } from '../middlewares/async-handler';
import { createAdSchema } from '../schemas/create-ad.schema';
import { convertHourStringToMinutes } from '../utils/convert-hour-string-to-minutes';
import { toAdResponse } from '../utils/to-ad-response';

export const gamesRoutes = Router();

gamesRoutes.get(
  '/',
  asyncHandler(async (request, response) => {
    const games = await prisma.game.findMany({
      include: {
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    return response.json(games satisfies Game[]);
  }),
);

gamesRoutes.post(
  '/:id/ads',
  asyncHandler(async (request, response) => {
    const gameId = request.params.id;
    const body = createAdSchema.parse(request.body);

    const game = await prisma.game.findUnique({ where: { id: gameId }, select: { id: true } });

    if (!game) {
      throw new HttpError(404, 'Game not found');
    }

    const ad = await prisma.ad.create({
      data: {
        gameId,
        name: body.name,
        yearsPlaying: body.yearsPlaying,
        discord: body.discord,
        weekDays: body.weekDays.join(','),
        hourStart: convertHourStringToMinutes(body.hourStart),
        hourEnd: convertHourStringToMinutes(body.hourEnd),
        useVoiceChannel: body.useVoiceChannel,
      },
    });

    return response.status(201).json(toAdResponse(ad) satisfies Ad);
  }),
);

gamesRoutes.get(
  '/:id/ads',
  asyncHandler(async (request, response) => {
    const gameId = request.params.id;

    const game = await prisma.game.findUnique({ where: { id: gameId }, select: { id: true } });

    if (!game) {
      throw new HttpError(404, 'Game not found');
    }

    const ads = await prisma.ad.findMany({
      select: {
        id: true,
        name: true,
        weekDays: true,
        useVoiceChannel: true,
        yearsPlaying: true,
        hourStart: true,
        hourEnd: true,
      },
      where: {
        gameId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return response.json(ads.map(toAdResponse) satisfies Ad[]);
  }),
);
