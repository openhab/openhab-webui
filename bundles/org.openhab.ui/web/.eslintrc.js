module.exports = {
  root: true,

  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    sourceType: 'module'
  },

  env: {
    browser: true,
    node: true,
    es6: true
  },

  extends: [
    'eslint:recommended',
    'plugin:cypress/recommended',
    'plugin:vue/recommended'
  ],

  plugins: [
    '@babel',
    'import',
    'cypress',
    'vue'
  ],

  globals: {
    'ga': true, // Google Analytics
    'cordova': true,
    '__statics': true,
    'process': true
  },

  // add your custom rules here
  rules: {
    'arrow-parens': 'off',
    'comma-dangle': 'error',
    'comma-spacing': 'error',
    'eol-last': 'error',
    'generator-star-spacing': 'off',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/first': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'jsx-quotes': 'error',
    'linebreak-style': 'off',
    'no-case-declarations': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'no-trailing-spaces': 'error',
    'no-unsafe-optional-chaining': 'error',
    'no-whitespace-before-property': 'error',
    'one-var': 'off',
    'prefer-promise-reject-errors': 'off',
    'quotes': ['error', 'single'],
    'space-in-parens': 'error',
    'vue/attribute-hyphenation': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/html-indent': 'error',
    'vue/html-quotes': 'error',
    'vue/no-multi-spaces': 'error',
    'vue/no-v-html': 'off',

    // The following rules should be activated successively. Due to the large amount
    // of required changes, the activations should be clustered in several pull requests.
    'camelcase': 'off',
    'no-empty': ['off', { 'allowEmptyCatch': true }],
    'no-unused-vars': 'off',
    'no-useless-catch': 'off',
    'vue/attributes-order': 'off',
    'vue/component-tags-order': ['off', { 'order': ['template', 'script', 'style'] }],
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-closing-bracket-spacing': 'error',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/mustache-interpolation-spacing': 'off',
    'vue/no-mutating-props': 'off',
    'vue/no-parsing-error': 'off',
    'vue/no-template-shadow': 'off',
    'vue/order-in-components': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/this-in-template': 'off',
    'vue/v-on-style': 'off',
    'vue/v-slot-style': 'off',
    'vue/valid-v-slot': 'off'
  }
}
