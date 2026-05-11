import { LRLanguage, LanguageSupport } from '@codemirror/language'
import { styleTags, tags } from '@lezer/highlight'

import { parser } from '@/assets/openhab-dsl.parser.js'

export const openHABDslLanguage = LRLanguage.define({
  name: 'openhab-dsl',
  parser: parser.configure({
    props: [
      styleTags({
        'RuleKeyword SectionKeyword ControlKeyword DeclarationKeyword': tags.keyword,
        'EventKeyword CommandKeyword BooleanLiteral NullLiteral': tags.atom,
        'PrimitiveType BuiltinType WidgetType': tags.typeName,
        Identifier: tags.variableName,
        String: tags.string,
        Number: tags.number,
        'LineComment HashComment BlockComment': tags.comment,
        'ArithOp LogicOp CompareOp AssignOp Arrow': tags.operator,
        'BraceL BraceR': tags.brace,
        'BracketL BracketR': tags.squareBracket,
        'ParenL ParenR': tags.paren,
        'Comma Dot Colon Semicolon QuestionMark AtSign': tags.punctuation
      })
    ]
  }),
  languageData: {
    commentTokens: { line: '//', block: { open: '/*', close: '*/' } }
  }
})

export function openHABDsl(): LanguageSupport {
  return new LanguageSupport(openHABDslLanguage)
}
