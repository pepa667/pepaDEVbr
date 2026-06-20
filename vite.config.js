import { defineConfig } from 'vite'
import Unfonts from 'unplugin-fonts/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    Unfonts({
      google: {
        families: [
          {
            name: "Roboto Slab",
            styles: "wght@400;700;900",
          },
          {
            name: "Inter",
            styles: "wght@300;400;600",
          },
          {
            name: "Space Mono",
          }
        ],
        display: 'swap',
      },
    }),
  ],
})
