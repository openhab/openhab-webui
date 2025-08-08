<template>
  <f7-page @page:beforein="onPageBeforeIn"
           @page:beforeout="onPageBeforeOut"
           ref="addondetails"
           class="page-addon-details">
    <f7-navbar :transparent="true" back-link="Back" class="addon-details-nav">
      <f7-nav-title v-if="addon">
        {{ addon.label }}
      </f7-nav-title>
    </f7-navbar>
    <f7-block class="block-narrow addon-details" v-if="ready && addon">
      <f7-row>
        <f7-col class="margin-left">
          <div class="addon-header">
            <f7-link :href="docLinkUrl" external target="_blank">
              <addon-logo class="logo-container" :addon="addon" size="100" />
            </f7-link>
            <div class="addon-header-content">
              <div class="addon-header-title">
                {{ addon.label }}
              </div>
              <div v-if="addon.verifiedAuthor" class="addon-header-subtitle">
                {{ addon.author }}
                <f7-icon :color="$f7.data.themeOptions.dark === 'dark' ? 'white' : 'blue'" f7="checkmark_seal_fill" />
              </div>
              <div v-else-if="addon.properties && addon.properties.views" class="addon-header-subtitle">
                <addon-stats-line :addon="addon" :iconSize="15" />
              </div>
              <div class="addon-header-actions">
                <div v-if="showInstallActions">
                  <f7-preloader v-if="isPending(addon)" color="blue" />
                  <f7-button v-else-if="addon.installed"
                             class="install-button"
                             text="Remove"
                             color="red"
                             round
                             small
                             fill
                             @click="openAddonPopup" />
                  <f7-button v-else
                             class="install-button"
                             :text="installableAddon(addon) ? 'Install' : 'Add'"
                             color="blue"
                             round
                             small
                             fill
                             @click="openAddonPopup" />
                </div>
                <f7-link v-if="showConfig"
                         icon-f7="gears"
                         tooltip="Configure add-on"
                         color="blue"
                         :href="'/settings/addons/' + addonId"
                         round
                         small />
              </div>
            </div>
          </div>
        </f7-col>
      </f7-row>
      <f7-row>
        <f7-col>
          <f7-block strong class="addon-description" v-if="descriptionReady">
            <div v-show="descriptionExpanded" v-html="parsedDescription" class="addon-description-text" />
            <div v-show="!descriptionExpanded" v-html="addonDescription" class="addon-description-text" />
            <div v-show="!descriptionExpanded" class="text-align-right">
              <f7-link @click="descriptionExpanded = true">
                more
              </f7-link>
            </div>
          </f7-block>
          <f7-block v-else class="skeleton-text skeleton-effect-blink">
            <p>
              Lorem ipsum dolor sit amet, an labore inermis est.
              Mel ut dicant tamquam commune, duo id accumsan eleifend tractatos, ius purto vitae fabulas cu.
              Te his vide omnis qualisque, in duo soluta persecuti instructior. Ex dicit detraxit voluptaria est.
              Aperiri reformidans comprehensam in vis.
            </p>
            <p>
              Quo quas rebum dicta ad, in erant eruditi vim.
              Mel no primis everti voluptatum, id utamur voluptatibus mea.
              Nam deseruisse expetendis cotidieque at, vis oratio utroque cu.
              Eu duo quod fuisset, ne fabulas hendrerit argumentum pro.
              Errem dictas his ea, eos interesset efficiantur ei.
            </p>
          </f7-block>
        </f7-col>
      </f7-row>
      <f7-row>
        <f7-col>
          <f7-block-title class="margin-left margin-bottom-half" medium>
            Information
          </f7-block-title>
          <addon-info-table v-if="ready && addon" :addon="addon" />
        </f7-col>
      </f7-row>
    </f7-block>
    <addon-details-sheet
      v-if="ready"
      :addon-id="realAddonId"
      :service-id="serviceId"
      :no-details="true"
      :opened="addonPopupOpened"
      @closed="addonPopupOpened = false"
      @install="installAddon"
      @uninstall="uninstallAddon" />
  </f7-page>
</template>

<style lang="stylus">
.theme-filled .addon-details-nav.navbar:not(.navbar-transparent-visible) .link
  color var(--f7-theme-color)
  transition color 0.3s
.theme-filled .addon-details-nav.navbar.navbar-transparent-visible .link
  color var(--f7-navbar-link-color)
  transition color 0.3s
.addon-details
  width calc(100%)
  .addon-header
    display flex
    align-items stretch
    .logo-container
      display flex
      justify-content center
      align-items center
      width 118px
      height 118px
      border-radius 10%
      margin-right var(--f7-block-padding-horizontal)
      flex-shrink 0
      background white
      border 1px solid rgba(0, 0, 0, 0.1)
      .logo
        max-width 100px
        max-height 100px
    @media (min-width 768px)
      .logo-container
        width 191px
        height 191px
        .logo
          max-width 165px
          max-height 165px
    .addon-header-content
      display flex
      flex-direction column
      width calc(100% - 2*var(--f7-block-padding-horizontal))
      flex-shrink 10
      min-width 0
      line-height 27px
      .addon-header-title
        font-size 22px
        font-weight 600
      @media (min-width 768px)
        .addon-header-title
          font-size 27px
          line-height normal
      .addon-header-subtitle
        font-size 16px
        font-weight 600
        color var(--f7-list-item-after-text-color)
        i
          font-size 16px
      @media (min-width 768px)
        .addon-header-author
          font-size 20px
          i
            font-size 20px
    .addon-header-actions
      display flex
      justify-content space-between
      align-items center
      margin-top auto
      margin-bottom auto
      margin-right 15px
      .install-button
        --f7-button-text-transform uppercase
        padding-left 15px
        padding-right 15px
        font-size 16px
  .addon-description
    --f7-block-strong-bg-color transparent
    width calc(100%)
    --f7-theme-color var(--f7-color-blue)
  .addon-description-text
    overflow-x clip
    .emoji
      height 1rem
    .lightbox-wrapper .meta
      display none
    pre
      overflow auto
      width calc(100% - 2*var(--f7-block-padding-horizontal-half))
      max-height 70vh
      color var(--f7-block-footer-text-color)
    img
      max-width calc(100%)
      height auto
      &[alt="logo"]
        display none
      &.lazy:not(.lazy-loaded)
        opacity 0
</style>

<script>
import AddonStoreMixin from './addon-store-mixin'
import AddonStatsLine from '@/components/addons/addon-stats-line.vue'
import AddonInfoTable from '@/components/addons/addon-info-table.vue'
import AddonLogo from '@/components/addons/addon-logo.vue'

export default {
  mixins: [AddonStoreMixin],
  components: {
    AddonLogo,
    AddonStatsLine,
    AddonInfoTable
  },
  props: ['addonId'],
  data () {
    return {
      addon: null,
      ready: false,
      descriptionReady: false,
      parsedDescription: '',
      descriptionExpanded: false
    }
  },
  computed: {
    showConfig () {
      return this.addon && this.addon.installed && (this.addon.configDescriptionURI || this.addon.loggerPackages.length > 0)
    },
    realAddonId () {
      if (!this.addon) return null
      return this.addon.uid
    },
    serviceId () {
      if (!this.addon) return null
      return (this.addon.uid.indexOf(':') > 0) ? this.addon.uid.substring(0, this.addon.uid.indexOf(':')) : undefined
    },
    addonDescription () {
      if (!this.descriptionReady) return null
      if (!this.addon) return null
      if (this.addon.description && (!this.addon.link || this.addon.link.indexOf('openhab.org/addons') < 0)) return this.addon.description
      if (this.parsedDescription) {
        const firstHeading = this.parsedDescription.match(/<h\d/m)
        if (firstHeading && firstHeading.index > 0) return this.parsedDescription.substring(0, firstHeading.index)
        return this.parsedDescription
      }
      return 'No description found'
    },
    docLinkUrl () {
      if (!this.addon) return ''
      if (this.serviceId && this.serviceId !== 'karaf') return this.addon.link ? this.addon.link : ''
      return this.$store.state.websiteUrl +
        `/addons/${this.addon.type.replace('misc', 'integrations').replace('binding', 'bindings').replace('transformation', 'transformations')}` +
        `/${this.addon.id}`
    },
    showInstallActions () {
      let splitted = this.addon.uid.split(':')
      return splitted.length < 2 || splitted[0] !== 'eclipse'
    }
  },
  methods: {
    onPageBeforeIn () {
      this.ready = false
      this.load()
    },
    onPageBeforeOut () {
      this.stopEventSource()
    },
    load () {
      this.stopEventSource()
      let serviceId = null
      if (this.addonId.indexOf(':') > 0) {
        serviceId = this.addonId.substring(0, this.addonId.indexOf(':'))
      }
      this.$oh.api.get('/rest/addons/' + this.addonId + (serviceId ? '?serviceId=' + serviceId : '')).then((data) => {
        this.resetPending()
        this.$set(this, 'addon', data)
        this.ready = true
        this.processDescription()
        this.startEventSource()

        setTimeout(() => {
          this.$f7.lazy.create('.page-addon-details')
        })
      })
    },
    processDescription () {
      if (this.addon.author === 'openHAB') {
        // assuming the add-on is an official one (distribution), try to fetch the documentation from GitHub
        let docsBranch = 'final'
        if (this.$store.state.runtimeInfo.buildString === 'Release Build') docsBranch = 'final-stable'
        let addonTypeFolder = '_addons_' + this.addon.type
        if (this.addon.type === 'misc') addonTypeFolder = '_addons_io'
        if (this.addon.type !== 'automation') addonTypeFolder += 's'
        let docSrcUrl = `${this.$store.state.docSrcUrl}/${addonTypeFolder}/${this.addon.id}`

        fetch(docSrcUrl + '/readme.md').then((readme) => {
          readme.text().then((text) => {
            import('marked').then((marked) => {
              const frontmatterSeparators = [...text.matchAll(/^---$/gm)]
              let body

              if (frontmatterSeparators.length !== 2) {
                body = '<p>The description is not available for this add-on.</p><h3>Debug Information</h3><blockquote>' + text + '</blockquote>'
              } else {
                const frontmatter = text.substring(4, frontmatterSeparators[1].index)
                body = marked.parse(text.substring(frontmatterSeparators[1].index + 4))

                // perform a few replaces on HTML body for Markdown readmes on GitHub
                body = body.replace(/<p>{% include base.html %}<\/p>\n/gm, '')
                body = body.replace(/<h1.*$/gm, '')
                body = body.replace(/<pre>/gm, '<div class="block block-strong no-padding"><pre class="padding-half">')
                body = body.replace(/<\/pre>/gm, '</pre></div>')
                body = body.replace(/<table>/gm, '<div class="data-table"><table>')
                body = body.replace(/<\/table>/gm, '</table></div>')
                body = body.replace(/<a href="http/gm, '<a class="external" target="_blank" href="http')
                body = body.replace(/<img src="doc/gm, '<img class="lazy lazy-fade-in" data-src="' + docSrcUrl + '/doc')
                body = body.replace(/<img src="contrib/gm, '<img class="lazy lazy-fade-in" data-src="' + docSrcUrl + '/contrib')
              }

              this.parsedDescription = body
              this.descriptionReady = true
              setTimeout(() => { this.$f7.lazy.create('.addon-description-text') })
            })
          })
        }).catch((err) => {
          this.parsedDescription = '<p>The description is unavailable for this add-on.</p><h3>Debug Information</h3><blockquote>' + err + '</blockquote>'
          this.descriptionReady = true
          setTimeout(() => { this.$f7.lazy.create('.addon-description-text') })
        })
      } else {
        // perform a few replaces for Discourse "cooked" HTML
        let body = this.addon.detailedDescription ? this.addon.detailedDescription : ''
        body = body.replace(/<pre>/gm, '<div class="block block-strong no-padding"><pre class="padding-half">')
        body = body.replace(/<\/pre>/gm, '</pre></div>')
        body = body.replace(/<table>/gm, '<div class="data-table"><table>')
        body = body.replace(/<\/table>/gm, '</table></div>')
        body = body.replace(/<a class="lightbox" href="/gm, '<a class="external" target="_blank" href="')
        body = body.replace(/<a href="http/gm, '<a class="external" target="_blank" href="http')
        body = body.replace(/<img src="\/\/community-openhab-org/gm, '<img class="lazy lazy-fade-in" data-src="//community-openhab-org')
        this.parsedDescription = body
        this.descriptionReady = true
        setTimeout(() => { this.$f7.lazy.create('.addon-description-text') })
      }
    }
  }
}
</script>
