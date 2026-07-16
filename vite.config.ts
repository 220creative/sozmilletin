import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Kök alan adında yayınlanıyor. Mutlak taban ('/'), prerender edilen
  // /haber/{id}/index.html alt yollarının da varlıkları /assets/... üzerinden
  // doğru çözmesi için gerekli (göreli './' alt dizinde kırılır).
  base: '/',
  build: {
    rollupOptions: {
      output: {
        // Satıcı kütüphanelerini ayrı chunk'lara böl (daha iyi önbellek + küçük ilk yük)
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('react-router') || id.includes('/react/') || id.includes('react-dom')) return 'react-vendor';
          }
        },
      },
    },
  },
})
