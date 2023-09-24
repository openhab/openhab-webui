<template>
  <f7-block>
    <p>
      <strong>Transformations</strong> are openHAB objects that convert a value or item state into different value or state.  Transformations can be used in many different instances including Links betweens Channels and Items, Rule scripts, and some Thing configurations.
    </p>
    <p>
      The different available Transformation methods must be individually installed via the <strong>Other</strong> tab of the
      <f7-link href="/addons/">
        Add-on Store
      </f7-link>
      .
    </p>
    <p>
      On these pages you can manage all the Transformations you have added to your system.
      <f7-list media-list>
        <f7-list-item title="Add new Transformations">
          Add individual Transformations using the <i class="f7-icons size-22 add-button-icon">plus_circle_fill</i> button.
        </f7-list-item>
        <f7-list-item title="Configure Items">
          Click on any Transformation in the main list to see it's configuration page
        </f7-list-item>
        <f7-list-item title="Delete Items">
          Select multiple Transformations using the top <strong>Select</strong> button and use the <strong>Remove</strong> button at the bottom or use the <span style="color: red">Remove Transform</span> button on the individual Transformation pages
        </f7-list-item>
      </f7-list>
    </p>
    <f7-link external :href="documentationLink" target="_blank" text="Open full documentation" color="blue" />
  </f7-block>
</template>

<script>
export default {
  computed: {
    documentationLink () {
      return `https://${this.$store.state.runtimeInfo.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org/link/transformations`
    }
  }
}
</script>
