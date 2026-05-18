<template>
  <f7-col>
    <f7-list inline-labels accordion-list no-hairline-md class="no-margin-top">
      <f7-list-input
        ref="pageId"
        label="Page ID"
        type="text"
        placeholder="A unique identifier for the page"
        :value="page.uid"
        @input="page.uid = $event.target.value"
        :clear-button="createMode && !readOnly"
        :info="createMode ? 'Required. Note: cannot be changed after the creation' : ''"
        input-id="input"
        required
        validate
        pattern="[A-Za-z0-9_]+"
        error-message="Required. A-Z,a-z,0-9,_ only"
        :disabled="readOnly || !createMode">
        <template #inner>
          <f7-link
            v-if="createMode && $refs.pageId?.state?.inputInvalid && page.uid.trim()"
            icon-f7="hammer_fill"
            style="margin-top: 4px; margin-left: 4px; margin-bottom: auto"
            tooltip="Fix ID"
            @click="$oh.utils.normalizeInput('#input')" />
        </template>
      </f7-list-input>
      <f7-list-input
        label="Label"
        type="text"
        placeholder="Page label used for display purposes"
        :info="createMode ? 'Required' : ''"
        :value="page.config.label"
        @input="page.config.label = $event.target.value"
        required
        validate
        :disabled="readOnly"
        :clear-button="!readOnly" />
      <f7-list-item v-if="page.uid !== 'overview'" accordion-item title="Sidebar &amp; Visibility">
        <f7-accordion-content>
          <f7-list-item
            ref="pageVisibility"
            title="Visible only to"
            smart-select
            :smart-select-params="{ openIn: 'popover' }"
            :disabled="readOnly">
            <select name="pagevisibility" multiple @change="updatePageVisibility">
              <optgroup label="Roles">
                <option value="role:administrator" :selected="isVisibleTo('role:administrator') ? true : null">Administrators</option>
                <option value="role:user" :selected="isVisibleTo('role:user') ? true : null">Users</option>
              </optgroup>
            </select>
          </f7-list-item>
          <f7-list inline-labels no-hairline-md>
            <f7-list-item title="Show on sidebar">
              <template #after>
                <f7-toggle
                  :checked="page.config.sidebar ? true : null"
                  @toggle:change="page.config.sidebar = $event"
                  :disabled="readOnly" />
              </template>
            </f7-list-item>
            <f7-list-input
              label="Sidebar order"
              type="number"
              placeholder="Assign order index to rearrange pages on sidebar"
              :value="page.config.order"
              @input="page.config.order = $event.target.value"
              :disabled="readOnly ? true : null"
              :clear-button="!readOnly" />
            <f7-list-input
              label="Icon"
              type="text"
              placeholder="Assign a custom icon"
              :value="page.config.icon"
              @input="page.config.icon = $event.target.value"
              :disabled="readOnly ? true : null"
              :clear-button="!readOnly" />
            <f7-list-input
              label="Browser Title"
              type="text"
              placeholder="A custom browser title instead of the label"
              :value="page.config.browserTitle"
              @input="page.config.browserTitle = $event.target.value"
              :disabled="readOnly ? true : null"
              :clear-button="!readOnly" />
          </f7-list>
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>
    <template v-if="page.uid !== 'overview'">
      <f7-list inline-labels no-hairline-md>
        <div>
          <tag-input :item="page" :disabled="readOnly" />
        </div>
      </f7-list>
      <f7-list v-if="!createMode" inline-labels no-hairline-md>
        <f7-list-button color="blue" @click="duplicatePage"> Duplicate Page </f7-list-button>
        <f7-list-button v-if="!readOnly" color="red" @click="deletePage"> Remove Page </f7-list-button>
      </f7-list>
    </template>
  </f7-col>
</template>

<script>
import { f7 } from 'framework7-vue'

import TagInput from '@/components/tags/tag-input.vue'
import cloneDeep from 'lodash/cloneDeep'
import { showToast } from '@/js/dialog-promises'

export default {
  components: {
    TagInput
  },
  props: {
    page: Object,
    createMode: Boolean,
    readOnly: Boolean,
    f7router: Object
  },
  data() {
    return {}
  },
  methods: {
    isVisibleTo(userrole) {
      return Array.isArray(this.page.config.visibleTo) && this.page.config.visibleTo.indexOf(userrole) >= 0
    },
    updatePageVisibility(userrole) {
      let value = this.$refs.pageVisibility.$el.children[0].f7SmartSelect.getValue()
      if (value && value.length === 0) {
        delete this.page.config.visibleTo
      } else {
        this.page.config.visibleTo = value
        showToast('Please be advised: the visibility restriction is not a security feature - pages can be accessed by other means!')
      }
    },
    duplicatePage() {
      const pageClone = cloneDeep(this.page)
      const pageType = pageClone.component.replace(/^oh-|-page$/g, '')
      pageClone.uid = pageClone.uid + '_copy'
      delete pageClone.editable
      this.f7router.navigate(`/settings/pages/${pageType}/duplicate`, { props: { pageCopy: pageClone } })
    },
    deletePage() {
      f7.dialog.confirm(`Are you sure you want to delete ${this.page.uid}?`, 'Delete Page', () => {
        this.$oh.api
          .delete('/rest/ui/components/ui:page/' + this.page.uid)
          .then((data) => {
            showToast(`Page '${this.page.uid}' deleted`)
            this.f7router.back('/settings/pages/', { force: true })
          })
          .catch((err) => {
            console.error(err)
            f7.dialog.alert('An error occurred while deleting: ' + err)
          })
      })
    }
  }
}
</script>
