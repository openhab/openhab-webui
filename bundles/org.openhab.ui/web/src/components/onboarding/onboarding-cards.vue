<template>
  <div>
    <f7-card
      v-show="showSetup"
      title="Welcome to openHAB!"
      content="Congratulations, your server is up and running! However, it is not configured yet. Follow the setup wizard and let it guide you through the initial configuration. (Note: the wizard could also be started automatically on launch if no package is detected - services/org.openhab.addons > package).">
      <f7-card-footer>
        <f7-link color="blue" @click="skipSetupWizard()">
          No thanks
        </f7-link>
        <!-- <f7-button color="blue" fill raised login-screen-open="#login-screen">Start Setup Wizard</f7-button> -->
        <f7-button color="blue"
                   fill
                   raised
                   href="/setup-wizard/">
          Start Setup Wizard
        </f7-button>
      </f7-card-footer>
    </f7-card>
    <f7-card title="Suggested Tasks" v-show="showTasks">
      <f7-card-content :padding="false">
        <ol>
          <li>
            <f7-link no-link-class color="blue" href="#">
              Install Bindings &amp; other add-ons
            </f7-link>
          </li>
          <li>
            <f7-link no-link-class color="blue" href="#">
              Discover &amp; configure Things
            </f7-link>
          </li>
          <li>
            <f7-link no-link-class color="blue" href="#">
              Design your home's conceptually with the semantic model builder and link the Things to Items
            </f7-link>
          </li>
          <li>
            <f7-link no-link-class color="blue" href="#">
              Connect to openHAB Cloud for remote access and integration with voice assistants
            </f7-link>
          </li>
        </ol>
      </f7-card-content>
      <f7-card-footer>
        <f7-link color="blue" @click="dismissTasks">
          Dismiss
        </f7-link>
      </f7-card-footer>
    </f7-card>
  </div>
</template>

<script>
import { f7 } from 'framework7-vue'

export default {
  props: {
    showSetup: Boolean,
    showTasks: Boolean
  },
  methods: {
    skipSetupWizard () {
      f7.dialog.confirm(
        'Are you sure? You currently only have a minimal set of features available and you will need to install all essential add-ons by hand!',
        'Skip Setup Wizard',
        () => {
          // TODO
        }
      )
    },
    dismissTasks () {
      // TODO
    }
  }
}
</script>
