<template>
  <f7-block :class="['widget-renderer-test', split === 'horizontal' ? 'horizontal' : 'vertical']">
    <f7-row :resizable="split !== 'vertical'">
      <f7-col :resizable="split === 'vertical'" style="min-width: 20px" class="widget-code">
        <editor class="widget-component-editor" :mode="'text/x-yaml'" :value="widgetDefinition" @input="(value) => widgetDefinition = value" />
      </f7-col>
      <f7-col v-if="split === 'vertical'" :resizable="split === 'vertical'" style="min-width: 20px" class="widget-preview padding-horizontal margin-bottom">
        <generic-widget-component :class="[!ready ? 'notready' : '']" :context="context" @command="onCommand" />
        <f7-block class="no-padding padding-bottom margin-bottom">
          <f7-list accordion-list>
            <f7-list-item accordion-item title="Tracked Items" :footer="`${items.length} items`">
              <f7-accordion-content>
                <f7-list>
                  <f7-list-item v-for="item in items" :key="item" :title="item" :after="states[item]" />
                </f7-list>
              </f7-accordion-content>
            </f7-list-item>
          </f7-list>
        </f7-block>
      </f7-col>
    </f7-row>
    <f7-row resizable v-if="split !== 'vertical'">
      <f7-col style="min-width: 20px" class="widget-preview margin-bottom">
        <generic-widget-component :class="[!ready ? 'notready' : '']" :context="context" @command="onCommand" />
        <f7-block class="padding-bottom margin-bottom">
          <f7-list accordion-list>
            <f7-list-item accordion-item title="Tracked Items" :footer="`${items.length} items`">
              <f7-accordion-content>
                <f7-list>
                  <f7-list-item v-for="item in items" :key="item" :title="item" :after="states[item]" />
                </f7-list>
              </f7-accordion-content>
            </f7-list-item>
          </f7-list>
        </f7-block>
      </f7-col>
    </f7-row>
  </f7-block>
</template>

<style lang="stylus">
.widget-renderer-test
  padding 0
  height calc(100vh - 2*var(--f7-navbar-height) - var(--f7-toolbar-height) - 2.5*var(--f7-block-margin-vertical))
  .notready
    visibility hidden
  .code-editor-fit
    top 0
    height calc(100% - var(--f7-grid-gap))
  &.vertical
    .row
      height 100%
      .widget-preview
        height 100%
        overflow auto
      .widget-code
        height 100%
  &.horizontal
    .row
      height 50%
</style>

<script>
import TestWidget from './test-card'
import YAML from 'yaml'
import { strOptions } from 'yaml/types'
import dummyStore from './dummyStateStore'

strOptions.fold.lineWidth = 0

export default {
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue')
  },
  props: ['split'],
  data () {
    return {
      widgetDefinition: null,
      states: {},
      store: null,
      items: [],
      randomInterval: null,
      ready: false
    }
  },
  mounted () {
    this.widgetDefinition = YAML.stringify(TestWidget)
    this.store = dummyStore(this.states)
    this.randomInterval = setInterval(() => {
      for (const itemName of this.items) {
        const rnd = Math.floor(Math.random() * 100)
        if (itemName.indexOf('Switch') >= 0) {
          this.store[itemName] = (rnd > 50) ? { state: 'ON' }  : { state: 'OFF' }
        } else {
          this.store[itemName] = { state: rnd }
        }
      }
    }, 5000)
  },
  beforeDestroy () {
    clearInterval(this.randomInterval)
  },
  computed: {
    context () {
      return {
        component: this.widget,
        store: this.store,
        states: this.states,
        editmode: true
      }
    },
    widget () {
      try {
        return YAML.parse(this.widgetDefinition, { prettyErrors: true })
      } catch (e) {
        return { component: 'Error', config: { error: e } }
      }
    }
  },
  methods: {
    redrawWidget () {
      const wd = this.widgetDefinition
      this.widgetDefinition = 'component: Label\nnconfig: { text: "Redrawing..."}'
      this.$nextTick(() => {
        this.widgetDefinition = wd
      })
    },
    onCommand (itemName, cmd) {
      const currentState = this.store[itemName]*
      this.$f7.toast.create({
        text: `Command: ${itemName}=${cmd}`,
        destroyOnClose: true,
        closeTimeout: 1000
      }).open()
      console.log(`CMD: ${itemName}=${cmd}`)
      if (currentState !== cmd) {
        this.store[itemName] = cmd
      }
    }
  },
  watch: {
    states () {
      this.$nextTick(() => {
        this.$set(this, 'items', this.store._keys)
      })
    },
    items (value) {
      console.log(value)
      // simulate the initial event
      setTimeout(() => {
        this.ready = true
        const event = {
          Dimmer1: { state: 10 },
          Dimmer2: { state: 20 },
          Dimmer3: { state: 30 },
          Dimmer4: { state: 40 },
          TestSwitch: { state: 'ON' }
        }
        for (const item in event) {
          this.store[item] = event[item]
        }
      }, 100)
    }
  }
}
</script>
