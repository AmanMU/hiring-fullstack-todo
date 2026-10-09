import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    // Forwards /api to the Express server in dev, so the browser sees one origin and needs no CORS.
    proxy: { '/api': 'http://localhost:4000' },
  },
});
