import { defineConfig } from 'vite'
import webfontDl from 'vite-plugin-webfont-dl'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    webfontDl([
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Roboto+Slab:wght@400;700;900&family=Space+Mono&display=swap"
    ]),
  ],
})
