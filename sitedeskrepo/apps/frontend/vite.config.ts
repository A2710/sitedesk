import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load .env files based on the current mode (development, production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173 },
    define: {
      'process.env': {},      // prevent accidental access to Node env
      'import.meta.env': env,
    },
    // Optionally expose only specific env vars to client
    envPrefix: 'VITE_',
  };
});