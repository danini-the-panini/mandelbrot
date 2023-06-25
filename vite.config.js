import { resolve } from 'path'
import { defineConfig } from 'vite'

import brots from './brots.js'

export default defineConfig({
  build: {
    rollupOptions: {
      input: [
        resolve(__dirname, 'index.html'),
        ...Object.keys(brots).map(brot => resolve(__dirname, `pages/${brot}.html`))
      ]
    }
  }
})
