import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Keep the 3D stack out of the first-paint chunk (CLAUDE.md §4.5).
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/three|@react-three|postprocessing|maath/.test(id)) return 'three';
          if (/gsap|lenis/.test(id)) return 'motion';
          if (/react|scheduler/.test(id)) return 'react';
        },
      },
    },
  },
});
