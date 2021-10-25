<template>
  <div v-if="(!this.context.editmode && visible) || (this.context.editmode && editVisible)" ref="ohCanvasLayer" class="oh-canvas-layer">
    <oh-canvas-item
      v-for="obj in layer"
      :key="obj.id"
      :id="obj.id"
      :grid-enable="gridEnable"
      :grid-pitch="gridPitch"
      :context="childContext(obj.item)" />
  </div>
</template>

<style lang="stylus">
.oh-canvas-layer
  height 100%
  width 100%
  position fixed
  pointer-events none
</style>

<script>
import mixin from '../widget-mixin'
import OhCanvasItem from './oh-canvas-item'
import { OhCanvasLayerDefinition } from '@/assets/definitions/widgets/layout'

export default {
  mixins: [mixin],
  widget: OhCanvasLayerDefinition,
  components: {
    OhCanvasItem
  },
  props: {
    gridPitch: Number,
    gridEnable: Boolean,
    id: String
  },
  data () {
    return {
      layer: []
    }
  },
  created () {
    this.computeLayer()
  },
  computed: {
    editVisible () {
      return !(this.config && (this.config.editVisible === false))
    }
  },
  methods: {
    computeLayer () {
      let layer = []
      if (this.context.component.slots) {
        this.context.component.slots?.default.forEach((item) => {
          if (item.component === 'oh-canvas-item') {
            layer.push({
              item: item,
              id: Math.random().toString(36).substring(2)
            })
          } else {
            console.log('Wrong component type in canvas layer: ' + item.component)
          }
        })
      }
      this.layer = layer
    }
  }
}
</script>
