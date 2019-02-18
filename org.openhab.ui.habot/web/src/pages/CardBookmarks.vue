<template>
    <div class="row">
      <div class="hb-cards">
        <component :is="'HbCard'" :model="card" menu="deck" v-for="card in cards" :key="card.uid"></component>
      </div>
      <div v-if="cards.length === 0" class="fit text-center q-pt-xl q-pl-lg q-pr-lg text-grey">
        <h4 class="q-display-1">No bookmarked cards</h4>
        <p>Bookmark stored cards using their context menu from the deck or while chatting with HABot.</p>
        <q-btn flat icon="dashboard" @click="$router.push('/cards/deck')" style="margin-top: -1px" label="Card deck" />
      </div>
    </div>
</template>

<style lang="stylus">
@import '~variables'

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
import HbCard from 'components/HbCard.vue'

export default {
  components: {
    HbCard
  },
  computed: {
    cards: {
      get () {
        return this.$store.getters['cards/bookmarked']
      }
    }
  }
}
</script>
