<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline" :style="{background: config.background}">
    <f7-card-header v-if="config.headline">
      <div class="cont">
        <div class="headline">
          {{ config.headline }}
        </div>
        <div class="subheadline">
          {{ config.subheadline }}
        </div>
      </div>
    </f7-card-header>
    <f7-card-content :class="{ 'slider-card-vertical': config.vertical }">
      <oh-list :context="childContext(context.component)" v-on="$listeners" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{ config.footer }}
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.slider-card-vertical
  height 300px
.cont {
  display: grid
  grid-template-columns: 32px 1fr 32px 1fr;
  grid-template-rows: 30px 10px;
  gap: 5px 10px;
  position: relative;
}
.headline {
  grid-column: 1/4;
  grid-row: 1/2;
  justify-self: start;
  align-self: start;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: rgba(255,255,255,1);
  letter-spacing: .75px;
  font-size: min(max(70px, 4vw), 20px);
  font-weight: 600;
  text-shadow: 2px 2px rgba(0,0,0,.25);
}
.subheadline {
  grid-column: 1/4;
  grid-row: 2/3;
  justify-self: left;
  align-self: end;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: rgba(255,255,255,.7);
  letter-spacing: .75px;
  font-size: min(max(50px, 2.5vw), 15px);
  font-weight: 600;
  text-shadow: 2px 2px rgba(0,0,0,.25);
}
</style>

<script>
import mixin from '../widget-mixin'
import OhList from '../system/oh-list.vue'
import { OhListCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhList
  },
  widget: OhListCardDefinition
}
</script>
