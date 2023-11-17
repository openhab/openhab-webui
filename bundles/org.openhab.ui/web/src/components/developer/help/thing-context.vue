<template>
  <f7-block class="no-margin no-padding">
    <f7-block>
      <strong>Things</strong> are the openHAB structures that represent individual devices or services.  The Things that you can add to your system are determined by the bindings that you have installed.
      <br><br>
      On these pages you can manage all the Things you have added to your system.
    </f7-block>
    <f7-list media-list>
      <f7-list-item title="Add new Things">
        Use the Thing Inbox to scan for available things or manually add ones that cannot be found automatically
      </f7-list-item>
      <f7-list-item title="Configure Things">
        Click on any Thing in the main list to see it's configuration page
      </f7-list-item>
      <f7-list-item title="Delete Things">
        Select multiple Things using the top <strong>Select</strong> button and use the <strong>Remove</strong> buttons at the bottom or use the <span style="color: red">Delete Thing</span> button on the individual Things pages
      </f7-list-item>
      <f7-list-item title="Enable/Disable Things">
        Select multiple Things using the top <strong>Select</strong> button and use the <strong>Enable</strong> or <strong>Disable</strong> buttons at the bottom or use the <i class="f7-icons size-22">play_circle</i> and <i class="f7-icons size-22">pause_circle</i> buttons on the individual Things pages
      </f7-list-item>
    </f7-list>
    <f7-block>
      <f7-link external :href="documentationLink" target="_blank" text="Open full documentation" color="blue" />
    </f7-block>
  </f7-block>
</template>

<script>
export default {
  computed: {
    documentationLink () {
      return `https://${this.$store.state.runtimeInfo.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org/link/thing`
    }
  }
}
</script>
