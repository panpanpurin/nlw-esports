import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { Prisma, PrismaClient } from '../generated/prisma/client';

export function getPrismaLogLevels(env: NodeJS.ProcessEnv): Prisma.LogLevel[] {
  return env.PRISMA_LOG_QUERIES === 'true' ? ['query', 'warn', 'error'] : ['warn', 'error'];
}

export function createPrismaClient(env: NodeJS.ProcessEnv = process.env) {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  const adapter = new PrismaBetterSqlite3(
    { url: env.DATABASE_URL },
    { timestampFormat: 'unixepoch-ms' },
  );

  return new PrismaClient({ adapter, log: getPrismaLogLevels(env) });
}

export const prisma = createPrismaClient();
