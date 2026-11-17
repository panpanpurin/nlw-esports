import { describe, expect, it } from 'vitest';
import { getPrismaLogLevels } from './prisma';

describe('getPrismaLogLevels', () => {
  it('logs only warnings and errors by default', () => {
    expect(getPrismaLogLevels({})).toEqual(['warn', 'error']);
  });

  it('adds queries when PRISMA_LOG_QUERIES is true', () => {
    expect(getPrismaLogLevels({ PRISMA_LOG_QUERIES: 'true' })).toEqual(['query', 'warn', 'error']);
  });

  it.each(['false', '1', ''])('ignores PRISMA_LOG_QUERIES=%j', (value) => {
    expect(getPrismaLogLevels({ PRISMA_LOG_QUERIES: value })).toEqual(['warn', 'error']);
  });
});
