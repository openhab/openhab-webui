<template>
  <f7-page name="devtools" @page:beforeremove="onPageBeforeRemove">
    <f7-navbar no-hairline>
      <oh-nav-content title="Developer Tools" back-link-url="/" :f7router />
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'menu'" :tab-link-active="currentTab === 'menu'" tab-link="#tab-menu"> Expert Features </f7-link>
      <f7-link @click="currentTab = 'debug'" :tab-link-active="currentTab === 'debug'" tab-link="#tab-debug"> Debug </f7-link>
    </f7-toolbar>

    <f7-tabs>
      <f7-tab id="tab-menu" :tab-active="currentTab === 'menu'">
        <f7-block class="block-narrow after-big-title settings-menu">
          <f7-row>
            <f7-col
              v-for="column in developerNavigationColumns"
              :key="column"
              width="100"
              :medium="developerNavigationColumns.length > 1 ? '50' : '100'">
              <template v-for="section in developerColumnSections(column)" :key="section.id">
                <f7-block-title>{{ $t(section.titleKey) }}</f7-block-title>
                <f7-list>
                  <template v-for="item in section.items" :key="item.id">
                    <f7-list-item
                      v-if="item.kind === 'link'"
                      media-item
                      :class="item.className"
                      :title="$t(item.titleKey)"
                      :footer="$t(item.footerKey)"
                      :link="item.link">
                      <template #media>
                        <f7-icon :f7="item.icon" color="gray" />
                      </template>
                    </f7-list-item>
                    <f7-list-item
                      v-else-if="item.kind === 'action'"
                      media-item
                      :class="item.className"
                      :title="$t(item.titleKey)"
                      :footer="$t(item.footerKey)"
                      link="#"
                      @click.prevent="runDeveloperMenuAction(item.actionId)">
                      <template #media>
                        <f7-icon :f7="item.icon" color="gray" />
                      </template>
                    </f7-list-item>
                    <f7-list-item
                      v-else-if="item.kind === 'toggle'"
                      media-item
                      no-chevron
                      :class="item.className"
                      :title="$t(item.titleKey)"
                      :footer="$t(item.footerKey)"
                      link="#"
                      @click.prevent="toggleDeveloperMenuControl(item.controlId)">
                      <template #media>
                        <f7-icon :f7="item.icon" color="gray" />
                      </template>
                      <template #header>
                        <div
                          style="height: 100%; height: 32px"
                          class="display-flex float-right flex-direction-column justify-content-center">
                          <f7-toggle
                            color="blue"
                            :checked="developerToggleValue(item.controlId) ? true : null"
                            @click.stop="toggleDeveloperMenuControl(item.controlId)" />
                        </div>
                      </template>
                    </f7-list-item>
                    <f7-list-item
                      v-else-if="item.kind === 'select'"
                      smart-select
                      :smartSelectParams="item.smartSelectParams"
                      media-item
                      :class="item.className"
                      :title="$t(item.titleKey)"
                      :footer="$t(item.footerKey)">
                      <template #media>
                        <f7-icon :f7="item.icon" color="gray" />
                      </template>
                      <select
                        :value="developerSelectValue(item.controlId)"
                        @change="updateDeveloperSelectValue(item.controlId, $event.target.value)">
                        <option v-for="option in item.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                      </select>
                    </f7-list-item>
                  </template>
                </f7-list>
              </template>
            </f7-col>
          </f7-row>
          <f7-block-footer v-if="$t('home.overview.title') !== 'Overview'" class="margin text-align-center">
            <small>{{ $t('admin.notTranslatedYet') }}</small>
          </f7-block-footer>
        </f7-block>
      </f7-tab>
      <f7-tab id="tab-debug" :tab-active="currentTab === 'debug'">
        <!-- Test SSE connection -->
        <f7-block class="block-narrow">
          <f7-row>
            <f7-col>
              <f7-block>
                <f7-block-title class="after-big-title"> Test SSE connection </f7-block-title>
                <f7-button v-if="!sseClient" text="Stream Events" @click="startSSE()" />
                <f7-button v-if="sseClient" text="Stop Streaming" @click="stopSSE()" />
                <f7-list media-list>
                  <f7-list-item
                    v-for="event in sseEvents"
                    :key="event.time.getTime() + '#' + f7.utils.id()"
                    :title="event.topic"
                    :subtitle="event.payload"
                    :after="event.type" />
                </f7-list>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>
        <!-- Test WebSocket connection -->
        <f7-block class="block-narrow">
          <f7-row>
            <f7-col>
              <f7-block>
                <f7-block-title class="after-big-title"> Test WebSocket connection </f7-block-title>
                <f7-button v-if="!wsClient" text="Stream Events" @click="startWS()" />
                <f7-button v-if="wsClient" text="Stop Streaming" @click="stopWS()" />
                <f7-list media-list>
                  <f7-list-item
                    v-for="event in wsEvents"
                    :key="event.time.getTime() + '#' + f7.utils.id()"
                    :title="event.topic"
                    :subtitle="event.payload"
                    :after="event.type" />
                </f7-list>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>
        <!-- Test an icon -->
        <f7-block class="block-narrow">
          <f7-row>
            <f7-col>
              <f7-block>
                <p>Test an icon fetch to check the different implementations</p>
                <f7-list media-list>
                  <f7-list-input
                    label="Icon"
                    type="text"
                    :value="icon"
                    @change="icon = $event.target.value"
                    placeholder="e.g. lightbulb, qualityofservice-2"
                    :info="iconUrl"
                    clear-button>
                    <template #media>
                      <img :src="iconUrl" width="44" />
                    </template>
                  </f7-list-input>
                </f7-list>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
@media (max-width 1279px)
  .developer-sidebar-toggle
    display none
</style>

<script>
import { f7 } from 'framework7-vue'
import { mapStores } from 'pinia'

import FileDefinition from '@/pages/settings/file-definition-mixin'
import { getAdminMenuPageSections } from '@/js/admin-menu.ts'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore.ts'

export default {
  mixins: [FileDefinition],
  props: {
    f7router: Object
  },
  setup() {
    return {
      f7
    }
  },
  data() {
    return {
      currentTab: 'menu',
      sseClient: null,
      sseEvents: [],
      wsClient: null,
      wsEvents: [],
      icon: 'lightbulb',
      split: this.$device.desktop ? 'vertical' : 'horizontal',
      logLevel: localStorage.getItem('openhab.ui:logLevel') || 'INFO'
    }
  },
  computed: {
    developerNavigationSections() {
      return getAdminMenuPageSections('developer', this.runtimeStore)
    },
    developerNavigationColumns() {
      return [...new Set(this.developerNavigationSections.map((section) => section.column))]
    },
    ...mapStores(useRuntimeStore, useUIOptionsStore)
  },
  methods: {
    developerColumnSections(column) {
      return this.developerNavigationSections.filter((section) => section.column === column)
    },
    runDeveloperMenuAction(actionId) {
      switch (actionId) {
        case 'copy-thing-file-definitions':
          this.copyFileDefinitionToClipboard(this.ObjectType.THING)
          break
        case 'copy-item-file-definitions':
          this.copyFileDefinitionToClipboard(this.ObjectType.ITEM)
          break
      }
    },
    developerToggleValue(controlId) {
      switch (controlId) {
        case 'developer-sidebar':
          return this.runtimeStore.showDeveloperDock
        case 'vim-mode':
          return this.uiOptionsStore.codeMirrorSettings.vimMode
        default:
          return false
      }
    },
    toggleDeveloperMenuControl(controlId) {
      switch (controlId) {
        case 'developer-sidebar':
          this.f7.emit('toggleDeveloperDock')
          break
        case 'vim-mode':
          this.uiOptionsStore.codeMirrorSettings.vimMode = !this.uiOptionsStore.codeMirrorSettings.vimMode
          break
      }
    },
    developerSelectValue(controlId) {
      switch (controlId) {
        case 'ui-logging':
          return this.logLevel
        default:
          return ''
      }
    },
    updateDeveloperSelectValue(controlId, value) {
      switch (controlId) {
        case 'ui-logging':
          this.logLevel = value
          this.onLogLevelChange()
          break
      }
    },
    onPageBeforeRemove() {
      if (this.sseClient) this.$oh.sse.close(this.sseClient)
    },
    startSSE() {
      this.sseClient = this.$oh.sse.connect('/rest/events', '', (event) => {
        event.time = new Date()
        this.sseEvents.unshift(...[event])
        this.sseEvents.splice(5)
      })
    },
    stopSSE() {
      this.$oh.sse.close(this.sseClient)
      this.sseClient = null
      this.sseEvents = []
    },
    startWS() {
      this.wsClient = this.$oh.ws.events([], (event) => {
        event.time = new Date()
        this.wsEvents.unshift(...[event])
        this.wsEvents.splice(5)
      })
    },
    stopWS() {
      this.$oh.ws.close(this.wsClient)
      this.wsClient = null
      this.wsEvents = []
    },
    onLogLevelChange() {
      window.setLogLevel(this.logLevel)
    }
  },
  asyncComputed: {
    iconUrl() {
      return this.$oh.media.getIcon(this.icon)
    }
  }
}
</script>
