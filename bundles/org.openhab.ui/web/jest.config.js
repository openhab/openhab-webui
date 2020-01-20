module.exports = {
  globals: {
    __DEV__: true
  },
  // setupFilesAfterEnv: [
  //   '<rootDir>/test/jest/jest.setup.js'
  // ],
  // noStackTrace: true,
  // bail: true,
  // cache: false,
  // verbose: true,
  // watch: true,
  collectCoverage: false,
  coverageDirectory: '<rootDir>/test/jest/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.vue',
    '<rootDir>/src/**/*.js',
    '<rootDir>/src/**/*.ts',
    '<rootDir>/src/**/*.jsx'
  ],
  coverageThreshold: {
    global: {
    //  branches: 50,
    //  functions: 50,
    //  lines: 50,
    //  statements: 50
    }
  },
  testMatch: [
    '<rootDir>/test/jest/__tests__/**/*.spec.js',
    '<rootDir>/test/jest/__tests__/**/*.test.js',
    '<rootDir>/src/**/__tests__/*_jest.spec.js'
  ],
  moduleFileExtensions: [
    'vue',
    'js',
    'jsx',
    'json',
    'ts',
    'tsx'
  ],
  moduleNameMapper: {
    '^vue$': '<rootDir>/node_modules/vue/dist/vue.common.js',
    '^test-utils$': '<rootDir>/node_modules/@vue/test-utils/dist/vue-test-utils.js',
    '^~/(.*)$': '<rootDir>/$1',
    '^framework7$': '<rootDir>/node_modules/framework7/framework7.esm.bundle.js',
    '^f7vue$': '<rootDir>/node_modules/framework7-vue/framework7-vue.esm.bundle.js',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    // '.*css$': '<rootDir>/test/jest/utils/stub.css'
  },
  transform: {
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    '.*\\.js$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!framework7|framework7-vue|template7|dom7/)'
  ],
  // transformIgnorePatterns: [
  //   '.*\\.js$'
  // ],
  snapshotSerializers: [
    '<rootDir>/node_modules/jest-serializer-vue'
  ]
}
