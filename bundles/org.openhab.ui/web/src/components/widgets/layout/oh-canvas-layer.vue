<template>
  <div v-if="layerPreload || layerVisible" v-show="!layerPreload || layerVisible" ref="ohCanvasLayer" class="oh-canvas-layer">
    <oh-canvas-item
      v-for="obj in layer"
      v-bind="$attrs"
      :key="obj.id"
      :id="obj.id"
      :grid-enable="gridEnable"
      :grid-pitch="gridPitch"
      :prevent-deactivation="preventDeactivation"
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
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCanvasItem from './oh-canvas-item.vue'
import { OhCanvasLayerDefinition } from '@/assets/definitions/widgets/layout'

export default {
  widget: OhCanvasLayerDefinition,
  components: {
    OhCanvasItem
  },
  props: {
    context: Object,
    gridPitch: Number,
    gridEnable: Boolean,
    id: String,
    preventDeactivation: Boolean
  },
  setup (props) {
    const { config, childContext, visible } = useWidgetContext(props.context)
    return { config, childContext, visible }
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
    layerPreload () {
      return this.config?.preload === true
    },
    layerVisible () {
      return (!this.context.editmode && this.visible) || (this.context.editmode && this.editVisible)
    },
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
              item,
              selected: false,
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
