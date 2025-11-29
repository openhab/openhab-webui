<template>
  <f7-page name="about" class="page-about" @page:beforein="beforePageIn">
    <f7-navbar large>
      <oh-nav-content :title="t('about.title')" :large="true" :f7router />
    </f7-navbar>
    <f7-block class="block-narrow after-big-title">
      <f7-row>
        <f7-col>
          <!-- <f7-block-title>About openHAB</f7-block-title> -->
          <f7-block>
            <img src="/res/icons/favicon.svg"
                 type="image/svg+xml"
                 width="96"
                 class="padding float-right">
            <h2 v-if="runtimeStore.runtimeInfo" class="block-title-medium">
              openHAB {{ runtimeStore.runtimeInfo.version }}<br>
              <small>{{ runtimeStore.runtimeInfo.buildString }}</small>
            </h2>
            <p v-if="runtimeStore.uiInfo.commit">
              Main UI Commit <a :href="'https://github.com/openhab/openhab-webui/commit/' + runtimeStore.uiInfo.commit" class="external" target="_blank">{{ runtimeStore.uiInfo.commit }}</a>
            </p>
            <p>
              <f7-link external
                       target="_blank"
                       href="https://www.openhab.org/"
                       :text="t('about.homePage')" />
            </p>
            <p>
              <f7-link external
                       target="_blank"
                       href="https://www.openhab.org/docs/"
                       :text="t('about.documentation')" />
            </p>
            <p>
              <f7-link external
                       target="_blank"
                       href="https://community.openhab.org/"
                       :text="t('about.communityForum')" />
            </p>
          </f7-block>
        </f7-col>
      </f7-row>
      <f7-row v-if="systemInfo">
        <f7-col>
          <f7-list accordion-list>
            <f7-list-item :title="t('about.technicalInformation')" accordion-item>
              <f7-accordion-content>
                <f7-list>
                  <f7-list-item :title="t('about.technicalInformation.configurationFolder')" :after="systemInfo.configFolder" />
                  <f7-list-item :title="t('about.technicalInformation.userdataFolder')" :after="systemInfo.userdataFolder" />
                  <f7-list-item :title="t('about.technicalInformation.logsFolder')" :after="systemInfo.logFolder" />
                  <f7-list-item :title="t('about.technicalInformation.operatingSystem')" :after="`${systemInfo.osName}/${systemInfo.osVersion} (${systemInfo.osArchitecture})`" />
                  <f7-list-item :title="t('about.technicalInformation.javaRuntime')" :footer="systemInfo.javaVendor" :after="`${systemInfo.javaVersion} (${systemInfo.javaVendorVersion})`">
                    <template #root-end>
                      <div class="item-content" style="flex-direction: column">
                        <f7-progressbar
                          class="margin-top"
                          style="width: 90%"
                          color="blue"
                          :progress="(systemInfo.freeMemory * 100) / systemInfo.totalMemory" />
                        <small class="margin-bottom text-color-gray">
                          {{ t('about.technicalInformation.resourceStats', { nbproc: systemInfo.availableProcessors, ram: Math.round(systemInfo.freeMemory / 1024 / 1024) + '/' + Math.round(systemInfo.totalMemory / 1024 / 1024) + 'MB', }) }}
                        </small>
                      </div>
                    </template>
                  </f7-list-item>
                  <f7-list-button color="blue" @click="textualSystemInfoOpened = true">
                    {{ t('about.technicalInformation.viewDetails') }}
                  </f7-list-button>
                </f7-list>
              </f7-accordion-content>
            </f7-list-item>
          </f7-list>
        </f7-col>
      </f7-row>

      <f7-block-title>
        <h4>{{ t('about.appearanceOptions') }}</h4>
      </f7-block-title>
      <theme-switcher />

      <f7-block-title>
        <h4>
          {{ t('about.reload') }}
        </h4>
      </f7-block-title>
      <f7-col v-if="showCachePurgeOption">
        <p class="padding-horizontal">
          {{ t('about.reload.purgeExplanation1') }}
        </p>
        <p class="padding-horizontal">
          {{ t('about.reload.purgeExplanation2') }}
        </p>
      </f7-col>
      <f7-col>
        <f7-list>
          <f7-list-button v-if="showCachePurgeOption"
                          color="red"
                          @click="purgeServiceWorkerAndCaches()">
            {{ t('about.reload.purgeCachesAndRefresh') }}
          </f7-list-button>
          <f7-list-button color="blue" @click="reload">
            {{ t('about.reload.reloadApp') }}
          </f7-list-button>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-popup :opened="textualSystemInfoOpened" close-on-escape @popup:closed="textualSystemInfoOpened = false">
      <f7-navbar>
        <div class="left">
          <f7-link @click="copyTextualSystemInfo" :text="t('dialogs.copy')" />
        </div>
        <div class="right">
          <f7-link popup-close :text="t('dialogs.close')" />
        </div>
      </f7-navbar>
      <!-- <pre class="textual-definition" v-html="textualDefinition"></pre> -->
      <textarea readonly
                class="textual-systeminfo"
                id="textual-systeminfo"
                :value="textualSystemInfo" />
    </f7-popup>
  </f7-page>
</template>

<style lang="stylus" scoped>
code.textual-systeminfo pre
  overflow auto
  white-space normal

pre.textual-systeminfo
  padding 5px

textarea.textual-systeminfo
  position absolute
  top calc(var(--f7-safe-area-top) + var(--f7-toolbar-height))
  bottom 0
  padding-left 5px
  width calc(100% - var(--f7-safe-area-left) - var(--f7-safe-area-right))
  height calc(100% - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-toolbar-height))
  top calc(var(--f7-safe-area-top) + var(--f7-toolbar-height))
  font-family monospace
  font-size 12px
</style>

<script>
import { f7 } from 'framework7-vue'
import { mapStores } from 'pinia'

import ThemeSwitcher from '../components/theme-switcher.vue'
import YAML from 'yaml'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useUserStore } from '@/js/stores/useUserStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import reloadMixin from '../components/reload-mixin.js'

import { loadLocaleMessages } from '@/js/i18n'
import { useI18n } from 'vue-i18n'

export default {
  mixins: [reloadMixin],
  components: {
    ThemeSwitcher
  },
  props: {
    f7router: Object
  },
  setup () {
    const { t, mergeLocaleMessage } = useI18n({ useScope: 'local'})
    loadLocaleMessages('about', mergeLocaleMessage)
    return { t, mergeLocaleMessage }
  },
  data () {
    return {
      systemInfo: null,
      textualSystemInfoOpened: false,
      bindings: null
    }
  },
  computed: {
    textualSystemInfo () {
      if (!this.textualSystemInfoOpened) return ''
      return YAML.stringify({
        runtimeInfo: useRuntimeStore().runtimeInfo,
        locale: useRuntimeStore().locale,
        systemInfo: this.systemInfo,
        addons: this.addons,
        clientInfo: {
          device: Object.assign({}, this.$device, { prefersColorScheme: this.$device.prefersColorScheme() }),
          isSecureContext: window.isSecureContext,
          locationbarVisible: window.locationbar ? window.locationbar.visible : 'N/A',
          menubarVisible: window.menubar ? window.menubar.visible : 'N/A',
          navigator: {
            cookieEnabled: navigator.cookieEnabled,
            deviceMemory: navigator.deviceMemory || 'N/A',
            hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
            language: navigator.language,
            languages: navigator.languages,
            onLine: navigator.onLine,
            platform: navigator.platform
          },
          screen: { width: window.screen.width, height: window.screen.height, colorDepth: window.screen.colorDepth },
          support: f7.support,
          themeOptions: useUIOptionsStore().themeOptions(),
          userAgent: window.navigator.userAgent
        },
        timestamp: new Date()
      })
    },
    ...mapStores(useUIOptionsStore, useRuntimeStore)
  },
  methods: {
    beforePageIn () {
      if (useUserStore().isAdmin()) {
        this.$oh.api.get('/rest/systeminfo').then((data) => { this.systemInfo = data.systemInfo })
        this.$oh.api.get('/rest/addons').then((data) => { this.addons = data.filter((a) => a.installed).map((a) => a.uid).sort() })
      }
      this.checkPurgeServiceWorkerAndCachesAvailable()
    },
    copyTextualSystemInfo () {
      let el = document.getElementById('textual-systeminfo')
      el.select()
      document.execCommand('copy')
      f7.toast.create({
        text: 'Copied to clipboard',
        destroyOnClose: true,
        closeTimeout: 2000
      }).open()
    }
  }
}
</script>
