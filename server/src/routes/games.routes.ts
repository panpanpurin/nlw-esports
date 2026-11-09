import { Router } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../errors/http-error";
import { asyncHandler } from "../middlewares/async-handler";
import { convertHourStringToMinutes } from "../utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "../utils/convert-minutes-to-hour-string";

export const gamesRoutes = Router();

gamesRoutes.get("/", asyncHandler(async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                },
            },
        },
    });

    return response.json([games]);
}));

gamesRoutes.post("/:id/ads", asyncHandler(async (request, response) => {
    const gameId = request.params.id;
    const body: any = request.body;

    const game = await prisma.game.findUnique({ where: { id: gameId }, select: { id: true } });

    if (!game) {
        throw new HttpError(404, "Game not found");
    }

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(","),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        },
    });
    console.log('data')
    return response.status(201).json(ad);
}));

gamesRoutes.get("/:id/ads", asyncHandler(async (request, response) => {
    const gameId = request.params.id;

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
            createdAt: "desc",
        },
    });

    return response.json(
        ads.map((ad) => {
            return {
                ...ad,
                weekDays: ad.weekDays.split(","),
                hourStart: convertMinutesToHourString(ad.hourStart),
                hourEnd: convertMinutesToHourString(ad.hourEnd),
            };
        })
    );
}));
