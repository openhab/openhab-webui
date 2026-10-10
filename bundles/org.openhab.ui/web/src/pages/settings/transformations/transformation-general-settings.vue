<template>
  <f7-block class="block-narrow">
    <f7-col>
      <f7-list class="no-margin" inline-labels no-hairlines-md>
        <f7-list-group>
          <f7-list-input
            v-if="createMode"
            label="Transformation ID"
            type="text"
            placeholder="Required"
            :value="transformation.uid"
            required
            validate
            pattern="[A-Za-z0-9_]+"
            error-message="Required. A-Z,a-z,0-9,_ only"
            info="Note: cannot be changed after the creation"
            @input="transformation.uid = $event.target.value"
            clear-button />
          <wrapped-list-output v-else label="Transformation UID" :value="transformation.uid" clipboard />
          <f7-list-input
            v-if="transformation.editable"
            label="Label"
            type="text"
            placeholder="Tranformation label for display purposes"
            :info="createMode ? 'Required' : ''"
            :value="transformation.label"
            required
            validate
            @input="transformation.label = $event.target.value"
            clear-button />
          <wrapped-list-output v-else label="Label" :value="transformation.label" />
          <f7-list-item v-if="createMode && languages" title="Language" smart-select :smart-select-params="smartSelectParams">
            <select name="language" @change="$emit('new-language', $event.target.value)">
              <option value="" selected />
              <option v-for="lang in languages" :selected="language ? true : null" :value="lang.value" :key="lang.value">
                {{ lang.label }}
              </option>
            </select>
          </f7-list-item>
        </f7-list-group>
      </f7-list>
    </f7-col>
    <f7-col v-if="createMode && types">
      <f7-block-title>Transformation Type</f7-block-title>
      <f7-list media-list>
        <f7-list-item
          v-for="type in types"
          media-item
          radio
          radio-icon="start"
          :value="transformation.type"
          :checked="transformation.type === type ? true : null"
          @change="$emit('new-type', type)"
          :key="type"
          :title="type" />
      </f7-list>
    </f7-col>
  </f7-block>
</template>

<script>
import { theme } from 'framework7-vue'

import WrappedListOutput from '@/components/util/wrapped-list-output.vue'

export default {
  components: { WrappedListOutput },
  props: {
    transformation: Object,
    createMode: Boolean,
    types: Array,
    languages: Array,
    language: String
  },
  emits: ['new-type', 'new-language'],
  data() {
    return {
      smartSelectParams: {
        openIn: 'popup',
        searchbar: true,
        virtualList: true,
        virtualListHeight: theme.aurora ? 32 : undefined
      }
    }
  }
}
</script>
