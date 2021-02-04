module.exports = {
  root: true,

  parserOptions: {
    parser: '@babel/eslint-parser',
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
    'plugin:vue/recommended',
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
    'generator-star-spacing': 'off',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/first': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'jsx-quotes': 'error',
    'linebreak-style': 'error',
    'no-case-declarations': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'no-unsafe-optional-chaining': 'error',
    'no-whitespace-before-property': 'error',
    'one-var': 'off',
    'prefer-promise-reject-errors': 'off',
    'space-in-parens': 'error',
    'vue/attribute-hyphenation': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/no-v-html': 'off',

    // The following rules should be activated successively. Due to the large amount
    // of required changes, the activations should be clustered in several pull requests.
    'camelcase': 'off',
    'comma-dangle': 'off',
    'comma-spacing': 'off',
    'eol-last': 'off',
    'indent': ["off", 2],
    'no-empty': ['off', { 'allowEmptyCatch': true }],
    'no-trailing-spaces': 'off',
    'no-unused-vars': 'off',
    'no-useless-catch': 'off',
    'quotes': ['off', 'single'],
    'vue/attributes-order': 'off',
    'vue/component-tags-order': ["off", { "order": ["template", "script", "style"] }],
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/html-indent': 'off',
    'vue/html-quotes': 'off',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/mustache-interpolation-spacing': 'off',
    'vue/no-multi-spaces': 'off',
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
    'vue/valid-v-slot': 'off',
  }
}
