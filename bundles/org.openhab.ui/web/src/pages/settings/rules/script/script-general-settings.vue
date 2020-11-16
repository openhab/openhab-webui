<template>
  <f7-block v-if="!ready" class="block-narrow">
    <f7-col>
      <f7-list class="no-margin" inline-labels no-hairlines-md>
        <f7-list-input label="Unique ID" type="text" placeholder="Required" :value="rule.uid" required validate
                      :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                      pattern="[A-Za-z0-9_\-]+" error-message="Required. A-Z,a-z,0-9,_,- only"
                      @input="rule.uid = $event.target.value" :clear-button="createMode">
        </f7-list-input>
        <f7-list-input label="Name" type="text" placeholder="Required" :value="rule.name" required validate
                      @input="rule.name = $event.target.value" clear-button>
        </f7-list-input>
        <f7-list-input label="Description" type="text" :value="rule.description"
                      @input="rule.description = $event.target.value" clear-button>
        </f7-list-input>
      </f7-list>
    </f7-col>
  </f7-block>

</template>

<script>
export default {
  props: ['rule', 'createMode', 'ready']
}
</script>
