<template>
  <f7-block class="block-narrow">
    <f7-col>
      <f7-list class="no-margin" inline-labels no-hairlines-md>
        <f7-list-input label="Unique ID" type="text" placeholder="Required" :value="transformation.uid"
                       required :validate="createMode" pattern="[A-Za-z0-9_]+" error-message="Required. A-Z,a-z,0-9,_ only"
                       :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                       @input="transformation.uid = $event.target.value" :clear-button="createMode" />
        <f7-list-input label="Label" type="text" placeholder="Required" :value="transformation.label" required validate
                       :disabled="!transformation.editable" @input="transformation.label = $event.target.value" :clear-button="createMode || transformation.editable" />
        <f7-list-item v-if="createMode && languages" title="Language" smart-select :smart-select-params="smartSelectParams">
          <select name="language" @change="$emit('newLanguage', $event.target.value)">
            <option value="" selected />
            <option v-for="lang in languages" :selected="language" :value="lang.value" :key="lang.value">
              {{ lang.label }}
            </option>
          </select>
        </f7-list-item>
      </f7-list>
    </f7-col>
    <f7-col v-if="createMode && types">
      <f7-block-title>Transformation Type</f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item radio radio-icon="start"
                      :value="transformation.type" :checked="transformation.type === type" @change="$emit('newType', type)"
                      v-for="type in types" :key="type"
                      :title="type" />
      </f7-list>
    </f7-col>
  </f7-block>
</template>

<script>
export default {
  props: ['transformation', 'createMode', 'types', 'languages', 'language'],
  emits: ['newType', 'newLanguage'],
  data () {
    return {
      smartSelectParams: {
        openIn: 'popup',
        searchbar: true,
        virtualList: true,
        virtualListHeight: (this.$theme.aurora) ? 32 : undefined
      }
    }
  }
}
</script>
