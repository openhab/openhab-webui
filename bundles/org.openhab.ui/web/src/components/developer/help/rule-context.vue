<template>
  <f7-block>
    <p>
      <strong>Rules</strong> are the heart of home automation.  They allow openHAB to respond to different events with automatic reactions. Rules can be a simple as a directive to turn on a single light at a given time but full scripting languages also allow for more complex reactions. Scenes, Scripts, and Schedules are all special types of rules.
    </p>
    <p>
      Community made Rule Templates can also be added to your system from the <strong>Automation</strong> tab of the Add-on Store.
    </p>
    <p>
      On these pages you can manage all the basic Rules you have added to your system.
      <f7-list media-list>
        <f7-list-item title="Add new Rules">
          Add Rules using the <i class="f7-icons size-22 add-button-icon">plus_circle_fill</i> button
        </f7-list-item>
        <f7-list-item title="Configure Rules">
          Click on any Rule in the main list to configure the rule or write a script action for the rule
        </f7-list-item>
        <f7-list-item title="Delete Rules">
          Select multiple Pages using the top <strong>Select</strong> button and use the <strong>Remove</strong> button at the bottom or use the <span style="color: red">Remove Rule</span> button on the individual Rule pages 
        </f7-list-item>
        <f7-list-item title="Enable/Disable Rules">
          Select multiple Rules using the top <strong>Select</strong> button and use the <strong>Enable</strong> or <strong>Disable</strong> buttons at the bottom or use the <i class="f7-icons size-22">play_circle</i> and <i class="f7-icons size-22">pause_circle</i> buttons on the individual Rule pages
        </f7-list-item>
        <f7-list-item title="Manually run Rules">
          Use the <i class="f7-icons size-22">play</i> button on the individual Rule pages to have the rule run all actions immediately
        </f7-list-item>
      </f7-list>
    </p>
  </f7-block>
</template>

<script>
export default {
}
</script>
