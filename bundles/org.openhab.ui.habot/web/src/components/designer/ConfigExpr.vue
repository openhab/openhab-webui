<template>
  <q-input :value="value" @input="$emit('input', $event)" color="secondary" :error="isError" :float-label="exprError" prefix="="></q-input>
</template>

<script>
export default {
  name: 'ConfigExpr',
  props: ['value', 'targetType'],
  computed: {
    isError () {
      if (!this.value) return false
      if (this.exprResult && this.exprResult.toString().indexOf('Error') === 0) return true
      if (this.targetType === 'array' && !Array.isArray(this.exprResult)) return true
      if (this.targetType === 'boolean' && (this.exprResult !== true && this.exprResult !== false)) return true
      return false
    },
    exprError () {
      if (!this.value) return ''
      if (this.exprResult === undefined || this.exprResult === null) {
        return 'Result indetermined'
      }
      if (this.exprResult && this.exprResult.toString().indexOf('Error:') === 0) {
        return this.exprResult.toString()
      }
      if (this.targetType === 'boolean' && this.exprResult !== true && this.exprResult !== false) {
        return 'Result not boolean: ' + this.exprResult.toString()
      }
      if (this.targetType === 'array' && !Array.isArray(this.exprResult)) {
        return 'Result is not an array'
      }
      return (this.targetType === 'boolean') ? 'OK - result is ' + this.exprResult.toString() : 'OK'
    }
  },
  asyncComputed: {
    exprResult () {
      if (!this.value) return ''
      return this.$expr('=' + this.value)
    }
  }
}
</script>
