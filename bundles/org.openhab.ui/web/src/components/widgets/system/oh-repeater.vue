<template>
  <ul v-if="config.listContainer" :class="config.containerClasses" :style="config.containerStyle">
    <generic-widget-component :context="ctx" v-for="(ctx, idx) in childrenContexts" :key="'repeater-' + idx" @command="onCommand" />
  </ul>
  <fragment v-else-if="config.fragment">
    <generic-widget-component :context="ctx" v-for="(ctx, idx) in childrenContexts" :key="'repeater-' + idx" @command="onCommand" />
  </fragment>
  <div v-else :class="config.containerClasses" :style="config.containerStyle">
    <generic-widget-component :context="ctx" v-for="(ctx, idx) in childrenContexts" :key="'repeater-' + idx" @command="onCommand" />
  </div>
</template>

<script>
import mixin from '../widget-mixin'
import { OhRepeaterDefinition } from '@/assets/definitions/widgets/system'
import { compareItems } from '@/components/widgets/widget-order'
import { Fragment } from 'vue-fragment'

export default {
  mixins: [mixin],
  components: {
    Fragment
  },
  widget: OhRepeaterDefinition,
  computed: {
    childrenContexts () {
      const iterationContext = (ctx, el, idx, source) => {
        // takes the context with the added variables
        const loopVars = {}
        if (ctx.loop) {
          for (const loopKey in this.context.loop) {
            this.$set(loopVars, loopKey, this.context.loop[loopKey])
          }
        }
        loopVars[this.config.for] = el
        loopVars[this.config.for + '_idx'] = idx
        loopVars[this.config.for + '_source'] = source

        this.$set(ctx, 'loop', loopVars)

        return ctx
      }

      let source = this.source
      if (!Array.isArray(source)) return []

      if (this.config.filter) {
        source = source.filter((el, idx, source) =>
          this.evaluateExpression('filterExpr', '=' + this.config.filter,
            iterationContext(this.childContext(this.context.component), el, idx, source)))
      }
      if (this.config.map) {
        source = source.map((el, idx, source) =>
          this.evaluateExpression('mapExpr', '=' + this.config.map,
            iterationContext(this.childContext(this.context.component), el, idx, source)))
      }

      let contexts = []
      let idx = 0
      for (let i of source) {
        contexts.push(...this.context.component.slots.default.map((c) => {
          return iterationContext(this.childContext(c), i, idx, source)
        }))

        idx++
      }

      return contexts
    }
  },
  asyncComputed: {
    source () {
      if (this.config.sourceType === 'range') {
        const start = this.config.rangeStart || 0
        const stop = this.config.rangeStop || 10
        const step = this.config.rangeStep || 1
        return Promise.resolve(Array(Math.ceil((stop + 1 - start) / step)).fill(start).map((x, y) => x + y * step))
      } else if (this.config.sourceType === 'itemsWithTags' && this.config.itemTags) {
        return this.$oh.api.get('/rest/items?metadata=' + this.config.fetchMetadata + '&tags=' + this.config.itemTags).then((d) => d.sort(compareItems))
      } else if (this.config.sourceType === 'itemsInGroup') {
        return this.$oh.api.get('/rest/items/' + this.config.groupItem + '?metadata=' + this.config.fetchMetadata + '&tags=' + this.config.itemTags).then((i) => Promise.resolve(i.members.sort(compareItems)))
      } else if (this.config.sourceType === 'itemStateOptions') {
        return this.$oh.api.get('/rest/items/' + this.config.itemOptions).then((i) => Promise.resolve((i.stateDescription) ? i.stateDescription.options : []))
      } else if (this.config.sourceType === 'itemCommandOptions') {
        return this.$oh.api.get('/rest/items/' + this.config.itemOptions).then((i) => Promise.resolve((i.commandDescription) ? i.commandDescription.commandOptions : []))
      } else if (this.config.sourceType === 'rules') {
        // return this.$oh.api.get('/rest/items?metadata=' + this.config.fetchMetadata + '&tags=' + this.config.itemTags)
        return this.$oh.api.get('/rest/rules?summary=true').then((d) => d)
      } else {
        return Promise.resolve(this.config.in)
      }
    }
  }
}
</script>
