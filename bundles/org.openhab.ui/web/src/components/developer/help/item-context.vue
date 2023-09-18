<template>
  <f7-block>
    <p>
      <strong>Items</strong> are openHAB's information storage and control structures.  Items can be Linked to the channels of a Thing to control and read data from a device or service. Items can also be used to store information that is just used by your openHAB system itself.
    </p>
    <p>
      On these pages you can manage all the Items you have added to your system.
      <f7-list media-list>
        <f7-list-item title="Add new Items">
          Add individual Items using the <i class="f7-icons size-22 add-button-icon">plus_circle_fill</i> button and, if needed, manually link them to Channel
        </f7-list-item>
        <f7-list-item title="Configure Items">
          Click on any Item in the main list to see it's configuration page
        </f7-list-item>
        <f7-list-item title="Delete Items">
          Select multiple Items using the top <strong>Select</strong> button and use the <strong>Remove</strong> button at the bottom or use the <span style="color: red">Remove Item</span> button on the individual Item pages
        </f7-list-item>
      </f7-list>
    </p>
  </f7-block>
</template>

<script>
export default {
}
</script>
