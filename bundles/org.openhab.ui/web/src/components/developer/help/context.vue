<template>
  <f7-block class="no-margin no-padding">
    <f7-block>
      <div v-show="ready" v-html="parsedDocs" />
    </f7-block>
    <f7-block>
      <f7-link external :href="documentationLink" target="_blank" text="Open full documentation" color="blue" />
    </f7-block>
  </f7-block>
</template>

<style lang="stylus">
ul
  padding-left 20px
</style>

<script>
export default {
  props: ['path'],
  data () {
    return {
      ready: false,
      parsedDocs: null,
      cache: {} // Use some simple caching mechanism to avoid reloading .md file every time the context changes
    }
  },
  computed: {
    docsBranch () {
      if (this.$store.state.runtimeInfo.buildString === 'Release Build') return 'final-stable'
      return 'final'
    },
    docSrcUrl () {
      return `https://raw.githubusercontent.com/openhab/openhab-docs/${this.docsBranch}/mainui`
    },
    localUrl () {
      if (!this.$store.state.pagePath.endsWith('/')) return '/'
      return this.$store.state.pagePath
    },
    documentationLink () {
      if (this.path.endsWith('index')) return `${this.$store.state.websiteUrl}/docs/mainui${this.path.replace('index', '')}`
      return `${this.$store.state.websiteUrl}/docs/mainui${this.path}`
    }
  },
  watch: {
    path () {
      if (this.ready) {
        this.ready = false
        this.load()
      }
    }
  },
  methods: {
    load () {
      console.debug('Sidebar Help: Loading docs for ' + this.path + ' ...')
      if (this.cache[this.path]) {
        console.debug('Sidebar Help: Using docs from cache.')
        this.parsedDocs = this.cache[this.path]
        this.ready = true
        return
      }
      console.debug('Sidebar Help: Docs not found in cache, loading from GitHub ...')
      fetch(this.docSrcUrl + this.path + '.md').then((response) => {
        if (response.status === 404) {
          this.parsedDocs = '<p>Failed to load docs. It seems they are missing.</p><p>Please <a class="external" target="_blank" href="https://github.com/openhab/openhab-docs/issues/new">report this on the openHAB docs repo</a>.</p>'
          this.ready = true
          return
        }
        response.text().then((text) => {
          import('marked').then((marked) => {
            const startComment = '<!-- START MAINUI SIDEBAR DOC - DO NOT REMOVE -->'
            const endComment = '<!-- END MAINUI SIDEBAR DOC - DO NOT REMOVE -->'

            // Remove frontmatter stuff
            const frontmatterSeparators = [...text.matchAll(/^---$/gm)]
            if (frontmatterSeparators.length > 0) {
              text = text.substring(frontmatterSeparators[1].index + 4)
            }
            // Remove anything before the start comment (if existent)
            const startIndex = text.indexOf(startComment)
            if (startIndex > -1) {
              text = text.substring(startIndex + startComment.length)
            }
            // Remove anything after the end comment (if existent)
            const endIndex = text.indexOf(endComment)
            if (endIndex > -1) {
              text = text.substring(0, endIndex)
            }
            let body = marked.parse(text)

            // Perform a few replaces on HTML body for Markdown readmes on GitHub
            body = body.replace(/<p>{% include base.html %}<\/p>\n/gm, '')
            body = body.replace(/<h1 .*$/gm, '') // Remove h1 headings
            body = body.replace(/<img src=".*$/gm, '') // Remove images

            // Fix {{base}} and /docs anchor href for doc pages
            body = body.replace(/<a href="(%7B%7Bbase%7D%7D|\/docs)/gm, `<a class="external" target="_blank" href="${this.$store.state.websiteUrl}/docs`)
            // Fix local folder anchor href: Rewrite folder to /folder/
            body = body.replace(/(<a href=")([A-z]+)(")/gm, '$1' + this.localUrl + '$2/$3')
            // Fix external anchor href
            body = body.replace(/<a href="http/gm, '<a class="external" target="_blank" href="http')

            // Allow embedding framework7 icons by using <!--F7(:blue|:green) ICON_NAME --> comments
            body = body.replace(/<!--F7 ([A-z]*) -->/gm, '<i class="f7-icons size-22">$1</i>')
            body = body.replace(/<!--F7:blue ([A-z]*) -->/gm, '<i class="f7-icons size-22" style="color: #2196f3">$1</i>')
            body = body.replace(/<!--F7:green ([A-z]*) -->/gm, '<i class="f7-icons size-22" style="color: #4cd964">$1</i>')

            body = body.replace(/<pre>/gm, '<div class="block block-strong no-padding"><pre class="padding-half">')
            body = body.replace(/<\/pre>/gm, '</pre></div>')
            body = body.replace(/<table>/gm, '<div class="data-table"><table>')
            body = body.replace(/<\/table>/gm, '</table></div>')

            this.cache[this.path] = body
            this.parsedDocs = body
            this.ready = true
          }).catch((err) => {
            this.parsedDocs = '<p>Failed to parse docs.</p><h3>Debug Information</h3><blockquote>' + err + '</blockquote>'
            this.ready = true
          })
        })
      }).catch((err) => {
        this.parsedDocs = '<p>Failed to load docs.</p><p>This might be an issue with your internet connection.</p><h3>Debug Information</h3><blockquote>' + err + '</blockquote>'
        this.ready = true
      })
    }
  },
  created () {
    this.load()
  }
}
</script>
