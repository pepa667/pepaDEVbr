import { defineConfig } from 'vite'
import webfontDl from 'vite-plugin-webfont-dl'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    webfontDl([
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Roboto+Slab:wght@400;900&family=Space+Mono&display=swap"
    ], {
      // 1. Força o plugin a injetar a tag <link rel="preload"> no HTML final de build automaticamente
      injectAs: 'preload',

      // 2. Filtra para o Google mandar APENAS os caracteres latinos (PT-BR)
      // Arranca fora cirílico, grego e símbolos desnecessários, reduzindo o arquivo em até 70%
      subsets: ['latin'],

      // 3. Garante que o CSS venha com font-display: swap ativo
      fontDisplay: 'swap'
    }),
  ],
})
