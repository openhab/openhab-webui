<template>
  <oh-card :context="context">
    <template #content>
      <f7-list v-if="config.artistItem && config.trackItem">
        <f7-list-item>
          <div class="display-block">
            <div class="no-padding no-margin font-weight-normal">
              {{ context.store[config.artistItem].state }}
            </div>
            <h3 class="no-padding no-margin">
              {{ context.store[config.trackItem].state }}
            </h3>
          </div>
        </f7-list-item>
      </f7-list>
    </template>
    <template #footer>
      <f7-card-footer class="display-flex justify-content-center">
        <oh-media-browser-controls :context="childContext(context.component)" @command="onCommand" />
      </f7-card-footer>
    </template>
  </oh-card>
</template>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhMediaBrowserControls from '../system/oh-media-browser-controls.vue'
import { OhMediaBrowserCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhMediaBrowserControls
  },
  widget: OhMediaBrowserCardDefinition
}
</script>
