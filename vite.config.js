import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { CLIENTE } from './src/cliente.js';

// El título de la pestaña sale de src/cliente.js, como todo lo que nombra a la marca
export const conCliente = { name: 'cliente', transformIndexHtml: (html) => html.replaceAll('%CLIENTE%', CLIENTE.nombre) };

export default defineConfig({
  plugins: [react(), conCliente],
  server: { port: 3000 },
  build: { outDir: 'dist', sourcemap: false },
});
