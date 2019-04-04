<template>
  <div class="q-full-width q-ma-lg center">
    <div class="flex flex-center">
      <q-chat-message
        avatar="statics/icons/icon-192x192.png"
        :text="['Welcome to Help!', 'Select a topic below:']"
      />
    </div>
    <hr class="text-grey">
    <h5 class="q-body text-grey">Get Started</h5>
    <div class="row flex flex-center">
      <help-topic title="Meet HABot" subtitle="Get to know HABot and discover what it can do in 1 minute" topic="getting-started" @launch="launch" />
      <!-- <help-topic title="Tag your items" subtitle="Learn how to prepare your openHAB items for HABot" topic="tagging-items" @launch="launch" /> -->
      <!-- <help-topic title="Get the full experience" subtitle="Make sure you get all the features of this web app" topic="enhanced-features" @launch="launch" /> -->
    </div>
    <h5 class="q-body text-grey">Walkthrough Series</h5>
    <div class="layout-padding walkthough" style="max-width: 600px; padding-top: 0;">
      <q-list link>
        <q-item tag="a" href="https://community.openhab.org/t/55636" target="_blank">
          <q-item-main>
            <q-item-tile label>1. Introduction and Installation</q-item-tile>
            <q-item-tile sublabel>General information about HABot: its architecture, terminology, features and installation</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-icon name="chevron_right" size="18px" />
          </q-item-side>
        </q-item>
        <q-item tag="a" href="https://community.openhab.org/t/55651" target="_blank">
          <q-item-main>
            <q-item-tile label>2. Semantic Tagging &amp; Item Resolving</q-item-tile>
            <q-item-tile sublabel>How to tag your items semantically to make HABot resolve them in queries</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-icon name="chevron_right" size="18px" />
          </q-item-side>
        </q-item>
        <q-item tag="a" href="https://community.openhab.org/t/55676" target="_blank">
          <q-item-main>
            <q-item-tile label>3. Add to Home Screen (or Desktop)</q-item-tile>
            <q-item-tile sublabel>Learn about prerequisites to get the full experience of this Progressive Web App</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-icon name="chevron_right" size="18px" />
          </q-item-side>
        </q-item>
        <q-item tag="a" href="https://community.openhab.org/t/55747" target="_blank">
          <q-item-main>
            <q-item-tile label>4. Card Basics</q-item-tile>
            <q-item-tile sublabel>Discover HABot's cards, how to save them in your Card deck and reuse them</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-icon name="chevron_right" size="18px" />
          </q-item-side>
        </q-item>
        <q-item tag="a" href="https://community.openhab.org/t/55759" target="_blank">
          <q-item-main>
            <q-item-tile label>5. The Card Designer</q-item-tile>
            <q-item-tile sublabel>Learn the anatomy of a card, as well as how to modify them or design your own using the designer</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-icon name="chevron_right" size="18px" />
          </q-item-side>
        </q-item>
        <q-item tag="a" href="https://community.openhab.org/t/55840" target="_blank">
          <q-item-main>
            <q-item-tile label>6. Card Components &amp; Dynamic Expressions</q-item-tile>
            <q-item-tile sublabel>How to configure components in a card, including using expression with dynamic data</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-icon name="chevron_right" size="18px" />
          </q-item-side>
        </q-item>
        <q-item tag="a" href="https://community.openhab.org/t/59878" target="_blank">
          <q-item-main>
            <q-item-tile label>8. Analyzing Historical Data</q-item-tile>
            <q-item-tile sublabel>Introducing the analyzer window, an easy-to-use interactive charting feature for your persisted data</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-icon name="chevron_right" size="18px" />
          </q-item-side>
        </q-item>
        <q-item tag="a" href="https://community.openhab.org/t/59879" target="_blank">
          <q-item-main>
            <q-item-tile label>9. Configuring Voice Input</q-item-tile>
            <q-item-tile sublabel>Your options for speech recognition, and how to configure them to talk to HABot</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-icon name="chevron_right" size="18px" />
          </q-item-side>
        </q-item>
      </q-list>
    </div>

    <q-modal v-model="modal" maximized>
      <component :is="currentTopic" @close="close" @go="launch" @done="close(true)" />
    </q-modal>
  </div>
</template>

<style lang="stylus">
.walkthough .q-item
  text-decoration none
</style>

<script>
import HelpTopic from 'components/help/HelpTopic.vue'
import GettingStarted from 'layouts/help/GettingStarted.vue'
// import TaggingItems from 'layouts/help/TaggingItems.vue'
import EnhancedFeatures from 'layouts/help/EnhancedFeatures.vue'

export default {
  components: {
    HelpTopic,
    GettingStarted,
    // TaggingItems,
    EnhancedFeatures
  },
  data () {
    return {
      modal: false,
      currentTopic: null,
      colors: [
        'primary',
        'secondary',
        'yellow',
        'red',
        'orange',
        'grey-2'
      ]
    }
  },
  created () {
    if (this.$route.query.topic) {
      this.launch(this.$route.query.topic)
    }
  },
  methods: {
    launch (topic) {
      this.currentTopic = topic
      this.modal = true
    },
    close () {
      this.modal = false
    }
  }
}
</script>
