<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar :title="(createMode) ? 'Create scene' : rule.name" back-link="Back" no-hairline>
      <f7-nav-right v-if="isEditable">
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <!-- skeletons -->
    <f7-block v-if="!ready" class="block-narrow">
      <f7-col class="skeleton-text skeleton-effect-blink">
        <f7-list inline-labels no-hairlines-md>
          <f7-list-input label="Unique ID" type="text" placeholder="Required" value="_______" required validate
                         :disabled="true" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                         @input="rule.uid = $event.target.value" :clear-button="createMode" />
          <f7-list-input label="Name" type="text" placeholder="Required" required validate
                         :disabled="true" @input="rule.name = $event.target.value" :clear-button="isEditable" />
          <f7-list-input label="Description" type="text" value="__ _____ ___ __ ___"
                         :disabled="true" @input="rule.description = $event.target.value" :clear-button="isEditable" />
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-else class="block-narrow">
      <f7-col>
        <f7-list inline-labels no-hairlines-md>
          <f7-list-input label="Unique ID" type="text" placeholder="Required" :value="rule.uid" required validate
                         :disabled="!createMode"
                         :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                         pattern="[A-Za-z0-9_\-]+" error-message="Required. A-Z,a-z,0-9,_,- only"
                         @input="rule.uid = $event.target.value" :clear-button="createMode" />
          <f7-list-input label="Name" type="text" placeholder="Required" :value="rule.name" required validate
                         :disabled="!isEditable" @input="rule.name = $event.target.value" :clear-button="isEditable" />
          <f7-list-input label="Description" type="text" :value="rule.description"
                         :disabled="!isEditable" @input="rule.description = $event.target.value"
                         :clear-button="isEditable" />
        </f7-list>
      </f7-col>

      <f7-block-footer v-if="!isEditable" class="no-margin padding-left">
        <f7-icon f7="lock_fill" size="12" color="gray" />&nbsp;Note: this rule is not editable because it has been
        provisioned from a file.
      </f7-block-footer>
      <!-- <f7-col v-if="isEditable" class="text-align-right justify-content-flex-end">
      </f7-col> -->
      <f7-col class="rule-modules">
        <div class="no-padding float-right" v-if="rule['actions'].length > 0">
          <f7-button @click="toggleModuleControls" small outline :fill="showModuleControls" sortable-toggle=".sortable"
                     style="margin-top: -3px; margin-right: 5px"
                     color="gray" icon-size="12" icon-ios="material:wrap_text" icon-md="material:wrap_text"
                     icon-aurora="material:wrap_text">
            &nbsp;Reorder
          </f7-button>
        </div>
        <div>
          <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)"
                          v-if="rule['actions'].length > 0">
            Configuration
          </f7-block-title>
          <f7-list sortable swipeout media-list @sortable:sort="(ev) => reorderModule(ev, 'actions')">
            <f7-list-item :title="mod.configuration.itemName"
                          :after="mod.configuration.command" media
                          v-for="mod in rule['actions']" :key="mod.id"
                          :link="!showModuleControls"
                          @click.native="(ev) => editModule(ev, mod)" swipeout>
              <f7-link slot="media" icon-color="red" icon-aurora="f7:minus_circle_filled"
                       icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                       @click="showSwipeout" />
              <f7-swipeout-actions right>
                <f7-swipeout-button @click="(ev) => deleteModule(ev, 'actions', mod)"
                                    style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                  Delete
                </f7-swipeout-button>
              </f7-swipeout-actions>
            </f7-list-item>
          </f7-list>
          <f7-list v-if="isEditable">
            <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'" subtitle="Add Item"
                          @click="addModule()">
              <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill"
                       md="material:control_point" />
            </f7-list-item>
            <!-- <f7-list-button :color="(showModuleControls) ? 'gray' : 'blue'" :title="sectionLabels[section][1]"></f7-list-button> -->
          </f7-list>
        </div>
      </f7-col>
      <f7-col v-if="(isEditable || rule.tags.length > 0) && (!createMode || !hasTemplate)">
        <f7-block-title>Tags</f7-block-title>
        <semantics-picker v-if="isEditable" :item="rule" />
        <tag-input :item="rule" :disabled="!isEditable" />
      </f7-col>
      <f7-col v-if="isEditable && !createMode">
        <f7-list>
          <f7-list-button color="red" @click="deleteRule">
            Remove Scene
          </f7-list-button>
        </f7-list>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<style lang="stylus">
.enable-toggle
  vertical-align inherit

.moduleconfig-popup
  .page-content
    overflow-x hidden !important

  .config-sheet, .parameter-group
    margin-top 0 !important

.rule-modules
  .swipeout-opened
    .sortable-handler
      display none

  .item-media .icon
    color var(--f7-theme-color)

  .media-list
    margin-bottom 0

  .list
    margin-top 0
</style>

<script>
import cloneDeep from 'lodash/cloneDeep'

import SemanticsPicker from '@/components/tags/semantics-picker.vue'
import TagInput from '@/components/tags/tag-input.vue'

import RuleModulePopup from './rule-module-popup.vue'

import ModuleDescriptionSuggestions from './module-description-suggestions'
import DirtyMixin from '../dirty-mixin'

export default {
  mixins: [ModuleDescriptionSuggestions, DirtyMixin],
  components: {
    SemanticsPicker,
    TagInput
  },
  props: ['ruleId', 'createMode'],
  data () {
    return {
      ready: false,
      loading: false,
      rule: {},
      ruleYaml: '',
      moduleTypes: {
        actions: [],
        conditions: [],
        triggers: []
      },
      showModuleControls: false,
      currentModuleType: null,
      currentModule: null,
      currentModuleConfig: {},
      keyHandler: null
    }
  },
  methods: {
    onPageAfterIn () {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.load()
    },
    onPageAfterOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    onEditorInput (value) {
      this.ruleYaml = value
      this.dirty = true
    },
    load () {
      if (this.loading) return
      this.loading = true

      const loadModules1 = this.$oh.api.get('/rest/module-types?type=action')

      const loadingFinished = () => {
        this.$nextTick(() => {
          this.savedRule = cloneDeep(this.rule)
          this.ready = true
          this.loading = false
        })
      }

      Promise.all([loadModules1]).then((data) => {
        this.moduleTypes.actions = data[0]
        if (this.createMode) {
          this.$set(this, 'rule', {
            uid: this.$f7.utils.id(),
            name: '',
            triggers: [],
            actions: [],
            conditions: [],
            tags: [],
            configuration: {},
            templateUID: null,
            visibility: 'VISIBLE',
            status: {
              status: 'NEW'
            }
          })
          loadingFinished()
        } else {
          this.$oh.api.get('/rest/rules/' + this.ruleId).then((data2) => {
            this.$set(this, 'rule', data2)
            this.rule.tags = this.rule.tags.filter(e => e !== 'Scene')
            loadingFinished()
          })
        }
      })
    },
    save (stay) {
      if (!this.isEditable) return Promise.reject()
      if (!this.rule.uid) {
        this.$f7.dialog.alert('Please give an ID to the rule')
        return Promise.reject()
      }
      if (!this.rule.name) {
        this.$f7.dialog.alert('Please give a name to the rule')
        return Promise.reject()
      }
      let saveRule = cloneDeep(this.rule)
      saveRule.tags.push('Scene')
      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/rules', JSON.stringify(saveRule), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/rules/' + saveRule.uid, saveRule)
      return promise.then((data) => {
        this.dirty = false
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Scene created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.$f7router.navigate(this.$f7route.url.replace('/add', '/' + this.rule.uid), { reloadCurrent: true })
          this.load()
        } else {
          this.$f7.toast.create({
            text: 'Scene updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.savedRule = cloneDeep(this.rule)
        }
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving rule: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    deleteRule () {
      this.$f7.dialog.confirm(
        `Are you sure you want to delete ${this.rule.name}?`,
        'Delete Scene',
        () => {
          this.$oh.api.delete('/rest/rules/' + this.rule.uid).then(() => {
            this.$f7router.back('/settings/rules/', { force: true })
          })
        }
      )
    },
    keyDown (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        if (this.currentModule) return
        switch (ev.keyCode) {
          case 83:
            this.save(!this.createMode)
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    },
    toggleModuleControls () {
      this.showModuleControls = !this.showModuleControls
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
    editModule (ev, mod) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      if (swipeoutElement && swipeoutElement.classList.contains('swipeout-opened')) return

      this.currentModule = Object.assign({}, mod)

      const popup = {
        component: RuleModulePopup
      }

      this.$f7router.navigate({
        url: 'module-config',
        route: {
          path: 'module-config',
          popup
        }
      }, {
        props: {
          currentSection: 'actions',
          ruleModule: this.currentModule,
          ruleModuleType: this.moduleTypes['actions'].find((m) => m.uid === mod.type),
          moduleTypes: this.moduleTypes,
          isSceneModule: true
        }
      })

      this.$f7.once('ruleModuleConfigUpdate', this.saveModule)
      this.$f7.once('ruleModuleConfigClosed', () => {
        this.$f7.off('ruleModuleConfigUpdate', this.saveModule)
        this.moduleConfigClosed()
      })
    },
    deleteModule (ev, section, mod) {
      let swipeoutElement = ev.target
      if (!this.isEditable) return
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      this.$f7.swipeout.delete(swipeoutElement, () => {
        const idx = this.rule[section].findIndex((m) => m.id === mod.id)
        this.rule[section].splice(idx, 1)
      })
    },
    addModule () {
      if (this.showModuleControls) return
      if (!this.isEditable) return
      let moduleId = 1
      for (; this.rule['actions'].some((m) => m.id === moduleId.toString()); moduleId++) ;
      console.debug('new moduleId=' + moduleId)
      const newModule = {
        id: moduleId.toString(),
        configuration: {},
        type: 'core.ItemCommandAction'
      }

      this.currentModule = newModule
      this.currentModuleType = this.moduleTypes['actions'].find((m) => m.uid === newModule.type)

      const popup = {
        component: RuleModulePopup
      }
      this.$f7router.navigate({
        url: 'module-config',
        route: {
          path: 'module-config',
          popup
        }
      }, {
        props: {
          currentSection: 'actions',
          ruleModule: this.currentModule,
          ruleModuleType: this.currentModuleType,
          moduleTypes: this.moduleTypes,
          isSceneModule: true
        }
      })

      this.$f7.once('ruleModuleConfigUpdate', this.saveModule)
      this.$f7.once('ruleModuleConfigClosed', () => {
        this.$f7.off('ruleModuleConfigUpdate', this.saveModule)
        this.moduleConfigClosed()
      })
    },
    reorderModule (ev, section) {
      const newSection = [...this.rule[section]]
      newSection.splice(ev.to, 0, newSection.splice(ev.from, 1)[0])
      this.$set(this.rule, section, newSection)
    },
    saveModule (updatedModule) {
      if (!updatedModule.type) return
      if (!updatedModule.configuration.command) {
        this.$oh.api.getPlain('/rest/items/' + updatedModule.configuration.itemName + '/state').then(state => {
          updatedModule.configuration.command = state
          this.doSave(updatedModule)
        })
      } else {
        this.doSave(updatedModule)
      }
    },
    doSave (updatedModule) {
      const idx = this.rule['actions'].findIndex((m) => m.id === updatedModule.id)
      if (idx >= 0) {
        this.$set(this.rule['actions'], idx, updatedModule)
      } else {
        this.rule['actions'].push(updatedModule)
      }
    },
    saveAndEditNewScript (updatedModule) {
      this.saveModule(updatedModule)
      this.save().then(() => {
        this.$f7router.navigate('/settings/rules/' + this.rule.uid + '/script/' + updatedModule.id, { transition: this.$theme.aurora ? 'f7-cover-v' : '' })
      })
    },
    moduleConfigClosed () {
      this.currentModule = null
      this.currentModuleType = null
    }
  },
  computed: {
    isEditable () {
      return this.rule && this.rule.editable !== false
    }
  }
}
</script>
