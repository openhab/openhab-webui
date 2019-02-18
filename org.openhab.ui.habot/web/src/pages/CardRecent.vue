<template>
  <div class="q-ma-xl full-width text-center" v-if="busy">
    <q-spinner-dots width="4rem" color="primary" />
  </div>
  <div v-else-if="!cards.length" class="row">
    <div style="padding: 10px"></div>
    <div class="fit text-center q-pt-xl q-pl-lg q-pr-lg text-grey">
      <h4 class="q-display-1">No recent cards</h4>
      <p>The cards encountered while chatting or modified recently will appear here.</p>
      <q-btn flat icon="chat" @click="$router.push('/chat')" style="margin-top: -1px" label="Chat with HABot" />
    </div>
  </div>
  <div v-else class="recent-cards-container">
    <q-timeline class="recent-cards">
      <q-timeline-entry v-for="card in cards" :key="card.uid"
        :subtitle="timeAgo(new Date(card.timestamp))" class="recent-card">
        <hb-card :model="card" menu="recent" @forgotten="cardForgotten" />
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<style lang="stylus">
@import '~variables'

.recent-cards-container
  display flex
  flex-direction column
  align-items center
.recent-cards
  @media (max-width $breakpoint-xs-max)
    .q-card
      width calc(100% - 10px)
      margin-bottom 20px
      margin-left -0.60rem
  @media (min-width $breakpoint-sm-min)
    .q-card
      min-width $card-min-width
      margin 15px
  @media (max-width $breakpoint-sm-max)
    width calc(100% - 20px)
    margin-left 20px
  @media (min-width $breakpoint-md-min)
    //margin-left -100px
    width 500px
    //width calc(100% - 48px)
  @media (min-width $breakpoint-lg-min)
    //margin-left -250px
    width 500px
    //width calc(100% - 48px)
    .q-card
      // margin-left -2.2rem
      // margin-right -2.2rem
      z-index 1000
</style>

<script>
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'

import HbCard from 'components/HbCard.vue'

export default {
  components: {
    HbCard
  },
  data () {
    return {
      cards: null,
      busy: true
    }
  },
  methods: {
    getRecentCards (skip) {
      this.$http.get('/rest/habot/cards/recent').then((resp) => {
        this.busy = false
        if (resp.data) {
          this.cards = resp.data
        }
      })
    },
    timeAgo (date) {
      return distanceInWordsToNow(date, { includeSeconds: true, addSuffix: true })
    },
    cardForgotten (uid) {
      let card = this.cards.find((card) => card.uid === uid)
      this.cards.splice(this.cards.indexOf(card), 1)
    },
    formatTimestamp (timestamp) {
      return new Date(timestamp).toString()
    }
  },
  created () {
    this.getRecentCards(0)
  }
}
</script>
