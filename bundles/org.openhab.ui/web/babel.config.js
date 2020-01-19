module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      targets: {
        browsers: [
          'Android >= 5',
          'IOS >= 9.3',
          'Edge >= 15',
          'Safari >= 9.1',
          'Chrome >= 49',
          'Firefox >= 31',
          'Samsung >= 5'
        ]
      }
    }]
  ],
  plugins: [
    'transform-vue-jsx',
    // "@babel/plugin-transform-runtime",
    '@babel/plugin-syntax-dynamic-import'
  ],
  env: {
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        'babel-plugin-dynamic-import-node-babel-7'
      ],
      presets: [
        [
          '@babel/preset-env',
          {
            'modules': 'commonjs',
            'targets': {
              'node': 'current'
            }
          }
        ]
      ]
    }
  }
}
