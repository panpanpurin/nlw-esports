import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'file:./test.sqlite',
      NODE_ENV: 'test',
      TRUST_PROXY: '1',
    },
    globalSetup: './test/global-setup.ts',
    fileParallelism: false,
  },
});
