<template>
  <f7-block class="no-margin no-padding">
    <f7-block>
      The <strong>Semantic Model</strong> is a way for you to group and categorize your openHAB Items to provide additional real-world relationships and information about them.  openHAB can use this information to automatically generate the location, equipment, and properties tabs of the home page.
      <br><br>
      Every semantic model object (location, equipment, or point) is just a regular openHAB item with semantic tags and arranged in semantic groups. It is important to note that not all of your items need to be included in the semantic model.  For most systems it only makes sence to inlcude those items that users will interact with.
      <br><br>
      On this page you can manage your system's semantic model.
    </f7-block>
    <f7-list media-list>
      <f7-list-item title="Add new locations">
        Add group items with semantic group tags to represent physical locations in and around your home
      </f7-list-item>
      <f7-list-item title="Add new equipment">
        Add group items with semantic equipment tags to represent devices of interest to users in specific locations
      </f7-list-item>
      <f7-list-item title="Add new points">
        Add items with semantic class and property tags to represent the actual information and interactions that users will need
      </f7-list-item>
      <f7-list-item title="Bulk creation of points">
        Create equipement directly from your Things with the desired items for rapid building of a semantic model
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
      return `https://${this.$store.state.runtimeInfo.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org/docs/tutorial/model`
    }
  }
}
</script>
