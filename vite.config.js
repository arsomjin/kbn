import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      // Add path aliases for absolute imports
      components: resolve(__dirname, './src/components'),
      elements: resolve(__dirname, './src/elements'),
      contexts: resolve(__dirname, './src/contexts'),
      hooks: resolve(__dirname, './src/hooks'),
      utils: resolve(__dirname, './src/utils'),
      services: resolve(__dirname, './src/services'),
      constants: resolve(__dirname, './src/constants'),
      pages: resolve(__dirname, './src/pages'),
      routes: resolve(__dirname, './src/routes'),
      translations: resolve(__dirname, './src/translations'),
      store: resolve(__dirname, './src/store'),
      assets: resolve(__dirname, './src/assets'),
      api: resolve(__dirname, './src/api'),
      data: resolve(__dirname, './src/data'),
      styles: resolve(__dirname, './src/styles'),
      modules: resolve(__dirname, './src/modules'),
      firebaseConfig: resolve(__dirname, './src/firebase'),
    },
  },
});
