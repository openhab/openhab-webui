<template>
  <f7-card expandable :animate="$f7.data.themeOptions.expandableCardAnimation !== 'disabled'" card-tablet-fullscreen v-on:card:opened="cardOpening" v-on:card:closed="cardClosed">
    <f7-card-content :padding="false">
      <div :class="`bg-color-${color}`" :style="{height: '300px'}">
        <f7-card-header text-color="white" class="display-block">
          {{title || 'Something'}}
          <div><small v-if="subtitle">{{subtitle}}</small></div>
          <br>
          <h1>State</h1>
        </f7-card-header>
        <f7-link
          card-close
          color="white"
          class="card-opened-fade-in"
          :style="{position: 'absolute', right: '15px', top: '15px'}"
          icon-f7="close_round_fill"
        ></f7-link>
      </div>
      <div class="card-content-padding" v-if="opened">
        <f7-list>
          <ul>
            <sitemap-widget-generic v-for="model in standaloneEquipments" :key="model.item"
              :model="model" />
          </ul>
          <ul v-for="equipment in equipmentsWithPoints" :key="equipment.item">
            <f7-list-item divider :title="equipment.title"></f7-list-item>
            <sitemap-widget-generic v-for="model in equipment.points" :key="model.item"
              :model="model" />
          </ul>
        </f7-list>
        <p>
          <f7-button fill round large card-close :color="color">Close</f7-button>
        </p>
      </div>
    </f7-card-content>
  </f7-card>
</template>

<script>
import item2SitemapModel from './item2SitemapModel.js'

export default {
  props: ['color', 'type', 'header', 'title', 'subtitle', 'items'],
  data () {
    return {
      opened: false
    }
  },
  methods: {
    cardOpening () {
      console.log('card opened')
      setTimeout(() => { this.opened = true })
      this.$f7.toast.create({
        text: 'The semantic cards rendering is currently for demonstration purposes only. It is not functional nor updates in real time. Please use another app like Basic UI or HABPanel to interact with your items.',
        closeButton: true,
        destroyOnClose: true
      }).open()
    },
    cardClosed () {
      console.log('card closed')
      this.opened = false
    }
  },
  computed: {
    standaloneEquipments () {
      return this.items.filter((i) => i.points.length === 0).map((i) => item2SitemapModel(i.item))
    },
    equipmentsWithPoints () {
      return this.items.filter((i) => i.points.length !== 0).map((i) => {
        return {
          item: i.item.name,
          title: (i.item.label || i.item.name),
          points: i.points.map(item2SitemapModel)
        }
      })
    }
  }
}
</script>
