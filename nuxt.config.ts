// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@prisma/nuxt'],
  devtools: { enabled: true },
  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.prisma/client/index-browser.js",
      },
    },
  },
  app: {
    head: {
      title: 'Kapitalist',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [{
        charset: 'utf-8',
      },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        }],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
      ]
    }
  },
  css: ["bulma/css/bulma.css"],
  compatibilityDate: '2024-11-01',
  eslint: {
    config: {
    },
  },
})