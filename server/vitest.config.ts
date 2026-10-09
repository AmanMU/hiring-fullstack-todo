import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.ts'],
    // The first run downloads a MongoDB binary for the in-memory server.
    hookTimeout: 60_000,
  },
});
