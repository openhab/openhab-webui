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
    '@vue/standard',
    'plugin:cypress/recommended',
    'plugin:vue/recommended'
  ],

  plugins: [
    '@babel',
    'import',
    'cypress',
    'vue',
    'es'
  ],

  globals: {
    'ga': true, // Google Analytics
    '__statics': true,
    'process': true
  },

  // add your custom rules here
  rules: {
    'arrow-parens': 'off',
    'comma-dangle': 'error',
    'comma-spacing': 'error',
    'dot-notation': 'off',
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
    'multiline-ternary': 'off',
    'no-case-declarations': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'es/no-regexp-lookbehind-assertions': 'error', // Supported in Safari  >= 16.4, which breaks iOS 15.x.
    'no-trailing-spaces': 'error',
    'no-unsafe-optional-chaining': 'error',
    'no-whitespace-before-property': 'error',
    'one-var': 'off',
    'prefer-promise-reject-errors': 'off',
    'quote-props': 'off',
    'quotes': ['error', 'single'],
    'space-in-parens': 'error',
    'vue/attribute-hyphenation': 'off',
    'vue/attributes-order': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/html-closing-bracket-newline': ['error', { 'singleline': 'never', 'multiline': 'never' }],
    'vue/html-closing-bracket-spacing': 'error',
    'vue/html-indent': 'error',
    'vue/html-quotes': 'error',
    'vue/html-self-closing': 'error',
    'vue/max-attributes-per-line': ["error", {
        'singleline': 3,
        'multiline' : 1
    }],
    'vue/multiline-html-element-content-newline': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/mustache-interpolation-spacing': 'error',
    'vue/no-multi-spaces': 'error',
    'vue/no-v-html': 'off',
    'vue/singleline-html-element-content-newline': 'error',
    'vue/v-on-style': 'error',
    'vue/v-slot-style': 'error',

    // The following rules should be activated successively. Due to the large amount
    // of required changes, the activations should be clustered in several pull requests.
    'camelcase': 'off',
    'no-empty': ['off', { 'allowEmptyCatch': true }],
    'no-unused-vars': 'off',
    'no-useless-catch': 'off',
    'prefer-const': 'off',
    'vue/component-tags-order': ['off', { 'order': ['template', 'script', 'style'] }],
    'vue/no-mutating-props': 'off',
    'vue/no-parsing-error': 'off',
    'vue/no-template-shadow': 'off',
    'vue/order-in-components': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/this-in-template': 'off',
    'vue/valid-v-slot': 'off'
  }
}
