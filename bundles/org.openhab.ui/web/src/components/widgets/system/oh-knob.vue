<template>
  <knob-control v-bind="config" :text-color="config.textColor || ($f7.data.themeOptions.dark === 'dark') ? '#ffffff' : undefined" :value="value"
                @input="sendCommandDebounced($event)" @click.native="sendCommandDebounced(value, true)" @touchend.native="sendCommandDebounced(value, true)" />
</template>

<script>
import mixin from '../widget-mixin'
import slideMixin from './slide-mixin'
import { OhKnobDefinition } from '@/assets/definitions/widgets/system'

import KnobControl from 'vue-knob-control'

export default {
  mixins: [mixin, slideMixin],
  components: {
    KnobControl
  },
  widget: OhKnobDefinition
}
</script>
