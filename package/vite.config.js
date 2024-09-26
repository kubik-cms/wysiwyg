const path = require('path')
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'wysiwyg'
    },
    rollupOptions: {
      external: ['@hotwired/stimulus'],
      output: {
        globals: {
          "@hotwired/stimulus": 'Stimulus'
        }
      }
    }
  }
})
