<template>
  <f7-block>
    <p>
      <strong>Rules</strong> are the heart of home automation.  <span v-if="type == 'Rules'">They allow openHAB to respond to different events with automatic reactions. Rules can be a simple as a directive to turn on a single light at a given time but full scripting languages also allow for more complex reactions. </span><span v-else><strong> {{ type }}</strong> are special types of rules.</span>
    </p>
    <p v-if="(type == 'Rules' && ($store.state.pagePath).indexOf('schedule')<0)">
      Community made Rule Templates can also be added to your system from the <strong>Automation</strong> tab of the Add-on Store.
    </p>
    <p v-else-if="(type == 'Rules' && ($store.state.pagePath).indexOf('schedule')>=0)">
      The shedule page shows you a calendar layout of all Rules that have the <f7-chip text="Schedule" media-bg-color="blue"><f7-icon slot="media" f7="tag_fill"></f7-icon></f7-chip> tag and trigger at one or more defined times.
    </p>
    <p>
      On these pages you can manage all the basic {{ type }} you have added to your system.
      <f7-list media-list>
        <f7-list-item :title="`Add new ${type}`">
          Add {{ type }} using the <i class="f7-icons size-22 add-button-icon">plus_circle_fill</i> button
        </f7-list-item>
        <f7-list-item v-if="(type == 'Rules')" title="Configure Rules">
          Click on any Rule in the main list to configure the rule or write a script action for the rule
        </f7-list-item>
        <f7-list-item v-else-if="(type == 'Scripts')" title="Edit Scripts">
          Click on any Script in the main list to edit the action of the script
        </f7-list-item>
        <f7-list-item v-else-if="(type == 'Scenes')" title="Edit Scenes">
          Click on any Scene in the main list to edit scene's item commands
        </f7-list-item>
        <f7-list-item :title="`Delete ${type}`">
          Select multiple {{ type }} using the top <strong>Select</strong> button and use the <strong>Remove</strong> button at the bottom or use the <span style="color: red">Remove {{ type }}</span> button on the individual {{ type.slice(0,-1).toLowerCase() }} pages 
        </f7-list-item>
        <f7-list-item v-if="(type == 'Rules' || type == 'Scripts')" :title="`Enable/Disable ${type}`">
          Select multiple {{ type }} using the top <strong>Select</strong> button and use the <strong>Enable</strong> or <strong>Disable</strong> buttons at the bottom or use the <i class="f7-icons size-22">play_circle</i> and <i class="f7-icons size-22">pause_circle</i> buttons on the individual {{ type.slice(0,-1).toLowerCase() }} pages
        </f7-list-item>
        <f7-list-item v-else title="Enable/Disable Scenes">
          Use the <i class="f7-icons size-22">play_circle</i> and <i class="f7-icons size-22">pause_circle</i> buttons on the individual scene pages
        </f7-list-item>
        <f7-list-item :title="`Manually run ${type}`">
          Use the <i class="f7-icons size-22">play</i> button on the individual {{ type.slice(0,-1) }} pages to have the {{ type.slice(0,-1).toLowerCase() }} run <span v-if="(type == 'Rules')">all actions</span> immediately
        </f7-list-item>
      </f7-list>
    </p>
    <f7-link external :href="documentationLink" target="_blank" text="Open full documentation" color="blue" />
  </f7-block>
</template>

<script>
export default {
  props: ['type'],
  computed: {
    documentationLink () {
      return `https://${this.$store.state.runtimeInfo.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org/link/${this.type.toLowerCase()}`
    }
  }
}
</script>
