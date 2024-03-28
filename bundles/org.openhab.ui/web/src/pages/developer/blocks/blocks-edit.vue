<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="(!ready) ? '' : (createMode) ? 'Create Block Library' : 'Block Library: ' + blocks.uid" back-link="Back">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar position="bottom">
      <f7-link @click="previewOpened = true">
        Preview<span v-if="$device.desktop">&nbsp;(Ctrl-P)</span>
      </f7-link>
      <f7-link icon-f7="uiwindow_split_2x1" @click="split = (split === 'horizontal') ? 'vertical' : 'horizontal'; blockKey = $f7.utils.id()" />
      <f7-link @click="refreshBlocks">
        Refresh<span v-if="$device.desktop">&nbsp;(Ctrl-R)</span>
      </f7-link>
    </f7-toolbar>
    <f7-block :key="blockKey + '-h'" v-if="split === 'horizontal'" class="blocks-editor horizontal">
      <f7-row resizable>
        <f7-col style="min-width: 20px" class="blocks-code">
          <editor class="blocks-component-editor" mode="application/vnd.openhab.uicomponent+yaml;type=blocks" :value="blocksDefinition" @input="onEditorInput" />
        </f7-col>
      </f7-row>
      <f7-row v-if="ready" resizable>
        <f7-col style="min-width: 20px" class="block-preview-pane margin-horizontal margin-bottom">
          <block-preview :blocks-definition="blocks" :key="previewKey" />
          <!-- <generic-widget-component :key="widgetKey" :context="context" @command="onCommand" /> -->
        </f7-col>
      </f7-row>
    </f7-block>
    <f7-block v-else :key="blockKey + 'b'" class="blocks-editor vertical">
      <f7-row resizable>
        <f7-col resizable style="min-width: 20px" class="blocks-code">
          <editor class="blocks-component-editor" mode="application/vnd.openhab.uicomponent+yaml;type=blocks" :value="blocksDefinition" @input="onEditorInput" />
        </f7-col>
        <f7-col v-if="ready" resizable style="min-width: 20px" class="block-preview-pane padding-right margin-bottom">
          <block-preview :blocks-definition="blocks" :key="previewKey" />
          <!-- <generic-widget-component :key="widgetKey" :context="context" @command="onCommand" /> -->
        </f7-col>
      </f7-row>
    </f7-block>

    <f7-popup ref="previewPopup" close-on-escape class="block-editor-preview-popup" :opened="previewOpened" @popup:closed="previewClosed">
      <f7-page v-if="previewOpened">
        <f7-navbar>
          <f7-nav-left>
            <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close />
          </f7-nav-left>
          <f7-nav-title>Preview</f7-nav-title>
          <f7-nav-right>
            <f7-link popup-close>
              Done
            </f7-link>
          </f7-nav-right>
        </f7-navbar>
        <blockly-editor ref="blocklyPreviewEditor" v-if="previewMode === 'blockly'" :blocks="previewBlockSource" :library-definitions="[blocks]" @change="dirty = true" />
        <editor class="blocks-preview-code" v-else-if="previewMode === 'code'" mode="application/javascript" :value="previewGeneratedCode" :read-only="true" />
        <f7-fab v-show="previewMode === 'blockly'" position="right-bottom" slot="fixed" color="blue" @click="togglePreviewMode('code')">
          <f7-icon f7="doc_text" />
        </f7-fab>
        <f7-fab v-show="previewMode === 'code'" position="right-bottom" slot="fixed" color="blue" @click="togglePreviewMode('blockly')">
          <f7-icon f7="ticket" />
        </f7-fab>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<style lang="stylus">
.blocks-editor
  margin-top 0 !important
  margin-bottom 0 !important
  padding 0
  z-index auto !important
  top 0
  height calc(100%)
  .code-editor-fit
    height calc(100% - var(--f7-grid-gap))
  .row
    height 100%
    .block-preview-pane
      height 100%
      overflow auto
    .blocks-code
      height 100%
  .vue-codemirror
    top 0
    height 100%
  &.vertical
    .block-preview-pane
      z-index auto !important
  &.horizontal
    .row
      height 50%
    .vue-codemirror
      height calc(100% - var(--f7-grid-gap))
.blocklyDropDownDiv
  z-index 11001 !important
</style>

<script>
import YAML from 'yaml'
import { strOptions } from 'yaml/types'

import BlocklyEditor from '@/pages/settings/rules/script/blockly-editor.vue'
import BlockPreview from './block-preview.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'
import DirtyMixin from '@/pages/settings/dirty-mixin'

strOptions.fold.lineWidth = 0

export default {
  mixins: [DirtyMixin],
  components: {
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'),
    BlocklyEditor, // 'blockly-editor': () => import(/* webpackChunkName: "blockly-editor" */ '@/pages/settings/rules/script/blockly-editor.vue'),
    BlockPreview // 'block-preview': () => import(/* webpackChunkName: "blockly-editor" */ './block-preview.vue')
  },
  props: ['uid', 'createMode'],
  data () {
    return {
      blocksDefinition: null,
      items: [],
      ready: false,
      split: 'vertical',
      props: {},
      vars: {},
      previewBlockSource: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
      previewCode: '',
      blockKey: this.$f7.utils.id(),
      previewKey: this.$f7.utils.id(),
      previewOpened: false,
      previewMode: 'blockly',
      previewGeneratedCode: ''
    }
  },
  computed: {
    blocks () {
      try {
        if (!this.blocksDefinition) return {}
        return YAML.parse(this.blocksDefinition, { prettyErrors: true })
      } catch (e) {
        return { component: 'Error', config: { error: e.message } }
      }
    }
  },
  methods: {
    onPageAfterIn () {
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
    onEditorInput (value) {
      this.blocksDefinition = value
      if (!this.loading) {
        this.dirty = true
      }
    },
    refreshBlocks () {
      this.previewKey = this.$f7.utils.id()
    },
    previewClosed () {
      this.previewOpened = false
      this.previewMode = 'blockly'
    },
    togglePreviewMode (mode) {
      this.previewMode = mode
      if (mode === 'code') {
        this.previewBlockSource = this.$refs.blocklyPreviewEditor.getBlocks()
        this.previewGeneratedCode = this.$refs.blocklyPreviewEditor.getCode()
      }
    },
    keyDown (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        switch (ev.keyCode) {
          case 66:
            if (!this.previewOpened) {
              this.previewOpened = true
            } else {
              this.togglePreviewMode(this.previewMode === 'blockly' ? 'code' : 'blockly')
            }
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 80:
            if (!this.previewOpened) {
              this.previewOpened = true
            } else {
              this.previewOpened = false
              this.previewClosed()
            }
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 82:
            this.refreshBlocks()
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 83:
            this.save(!this.createMode)
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    },
    load () {
      if (this.loading) return
      this.loading = true
      if (this.createMode) {
        const uid = this.$f7.utils.id()
        this.blocksDefinition = YAML.stringify({
          uid: 'blocklibrary_' + uid,
          tags: [],
          component: 'BlockLibrary',
          config: {
            name: 'Block Library ' + uid
          },
          slots: {
            blocks: [
              {
                component: 'BlockType',
                config: {
                  type: 'block1',
                  message0: 'Do %1 with %2 and %3 then %4',
                  args0: [
                    {
                      type: 'field_dropdown',
                      name: 'OPTION1',
                      options: [
                        [
                          'something',
                          'option1'
                        ],
                        [
                          'something else',
                          'option2'
                        ]
                      ]
                    },
                    {
                      type: 'field_input',
                      name: 'TEXT1',
                      text: 'some text'
                    },
                    {
                      type: 'input_value',
                      name: 'NAME'
                    },
                    {
                      type: 'input_statement',
                      name: 'NAME'
                    }
                  ],
                  'previousStatement': null,
                  'nextStatement': null,
                  'colour': 90,
                  'tooltip': '',
                  'helpUrl': ''
                },
                slots: {
                  code: [
                    {
                      component: 'BlockCodeTemplate',
                      config: {
                        template:
                          '/* Incomplete example skeleton, check out\n' +
                          '   https://v34.openhab.org/link/blocklib-tutorial\n' +
                          '   to learn how to build block libraries */\n'
                      }
                    }
                  ]
                }
              }
            ]
          }
        })
        this.$nextTick(() => {
          this.loading = false
          this.ready = true
        })
      } else {
        this.$oh.api.get('/rest/ui/components/ui:blocks/' + this.uid).then((data) => {
          this.$set(this, 'blocksDefinition', YAML.stringify(data))
          this.$nextTick(() => {
            this.loading = false
            this.ready = true
          })
        })
      }
    },
    save (stay) {
      if (!this.blocks.uid) {
        this.$f7.dialog.alert('Please give an ID to the block library')
        return
      }
      if (!this.createMode && this.uid !== this.blocks.uid) {
        this.$f7.dialog.alert('You cannot change the ID of an existing block library. Duplicate it with the new ID then delete this one.')
        return
      }

      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/ui/components/ui:blocks', JSON.stringify(this.blocks), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/ui:blocks/' + this.blocks.uid, this.blocks)
      promise.then((data) => {
        this.dirty = false
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Block library created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.$f7router.navigate(this.$f7route.url.replace('/add', '/' + this.blocks.uid), { reloadCurrent: true })
          this.load()
        } else {
          this.$f7.toast.create({
            text: 'Block library updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        // this.$f7.emit('sidebarRefresh', null)
        // if (!stay) this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving block library: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    }
  }
}
</script>
