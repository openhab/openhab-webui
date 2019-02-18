<template>
  <div>
    <div class="row bg-grey-2 shadow-2">
      <q-checkbox class="multiple-toggle" color="secondary" v-model="multiple" unchecked-icon="done" checked-icon="done_all"></q-checkbox>
      <div :class="['filters', 'row', (multiple) ? 'multiple' : 'single']">
        <q-select :multiple="multiple" :filter="!$q.platform.is.mobile" class="col-12 col-sm-6" clearable chips color="secondary" v-model="objects" :options="objectSet" float-label="Objects"></q-select>
        <q-select :multiple="multiple" :filter="!$q.platform.is.mobile" class="col-12 col-sm-6" clearable chips color="secondary" v-model="locations" :options="locationSet" float-label="Locations"></q-select>
      </div>
      <!-- <q-search v-model="search" color="none" class="col"></q-search> -->
    </div>
    <div class="row">
      <div v-if="!objectSet.length && !locationSet.length" class="fit text-center q-pt-xl q-pl-lg q-pr-lg text-grey">
        <h4 class="q-display-1">Card deck empty</h4>
        <p>Add cards while chatting with HABot or use the button below to create one.</p>
        <q-btn flat icon="chat" @click="$router.push('/chat')" style="margin-top: -1px" label="Chat with HABot" />
      </div>
      <div v-else-if="!nofilters && !cards.length" class="fit text-center q-pt-xl q-pl-lg q-pr-lg text-grey">
        <h4 class="q-display-1">No cards found</h4>
        <p>Change the filters or use the button below to create one.</p>
      </div>
      <div v-else-if="nofilters" class="fit text-center q-pt-xl q-pl-lg q-pr-lg text-grey">
        <h4 class="q-display-1">Select attributes to show cards</h4>
        <p>Use the filters above to display the corresponding cards, or create one.</p>
        <q-btn flat icon="bookmark" @click="$router.push('/cards/bookmarks')" style="margin-top: -1px" label="Bookmarks" />
        <q-btn flat icon="star" @click="$router.push('/cards/suggestions')" style="margin-top: -1px" label="Suggestions" />
      </div>
      <div class="hb-cards">
        <component :is="'HbCard'" :model="card" menu="deck" v-for="card in cards" :key="card.uid"></component>
      </div>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        color="secondary"
        icon="add" direction="up">
        <q-fab-action
          color="secondary"
          @click="addCard"
          icon="aspect_ratio">
          <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">Create simple card</q-tooltip>
        </q-fab-action>
        <q-fab-action
          color="secondary"
          @click="addListCard"
          icon="list">
          <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">Create list card</q-tooltip>
        </q-fab-action>
        <q-fab-action
          color="secondary"
          @click="addTabbedCard"
          icon="tab">
          <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">Create tabbed card</q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>
  </div>
</template>

<style lang="stylus">
@import '~variables'
.multiple-toggle
  position absolute
  right 0
  margin 30px
// mat theme fixes for the filters
.filters
  padding 10px
  width 100%
  margin-right 50px
  .q-select
    padding-top 13px
  .q-if-label
    width 100%
    cursor pointer !important
  .q-input-chips
    margin-bottom -3px

.hb-cards
  padding 10px
  width 100%
  @media (min-width $breakpoint-xs-min)
    .q-card
      min-width $card-min-width
      margin 15px
  @media (max-width $breakpoint-xs-max)
    .q-card
      width 100%
      margin-bottom 20px
      margin-left -0.25rem
</style>

<script>
import CardDesigner from 'layouts/designer/CardDesigner.vue'
import HbCard from 'components/HbCard.vue'
import { uid } from 'quasar'

export default {
  components: {
    CardDesigner,
    HbCard
  },
  data () {
    return {
      multiple: false,
      objects: null,
      locations: null
      // cards: []
    }
  },
  methods: {
    addCard () {
      this.$router.push({ path: '/designer/' + uid(), query: { objects: this.currentObjects.join(','), locations: this.currentLocations.join(',') } })
    },
    addListCard () {
      this.$router.push({ path: '/designer/' + uid(), query: { type: 'list', objects: this.currentObjects.join(','), locations: this.currentLocations.join(',') } })
    },
    addTabbedCard () {
      this.$router.push({ path: '/designer/' + uid(), query: { type: 'tabs', objects: this.currentObjects.join(','), locations: this.currentLocations.join(',') } })
    }
  },
  watch: {
    multiple: function (val) {
      if (val) {
        this.objects = (!this.objects) ? [] : [this.objects]
        this.locations = (!this.locations) ? [] : [this.locations]
      } else {
        this.objects = (this.objects.length) ? this.objects[0] : null
        this.locations = (this.locations.length) ? this.locations[0] : null
      }
    }
  },
  computed: {
    nofilters () {
      if (this.multiple) return (!this.objects.length && !this.locations.length)
      else return (!this.objects && !this.locations)
    },
    objectSet: {
      get () {
        return this.$store.getters['cards/objectSet'].map((object) => {
          return {
            value: object,
            label: object,
            stamp: '(' + this.$store.getters['cards/object'](object).length + ')'
          }
        })
      }
    },
    locationSet: {
      get () {
        return this.$store.getters['cards/locationSet'].map((location) => {
          return {
            value: location,
            label: location,
            stamp: '(' + this.$store.getters['cards/location'](location).length + ')'
          }
        })
      }
    },
    cards: {
      get () {
        let objects = (this.multiple) ? this.objects : (this.objects) ? [this.objects] : []
        let locations = (this.multiple) ? this.locations : (this.locations) ? [this.locations] : []
        return this.$store.getters['cards/filter'](objects, locations)
      }
    },
    currentObjects () {
      return (this.multiple) ? this.objects : [this.objects]
    },
    currentLocations () {
      return (this.multiple) ? this.locations : [this.locations]
    }
  }
}
</script>
