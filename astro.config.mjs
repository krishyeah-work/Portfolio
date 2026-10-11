// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // TODO: replace with the final domain before deploying.
  site: 'https://krishnarevanth.example',
  build: { inlineStylesheets: 'always' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
