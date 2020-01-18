<template>
<div>
  <f7-block class="block-narrow">
    <habot v-if="showHABot" />
    <other-apps v-if="showApps" />
    <f7-col>
      <f7-card
        v-show="showSetup"
        title="Welcome to openHAB!"
        content="Congratulations, your server is up and running! However, it is not configured yet. Follow the setup wizard and let it guide you through the initial configuration. (Note: the wizard could also be started automatically on launch if no package is detected - services/org.openhab.addons > package)."
      >
        <f7-card-footer>
          <f7-link color="blue" @click="skipSetupWizard()">No thanks</f7-link>
          <!-- <f7-button color="blue" fill raised login-screen-open="#login-screen">Start Setup Wizard</f7-button> -->
          <f7-button color="blue" fill raised href="/setup-wizard/">Start Setup Wizard</f7-button>
        </f7-card-footer>
      </f7-card>
      <f7-card title="Suggested Tasks" v-show="showTasks">
        <f7-card-content :padding="false">
          <ol>
            <li>
              <f7-link no-link-class color="blue" href="#">Install Bindings &amp; other add-ons</f7-link>
            </li>
            <li>
              <f7-link no-link-class color="blue" href="#">Discover &amp; configure Things</f7-link>
            </li>
            <li>
              <f7-link
                no-link-class
                color="blue"
                href="#"
              >Design your home's conceptually with the semantic model builder and link the Things to Items</f7-link>
            </li>
            <li>
              <f7-link
                no-link-class
                color="blue"
                href="#"
              >Connect to openHAB Cloud for remote access and integration with voice assistants</f7-link>
            </li>
          </ol>
        </f7-card-content>
        <f7-card-footer>
          <f7-link color="blue" @click="dismissTasks">Dismiss</f7-link>
        </f7-card-footer>
      </f7-card>

    </f7-col>
  </f7-block>

  <f7-block v-if="showCards && !ready" class="text-align-center">
    <f7-preloader></f7-preloader>
    <div>Loading...</div>
  </f7-block>

  <div class="demo-expandable-cards" v-if="showCards && ready">
    <h2 class="home-header">
      <!-- <f7-icon aurora="f7:star_fill" ios="f7:star_fill" md="material:star" size="25" style="vertical-align: sub" /> -->
      Now
    </h2>
    <expandable-card color="teal" header="gauge" />
    <h2 class="home-header">Favorites</h2>
    <h3 class="home-header">Scenes</h3>
    <f7-block style="text-align: center">No favorite scenes defined</f7-block>
    <h3 class="home-header">Cards</h3>
    <expandable-card color="red" header="temperature" title="Thermostat Upstairs" />
    <expandable-card color="blue" header="temperature" title="Thermostat Downstairs" />
    <expandable-card color="green" header="gauge" />
    <expandable-card color="deeppurple" />
    <!-- <expandable-card color="gray" /> -->
    <expandable-card color="black" header="player" title="SONOS Multiroom" />
    <expandable-card color="blue" header="image" title="Webcam Front Door" />
    <!-- <expandable-card color="orange" />
    <expandable-card color="deeporange" />
    <expandable-card color="pink" />
    <expandable-card color="lightblue" /> -->
  </div>

  <f7-block v-if="showCards && ready">
    <f7-button small @click="showSetup = true; showTasks = true; showCards = false; showHABot = false">Simulate first-time run</f7-button>
  </f7-block>
</div>

</template>

<style lang="stylus">
.home-header
  display block
  width calc(100% - 30px)
  margin-left calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-left))
</style>

<script>
import ExpandableCard from '../../components/expandable-card.vue'
import Habot from '../../components/home/habot.vue'
import OtherApps from '../../components/home/other-apps.vue'

export default {
  props: ['items'],
  components: {
    ExpandableCard,
    OtherApps,
    Habot
  },
  data () {
    return {
      showSetup: false,
      showTasks: false,
      showApps: true,
      showCards: false,
      showHABot: false,
      ready: true
    }
  },
  created () {
    // if (Object.keys(this.items).length === 0) {
    //   this.showSetup = true
    // } else {
    //   this.showCards = true
    //   this.showHABot = true
    //   setTimeout(() => { this.ready = true }, 1000)
    // }
  },
  methods: {
    skipSetupWizard () {
      const vm = this
      this.$f7.dialog.confirm(
        'Are you sure? You currently only have a minimal set of features available and you will need to install all essential add-ons by hand!',
        'Skip Setup Wizard',
        () => {
          vm.showSetup = false
          vm.showTasks = true
        }
      )
    },
    dismissTasks () {
      this.showTasks = false
      this.showHABot = true
      this.showCards = true
      setTimeout(() => { this.ready = true }, 1000)
    },
    displayCards () {
      setTimeout(() => { this.showCards = true }, 3000)
    }
  }
}
</script>
