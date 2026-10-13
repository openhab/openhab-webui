import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint, { plugin } from 'typescript-eslint';
import pluginJsonc from 'eslint-plugin-jsonc'
import parserVue from 'vue-eslint-parser'
import pluginVue from 'eslint-plugin-vue'
import pluginVueI18n from '@intlify/eslint-plugin-vue-i18n'
import pluginImport from 'eslint-plugin-import-x'

import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginOxlint from 'eslint-plugin-oxlint'

const rules = {
    // Import-x rules not in oxlint
    'import-x/no-unresolved': 'error',
    'import-x/no-unused-modules': 'warn',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/attribute-hyphenation': 'off',

    'vue/attributes-order': ['error', {
      'order': ['DEFINITION', 'LIST_RENDERING', 'CONDITIONALS', 'RENDER_MODIFIERS', [ 'GLOBAL', 'UNIQUE', 'SLOT', 'TWO_WAY_BINDING', 'OTHER_DIRECTIVES', 'OTHER_ATTR', 'EVENTS', 'CONTENT' ]],
      'alphabetical': false,
      "sortLineLength": false
    }],
    'vue/v-on-style': 'error',
    'vue/v-slot-style': 'error',
    'vue/block-order': ['off', { 'order': [ [ 'template', 'style' ], 'script' ] } ],
    'vue/no-mutating-props': 'off',
    'vue/no-parsing-error': 'off',
    'vue/no-template-shadow': 'off',
    'vue/order-in-components': 'off',
    'vue/this-in-template': 'off',
    'vue/valid-v-slot': 'off',

    // @intlify not covered in oxlint
    '@intlify/vue-i18n/no-raw-text': 'off',
    '@intlify/vue-i18n/no-html-messages': 'off'
}

const oxlintOwnedImportRules = {
  'import-x/default': 'off',
  'import-x/export': 'off',
  'import-x/named': 'off',
  'import-x/namespace': 'off',
  'import-x/no-duplicates': 'off',
  'import-x/extensions': 'off',
  'import-x/first': 'off',
  'import-x/no-named-as-default-member': 'off',
  'import-x/no-named-as-default': 'off'
}

export default defineConfig([
  ...pluginVue.configs['flat/recommended'],
  ...pluginVueI18n.configs.recommended,
  pluginImport.flatConfigs.recommended,
  pluginImport.flatConfigs.typescript,
  ...pluginJsonc.configs['flat/recommended-with-jsonc'],
  {
    plugins: {
      vue: pluginVue
    }
  },
  {
    rules: oxlintOwnedImportRules
  },
  {
    settings: {
      'vue-i18n': {
        localeDir: './src/assets/i18n/**/*.json',
        messageSyntaxVersion: '^11.0.0',
      }
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: tseslint.parser
      }
    },
    rules: rules
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.eslint.json', // Path to your tsconfig.json
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ga: true,
        __statics: true,
        process: true
      }
    },
    rules: rules
  },
  {
    files: ['src/assets/i18n/**/*.json'],
    rules: {
      '@intlify/vue-i18n/no-html-messages': 'off',
      'no-irregular-whitespace': 'off'
    }
  },
  globalIgnores(['dist', 'build', 'public', '**/*.parser.js', 'src/api/**']),
  eslintConfigPrettier, // Disables all ESLint rules that conflict with Prettier/oxfmt
  ...pluginOxlint.buildFromOxlintConfig({
    categories: {
      correctness: true
    },
    rules: {
      eqeqeq: 'warn'
    }
  })
])
