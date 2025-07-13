import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginJsonc from 'eslint-plugin-jsonc'
import parserVue from 'vue-eslint-parser'
import pluginVue from 'eslint-plugin-vue'
import pluginVueI18n from '@intlify/eslint-plugin-vue-i18n'
import pluginImport from 'eslint-plugin-import-x'


// import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
// import eslintConfigPrettier from 'eslint-config-prettier/flat'

const rules = {
    'arrow-parens': 'off',
    'comma-dangle': 'error',
    'comma-spacing': 'error',
    'dot-notation': 'off',
    'eol-last': 'error',
    'generator-star-spacing': 'off',
    'semi': ['error', 'never'],
    'space-before-function-paren': ['error', 'always'], // add to main
    'arrow-parens': ['error', 'always'],    // add to main
    // 'brace-style': ['error', '1tbs'], // add to main
    'eol-last': 'off',
    'import-x/default': 'error',
    'import-x/export': 'error',
    'import-x/extensions': 'off',
    'import-x/first': 'off',
    'import-x/named': 'error',
    'import-x/namespace': 'error',
    'import-x/no-extraneous-dependencies': 'off',
    'import-x/no-unresolved': 'error',
    'import-x/no-dynamic-require': 'warn',
    'import-x/no-nodejs-modules': 'warn',
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'import-x/no-named-as-default-member': 'off',
    'jsx-quotes': 'error',
    'linebreak-style': 'off',
    'multiline-ternary': 'off',
    'no-case-declarations': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'no-irregular-whitespace': 'off',
    // 'es/no-regexp-lookbehind-assertions': 'error', // Supported in Safari  >= 16.4, which breaks iOS 15.x.
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
    'vue/max-attributes-per-line': ['error', {
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
    'vue/block-order': ['off', { 'order': [ [ 'template', 'style' ], 'script' ] } ],
    'vue/no-mutating-props': 'off',
    'vue/no-parsing-error': 'off',
    'vue/no-template-shadow': 'off',
    'vue/order-in-components': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/this-in-template': 'off',
    'vue/valid-v-slot': 'off',

    '@intlify/vue-i18n/no-raw-text': 'off',
    '@intlify/vue-i18n/no-html-messages': 'off',

    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-empty-object-type': 'off'
}

export default defineConfig([
  ...pluginVue.configs['flat/recommended'],
  // eslintPluginPrettierRecommended,
  ...pluginVueI18n.configs.recommended,
  eslint.configs.recommended,
  tseslint.configs.recommended,
  pluginImport.flatConfigs.recommended,
  pluginImport.flatConfigs.typescript,
  ...pluginJsonc.configs['flat/recommended-with-jsonc'],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: tseslint.parser
      }
    },
    rules: rules,
    settings: {
      'vue-i18n': {
        localeDir: './src/assets/i18n/**/*.json',
        messageSyntaxVersion: '^11.0.0'
      }
    }
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsxn,json}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json', // Path to your tsconfig.json
        tsconfigRootDir: import.meta.dirname
      }
    },
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
        ga: true,
        __statics: true,
        process: true
      }
    },
    // "plugin:@typescript-eslint/recommended",
    rules: rules,
    settings: {
      'vue-i18n': {
        localeDir: './src/assets/i18n/**/*.json',
        messageSyntaxVersion: '^11.0.0'
      }
    }
  },
  globalIgnores(['dist', 'build', 'public', '**/*.nearley.js'])

  // eslintConfigPrettier, // This is the Prettier config that disables all ESLint rules that conflict with Prettier
])

