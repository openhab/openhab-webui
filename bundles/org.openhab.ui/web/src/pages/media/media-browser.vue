<template>
  <f7-page class="media-content">
    <f7-navbar title="MediaBrowser" back-link="Back">
      <f7-nav-right>
        <f7-button popup-close>
          Close
        </f7-button>
      </f7-nav-right>
    </f7-navbar>
     <f7-link href="/mediabrowser/?path=/Root">Root</f7-link>
     <br/>
     <br/>
	   

    {{  currentRoute }}
    <br/>
    {{  currentPath }}
    <br/>
    {{  this.path }}
    <br/>
    
    <br/>
    
    <div v-if="node">
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
              <br/>
              <hr/>
              <br/>
              <div v-for="r1 in node.childs" style="display: inline;clear:both;" :class="{ 'sheet-opened': controlsOpened }">
	                <f7-link :href="`/mediabrowser/?path=` + r1.path" :data-reload="true" :reload-current="true" :reload-detail="true">
                      <f7-button small outline style="height:40px;font-weight:bold;padding:2px;padding-left:10px;text-align:left;border:none 0px;"  @click="doPlay(item, r1.id)">
                          <img src="/static/Arrow.png" style="vertical-align:middle" height=24/>
	                          {{ r1.label }}
	                    </f7-button>
	                </f7-link>
	                <br/>
              </div>
          </div>
          <hr/>
          <br/>
      </div>
      <div v-else>
        <div v-for="r1 in node.childs" style="width:200px;height:200px;position:relative;float:left;margin:20px;background-color:#ffffff;color:#000000;border:solid 1px;border-radius:10px;padding:10px;">
            <f7-link :href="`/mediabrowser/?path=` + r1.path + `&item=` + item">
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


<script>
export default {
  name: 'MediaBrowser',
  props: {
  },
  data () {
      this.item = this.$f7route.query.item;
      if (this.$f7route.query.item !== '') {
          this.item = this.$f7route.query.item;
      }
      console.log("MediaBrowser item: " + this.item);


      this.$f7.toast.create({
          text: this.$t('media.page.updated'),
          destroyOnClose: true,
          closeTimeout: 2000
        }).open();

      this.path='/Root';  
      
      if (this.$f7route.query.path && !this.$f7route.query.path.startsWith('/page/')) {
          this.path=this.$f7route.query.path;
      }
      
      console.log("MediaBrowser path: " + this.path);

      this.$oh.api.get(`/rest/media/sources?path=` + this.path).then((data) => {
        console.log("Data");
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
          controlsOpened: true,
          item: this.item
      };
  },
  computed: {
    currentRoute() {
      var res='';
      if (this.$f7router && this.$f7router.currentRoute) {
        res = this.$f7router.currentRoute.path;
      }
      if (res===undefined) {
        res= '';
      }
      return res;
    },
    currentPath() {
      return this.$f7route.query.path || '';
    }

  },
  methods: {
    onClose () { 
    },
    doPlay (item, id) {
        console.log("Playing item: " + item + " with id: " + id);
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
