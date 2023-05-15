<template>
  <div>
    <f7-block-header>
      <b style="color: var(--f7-theme-color) !important;">WARNING: Changing the internal unit can corrupt your persisted data!</b>
    </f7-block-header>
    <f7-list>
      <f7-list-input
        label="Internal Unit"
        name="value"
        ref="value"
        type="text"
        placeholder="leave empty to use system default"
        :value="metadata.value"
        @blur="(evt) => metadata.value = evt.target.value" />
    </f7-list>
    <f7-block-footer class="param-description">
      <small>Unit used internally, e.g. in events and for persistence.<br>The unit of the item is independent of the state description. The state description is used for display purposes only, it can contain any compatible unit and will not affect the internal unit.</small>
    </f7-block-footer>
  </div>
</template>

<script>
export default {
  props: ['itemName', 'metadata', 'namespace']
}
</script>
