import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';

const serverRoot = path.resolve(__dirname, '..');
const databaseFile = path.join(serverRoot, 'prisma', 'test.sqlite');

function removeDatabase() {
  rmSync(databaseFile, { force: true });
  rmSync(`${databaseFile}-journal`, { force: true });
}

export function setup() {
  removeDatabase();
  execSync('npx prisma migrate deploy', {
    cwd: serverRoot,
    env: { ...process.env, DATABASE_URL: 'file:./prisma/test.sqlite' },
    stdio: 'ignore',
  });
}

export function teardown() {
  removeDatabase();
}
