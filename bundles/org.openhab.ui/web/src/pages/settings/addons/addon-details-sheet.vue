<template>
  <f7-sheet ref="sheet" class="demo-sheet-swipe-to-step" @sheet:closed="$emit('closed')" swipe-to-close swipe-to-step backdrop>
    <div class="sheet-modal-swipe-step">

      <div class="swipe-handler" @click="toggleSwipeStep"></div>
      <f7-block-title><strong><big>{{addon.label}}</big></strong></f7-block-title>
      <f7-block>
        <f7-row>
          <f7-col class="col-100 margin-top padding-horizontal">
            <f7-button large fill color="blue" v-if="state === 'UNINSTALLED'" @click="install()" >Install</f7-button>
            <f7-button large fill color="red"  v-if="state !== 'UNINSTALLED'" @click="uninstall()" >Uninstall</f7-button>
          </f7-col>
        </f7-row>
      </f7-block>
      <f7-block class="padding-bottom" @click.native="toggleSwipeStep" style="cursor:pointer">
        <div class="margin-top margin-bottom text-align-center"><f7-icon f7="chevron_down_circle" />&nbsp;Expand for details</div>
      </f7-block>
    </div>
    <f7-page-content>
      <f7-block v-if="bindingInfo.description">
        <div class="padding-left padding-right" v-html="bindingInfo.description"/>
        <!-- <p class="padding-left padding-right">
          <em>Author: {{bindingInfo.author}}</em>
        </p> -->
      </f7-block>
      <f7-block>
        <f7-list>
          <f7-list-item v-if="bindingInfo.author" title="Author" :after="bindingInfo.author"></f7-list-item>
          <f7-list-item title="Version" :after="addon.version"></f7-list-item>
        </f7-list>
        <f7-list>
          <f7-list-button v-if="bindingInfo.configDescriptionURI" color="blue" :href="bindingInfo.id + '/config'" title="Configure"></f7-list-button>
          <f7-list-button v-if="addon.link" color="blue" external target="_blank" :href="addon.link" title="Documentation"></f7-list-button>
        </f7-list>
      </f7-block>
      <!-- <f7-block v-else>
        <p>No description available.</p>
      </f7-block> -->
    </f7-page-content>
  </f7-sheet>
</template>

<style lang="stylus">
.demo-sheet-swipe-to-step
  height auto

.demo-sheet-swipe-to-close,
.demo-sheet-swipe-to-step {
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
    margin-left 15%
    margin-right 15%
    width calc(100% - 30%)

@media (min-width: 1280px)
  .demo-sheet-swipe-to-close, .demo-sheet-swipe-to-step
    margin-left 30%
    margin-right 30%
    width: calc(100% - 60%)

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
    opened (state) {
      let self = this
      if (state) {
        if (!this.addonId) {
          this.addon = {}
          this.bindingInfo = {}
          return
        }
        self.$f7.preloader.show()
        this.$oh.api.get('/rest/extensions/' + this.addonId).then(data => {
          this.addon = data

          if (this.addon.type === 'binding' && this.addon.installed) {
            this.$oh.api.get('/rest/bindings').then(data2 => {
              this.bindingInfo = data2.find(b => b.id === this.addonId.replace('binding-', '')) || {}
              self.$f7.preloader.hide()
              setTimeout(() => {
                self.$refs.sheet.f7Sheet.setSwipeStep()
                self.$refs.sheet.f7Sheet.open()
              })
            })
          } else {
            self.$f7.preloader.hide()
            setTimeout(() => {
              self.$refs.sheet.f7Sheet.setSwipeStep()
              self.$refs.sheet.f7Sheet.open()
            })
          }
        })
      } else {
        self.$refs.sheet.f7Sheet.close()
      }
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
    toggleSwipeStep () {
      const self = this
      self.$refs.sheet.f7Sheet.stepToggle('.demo-sheet-swipe-to-step')
    },
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
