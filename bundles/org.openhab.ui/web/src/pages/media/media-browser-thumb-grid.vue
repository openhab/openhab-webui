<template>
  <div style="width:100%">
    <div style="width:95%;padding:5px;margin:10px;background-color: #c0c0c0;font-weight: bolder;font-size: 16pt;">
      {{ title }}
    </div>
    <br>
    <div style="width: 100%;">
      <div v-for="child in items.slice(0,7)" style="width:200px;height:200px;position:relative;float:left;margin:20px;background-color:#ffffff;color:#000000;border:solid 1px;border-radius:10px;padding:10px;" :key="child.path">
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
    </div>
    <div style="clear: both;width: 100%;text-align: center;">
      <f7-link :href="`/mediabrowser/?path=/Root/Spotify/Search/` + type + `&item=` + item + `&device=` + device">
        Display More
      </f7-link>
    </div>
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
    },
    type: {
      type: String,
      required: true
    }
  }
}
</script>
