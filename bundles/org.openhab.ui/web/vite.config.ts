import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevtools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'
import vitePluginTopLevelAwait from 'vite-plugin-top-level-await'
// import pluginDynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import pluginDynamicImport from 'vite-plugin-dynamic-import'
import { resolve } from 'path'
import { plugin } from 'typescript-eslint'
import webpackStatsPlugin from 'rollup-plugin-webpack-stats'

const projectRootDir = resolve(__dirname)

const apiBaseUrl = process.env.OH_APIBASE || 'http://localhost:8080'
const maven = process.env.MAVEN || false
const stats = process.env.STATS || false
if (!maven) {
  console.log(`Using openHAB API base URL: ${apiBaseUrl}`)
}
const outPath = maven ? '../target/classes/app' : 'www'
if (stats) {
  console.log(`Build will generate webpack stats file: ${outPath}/webpack-stats.json`)
}

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag : string) => ['field', 'block', 'category', 'xml', 'mutation', 'value', 'sep', 'shadow'].includes(tag) // blockly custom elements
        }
      }
    }),
    {
      name: 'html-injector',
      apply: 'build',
      transformIndexHtml () {
        return [
          {
            tag: 'meta',
            injectTo: 'head-prepend',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: "default-src 'self' 'unsafe-inline' 'unsafe-eval'; font-src 'self' data:; img-src * data:; media-src * data: blob: media:; frame-src *; connect-src 'self' *.openhab.org raw.githubusercontent.com api.iconify.design api.unisvg.com api.simplesvg.com *; worker-src 'self' blob:;"
            }
          }
        ]
      }
    },
    pluginDynamicImport({
      filter (id) {
        if (id.includes('/node_modules/')) {
          return true
        }
      }
    }),
    vueDevtools(),
    visualizer({ open: false }),
    vitePluginTopLevelAwait(),
    stats ? webpackStatsPlugin() : null
  ],
  define: {
    // __VUE_I18N_LEGACY_API__: false // tree-shake legacy mode
  },
  server: {
    port: 8081,
    host: '0.0.0.0',
    proxy: {
      '/rest': {
        target: apiBaseUrl,
        secure: false
      },
      '/auth': {
        target: apiBaseUrl,
        secure: false
      },
      '/chart': {
        target: apiBaseUrl,
        secure: false
      },
      '/proxy': {
        target: apiBaseUrl,
        secure: false
      },
      '/icon': {
        target: apiBaseUrl,
        secure: false
      },
      '/static': {
        target: apiBaseUrl,
        secure: false
      },
      '/changePassword': {
        target: apiBaseUrl,
        secure: false
      },
      '/createApiToken': {
        target: apiBaseUrl,
        secure: false
      },
      '/audio': {
        target: apiBaseUrl,
        secure: false
      },
      '/ws/logs': {
        target: apiBaseUrl,
        ws: true
      },
      '/ws/events': {
        target: apiBaseUrl,
        ws: true
      }
    }
  },
  build: {
    outDir: resolve(outPath),
    emptyOutDir: true,
    target: ['chrome107', 'edge107', 'firefox104', 'safari11.1'],
  },
  resolve: {
    alias: {
      '@': resolve(projectRootDir, 'src'),
      '@node_modules': resolve(projectRootDir, 'node_modules')
    }
  }
})
