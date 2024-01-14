const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const WebpackAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ESLintPlugin = require('eslint-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin')

const path = require('path')

function resolvePath(dir) {
  return path.join(__dirname, '..', dir)
}

const env = process.env.NODE_ENV || 'development'
const target = process.env.TARGET || 'web'
const buildSourceMaps = process.env.SOURCE_MAPS || false
const isCordova = target === 'cordova'

const apiBaseUrl = process.env.OH_APIBASE || 'http://localhost:8080'

module.exports = {
  mode: env,
  entry: [
    './src/js/app.js'
  ],
  output: {
    path: resolvePath(isCordova ? 'cordova/www' : 'www'),
    filename: 'js/app.[contenthash].js',
    publicPath: '/',
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json'
  },
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
    },
    extensions: ['.mjs', '.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolvePath('src')
    }
  },
  devtool: env === 'production' ? (buildSourceMaps) ? 'source-map' : false : 'eval-source-map',
  devServer: {
    hot: true,
    // open: true,
    // compress: true,
    static: [
      path.resolve(__dirname, 'www'),
    ],
    allowedHosts: "all",
    historyApiFallback: true,
    // watchOptions: {
    //   poll: 1000,
    // },
    proxy: [{
      context: ['/auth', '/rest', '/chart', '/proxy', '/icon', '/static', '/changePassword', '/createApiToken', '/audio'],
      target: apiBaseUrl
    }]
  },
  performance: {
    maxAssetSize: 2048000,
    maxEntrypointSize: 2500000
  },
  optimization: {
    moduleIds: env === 'production' ? undefined : 'named',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          sourceMap: true
        }
      }),
      new CssMinimizerPlugin(),
    ]
  },
  module: {
    rules: [
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: []
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        include: [
          resolvePath('src'),
          resolvePath('node_modules/framework7'),
          resolvePath('node_modules/framework7-vue'),

          resolvePath('node_modules/template7'),
          resolvePath('node_modules/dom7'),
          resolvePath('node_modules/ssr-window')
        ]
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.styl(us)?$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac|m4a)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'media/[name].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.nearley$/,
        use: [
          'babel-loader',
          'nearley-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
  }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.TARGET': JSON.stringify(target)
    }),
    new VueLoaderPlugin(),
    ...(env === 'production' ? [
      new ESLintPlugin({
        extensions: ['js', 'vue']
      }),
      new webpack.optimize.ModuleConcatenationPlugin()
    ] : [
      // Development only plugins
    ]),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './src/index.html',
      inject: true,
      minify: env === 'production' ? {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      } : false
    }),
    new MiniCssExtractPlugin({
      filename: 'css/app.[contenthash].css'
    }),
    new CopyWebpackPlugin([
      {
        from: resolvePath('src/res'),
        to: resolvePath(isCordova ? 'cordova/www/res' : 'www/res')
      },
      {
        from: resolvePath('src/manifest.json'),
        to: resolvePath('www/manifest.json')
      },
      {
        from: resolvePath('src/robots.txt'),
        to: resolvePath('www/robots.txt')
      }
    ]),
    ...(!isCordova && env === 'production' ? [
      new WorkboxPlugin.InjectManifest({
        swSrc: resolvePath('src/service-worker.js'),
        maximumFileSizeToCacheInBytes: 100000000,
      })
    ] : []),
    ...(env === 'production' ? [
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 0,
        minRatio: Infinity,
      }),
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|css|html|svg)$/,
        compressionOptions: {
          level: 11,
        },
        threshold: 0,
        minRatio: Infinity,
      })
    ] : []),
    ...(process.env.WEBPACK_ANALYZER ? [
      new WebpackAnalyzerPlugin(process.env.WEBPACK_ANALYZER_REPORT ? {
        analyzerMode: 'static',
        reportFilename: '../report.html',
        generateStatsFile: (process.env.WEBPACK_ANALYZER_REPORT_STATS) ? true : false,
        statsFilename: '../stats.json',
        statsOptions: {
          assets: true,
          entrypoints: true,
          chunks: true
        }
      } : {})
    ] : [])
  ]
}
