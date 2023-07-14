<template>
  <div>
    <f7-block-header>
      <b style="color: var(--f7-theme-color) !important;">WARNING: Changing the internal unit can corrupt your persisted data!</b>
    </f7-block-header>
    <f7-list>
      <f7-list-input
        label="Unit"
        name="value"
        ref="value"
        type="text"
        placeholder="leave empty to use system default"
        :value="metadata.value"
        @blur="(evt) => metadata.value = evt.target.value" />
    </f7-list>
    <f7-block-footer class="param-description">
      <small>All processed values are internally normalized to the specified <code>unit</code>. The normalized value is used to propagate the value to external integrations (e.g. persistence, REST API, WebSocket) so these values will always have the specified unit and scale.
        <br>
        Changing the <code>unit</code> will change the values that these systems receive.
        <br>
        <br>
        Additionally the <code>unit</code> will be used in UIs if no unit is specified for the state description. The state description is used for display purpose only, it can contain any compatible unit and will not affect the internal <code>unit</code>.
      </small>
    </f7-block-footer>
  </div>
</template>

<script>
export default {
  props: ['itemName', 'metadata', 'namespace']
}
</script>
