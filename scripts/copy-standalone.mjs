/**
 * Copies required static assets into the standalone output directory so that
 * `node .next/standalone/server.js` works without any extra manual steps.
 *
 * Next.js intentionally omits static files from the standalone bundle; they
 * must be copied alongside the server before it is started.
 *
 * See: https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-traced-files
 */
import { cpSync, existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const standaloneDir = join(root, '.next', 'standalone');

if (!existsSync(standaloneDir)) {
  console.error(
    'Standalone output directory not found. Make sure `output: "standalone"` is set in next.config.mjs and that you have run `next build`.'
  );
  process.exit(1);
}

// Copy .next/static -> .next/standalone/.next/static
cpSync(join(root, '.next', 'static'), join(standaloneDir, '.next', 'static'), {
  recursive: true,
});
console.log('Copied .next/static -> .next/standalone/.next/static');

// Copy public/ -> .next/standalone/public (only if the directory exists)
const publicDir = join(root, 'public');
if (existsSync(publicDir)) {
  cpSync(publicDir, join(standaloneDir, 'public'), { recursive: true });
  console.log('Copied public/ -> .next/standalone/public');
}
