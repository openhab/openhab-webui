<template>
  <f7-page class="media-content">
    <f7-navbar title="MediaDeviceSelector" back-link="Back">
      <f7-nav-right>
        <f7-button popup-close>
          Close
        </f7-button>
      </f7-nav-right>
    </f7-navbar>
     <f7-link href="/mediadeviceselector/?path=/Root">Root</f7-link>
     <br/>
     <br/>

     <h3>Media Device Selector</h3>

     {{ node}}


	   


    
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

      this.$oh.api.get(`/rest/media/sinks`).then((data) => {
        console.log("Data:" + data);
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
