<template>
  <f7-page class="media-content">
    <f7-navbar :title="$t('media.title')" :back-link="$t('media.back')">
      <f7-nav-right>
      </f7-nav-right>
    </f7-navbar>



    
    <a href="/mediabrowser/?path=/Root">Registry</a><br/><br/>

    <div v-if="node">
    {{ node.type }}
    <br/>
    {{ node.pres }}
    <br/>
    {{ node.path }}
    <br/>
    <br/>
    
    
     
    <div v-if="node.pres==='flat'">
        <div style=" display: grid;grid-template-columns: 220px 1fr;width:50%;"> 
            <div style="grid-column: 1;"> 
                <img :src="node.artUri" width="200"/>
            </div>
            <div style="grid-column: 2;text-align:left;">
                <p style="font-size:20pt; font-weight:bold;"> {{ node.label }}</p>
                 <f7-button small outline :fill="true" style="background-color:#9090ff;width: 120px;height:32px;font-weight:bold;padding:2px;padding-left:10px;text-align:left;border:none 0px;"  @click="doPlay(item, node.path)">
                    <img src="/static/Arrow.png" style="vertical-align:middle" height=24/>&nbsp;&nbsp;&nbsp;&nbsp;PLAY
                 </f7-button>
                 <f7-button small outline :fill="true" style="background-color:#9090ff;width: 120px;height:32px;font-weight:bold;padding:2px;padding-left:10px;text-align:left;border:none 0px;"  @click="doEnqueue(item, node.path)">
                    <img src="/static/Arrow.png" style="vertical-align:middle" height=24/>&nbsp;&nbsp;&nbsp;&nbsp;ENQUEUE
                 </f7-button>
                           
            </div>
        </div>
        <hr/>
        <br/>
        <div v-for="r1 in node.childs" style="display: inline;clear:both;" :class="{ 'sheet-opened': controlsOpened }">
	        <f7-link :href="`/mediabrowser/?path=` + r1.path + `&item=` + item" :data-reload="true" :reload-current="true" :reload-detail="true">
                 <f7-button small outline style="height:40px;font-weight:bold;padding:2px;padding-left:10px;text-align:left;border:none 0px;"  @click="doPlay(item, r1.path)">
                    <img src="/static/Arrow.png" style="vertical-align:middle" height=24/>
	                {{ r1.label }}
	                </f7-button>
	        </f7-link>
	        <br/>
        </div>
    </div>
    <div v-else>
	    <div v-for="r1 in node.childs" style="width:200px;height:200px;position:relative;float:left;margin:20px;background-color:#ffffff;color:#000000;border:solid 1px;border-radius:10px;padding:10px;" :class="{ 'sheet-opened': controlsOpened }">
	        <f7-link :href="`/mediabrowser/?path=` + r1.path + `&item=` + item" :data-reload="true" :reload-current="true" :reload-detail="true">
	            <div id="container" style="position:relative">
	            <div style="text-align:center;position:absolute;top:-10px;width:200px;">
	                {{ r1.label }}
	            </div>
	            <div style="text-align:center;width:200px;position:absolute;top:10px;">
	                <img width=160 height=160 :src="r1.artUri">
	            </div>
	            </div>
	        </f7-link>
	        <br/>
	    </div>
    </div>
    </div>
    
    <f7-toolbar bottom>
      <span />
    </f7-toolbar>

  </f7-page>
</template>

<style lang="stylus">
:root {
    --f7-popup-tablet-width: 80%;
    --f7-popup-tablet-height: 1000px;
}
.media-controls
  --f7-theme-color var(--f7-color-blue)
  --f7-theme-color-rgb var(--f7-color-blue-rgb)
  --f7-theme-color-tint var(--f7-color-blue-tint)
  z-index 11000
.md .media-controls .toolbar .link
  width 28%
</style>

<script>
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { loadLocaleMessages } from '@/js/i18n'
import api from '@/js/openhab/api'  

export default {
  components: {
    EmptyStatePlaceholder
  },
  data () {
      this.item = this.$f7route.query.item;
      if (this.$f7route.query.item === '') {
          
      }
      this.$f7.toast.create({
          text: this.$t('media.page.updated'),
          destroyOnClose: true,
          closeTimeout: 2000
        }).open();

      this.path='/Root';
      if (this.$f7route.query.path) {
          this.path=this.$f7route.query.path;
      }
      
      api.get(`/rest/media/sources?path=` + this.path).then((data) => {
          this.node = data;
          this.node.pres="thumb";
          if (this.node.type === 'org.openhab.core.media.model.MediaAlbum')
              this.node.pres="flat";
          if (this.node.type === 'org.openhab.core.media.model.MediaPlayList')
              this.node.pres="flat";
          
          if (this.node.label === 'TopTracks')
              this.node.pres="flat";
              
      });
      
      
    
      
      
      
      
      return {
          node: this.node,
          controlsOpened: false
      };

      
      //this.dataObj="aaaaaa";
      
      
  },
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/media'))
  },

  computed: {
  },
  methods: {
    onClose () {
      this.controlsOpened = false
    },
    openControls () {
      this.controlsOpened = true
      alert(this.$f7route.query.items);
      if (this.$f7route.query.items === '') {
      
      }
    },
    doPlay (item, id) {
        this.$store.dispatch('sendCommand', { itemName: item, cmd: "PLAY," + id });
      },
      doEnqueue (item, id) {
          this.$store.dispatch('sendCommand', { itemName: item, cmd: "ENQUEUE," + id });
        },
  },
  created () {
  },
  mounted () {
  }
}
</script>
