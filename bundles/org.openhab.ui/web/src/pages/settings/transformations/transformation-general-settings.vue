<template>
  <f7-block v-if="!ready" class="block-narrow">
    <f7-col>
      <f7-list class="no-margin" inline-labels no-hairlines-md>
        <f7-list-input label="Unique ID" type="text" placeholder="Required" :value="configuration.uid" required validate
                       :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                       @input="configuration.uid = $event.target.value" :clear-button="createMode" />
        <f7-list-input label="Type" type="text" placeholder="Required" :value="configuration.type" required validate
                       :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                       @input="configuration.type = $event.target.value" :clear-button="createMode" />
        <f7-list-input label="Language" type="text" :value="configuration.language" validate
                       :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                       pattern="[a-z]{2}" error-message="a-z only, empty or two characters"
                       @input="configuration.language = $event.target.value" :clear-button="createMode" />
        <f7-list-input label="Label" type="text" placeholder="Required" :value="configuration.label" required validate
                       @input="configuration.label = $event.target.value" clear-button />
        <f7-col v-if="suggestedModes.length > 0">
          <f7-block-title>Editor Mode</f7-block-title>
          <f7-block-footer class="padding-left padding-right">
            The editor mode defines what hints are given when editing the configuration. The default is "no-hints".
            <f7-list>
              <f7-list-item radio v-for="mode in suggestedModes"
                            :checked="context.mode && context.mode === mode"
                            @change="context.mode = mode"
                            :key="mode" :title="mode" name="editor-mode" />
            </f7-list>
          </f7-block-footer>
        </f7-col>
      </f7-list>
    </f7-col>
  </f7-block>
</template>

<script>
export default {
  props: ['configuration', 'context', 'createMode', 'ready'],
  computed: {
    suggestedModes () {
      if (this.configuration.type && this.configuration.type === 'script') {
        return ['', 'application/javascript', 'blockly', 'application/vnd.openhab.dsl.rule', 'python', 'ruby', 'groovy']
      }
      if (this.configuration.type && ['map', 'scale'].includes(this.configuration.type)) {
        return ['', 'properties']
      }
      return []
    }
  }
}
</script>
