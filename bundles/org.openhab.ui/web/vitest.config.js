import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue';
import path from 'path'
import Framework7 from 'framework7'
import Framework7Vue, * as Framework7VueComponents from 'framework7-vue'


export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'f7vue': 'framework7-vue/bundle'
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.js'
    }
})