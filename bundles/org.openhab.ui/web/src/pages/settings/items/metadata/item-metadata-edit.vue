<template>
  <f7-page @page:beforein="onPageBeforeIn" @page:afterin="onPageAfterIn">
    <f7-navbar :title="'Edit Item Metadata: ' + namespace" back-link="Cancel" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar v-if="ready" tabbar position="top">
      <f7-link v-if="!generic" @click="switchTab('config', fromYaml)" :tab-link-active="currentTab === 'config'" class="tab-link">
        Config
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-toolbar v-if="ready && generic" position="bottom">
      <f7-button color="red" v-if="!creationMode" @click="remove()" class="width-100">
        Remove metadata
      </f7-button>
    </f7-toolbar>
    <f7-tabs class="metadata-editor-tabs">
      <f7-tab id="config" class="metadata-editor-config-tab" @tab:show="() => this.currentTab = 'config'" :tab-active="currentTab === 'config'">
        <f7-block class="block-narrow" v-if="ready && currentTab === 'config'">
          <f7-col>
            <component :is="editorControl" :item="item" :metadata="metadata" :namespace="namespace" />
          </f7-col>
        </f7-block>
        <f7-block class="block-narrow" v-if="ready">
          <f7-col>
            <f7-list>
              <f7-list-button color="red" v-if="!creationMode" @click="remove()">
                Remove metadata
              </f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>

      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'" class="metadata-code-editor" mode="text/x-yaml" :value="yaml" @input="onEditorInput" />
        <!-- <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->
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
import YAML from 'yaml'

import MetadataNamespaces from '@/assets/definitions/metadata/namespaces.js'

import ItemMetadataItemDescription from '@/components/item/metadata/item-metadata-itemdescription.vue'
import ItemMetadataUnit from '@/components/item/metadata/item-metadata-unit.vue'
import ItemMetadataSynonyms from '@/components/item/metadata/item-metadata-synonyms.vue'
import ItemMetadataWidget from '@/components/item/metadata/item-metadata-widget.vue'
import ItemMetadataWidgetOrder from '@/components/item/metadata/item-metadata-widgetorder.vue'
import ItemMetadataAutoUpdate from '@/components/item/metadata/item-metadata-autoupdate.vue'
import ItemMetadataExpire from '@/components/item/metadata/item-metadata-expire.vue'
import ItemMetadataAlexa from '@/components/item/metadata/item-metadata-alexa.vue'
import ItemMetadataHomeKit from '@/components/item/metadata/item-metadata-homekit.vue'
import ItemMetadataGa from '@/components/item/metadata/item-metadata-ga.vue'
import DirtyMixin from '../../dirty-mixin'

export default {
  mixins: [DirtyMixin],
  props: ['itemName', 'namespace'],
  components: {
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  data () {
    return {
      ready: false,
      currentTab: 'config',
      creationMode: true,
      generic: false,
      item: {},
      metadata: { value: '', config: {} },
      yaml: null
    }
  },
  watch: {
    metadata: {
      handler: function () {
        if (this.ready) {
          this.dirty = true
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
        case 'alexa':
          return ItemMetadataAlexa
        case 'homekit':
          return ItemMetadataHomeKit
        case 'ga':
          return ItemMetadataGa
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
    }
  },
  methods: {
    onPageBeforeIn () {
      this.generic = MetadataNamespaces.map((n) => n.name).indexOf(this.namespace) < 0
      this.ready = false
    },
    onPageAfterIn () {
      this.$oh.api.get(`/rest/items/${this.itemName}?metadata=${this.namespace}`).then((data) => {
        this.item = data
        if (this.item.metadata) {
          this.metadata = this.item.metadata[this.namespace]
          if (!this.metadata.config) this.$set(this.metadata, 'config', {})
          this.creationMode = false
        }
        if (this.generic) {
          this.currentTab = 'code'
          this.toYaml()
        }
        this.$nextTick(() => {
          this.ready = true
        })
      })
    },
    onEditorInput (value) {
      this.yaml = value
      this.dirty = true
    },
    save () {
      if (this.currentTab === 'code' && !this.fromYaml()) return
      if (!this.metadata.value) this.metadata.value = ' '
      this.$oh.api.put(`/rest/items/${this.itemName}/metadata/${this.namespace}`, this.metadata).then((data) => {
        if (this.creationMode) {
          this.$f7.toast.create({
            text: 'Metadata created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        } else {
          this.$f7.toast.create({
            text: 'Metadata updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        this.dirty = false
        this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving metadata: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    remove () {
      let nslabel = ([...MetadataNamespaces].find(ns => ns.name === this.namespace) || { label: this.namespace }).label
      this.$f7.dialog.confirm(
        `Are you sure you want to remove all metadata for "${nslabel}"?`,
        'Remove metadata',
        () => {
          this.$oh.api.delete(`/rest/items/${this.itemName}/metadata/${this.namespace}`).then(() => {
            this.$f7.toast.create({
              text: 'Metadata deleted',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
            this.dirty = false
            this.$f7router.back()
          }).catch((err) => {
            this.$f7.toast.create({
              text: 'Error while deleting metadata: ' + err,
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          })
        }
      )
    },
    toYaml () {
      this.yaml = YAML.stringify(this.metadata)
    },
    fromYaml () {
      try {
        const updatedMetadata = YAML.parse(this.yaml)
        this.metadata.value = updatedMetadata.value
        if (updatedMetadata.config) this.$set(this.metadata, 'config', updatedMetadata.config)
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
