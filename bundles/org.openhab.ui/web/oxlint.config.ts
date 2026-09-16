import { defineConfig } from 'oxlint'
import * as globals from 'globals'

export default defineConfig({
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": [
    "vue",
    "typescript",
    "import",
    "unicorn"
  ],
  "jsPlugins": [
    // "@intlify/eslint-plugin-vue-i18n",
    "eslint-plugin-jsonc"
  ],
  "categories": {
    "correctness": "off"
  },
  "options": {
    "typeAware": true
  },
  "env": {
    "builtin": true,
    "es2018": true,
    "browser": true
  },
  "settings": {
    "import-x/extensions": [
      ".ts",
      ".tsx",
      ".cts",
      ".mts",
      ".js",
      ".jsx",
      ".cjs",
      ".mjs"
    ],
    "import-x/external-module-folders": [
      "node_modules",
      "node_modules/@types"
    ],
    "import-x/parsers": {
      "@typescript-eslint/parser": [
        ".ts",
        ".tsx",
        ".cts",
        ".mts"
      ]
    },
    "import-x/resolver": {
      "typescript": true
    },
    "vue-i18n": {
      "localeDir": "./src/assets/i18n/**/*.json",
      "messageSyntaxVersion": "^11.0.0"
    }
  },
  "ignorePatterns": [
    "dist",
    "build",
    "public",
    "**/*.parser.js",
    "src/api/**"
  ],
  "rules": {
    "vue/no-arrow-functions-in-watch": "error",
    "vue/no-async-in-computed-properties": "error",
    "vue/no-computed-properties-in-data": "error",
    "vue/no-deprecated-data-object-declaration": "error",
    "vue/no-deprecated-delete-set": "error",
    "vue/no-deprecated-destroyed-lifecycle": "error",
    "vue/no-deprecated-events-api": "error",
    "vue/no-deprecated-model-definition": "error",
    "vue/no-deprecated-props-default-this": "error",
    "vue/no-deprecated-vue-config-keycodes": "error",
    "vue/no-dupe-keys": "error",
    "vue/no-export-in-script-setup": "error",
    "vue/no-expose-after-await": "error",
    "vue/no-lifecycle-after-await": "error",
    "vue/no-reserved-component-names": "error",
    "vue/no-reserved-keys": "error",
    "vue/no-reserved-props": "error",
    "vue/no-shared-component-data": "error",
    "vue/no-side-effects-in-computed-properties": "error",
    "vue/no-watch-after-await": "error",
    "vue/prefer-import-from-vue": "error",
    "vue/require-prop-type-constructor": "error",
    "vue/require-render-return": "error",
    "vue/require-slots-as-functions": "error",
    "vue/return-in-computed-property": "error",
    "vue/return-in-emits-validator": "error",
    "vue/valid-define-emits": "error",
    "vue/valid-define-options": "error",
    "vue/valid-define-props": "error",
    "vue/valid-next-tick": "error",
    "vue/component-definition-name-casing": "warn",
    "vue/prop-name-casing": "warn",
    "vue/require-default-prop": "warn",
    "vue/require-prop-types": "warn",
    "vue/no-multiple-slot-args": "warn",
    "vue/no-required-prop-with-default": "warn",
    // "@intlify/vue-i18n/no-deprecated-i18n-component": "warn",
    // "@intlify/vue-i18n/no-deprecated-i18n-place-attr": "warn",
    // "@intlify/vue-i18n/no-deprecated-i18n-places-prop": "warn",
    // "@intlify/vue-i18n/no-deprecated-modulo-syntax": "warn",
    // "@intlify/vue-i18n/no-deprecated-tc": "warn",
    // "@intlify/vue-i18n/no-deprecated-v-t": "warn",
    // "@intlify/vue-i18n/no-html-messages": "warn",
    // "@intlify/vue-i18n/no-i18n-t-path-prop": "warn",
    // "@intlify/vue-i18n/no-missing-keys": "warn",
    // "@intlify/vue-i18n/no-raw-text": "warn",
    // "@intlify/vue-i18n/no-v-html": "warn",
    // "@intlify/vue-i18n/valid-message-syntax": "warn",
    "constructor-super": "error",
    "for-direction": "error",
    "getter-return": "error",
    "no-async-promise-executor": "error",
    "no-case-declarations": "error",
    "no-class-assign": "error",
    "no-compare-neg-zero": "error",
    "no-cond-assign": "error",
    "no-const-assign": "error",
    "no-constant-binary-expression": "error",
    "no-constant-condition": "error",
    "no-control-regex": "error",
    "no-debugger": "error",
    "no-delete-var": "error",
    "no-dupe-class-members": "error",
    "no-dupe-else-if": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty": "error",
    "no-empty-character-class": "error",
    "no-empty-pattern": "error",
    "no-empty-static-block": "error",
    "no-ex-assign": "error",
    "no-extra-boolean-cast": "error",
    "no-fallthrough": "error",
    "no-func-assign": "error",
    "no-global-assign": "error",
    "no-import-assign": "error",
    "no-invalid-regexp": "error",
    "no-irregular-whitespace": "error",
    "no-loss-of-precision": "error",
    "no-misleading-character-class": "error",
    "no-new-native-nonconstructor": "error",
    "no-nonoctal-decimal-escape": "error",
    "no-obj-calls": "error",
    "no-prototype-builtins": "error",
    "no-redeclare": "error",
    "no-regex-spaces": "error",
    "no-self-assign": "error",
    "no-setter-return": "error",
    "no-shadow-restricted-names": "error",
    "no-sparse-arrays": "error",
    "no-this-before-super": "error",
    "no-undef": "error",
    "no-unreachable": "error",
    "no-unsafe-finally": "error",
    "no-unsafe-negation": "error",
    "no-unsafe-optional-chaining": "error",
    "no-unused-labels": "error",
    "no-unused-private-class-members": "error",
    "no-unused-vars": "off",
    "no-useless-backreference": "error",
    "no-useless-catch": "error",
    "no-useless-escape": "error",
    "no-with": "error",
    "require-yield": "error",
    "use-isnan": "error",
    "valid-typeof": "error",
    "no-array-constructor": "error",
    "no-unused-expressions": "error",
    "jsonc/no-bigint-literals": "error",
    "jsonc/no-binary-expression": "error",
    "jsonc/no-binary-numeric-literals": "error",
    "jsonc/no-dupe-keys": "error",
    "jsonc/no-escape-sequence-in-identifier": "error",
    "jsonc/no-floating-decimal": "error",
    "jsonc/no-hexadecimal-numeric-literals": "error",
    "jsonc/no-infinity": "error",
    "jsonc/no-multi-str": "error",
    "jsonc/no-nan": "error",
    "jsonc/no-number-props": "error",
    "jsonc/no-numeric-separators": "error",
    "jsonc/no-octal-numeric-literals": "error",
    "jsonc/no-octal": "error",
    "jsonc/no-parenthesized": "error",
    "jsonc/no-plus-sign": "error",
    "jsonc/no-regexp-literals": "error",
    "jsonc/no-sparse-arrays": "error",
    "jsonc/no-template-literals": "error",
    "jsonc/no-undefined-value": "error",
    "jsonc/no-unicode-codepoint-escapes": "error",
    "jsonc/no-useless-escape": "error",
    "jsonc/quote-props": "error",
    "jsonc/quotes": "error",
    "jsonc/space-unary-ops": "error",
    "jsonc/valid-json-number": "error",
    "jsonc/vue-custom-block/no-parsing-error": "error",
    "import/namespace": "error",
    "import/default": "error",
    "import/export": "error",
    "import/no-named-as-default": "warn",
    "import/no-named-as-default-member": "warn",
    "import/no-duplicates": "warn",
    "typescript/ban-ts-comment": "error",
    "typescript/no-duplicate-enum-values": "error",
    "typescript/no-empty-object-type": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-extra-non-null-assertion": "error",
    "typescript/no-misused-new": "error",
    "typescript/no-namespace": "error",
    "typescript/no-non-null-asserted-optional-chain": "error",
    "typescript/no-require-imports": "error",
    "typescript/no-this-alias": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-unsafe-declaration-merging": "error",
    "typescript/no-unsafe-function-type": "error",
    "typescript/no-wrapper-object-types": "error",
    "typescript/prefer-as-const": "error",
    "typescript/prefer-namespace-keyword": "error",
    "typescript/triple-slash-reference": "error",
    "typescript/no-unused-vars": "off"
  },
  "overrides": [
    {
      "files": [
        "**/*.ts",
        "**/*.tsx",
        "**/*.mts",
        "**/*.cts"
      ],
      "rules": {
        "constructor-super": "off",
        "getter-return": "off",
        "no-class-assign": "off",
        "no-const-assign": "off",
        "no-dupe-class-members": "off",
        "no-dupe-keys": "off",
        "no-func-assign": "off",
        "no-import-assign": "off",
        "no-new-native-nonconstructor": "off",
        "no-obj-calls": "off",
        "no-redeclare": "off",
        "no-setter-return": "off",
        "no-this-before-super": "off",
        "no-undef": "off",
        "no-unreachable": "off",
        "no-unsafe-negation": "off",
        "no-var": "error",
        "no-with": "off",
        "prefer-const": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error"
      }
    },
    {
      "files": [
        "**/*.{ts,tsx}",
        "**/*.vue?vue&type=script&lang=ts",
        "**/*.vue?vue&type=script&lang.ts",
        "**/*.vue?vue&type=script&lang=tsx",
        "**/*.vue?vue&type=script&lang.tsx"
      ],
      "rules": {
        "unicorn/no-useless-promise-resolve-reject": "error",
        "typescript/no-unsafe-call": "off",
        "typescript/promise-function-async": "error",
        "constructor-super": "off",
        "getter-return": "off",
        "no-class-assign": "off",
        "no-const-assign": "off",
        "no-dupe-class-members": "off",
        "no-dupe-keys": "off",
        "no-func-assign": "off",
        "no-import-assign": "off",
        "no-new-native-nonconstructor": "off",
        "no-obj-calls": "off",
        "no-redeclare": "off",
        "no-setter-return": "off",
        "no-this-before-super": "off",
        "no-undef": "off",
        "no-unreachable": "off",
        "no-unsafe-negation": "off",
        "no-var": "error",
        "no-with": "off",
        "prefer-const": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "no-implied-eval": "off",
        "no-throw-literal": "off",
        "prefer-promise-reject-errors": "off",
        "require-await": "off",
        "typescript/await-thenable": "error",
        "typescript/no-array-delete": "error",
        "typescript/no-base-to-string": "error",
        "typescript/no-duplicate-type-constituents": "error",
        "typescript/no-floating-promises": "error",
        "typescript/no-for-in-array": "error",
        "typescript/no-implied-eval": "error",
        "typescript/no-misused-promises": "error",
        "typescript/no-redundant-type-constituents": "error",
        "typescript/no-unnecessary-type-assertion": "error",
        "typescript/no-unsafe-argument": "error",
        "typescript/no-unsafe-assignment": "error",
        "typescript/no-unsafe-enum-comparison": "error",
        "typescript/no-unsafe-member-access": "error",
        "typescript/no-unsafe-return": "error",
        "typescript/no-unsafe-unary-minus": "error",
        "typescript/only-throw-error": "error",
        "typescript/prefer-promise-reject-errors": "error",
        "typescript/require-await": "error",
        "typescript/restrict-plus-operands": "error",
        "typescript/restrict-template-expressions": "error",
        "typescript/unbound-method": "error"
      }
    },
    {
      "files": [
        "*.json",
        "**/*.json",
        "*.json5",
        "**/*.json5",
        "*.jsonc",
        "**/*.jsonc"
      ],
      "rules": {
        "no-unused-expressions": "off",
        "no-unused-vars": "off"
      }
    },
    {
      "files": [
        "*.vue",
        "**/*.vue"
      ],
      "rules": {
        "no-case-declarations": "off",
        "no-console": "off",
        "no-debugger": "off",
        "no-irregular-whitespace": "off",
        "one-var": "off",
        "prefer-promise-reject-errors": "off",
        "vue/component-definition-name-casing": "off",
        "no-empty": [
          "off",
          {
            "allowEmptyCatch": true
          }
        ],
        "no-unused-vars": "off",
        "no-useless-catch": "off",
        "prefer-const": "off",
        "vue/require-default-prop": "off",
        "vue/require-prop-types": "off",
        // "@intlify/vue-i18n/no-raw-text": "off",
        // "@intlify/vue-i18n/no-html-messages": "off",
        "import/extensions": "off",
        "import/first": "off",
        "import/named": "error",
        "import/no-dynamic-require": "warn",
        "import/no-nodejs-modules": "warn",
        "import/no-named-as-default-member": "off",
        "typescript/dot-notation": "off",
        "typescript/no-explicit-any": "off",
        "typescript/no-this-alias": "off",
        "typescript/no-empty-object-type": "off"
      },
      "jsPlugins": [
        // "@intlify/eslint-plugin-vue-i18n"
      ]
    },
    {
      "files": [
        "**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx}"
      ],
      "rules": {
        "no-case-declarations": "off",
        "no-console": "off",
        "no-debugger": "off",
        "no-irregular-whitespace": "off",
        "one-var": "off",
        "prefer-promise-reject-errors": "off",
        "vue/component-definition-name-casing": "off",
        "no-empty": [
          "off",
          {
            "allowEmptyCatch": true
          }
        ],
        "no-unused-vars": "off",
        "no-useless-catch": "off",
        "prefer-const": "off",
        "vue/require-default-prop": "off",
        "vue/require-prop-types": "off",
        // "@intlify/vue-i18n/no-raw-text": "off",
        // "@intlify/vue-i18n/no-html-messages": "off",
        "import/extensions": "off",
        "import/first": "off",
        "import/named": "error",
        "import/no-dynamic-require": "warn",
        "import/no-nodejs-modules": "warn",
        "import/no-named-as-default-member": "off",
        "typescript/dot-notation": "off",
        "typescript/no-explicit-any": "off",
        "typescript/no-this-alias": "off",
        "typescript/no-empty-object-type": "off"
      },
      "jsPlugins": [
        // "@intlify/eslint-plugin-vue-i18n"
      ],
      "globals": {
        ...globals.browser,
        ...globals.node,
        "process": "writable",
        "ga": "writable",
        "__statics": "writable"
      },
      "env": {
        "es2026": true,
        "node": true
      }
    },
    {
      "files": [
        "src/assets/i18n/**/*.json"
      ],
      "rules": {
        // "@intlify/vue-i18n/no-html-messages": "off",
        "no-irregular-whitespace": "off"
      },
      "jsPlugins": [
        // "@intlify/eslint-plugin-vue-i18n"
      ]
    },
    {
      "files": [
        "**/*.{ts,tsx}"
      ],
      "rules": {
        "no-undef": "off"
      }
    }
  ]
})