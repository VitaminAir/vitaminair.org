import { defineConfig, type Plugin } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { generate } from './scripts/generate.ts';

const site = resolve(import.meta.dirname, '.site');

function htmlInputs(dir: string, acc: Record<string, string> = {}): Record<string, string> {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) htmlInputs(p, acc);
    else if (f.endsWith('.html')) acc[relative(site, p).replace(/\.html$/, '').replace(/[\\/]/g, '_')] = p;
  }
  return acc;
}

// In dev, regenerate the HTML whenever content, data, templates or styles change.
function regenerate(): Plugin {
  const watched = ['src/content', 'src/data', 'src/templates', 'src/styles', 'src/lib', 'src/hero'].map((d) => resolve(import.meta.dirname, d));
  return {
    name: 'va-regenerate',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(watched);
      let timer: NodeJS.Timeout | undefined;
      server.watcher.on('all', (_ev, file) => {
        if (!watched.some((w) => file.startsWith(w))) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          try {
            generate();
            server.ws.send({ type: 'full-reload' });
          } catch (e) {
            server.config.logger.error((e as Error).message);
          }
        }, 150);
      });
    },
  };
}

export default defineConfig(({ command }) => ({
  root: site,
  appType: 'mpa',
  publicDir: resolve(import.meta.dirname, 'public'),
  plugins: [regenerate()],
  server: { fs: { allow: [resolve(import.meta.dirname)] } },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: { input: command === 'build' ? htmlInputs(site) : undefined },
  },
  preview: { port: 4173 },
}));
