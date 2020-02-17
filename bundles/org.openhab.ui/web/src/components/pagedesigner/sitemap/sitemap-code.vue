<template>
  <div class="row">
    <div class="col">
      <editor class="sitemap-parser" :value="sitemapDsl" @input="updateSitemap" />
      <div v-if="parsedSitemap.error" class="sitemap-results error">
        <pre><code class="text-color-red">{{parsedSitemap.error}}</code></pre>
      </div>
      <div v-else class="sitemap-results">
        <pre><code class="text-color-teal">Your sitemap definition looks valid.</code></pre>
        <pre><code>{{parsedSitemap}}</code></pre>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
.sitemap-parser.vue-codemirror
  display block
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(50% - 2*var(--f7-navbar-height))
  width 100%
.sitemap-results
  position absolute
  top 50%
  height 50%
  overflow-y auto
  width 100%
  &.error
    pre
      padding 0 1rem
  pre
    padding 0 1rem
</style>

<script>
import { Parser, Grammar } from 'nearley'
import grammar from '@/assets/sitemap-lexer.nearley'
import dslUtil from './dslUtil'

export default {
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue')
  },
  props: ['sitemap'],
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
        const parser = new Parser(Grammar.fromCompiled(grammar))
        parser.feed(this.sitemapDsl.trim())
        if (!parser.results.length) return { error: 'Unable to parse, check your input' }
        // return parser.results[0].map((i) => i.name).join('\n')
        return parser.results[0]
      } catch (e) {
        return { error: e }
      }
    }
  }
}
</script>
