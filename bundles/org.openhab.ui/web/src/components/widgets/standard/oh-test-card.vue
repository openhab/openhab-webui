<template>
  <f7-card>
    <f7-card-header>
      <div>Test card</div>
    </f7-card-header>
    <f7-card-content>
      <f7-gauge :size="context.component.config.height" border-color="#2196f3" :value="value"></f7-gauge>
      <f7-list>
        <f7-list-input label="Height" type="number" placeholder="Height" :value="context.component.config.height" @input="context.component.config.height = parseInt($event.target.value)" clear-button>
        </f7-list-input>
      </f7-list>
    </f7-card-content>
    <f7-card-footer>
      <!-- <div>{{context.store['Switch' + idx]}}</div> -->
      <div>Test card</div>
    </f7-card-footer>
  </f7-card>
</template>

<script>
import mixin from '../widget-mixin'

export default {
  mixins: [mixin],
  widget: {
    name: 'oh-test-card',
    label: 'Test card',
    description: 'This is a test card',
    props: {
      parameters: [
        {
          name: 'height',
          label: 'Height',
          type: 'INTEGER',
          description: 'Height of the gauge'
        }
      ]
    }
  },
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>

<style>

</style>
