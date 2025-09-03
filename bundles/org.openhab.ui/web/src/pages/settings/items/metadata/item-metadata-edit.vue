<template>
  <f7-page @page:beforein="onPageBeforeIn" @page:afterin="onPageAfterIn">
    <f7-navbar :title="`${editable ? 'Edit' : 'View'} Item Metadata: ${namespace} ${dirtyIndicator}`" back-link="Cancel" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()"
                 v-if="theme.md && editable"
                 icon-md="material:save"
                 icon-only />
        <f7-link v-if="!theme.md && editable" @click="save()">
          Save
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar v-if="ready" tabbar position="top">
      <f7-link v-if="!generic"
               @click="switchTab('config', fromYaml)"
               :tab-link-active="currentTab === 'config'"
               tab-link="#config">
        Config
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" tab-link="#code">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-toolbar v-if="ready && generic" position="bottom">
      <f7-button v-if="!creationMode"
                 color="red"
                 @click="remove()"
                 class="width-100">
        Remove metadata
      </f7-button>
    </f7-toolbar>
    <f7-tabs class="metadata-editor-tabs">
      <f7-tab id="config"
              class="metadata-editor-config-tab"
              :tab-active="currentTab === 'config'">
        <f7-block class="block-narrow" v-if="ready && currentTab === 'config'">
          <f7-col>
            <component :is="editorControl"
                       :item="item"
                       :metadata="metadata"
                       :namespace="namespace" />
          </f7-col>
        </f7-block>
        <f7-block class="block-narrow" v-if="ready">
          <f7-col>
            <f7-list>
              <f7-list-button color="red" v-if="!creationMode && editable" @click="remove()">
                Remove metadata
              </f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>

      <f7-tab id="code" :tab-active="currentTab === 'code'">
        <f7-icon v-if="!editable"
                 f7="lock"
                 class="float-right margin"
                 style="opacity: 0.5; z-index: 4000; user-select: none"
                 size="50"
                 color="gray"
                 tooltip="This metadata is not editable as it has not been created through the UI" />
        <editor v-if="currentTab === 'code'"
                class="metadata-code-editor"
                mode="text/x-yaml"
                :value="yaml"
                :readOnly="!editable"
                @input="onEditorInput" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.metadata-code-editor.vue-codemirror
  display block
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(100% - 2*var(--f7-navbar-height))
  width 100%
.yaml-message
  display block
  position absolute
  top 80%
  white-space pre-wrap
</style>

<script>
import { f7, theme } from 'framework7-vue'
import { nextTick, defineAsyncComponent } from 'vue'
import YAML from 'yaml'
import fastDeepEqual from 'fast-deep-equal/es6'
import cloneDeep from 'lodash/cloneDeep'

import MetadataNamespaces from '@/assets/definitions/metadata/namespaces.js'

import ItemMetadataItemDescription from '@/components/item/metadata/item-metadata-itemdescription.vue'
import ItemMetadataUnit from '@/components/item/metadata/item-metadata-unit.vue'
import ItemMetadataSynonyms from '@/components/item/metadata/item-metadata-synonyms.vue'
import ItemMetadataWidget from '@/components/item/metadata/item-metadata-widget.vue'
import ItemMetadataWidgetOrder from '@/components/item/metadata/item-metadata-widgetorder.vue'
import ItemMetadataAutoUpdate from '@/components/item/metadata/item-metadata-autoupdate.vue'
import ItemMetadataExpire from '@/components/item/metadata/item-metadata-expire.vue'
import ItemMetadataVoiceSystem from '@/components/item/metadata/item-metadata-voicesystem.vue'
import ItemMetadataAlexa from '@/components/item/metadata/item-metadata-alexa.vue'
import ItemMetadataHomeKit from '@/components/item/metadata/item-metadata-homekit.vue'
import ItemMetadataMatter from '@/components/item/metadata/item-metadata-matter.vue'
import ItemMetadataGa from '@/components/item/metadata/item-metadata-ga.vue'
import ItemMetadataLinktomore from '@/components/item/metadata/item-metadata-linktomore.vue'
import DirtyMixin from '../../dirty-mixin'

export default {
  mixins: [DirtyMixin],
  props: {
    itemName: String,
    namespace: String,
    f7router: Object
  },
  components: {
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'))
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      ready: false,
      currentTab: 'config',
      creationMode: true,
      generic: MetadataNamespaces.map((n) => n.name).indexOf(this.namespace) < 0,
      item: {},
      metadata: { value: '', config: {} },
      savedMetadata: {},
      yaml: null
    }
  },
  watch: {
    metadata: {
      handler: function () {
        if (this.ready && this.editable) {
          this.dirty = !fastDeepEqual(this.metadata, this.savedMetadata)
        }
      },
      deep: true
    }
  },
  computed: {
    editorControl () {
      switch (this.namespace) {
        case 'stateDescription':
        case 'commandDescription':
          return ItemMetadataItemDescription
        case 'unit':
          return ItemMetadataUnit
        case 'synonyms':
          return ItemMetadataSynonyms
        case 'widget':
        case 'listWidget':
        case 'cellWidget':
          return ItemMetadataWidget
        case 'widgetOrder':
          return ItemMetadataWidgetOrder
        case 'autoupdate':
          return ItemMetadataAutoUpdate
        case 'expire':
          return ItemMetadataExpire
        case 'voiceSystem':
          return ItemMetadataVoiceSystem
        case 'matter':
          return ItemMetadataMatter
        case 'alexa':
          return ItemMetadataAlexa
        case 'homekit':
          return ItemMetadataHomeKit
        case 'ga':
          return ItemMetadataGa
        case 'link_to_more':
          return ItemMetadataLinktomore
        default:
          return null
      }
    },
    yamlError () {
      if (this.currentTab !== 'code') return null
      try {
        YAML.parse(this.yaml, { prettyErrors: true })
        return 'OK'
      } catch (e) {
        return e
      }
    },
    editable () {
      return this.metadata.editable !== false
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    onEditorInput (value) {
      this.yaml = value
    },
    load () {
      this.$oh.api.get(`/rest/items/${this.itemName}?metadata=${this.namespace}`).then((item) => {
        this.item = item
        if (item.metadata) {
          this.metadata = item.metadata[this.namespace]
          if (!this.metadata.config) this.metadata.config = {}
          this.creationMode = false
        }
        if (this.generic) {
          this.currentTab = 'code'
          this.toYaml()
        }
        this.savedMetadata = cloneDeep(this.metadata)
        nextTick(() => {
          this.ready = true
        })
      })
    },
    save () {
      if (!this.editable) return

      if (this.currentTab === 'code' && !this.fromYaml()) return
      if (!this.metadata.value) this.metadata.value = ' '
      this.$oh.api.put(`/rest/items/${this.itemName}/metadata/${this.namespace}`, this.metadata).then((data) => {
        if (this.creationMode) {
          f7.toast.create({
            text: 'Metadata created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        } else {
          f7.toast.create({
            text: 'Metadata updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        this.savedMetadata = cloneDeep(this.metadata)
        this.dirty = false
        this.f7router.back()
      }).catch((err) => {
        f7.toast.create({
          text: 'Error while saving metadata: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    remove () {
      let nslabel = ([...MetadataNamespaces].find((ns) => ns.name === this.namespace) || { label: this.namespace }).label
      f7.dialog.confirm(
        `Are you sure you want to remove all metadata for "${nslabel}"?`,
        'Remove metadata',
        () => {
          this.$oh.api.delete(`/rest/items/${this.itemName}/metadata/${this.namespace}`).then(() => {
            f7.toast.create({
              text: 'Metadata deleted',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
            this.dirty = false
            this.f7router.back()
          }).catch((err) => {
            f7.toast.create({
              text: 'Error while deleting metadata: ' + err,
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          })
        }
      )
    },
    toYaml () {
      this.yaml = YAML.stringify({
        value: this.metadata.value,
        config: this.metadata.config || {}
      })
    },
    fromYaml () {
      try {
        const updatedMetadata = YAML.parse(this.yaml)
        this.metadata.value = updatedMetadata.value
        if (updatedMetadata.config) this.metadata.config = updatedMetadata.config
        return true
      } catch (e) {
        f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
