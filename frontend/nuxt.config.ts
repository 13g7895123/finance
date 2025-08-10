export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:9219/api'
    }
  },
  // Development configuration
  vite: {
    server: {
      hmr: {
        port: 24678 // Different port for HMR to avoid conflicts
      }
    }
  },
  // Enable hot module replacement in development
  nitro: {
    experimental: {
      wasm: true
    }
  }
})