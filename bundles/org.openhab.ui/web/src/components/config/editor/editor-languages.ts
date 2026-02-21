import { StreamLanguage, LanguageSupport, getIndentUnit, codeFolding } from '@codemirror/language'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import type { Extension } from '@codemirror/state'

// for linting
import { linter, lintGutter } from '@codemirror/lint'
import YAML from 'yaml'
import * as eslint from 'eslint-linter-browserify'
import globals from 'globals'

// OH-specific CompletionSources
import javascriptAutocompletions from '../editor/hint-javascript'
// @ts-expect-error - these modules don't have types, but that's fine since we only use them as CompletionSources
import componentsHint from '../editor/hint-components'
// @ts-expect-error - these modules don't have types, but that's fine since we only use them as CompletionSources
import rulesHint from '../editor/hint-rules'
// @ts-expect-error - these modules don't have types, but that's fine since we only use them as CompletionSources
import thingsHint from '../editor/hint-things'
// @ts-expect-error - these modules don't have types, but that's fine since we only use them as CompletionSources
import itemsHint from '../editor/hint-items'

// languages
import { javascript, esLint } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { groovy } from '@codemirror/legacy-modes/mode/groovy'
import { ruby } from '@codemirror/legacy-modes/mode/ruby'
import { java } from '@codemirror/lang-java'
import { xml } from '@codemirror/lang-xml'
import { yaml } from '@codemirror/lang-yaml'
import { jinja2 } from '@codemirror/legacy-modes/mode/jinja2'
import { properties } from '@codemirror/legacy-modes/mode/properties'
import { shell } from '@codemirror/legacy-modes/mode/shell'

/**
 * Provides the CodeMirror language for the given mode.
 * Thereby, this method handles the mapping of the mode to the language for scripts, transformations, etc.
 *
 * @param {string} mode
 * @return {StreamLanguage<unknown>|LanguageSupport|null}
 */
function languageExtension(mode: string): StreamLanguage<unknown> | LanguageSupport | null {
  if (!mode) {
    return null
  }

  switch (true) {
    case mode.includes('yaml'):
      return yaml()

    case mode === 'dsl':
    case mode === 'application/vnd.openhab.dsl.rule':
      return java()

    case mode === 'text/vnd.openhab.dsl.thing':
    case mode === 'text/vnd.openhab.dsl.item':
      return javascript()

    case mode === 'js':
    case mode.startsWith('application/javascript'):
      return javascript()

    case mode === 'py':
    case mode === 'py2':
    case mode === 'py3':
    case mode.startsWith('application/x-python'):
      return python()

    case mode === 'rb':
    case mode === 'application/x-ruby':
      return StreamLanguage.define(ruby)

    case mode === 'groovy':
    case mode === 'application/x-groovy':
      return StreamLanguage.define(groovy)

    case mode === 'map':
    case mode === 'scale':
      return StreamLanguage.define(properties)

    case mode === 'exec':
      return StreamLanguage.define(shell)

    case mode === 'jinja':
      return StreamLanguage.define(jinja2)

    case mode === 'xslt':
      return xml()

    default:
      console.debug('Unsupported editor mode:', mode)
      return null
  }
}

function autocompletionExtension(mode: string): Extension | null {
  if (!mode) {
    return null
  }

  const activateOnCompletion = () => true

  switch (true) {
    case mode.startsWith('application/vnd.openhab.uicomponent'):
      return autocompletion({ activateOnCompletion, override: [componentsHint] })

    case mode === 'application/vnd.openhab.rule+yaml':
      return autocompletion({ activateOnCompletion, override: [rulesHint] })

    case mode === 'application/vnd.openhab.thing+yaml':
      return autocompletion({ activateOnCompletion, override: [thingsHint] })

    case mode === 'application/vnd.openhab.item+yaml':
      return autocompletion({ activateOnCompletion, override: [itemsHint] })

    case mode === 'js':
    case mode.startsWith('application/javascript'):
      return javascriptAutocompletions(mode)

    // CodeMirror supports autocompletion for python by default
    default:
      return autocompletion()
  }
}

function linterExtension(mode: string): Extension | null {
  if (!mode) {
    return null
  }

  switch (true) {
    case mode.includes('yaml'):
      return linter((view) => {
        const parsed = YAML.parseDocument(view.state.doc.toString())
        return parsed.errors.map((e) => {
          return {
            from: e.pos[0],
            to: e.pos[1],
            message: e.message,
            severity: e.name === 'YAMLParseError' ? 'error' : 'warning'
          }
        })
      })

    case mode === 'js':
    case mode.startsWith('application/javascript'):
      const config = {
        // eslint configuration
        languageOptions: {
          globals: {
            ...globals.node,
            // context:
            ctx: 'readonly',
            event: 'readonly',
            ruleUID: 'readonly',
            // openhab-js namespaces:
            Java: 'readonly',
            actions: 'readonly',
            cache: 'readonly',
            environment: 'readonly',
            items: 'readonly',
            rules: 'readonly',
            things: 'readonly',
            time: 'readonly',
            utils: 'readonly',
            Quantity: 'readonly'
          },
          sourceType: 'commonjs',
          parserOptions: {
            ecmaVersion: 2024,
            ecmaFeatures: {
              globalReturn: true // allow return outside functions
            }
          }
        },
        rules: {
          semi: 'off', // allow both with and without semicolons
          'no-undef': 'error',
          'no-const-assign': 'error',
          'no-unreachable': 'warn'
        }
      }
      return linter(esLint(new eslint.Linter(), config))
  }
  return null
}

export function languageCompartmentExtension(mode: string | undefined, includeLinter: boolean = true): Extension {
  if (!mode) {
    return []
  }

  const linter = includeLinter ? linterExtension(mode) : null

  const extensions: Extension[] = [languageExtension(mode), autocompletionExtension(mode), linter, linter && lintGutter()].filter(
    (ext) => ext != null
  )

  return extensions
}
