import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../errors/http-error';
import { asyncHandler } from '../middlewares/async-handler';

export const adsRoutes = Router();

adsRoutes.get(
  '/:id/discord',
  asyncHandler(async (request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUnique({
      select: {
        discord: true,
      },
      where: {
        id: adId,
      },
    });

    if (!ad) {
      throw new HttpError(404, 'Ad not found');
    }

    return response.json({
      discord: ad.discord,
    });
  }),
);
