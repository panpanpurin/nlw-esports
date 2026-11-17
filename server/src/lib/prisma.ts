import { Prisma, PrismaClient } from '@prisma/client';

export function getPrismaLogLevels(env: NodeJS.ProcessEnv): Prisma.LogLevel[] {
  return env.PRISMA_LOG_QUERIES === 'true' ? ['query', 'warn', 'error'] : ['warn', 'error'];
}

export const prisma = new PrismaClient({
  log: getPrismaLogLevels(process.env),
});
