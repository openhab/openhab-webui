<template>
  <ul v-if="config.listContainer" :class="config.containerClasses" :style="config.containerStyle">
    <generic-widget-component v-for="(ctx, idx) in childrenContexts"
                              :context="ctx"
                              :key="'repeater-' + idx"
                              @command="onCommand" />
  </ul>
  <!-- render without any additional container -->
  <template v-else-if="config.fragment">
    <!-- if parent is oh-swiper, render inside f7-swiper-slide -->
    <template v-if="['oh-swiper', 'f7-swiper'].includes(context.parent.component.component)">
      <f7-swiper-slide v-for="(ctx, idx) in childrenContexts" :key="'repeater-' + idx">
        <generic-widget-component :context="ctx"
                                  @command="onCommand" />
      </f7-swiper-slide>
    </template>
    <!-- else render -->
    <template v-else>
      <generic-widget-component v-for="(ctx, idx) in childrenContexts"
                                :context="ctx"
                                :key="'repeater-' + idx"
                                @command1111="onCommand" />
    </template>
  </template>
  <div v-else :class="config.containerClasses" :style="config.containerStyle">
    <generic-widget-component v-for="(ctx, idx) in childrenContexts"
                              :context="ctx"
                              :key="'repeater-' + idx"
                              @command="onCommand" />
  </div>
</template>

<script>
import mixin from '../widget-mixin'
import { OhRepeaterDefinition } from '@/assets/definitions/widgets/system'
import { compareItems, compareRules } from '@/components/widgets/widget-order'

export default {
  mixins: [mixin],
  widget: OhRepeaterDefinition,
  data () {
    return {
      sourceCache: null
    }
  },
  computed: {
    childrenContexts () {
      const iterationContext = (ctx, el, idx, source) => {
        // takes the context with the added variables
        const loopVars = {}
        if (ctx.loop) {
          for (const loopKey in this.context.loop) {
            loopVars[loopKey] = this.context.loop[loopKey]
          }
        }
        loopVars[this.config.for] = el
        loopVars[this.config.for + '_idx'] = idx
        loopVars[this.config.for + '_source'] = source

        ctx.loop = loopVars

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
      if (this.config.cacheSource && this.sourceCache) return this.sourceCache
      let sourceResult
      if (this.config.sourceType === 'range') {
        const start = this.config.rangeStart || 0
        const stop = this.config.rangeStop || 10
        const step = this.config.rangeStep || 1
        sourceResult = Promise.resolve(Array(Math.ceil((stop + 1 - start) / step)).fill(start).map((x, y) => x + y * step))
      } else if (this.config.sourceType === 'itemsWithTags' && this.config.itemTags) {
        sourceResult = this.$oh.api.get('/rest/items?metadata=' + this.config.fetchMetadata + '&tags=' + this.config.itemTags).then((d) => Promise.resolve(d.sort(compareItems)))
        this.sourceCache = (this.config.cacheSource) ? sourceResult : null
      } else if (this.config.sourceType === 'itemsInGroup') {
        sourceResult = this.$oh.api.get('/rest/items/' + this.config.groupItem + '?metadata=' + this.config.fetchMetadata + '&tags=' + this.config.itemTags).then((i) => Promise.resolve(i.members.sort(compareItems)))
        this.sourceCache = (this.config.cacheSource) ? sourceResult : null
      } else if (this.config.sourceType === 'itemStateOptions') {
        sourceResult = this.$oh.api.get('/rest/items/' + this.config.itemOptions).then((i) => Promise.resolve((i.stateDescription) ? i.stateDescription.options : []))
        this.sourceCache = (this.config.cacheSource) ? sourceResult : null
      } else if (this.config.sourceType === 'itemCommandOptions') {
        sourceResult = this.$oh.api.get('/rest/items/' + this.config.itemOptions).then((i) => Promise.resolve((i.commandDescription) ? i.commandDescription.commandOptions : []))
        this.sourceCache = (this.config.cacheSource) ? sourceResult : null
      } else if (this.config.sourceType === 'rulesWithTags' && this.config.ruleTags) {
        sourceResult = this.$oh.api.get('/rest/rules?summary=true' + '&tags=' + this.config.ruleTags).then((r) => Promise.resolve(r.sort(compareRules)))
        this.sourceCache = (this.config.cacheSource) ? sourceResult : null
      } else {
        sourceResult = Promise.resolve(this.config.in)
      }
      return sourceResult
    }
  }
}
</script>
