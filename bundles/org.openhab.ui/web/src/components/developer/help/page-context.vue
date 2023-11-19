<template>
  <f7-block class="no-margin no-padding">
    <f7-block>
      <strong>Pages</strong> are the different MainUI presentations that you can make to present users with control over home system. The location, equipment, and properties tabs of the home page are automatically generated if you have a semantic model. All other pages, you must create for yourself.
      <br><br>
      On these pages you can manage all the Pages you have added to your system.
    </f7-block>
    <f7-list media-list>
      <f7-list-item title="Add new Pages">
        Add individual Pages of all the different types using the <i class="f7-icons size-22 add-button-icon">plus_circle_fill</i> button
      </f7-list-item>
      <f7-list-item title="Configure Pages">
        Click on any Page in the main list to see a graphical editor and a yaml code editor for that page
      </f7-list-item>
      <f7-list-item title="Delete Pages">
        Select multiple Pages using the top <strong>Select</strong> button and use the <strong>Remove</strong> buttons at the bottom
      </f7-list-item>
      <f7-list-item title="Test Pages">
        See your changes and test the page functions using the <strong>Run</strong> option in the editor
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
      return `https://${this.$store.state.runtimeInfo.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org/link/pages`
    }
  }
}
</script>
