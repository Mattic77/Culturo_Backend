#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

// Load .env if present
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
} catch (e) {}

const direct = process.env.DIRECT_URL;
if (!direct) {
  console.error('DIRECT_URL not found in environment or .env file.');
  process.exit(1);
}

// Build env with DATABASE_URL overridden to DIRECT_URL
const env = Object.assign({}, process.env, { DATABASE_URL: direct });

// Forward any args to the prisma CLI (e.g. "migrate deploy" or "migrate dev")
const args = process.argv.slice(2);
if (args.length === 0) {
  // default to a safe production deploy
  args.push('prisma', 'migrate', 'deploy');
}

// If user passed raw prisma args, allow both forms:
// - npm run migrate:direct -- migrate dev
// - npm run migrate:direct -- prisma migrate dev

let cliArgs = args;
if (args[0] !== 'prisma') {
  // If first arg isn't 'prisma', assume they passed the rest directly
  // Example: ['migrate','deploy'] => ['prisma','migrate','deploy']
  if (args[0] === 'migrate' || args[0] === 'generate' || args[0] === 'db') {
    cliArgs = ['prisma', ...args];
  } else if (args.length === 1 && args[0].includes(' ')) {
    cliArgs = ['prisma', ...args[0].split(' ').filter(Boolean)];
  }
}

const res = spawnSync('npx', cliArgs, { stdio: 'inherit', env, cwd: process.cwd() });
process.exit(res.status === null ? 1 : res.status);
