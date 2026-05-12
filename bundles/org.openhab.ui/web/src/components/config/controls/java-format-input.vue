<template>
  <input ref="input" v-bind="$attrs" type="text" :placeholder="placeholder" :value="value" @input="onInput" />
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['input', 'validation-message'],
  watch: {
    value(newValue) {
      this.emitValidation(newValue || '')
    }
  },
  mounted() {
    this.emitValidation(this.value || '')
  },
  methods: {
    focus() {
      const inputElement = this.$refs.input
      if (inputElement && typeof inputElement.focus === 'function') {
        inputElement.focus()
      }
    },
    onInput(event) {
      const nextValue = event?.target?.value || ''
      this.$emit('input', nextValue)
      this.emitValidation(nextValue)
    },
    emitValidation(format) {
      const validation = this.validateJavaFormat(format || '')
      this.$emit('validation-message', validation.valid ? '' : validation.message)
    },
    validateJavaFormat(text) {
      if (!text) {
        return { valid: true, message: '' }
      }

      const dateTimeConversions = new Set([
        'H',
        'I',
        'k',
        'l',
        'M',
        'S',
        'L',
        'N',
        'p',
        'z',
        'Z',
        's',
        'Q',
        'B',
        'b',
        'h',
        'A',
        'a',
        'C',
        'Y',
        'y',
        'j',
        'm',
        'd',
        'e',
        'R',
        'T',
        'r',
        'D',
        'F',
        'c'
      ])
      const generalConversions = new Set([
        'b',
        'B',
        'h',
        'H',
        's',
        'S',
        'c',
        'C',
        'd',
        'o',
        'x',
        'X',
        'e',
        'E',
        'f',
        'g',
        'G',
        'a',
        'A',
        't',
        'T',
        '%',
        'n'
      ])
      const allowedFlagChars = new Set(['-', '#', '+', ' ', '0', ',', '(', '<'])

      const parseNumber = (source, start) => {
        let index = start
        while (index < source.length && source[index] >= '0' && source[index] <= '9') {
          index += 1
        }
        return index
      }

      let index = 0
      while (index < text.length) {
        if (text[index] !== '%') {
          index += 1
          continue
        }

        if (text.startsWith('%%', index)) {
          index += 2
          continue
        }
        if (text.startsWith('%unit%', index)) {
          index += 6
          continue
        }

        let cursor = index + 1

        const parameterStart = cursor
        cursor = parseNumber(text, cursor)
        if (cursor > parameterStart) {
          if (cursor >= text.length || text[cursor] !== '$') {
            return { valid: false, message: 'Invalid Java format: expected "$" after argument index.' }
          }
          cursor += 1
        }

        while (cursor < text.length && allowedFlagChars.has(text[cursor])) {
          cursor += 1
        }

        cursor = parseNumber(text, cursor)

        if (cursor < text.length && text[cursor] === '.') {
          cursor += 1
          const precisionStart = cursor
          cursor = parseNumber(text, cursor)
          if (cursor === precisionStart) {
            return { valid: false, message: 'Invalid Java format: precision requires digits after ".".' }
          }
        }

        if (cursor >= text.length) {
          return { valid: false, message: 'Invalid Java format: incomplete conversion at end of string.' }
        }

        const conversion = text[cursor]
        if (conversion === 't' || conversion === 'T') {
          cursor += 1
          if (cursor >= text.length || !dateTimeConversions.has(text[cursor])) {
            return { valid: false, message: 'Invalid Java format: unsupported date/time conversion.' }
          }
          cursor += 1
          index = cursor
          continue
        }

        if (!generalConversions.has(conversion)) {
          return { valid: false, message: `Invalid Java format: unsupported conversion "%${conversion}".` }
        }

        cursor += 1
        index = cursor
      }

      return { valid: true, message: '' }
    }
  }
}
</script>
