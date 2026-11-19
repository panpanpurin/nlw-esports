import 'dotenv/config';
import { createPrismaClient } from '../src/lib/prisma';

const prisma = createPrismaClient();

const games = [
  {
    id: 'baeef890-1752-4ba7-8920-5e1f5de2ba17',
    title: 'League of Legends',
    bannerUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/21779-285x380.jpg',
  },
  {
    id: 'f22e7422-9865-436d-ab5c-3f98fd78470e',
    title: 'Valorant',
    bannerUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/516575-285x380.jpg',
  },
  {
    id: '487d8572-c63a-4318-9c63-44284c97a48c',
    title: 'Fortnite',
    bannerUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/33214-285x380.jpg',
  },
  {
    id: 'cda3eaf1-6f6e-4229-a4a5-fee09b2334e8',
    title: 'CS:GO',
    bannerUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/32399_IGDB-285x380.jpg',
  },
  {
    id: '6d43c45e-5d98-4b14-9797-fec502899d7a',
    title: 'Super Smash Bros. Ultimate',
    bannerUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/504461_IGDB-285x380.jpg',
  },
  {
    id: 'da183fd6-af01-4463-b3cc-b7df0101d698',
    title: 'Splatoon 3',
    bannerUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/1158884259_IGDB-285x380.jpg',
  },
];

async function main() {
  for (const game of games) {
    await prisma.game.upsert({
      where: { id: game.id },
      update: { title: game.title, bannerUrl: game.bannerUrl },
      create: game,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
