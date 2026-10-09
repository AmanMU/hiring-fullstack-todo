import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.ts'],
    // the first run downloads the MongoDB binary
    hookTimeout: 60_000,
  },
});
