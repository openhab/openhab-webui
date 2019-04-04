module.exports = function (ctx) {
  return {
    plugins: [
      'axios',
      'jexl'
    ],
    css: [
      'app.styl'
    ],
    extras: [
      ctx.theme.mat ? 'roboto-font' : null,
      'material-icons',
      // 'ionicons',
      'mdi'
      // 'fontawesome'
    ],
    supportIE: false,
    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      publicPath: '/habot/',
      devtool: 'source-map',
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      // useNotifier: false,
      chainWebpack (chain, { isServer, isClient }) {
        if (!ctx.dev) {
          chain.plugin('manifest-crossorigin').use(class ManifestCrossoriginPlugin {
            apply (compiler) {
              compiler.hooks.compilation.tap('webpack-plugin-manifest-crossorigin', compilation => {
                compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('webpack-plugin-manifest-crossorigin', (data, callback) => {
                  if (data.head) {
                    for (let tag of data.head) {
                      if (tag.tagName === 'link' && tag.attributes.rel === 'manifest') {
                        tag.attributes.crossorigin = 'use-credentials'
                        tag.attributes.href = '/habot/statics/manifest.json'
                      }
                    }
                  }
                  // finally, inform Webpack that we're ready
                  callback(null, data)
                })
              })
            }
          }, [])
        }
      },
      extendWebpack (cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/
        })

        // console.log(JSON.stringify(cfg, null, 2))
        if (cfg.output) {
          cfg.output.chunkFilename = cfg.output.chunkFilename.replace('[id]', '[name]-[id]')

          cfg.optimization.splitChunks.cacheGroups['echarts'] = {
            test: /echarts|zrender/,
            name: 'charts',
            chunks: 'all',
            priority: 1000
          }
          cfg.optimization.splitChunks.cacheGroups['moment'] = {
            test: /moment/,
            name: 'moment',
            chunks: 'all',
            priority: 999
          }
        }

        for (let plugin of cfg.plugins) {
          if (plugin.options && plugin.options.uglifyOptions) {
            plugin.options.uglifyOptions.mangle = { reserved: ['self'] }
          }

          if (plugin.definitions && plugin.definitions['process.env']) {
            plugin.definitions['process.env']['BUILD_TIMESTAMP'] = Date.now().toString()
          }
        }
      }
    },
    devServer: {
      // https: true,
      port: 8081,
      open: false, // opens browser window automatically
      proxy: {
        '/rest': 'http://localhost:8080',
        '/chart': 'http://localhost:8080',
        '/proxy': 'http://localhost:8080'
      }
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QLayout',
        'QLayoutHeader',
        'QLayoutFooter',
        'QLayoutDrawer',
        'QPageContainer',
        'QPage',
        'QPageSticky',
        'QAlert',
        'QFab',
        'QTooltip',
        'QFabAction',
        'QToolbar',
        'QToolbarTitle',
        'QModal',
        'QModalLayout',
        'QDialog',
        'QBtnGroup',
        'QBtn',
        'QBtnDropdown',
        'QSpinnerRadio',
        'QSpinnerAudio',
        'QSpinnerDots',
        'QIcon',
        'QList',
        'QListHeader',
        'QItem',
        'QItemMain',
        'QItemSeparator',
        'QItemSide',
        'QItemTile',
        'QCollapsible',
        'QTabs',
        'QTab',
        'QTabPane',
        'QField',
        'QSelect',
        'QInput',
        'QSearch',
        'QChipsInput',
        'QAutocomplete',
        'QOptionGroup',
        'QChatMessage',
        'QResizeObservable',
        'QWindowResizeObservable',
        'QPullToRefresh',
        'QInnerLoading',
        'QPopover',
        'QCard',
        'QCardTitle',
        'QCardActions',
        'QCardMain',
        'QCardMedia',
        'QCheckbox',
        'QRadio',
        'QToggle',
        'QKnob',
        'QSlider',
        'QTree',
        'QTable',
        'QTableColumns',
        'QTd',
        'QChip',
        'QTimeline',
        'QTimelineEntry',
        'QColorPicker',
        'QDatetime',
        'QCarousel',
        'QCarouselSlide',
        'QCarouselControl',
        'QStepper',
        'QStep',
        'QStepperNavigation',
        'QScrollArea'
      ],
      directives: [
        'Ripple',
        'CloseOverlay'
      ],
      plugins: [
        'ActionSheet',
        'Notify',
        'Dialog',
        'Loading',
        'LocalStorage',
        'SessionStorage'
      ]
    },
    // animations: 'all' --- includes all animations
    animations: [
      'fadeIn',
      'fadeOut'
    ],
    pwa: {
      workboxPluginMode: 'InjectManifest',
      workboxOptions: (ctx.dev) ? {} : {
        importWorkboxFrom: 'local'
      },
      manifest: {
        name: 'HABot',
        short_name: 'HABot',
        description: 'Chatbot for openHAB',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ff6600',
        start_url: '/habot/',
        icons: [
          {
            'src': 'statics/icons/icon-72x72.png',
            'sizes': '72x72',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      extendWebpack (cfg) {
        // do something with cfg
      },
      packager: {
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      }
    },

    // leave this here for Quasar CLI
    starterKit: '1.0.0-beta.4'
  }
}
