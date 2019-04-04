<template>
  <div v-if="visible" :class="classes">
    <span v-if="this.model.config.text">{{text}}</span>
    <component :is="component.component" v-for="(component, idx) in model.slots.main" :model="component" :key="'container-' + idx" />
  </div>
</template>

<script>
// import HbComponents from 'components/index'

export default {
  name: 'HbContainer',
  props: ['model'],
  asyncComputed: {
    text () {
      return this.$expr(this.model.config.text)
    },
    classes () {
      let merged = []
      if (this.model.highlight) merged.push('highlight-and-fade')
      if (Array.isArray(this.model.config.classes)) {
        merged = merged.concat(this.model.config.classes)
      }
      if (this.model.config.classesExpr) {
        return this.$expr('=' + this.model.config.classesExpr).then((ret) => {
          if (Array.isArray(ret)) {
            return Promise.resolve(merged.concat(ret))
          } else {
            return Promise.resolve(merged)
          }
        })
      } else {
        return Promise.resolve(merged)
      }
    },
    visible () {
      if (!this.model.config.visible) return true
      return this.$expr('=' + this.model.config.visible)
    }
  }
}
</script>
