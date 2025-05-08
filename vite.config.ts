import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'), // Use Render PORT env
    proxy: {
      '/api': {
        target: 'https://oas-rest-api-evaluator-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: parseInt(process.env.PORT || '4173'), // For npm run preview
    host: '0.0.0.0',
  }
});


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'https://oas-rest-api-evaluator-backend.onrender.com',
//         changeOrigin: true,
//       },
//     },
//   },
// });