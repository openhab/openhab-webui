<template>
  <!-- <q-pull-to-refresh :handler="computeSuggestions"> -->
    <div class="row">
      <div class="hb-cards">
        <component :is="'HbCard'" :model="card" menu="deck" v-for="card in cards" :key="card.uid"></component>
      </div>
      <div v-if="cards.length === 0" class="fit text-center q-pt-xl q-pl-lg q-pr-lg text-grey">
        <h4 class="q-display-1">No suggestions at this time</h4>
        <p>Edit stored cards and add criteria in the designer to make them appear here when relevant.</p>
        <q-btn flat icon="dashboard" @click="$router.push('/cards/deck')" style="margin-top: -1px;" label="Card deck" />
      </div>
      <div class="full-width q-ma-lg text-center">
        <q-btn outline color="secondary" @click="computeSuggestions()" icon="refresh">Refresh suggestions</q-btn>
      </div>
    </div>
  <!-- </q-pull-to-refresh> -->
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
  data () {
    return {
      cards: []
    }
  },
  methods: {
    computeSuggestions (done) {
      this.cards = []
      this.$store.dispatch('cards/computeSuggestions').then((cards) => {
        this.cards = cards
        if (done) done()
      })
    //   let candidates = this.$store.getters['cards/suggestioncandidates']

    //   let promises = []

    //   for (let card of candidates) {
    //     promises.push(this.$expr('=' + card.config.suggestcriteria).then((result) => {
    //       if (result === true) {
    //         this.cards.push(card)
    //       }
    //     }))
    //   }

    //   Promise.all(promises).then(() => {
    //     if (done) done()
    //   })
    }
  },
  mounted () {
    this.computeSuggestions()
  }
}
</script>
