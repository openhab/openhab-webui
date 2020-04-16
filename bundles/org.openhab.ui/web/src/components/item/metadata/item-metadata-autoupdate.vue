<template>
  <div>
    <f7-list>
      <f7-list-item title="Force auto-update">
        <f7-toggle slot="after" name="autoupdate" :checked="typeof (metadata.value) === 'string' ? metadata.value === 'true' : metadata.value"
          @toggle:change="(ev) => metadata.value = ev"></f7-toggle>
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="param-description">
      <small>Force the state to auto-update on command.</small>
    </f7-block-footer>
  </div>
</template>

<script>
export default {
  props: ['itemName', 'metadata', 'namespace']
}
</script>
