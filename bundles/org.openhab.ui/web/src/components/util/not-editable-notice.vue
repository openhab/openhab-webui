<template>
  <f7-block>
    <f7-block-footer class="no-margin">
      <f7-icon f7="lock_fill" size="12" color="gray" />&nbsp;Note: This {{ subject }} is not editable because it has been provisioned from a
      file.
    </f7-block-footer>
  </f7-block>
</template>

<script>
export default {
  props: {
    subject: {
      type: String,
      default: 'page'
    }
  }
}
</script>
