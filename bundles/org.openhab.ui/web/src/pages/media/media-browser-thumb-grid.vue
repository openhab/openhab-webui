<template>
  <div style="width:100%">
    <div style="width:300px;background-color: #c0c0c0;font-weight: bolder;font-size: 16pt;">
      {{ title  }}
    </div>
    <br/>
    <div v-for="child in items.slice(0,14)" style="width:200px;height:200px;position:relative;float:left;margin:20px;background-color:#ffffff;color:#000000;border:solid 1px;border-radius:10px;padding:10px;" v-bind:key="child.path">
      <f7-link :href="`/mediabrowser/?path=` + child.path + `&item=` + item + `&device=` + device">
        <div id="container" style="position:relative">
          <div style="text-align:center;position:absolute;top:-10px;width:200px;">
            {{ child.label }}
          </div>
          <div style="text-align:center;width:200px;position:absolute;top:10px;">
            <img width="160" height="160" :src="child.artUri">
          </div>
        </div>
      </f7-link>
    </div>
    -->
  </div>
</template>

<script>
export default {
  name: 'MediaBrowserThumbGrid',
  props: {
    title: {
      type: String,
      required: true
    },
    item: {
      type: String,
      required: true
    },
    device: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    }
  }
}
</script>