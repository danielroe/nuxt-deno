import deno from './rollup-plugin-node-deno'
// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  nitro: {
    entry: '~/deno-entry',
    commands: {
      preview: 'deno run --unstable --allow-net --allow-read --allow-env ./server/index.mjs'
    },
    rollupConfig: {
      output: {
        hoistTransitiveImports: false
      },
      plugins: [
        deno(),
        {
          name: 'inject-process',
          renderChunk (code, chunk) {
            if (chunk.isEntry) {
              return "import process from 'https://deno.land/std/node/process.ts'\n" + code
              // TODO: use magic-string when moving to nitro
              // s.prepend("import process from 'https://deno.land/std/node/process.ts'\n")
            }
          }
        }
      ],
    },
  },
})
