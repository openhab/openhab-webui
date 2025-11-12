<template>
  <f7-block class="sitemap-code">
    <div class="row sitemap-parser resizable">
      <div class="col">
        <editor :value="sitemapDsl" @input="updateSitemap" mode="application/vnd.openhab.sitemap+dsl" />
      </div>
      <span class="resize-handler" />
    </div>
    <div class="row sitemap-results resizable">
      <div class="col">
        <div v-if="parsedSitemap.error" class="error">
          <pre><code class="text-color-red">{{ parsedSitemap.error }}</code></pre>
        </div>
        <div v-else>
          <pre><code class="text-color-teal">Your sitemap definition looks valid.</code></pre>
          <pre><code>{{ parsedSitemap }}</code></pre>
        </div>
      </div>
      <span class="resize-handler" />
    </div>
  </f7-block>
</template>

<style lang="stylus">
.sitemap-code
  margin-top 0 !important
  margin-bottom 0 !important
  padding 0
  z-index auto !important
  top 0
  height calc(100%)
  .sitemap-parser
    height 50%
    width 100%
    .v-codemirror
      position absolute
      height calc(100% - var(--f7-grid-gap))
  .sitemap-results
    height 50%
    width 100%
    overflow-y auto
    .error
      pre
        padding 0 1rem
    pre
      padding 0 1rem
</style>

<script>
import { defineAsyncComponent } from 'vue'

import { Parser, Grammar } from 'nearley'
import * as grammar from '@/assets/sitemap-lexer.nearley.js'
import dslUtil from './dslUtil'

export default {
  components: {
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'))
  },
  props: {
    sitemap: Object
  },
  emits: ['updated'],
  data () {
    return {
      sitemapDsl: ''
    }
  },
  created () {
    this.sitemapDsl = dslUtil.toDsl(this.sitemap)
  },
  methods: {
    updateSitemap (value) {
      this.sitemapDsl = value
      const parsed = this.parsedSitemap
      if (!parsed.error) {
        this.$emit('updated', parsed)
      }
    }
  },
  computed: {
    parsedSitemap () {
      try {
        const parser = new Parser(Grammar.fromCompiled(grammar.default))
        parser.feed(this.sitemapDsl.trim().replace(/\t/g, ' '))
        if (!parser.results.length) return { error: 'Unable to parse, check your input' }
        return parser.results[0]
      } catch (e) {
        return { error: e }
      }
    }
  }
}
</script>
