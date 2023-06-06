<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="newPersistence ? 'Create persistence configuration' : 'Edit persistence configuration'"
               back-link="Back">
      <f7-nav-right v-if="isEditable">
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>

    <f7-tabs>
      <!-- Design Tab -->
      <f7-tab id="design" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <!-- Skeletons for not ready -->
        <f7-block v-if="!ready" class="block-narrow">
          <f7-col class="modules">
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Configuration
              </f7-block-title>
              <f7-list class="skeleton-text skeleton-effect-blink">
                <f7-list-item />
              </f7-list>
            </div>
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Strategies
              </f7-block-title>
              <f7-list class="skeleton-text skeleton-effect-blink">
                <f7-list-item />
              </f7-list>
              <!-- Default Strategies -->
              <strategy-picker title="Default Strategies" class="skeleton-text skeleton-effect-blink" />
            </div>
          </f7-col>
        </f7-block>

        <f7-block v-if="ready" class="block-narrow">
          <f7-col v-if="!isEditable">
            <div class="padding-left">
              Note: {{ notEditableMgs }}
            </div>
          </f7-col>
          <f7-col class="modules">
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Configuration
              </f7-block-title>
              <f7-list media-list swipeout>
                <f7-list-item v-for="(cfg, index) in persistence.configs" :key="cfg.items.join()"
                              :title="cfg.items.join(', ')"
                              :footer="cfg.strategies.join(', ')" :link="isEditable"
                              @click.native="(ev) => editConfiguration(ev, index, cfg)" swipeout>
                  <f7-link slot="media" v-if="isEditable" icon-color="red" icon-aurora="f7:minus_circle_filled"
                           icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                           @click="showSwipeout" />
                  <f7-swipeout-actions right v-if="isEditable">
                    <f7-swipeout-button @click="(ev) => deleteConfiguration(ev, index)"
                                        style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="isEditable">
                <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'"
                              subtitle="Add configuration" @click="editConfiguration(undefined, null)">
                  <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill"
                           md="material:control_point" />
                </f7-list-item>
              </f7-list>
            </div>
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Strategies
              </f7-block-title>
              <!-- Cron Strategies -->
              <f7-list media-list swipeout>
                <f7-list-item v-for="(cs, index) in persistence.cronStrategies" :key="cs.name" :title="cs.name"
                              :footer="cs.cronExpression" :link="isEditable"
                              @click.native="(ev) => editCronStrategy(ev, index, cs)" swipeout>
                  <f7-link slot="media" v-if="isEditable" icon-color="red" icon-aurora="f7:minus_circle_filled"
                           icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                           @click="showSwipeout" />
                  <f7-swipeout-actions right v-if="isEditable">
                    <f7-swipeout-button @click="(ev) => deleteCronStrategy(ev, index)"
                                        style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="isEditable">
                <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'"
                              subtitle="Add cron strategy" @click="editCronStrategy(undefined, null)">
                  <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill"
                           md="material:control_point" />
                </f7-list-item>
              </f7-list>
              <!-- Default Strategies -->
              <strategy-picker title="Default Strategies" name="defaults" :strategies="strategies"
                               :value="persistence.defaults" @strategiesSelected="persistence.defaults = $event" />
            </div>
          </f7-col>
        </f7-block>
      </f7-tab>

      <!-- Code Tab -->
      <f7-tab id="code" @tab:show="() => { currentTab = 'code'; toYaml() }" :tab-active="currentTab === 'code'">
        <f7-icon v-if="!isEditable" f7="lock" class="float-right margin"
                 style="opacity:0.5; z-index: 4000; user-select: none;" size="50" color="gray"
                 :tooltip="notEditableMgs" />
        <editor v-if="currentTab === 'code'" class="persistence-code-editor"
                mode="application/vnd.openhab.persistence+yaml" :value="persistenceYaml" @input="onEditorInput"
                :read-only="!isEditable" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.moduleconfig-popup
  .page-content
    overflow-x hidden !important
  .config-sheet, .parameter-group
    margin-top 0 !important

.modules
  .swipeout-opened
    .sortable-handler
      display none
  .item-media .icon
    color var(--f7-theme-color)
  .media-list
    margin-bottom 0
  .list
    margin-top 0

.persistence-code-editor.vue-codemirror
  display block
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(100% - 2 * var(--f7-navbar-height))
  width 100%
</style>

<script>
import DirtyMixin from '../dirty-mixin'
import YAML from 'yaml'
import CronStrategyPopup from '@/pages/settings/persistence/cron-strategy-popup.vue'
import StrategyPicker from '@/pages/settings/persistence/strategy-picker.vue'
import ConfigurationPopup from '@/pages/settings/persistence/configuration-popup.vue'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

export default {
  mixins: [DirtyMixin],
  components: {
    StrategyPicker,
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  props: ['serviceId'],
  data () {
    return {
      newPersistence: false,
      persistence: {},
      savedPersistence: {},
      persistenceYaml: '',
      ready: false,
      loading: false,
      currentTab: 'design',
      currentConfiguration: null,
      currentCronStrategy: null,

      predefinedStrategies: ['everyChange', 'everyUpdate', 'restoreOnStartup'],
      notEditableMgs: 'This persistence configuration is not editable because it has been provisioned from a file.'
    }
  },
  computed: {
    isEditable () {
      return this.newPersistence || (this.persistence && this.persistence.editable === true)
    },
    strategies () {
      return this.predefinedStrategies.concat(this.persistence.cronStrategies.map(cs => cs.name))
    }
  },
  watch: {
    persistence: {
      handler: function (newPersistence, oldPersistence) {
        if (!this.loading) { // ignore initial rule assignment
          this.dirty = !fastDeepEqual(this.persistence, this.savedPersistence)
        }
      },
      deep: true
    }
  },
  methods: {
    onPageAfterIn () {
      if (this.ready) return
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.load()
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    initializeNewPersistence () {
      this.newPersistence = true
      this.persistence = {
        serviceId: this.serviceId,
        configs: [],
        defaults: [
          'everyChange'
        ],
        cronStrategies: [
          {
            name: 'everyMinute',
            cronExpression: '0 * * ? * *'
          },
          {
            name: 'everyHour',
            cronExpression: '0 0 * * * ?'
          },
          {
            name: 'everyDay',
            cronExpression: '0 0 0 * * ?'
          }
        ],
        thresholdFilters: [],
        timeFilters: []
      }
      this.ready = true
    },
    load () {
      if (this.loading) return
      this.loading = true

      this.$oh.api.get('/rest/persistence/' + this.serviceId).then((data) => {
        this.$set(this, 'persistence', data)
        this.savedPersistence = cloneDeep(this.persistence)
        this.loading = false
        this.ready = true
      }).catch((e) => {
        if (e === 404 || e === 'Not Found') {
          this.initializeNewPersistence()
        } else {
          Promise.reject(e)
        }
      })
    },
    save (noToast) {
      if (!this.isEditable) return
      if (this.currentTab === 'code') this.fromYaml()
      return this.$oh.api.put('/rest/persistence/' + this.persistence.serviceId, this.persistence).then((data) => {
        this.newPersistence = false
        this.dirty = false
        if (!noToast) {
          this.$f7.toast.create({
            text: 'Persistence configuration saved',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving persistence configuration: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    showSwipeout (ev) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }

      if (swipeoutElement) {
        this.$f7.swipeout.open(swipeoutElement)
      }
    },
    editConfiguration (ev, index, configuration) {
      this.currentConfiguration = configuration

      const popup = {
        component: ConfigurationPopup
      }
      this.$f7router.navigate({
        url: 'configuration-config',
        route: {
          path: 'configuration-config',
          popup
        }
      }, {
        props: {
          configuration: this.currentConfiguration,
          strategies: this.strategies
        }
      })

      this.$f7.once('configurationUpdate', (ev) => this.saveConfiguration(index, ev))
    },
    saveConfiguration (index, configuration) {
      const idx = this.persistence.configs.findIndex((cfg) => cfg.items.join() === configuration.items.join())
      console.log(index, idx)
      if (idx !== -1 && idx !== index) {
        this.$f7.dialog.alert('A configuration for this/these Item(s) already exists!')
        return
      }
      if (index === null) {
        this.persistence.configs.push(configuration)
      } else {
        this.persistence.configs[index] = configuration
        this.$forceUpdate()
      }
    },
    deleteConfiguration (ev, index) {
      let swipeoutElement = ev.target
      if (!this.isEditable) return
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      this.$f7.swipeout.delete(swipeoutElement, () => {
        this.persistence.configs.splice(index, 1)
      })
    },
    editCronStrategy (ev, index, cronStrategy) {
      this.currentCronStrategy = cronStrategy

      const popup = {
        component: CronStrategyPopup
      }
      this.$f7router.navigate({
        url: 'cron-strategy-config',
        route: {
          path: 'cron-strategy-config',
          popup
        }
      }, {
        props: {
          cronStrategy: this.currentCronStrategy
        }
      })

      this.$f7.once('cronStrategyConfigUpdate', (ev) => this.saveCronStrategy(index, ev))
    },
    saveCronStrategy (index, cronStrategy) {
      const idx = this.persistence.cronStrategies.findIndex((cs) => cs.name === cronStrategy.name)
      if ((idx !== -1 && idx !== index) || this.predefinedStrategies.includes(cronStrategy.name)) {
        this.$f7.dialog.alert('A (cron) strategy with the same name already exists!')
        return
      }
      if (index === null) {
        this.persistence.cronStrategies.push(cronStrategy)
      } else {
        this.persistence.cronStrategies[index] = cronStrategy
        this.$forceUpdate()
      }
    },
    deleteCronStrategy (ev, index) {
      let swipeoutElement = ev.target
      if (!this.isEditable) return
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      this.$f7.swipeout.delete(swipeoutElement, () => {
        this.persistence.cronStrategies.splice(index, 1)
      })
    },
    onEditorInput (value) {
      this.persistenceYaml = value
      this.dirty = true
    },
    toYaml () {
      this.persistenceYaml = YAML.stringify({
        configurations: this.persistence.configs,
        cronStrategies: this.persistence.cronStrategies,
        defaultStrategies: this.persistence.defaults,
        thresholdFilters: this.persistence.thresholdFilters,
        timeFilters: this.persistence.timeFilters
      })
    },
    fromYaml () {
      if (!this.isEditable) return false
      try {
        const updatedPersistence = YAML.parse(this.persistenceYaml)
        this.$set(this.persistence, 'configs', updatedPersistence.configurations)
        this.$set(this.persistence, 'cronStrategies', updatedPersistence.cronStrategies)
        this.$set(this.persistence, 'defaults', updatedPersistence.defaultStrategies)
        this.$set(this.persistence, 'thresholdFilters', updatedPersistence.thresholdFilters)
        this.$set(this.persistence, 'timeFilters', updatedPersistence.timeFilters)
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    },
    keyDown (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        switch (ev.keyCode) {
          case 83:
            this.save()
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    }
  }
}
</script>
