<template>
  <f7-sheet class="demo-sheet-swipe-to-step" :opened="opened" @sheet:closed="$emit('closed')" swipe-to-close swipe-to-step backdrop
    style="height:auto; --f7-sheet-bg-color: #fff;">
    <div class="sheet-modal-swipe-step">

      <div class="swipe-handler"></div>
      <f7-block-title><strong><big>{{addon.label}}</big></strong></f7-block-title>
      <f7-block>
        <f7-row>
          <f7-col class="col-100 tablet-50">
            <f7-button
              outline
              color="blue"
              :href="addon.link"
              external
              target="_blank"
            >Documentation</f7-button>
          </f7-col>
          <f7-col class="col-100 tablet-50">
            <f7-button
              outline
              fill
              color="blue"
              v-if="state === 'UNINSTALLED'"
              @click="install()"
            >Install</f7-button>
            <f7-button
              outline
              fill
              color="red"
              v-if="state === 'INSTALLED'"
              @click="uninstall()"
            >Uninstall</f7-button>
          </f7-col>
        </f7-row>
      </f7-block>
      <f7-block class="padding-bottom">
        <div class="margin-top margin-bottom text-align-center">Swipe up for details</div>
      </f7-block>
    </div>
    <f7-page-content>
      <f7-block>
        <p>
          <strong>Version: {{addon.version}}</strong>
        </p>
      </f7-block>
      <f7-block v-if="bindingInfo.description">
        <p>
          <strong>Author: {{bindingInfo.author}}</strong>
        </p>
        <div v-html="bindingInfo.description"/>
      </f7-block>
      <f7-block v-if="!bindingInfo.description">
        <p>No description available.</p>
      </f7-block>
    </f7-page-content>
  </f7-sheet>
</template>

<style lang="stylus">
.demo-sheet-swipe-to-close,
.demo-sheet-swipe-to-step {
  --f7-sheet-bg-color: #fff;
  --f7-sheet-border-color: transparent;
  border-radius: 15px 15px 0 0;
  overflow: hidden;
}
.swipe-handler {
  height: 16px;
  position: absolute;
  left: 0;
  width: 100%;
  top: 0;
  background: #fff;
  cursor: pointer;
  z-index: 10;
}
.swipe-handler:after {
  content: '';
  width: 36px;
  height: 6px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -18px;
  margin-top: -3px;
  border-radius: 3px;
  background: #666;
}

@media (min-width: 1024px)
  .demo-sheet-swipe-to-close, .demo-sheet-swipe-to-step
    margin-left 150px
    margin-right 150px
    width: calc(100% - 300px)

@media (min-width: 1280px)
  .demo-sheet-swipe-to-close, .demo-sheet-swipe-to-step
    margin-left 250px
    margin-right 250px
    width: calc(100% - 500px)

</style>

<script>
export default {
  props: ['addonId', 'opened'],
  data () {
    return {
      addon: {},
      bindingInfo: {}
    }
  },
  watch: {
    addonId () {
      if (!this.addonId) {
        this.addon = {}
        this.bindingInfo = {}
        return
      }
      this.$oh.api.get('/rest/extensions/' + this.addonId).then(data => {
        this.addon = data

        if (this.addon.type === 'binding' && this.addon.installed) {
          this.$oh.api.get('/rest/bindings').then(data2 => {
            this.bindingInfo = data2.find(b => b.id === this.addonId.replace('binding-', '')) || {}

            // TODO: binding configuration stuff
          })
        }
      })
    }
  },
  computed: {
    state () {
      // TODO: figure out somehow whether the addon is BEING installed/uninstalled.
      if (!this.addon) return 'UNKNOWN'
      return this.addon.installed ? 'INSTALLED' : 'UNINSTALLED'
    }
  },
  methods: {
    install () {
      this.$oh.api.post('/rest/extensions/' + this.addonId + '/install', {}, 'text').then((data) => {
        this.$emit('install', this.addon)
      })
    },
    uninstall () {
      this.$oh.api.post('/rest/extensions/' + this.addonId + '/uninstall', {}, 'text').then((data) => {
        this.$emit('uninstall', this.addon)
      })
    }
  }
}
</script>
