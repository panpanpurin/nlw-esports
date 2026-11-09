import { Router } from "express";
import { prisma } from "../lib/prisma";

export const adsRoutes = Router();

adsRoutes.get("/:id/discord", async (request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        },
    });

    return response.json({
        discord: ad.discord,
    });
});
