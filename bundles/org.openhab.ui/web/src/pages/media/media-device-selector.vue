<template>
  <f7-page class="media-content">
    <f7-navbar title="MediaDeviceSelector">
      <f7-nav-right>
        <f7-button popup-close>
          Close
        </f7-button>
      </f7-nav-right>
    </f7-navbar>

    <div v-if="node">
       <f7-list form>
            <f7-list-item v-for="item in node.childs" :title="item.name + ` (` + item.type + `) `" :key="item.id" :value="item"  radio :checked="selectedOption!=null ? selectedOption.key === item.key:false"
              @change="selectedOption = item" :name="'options-group'" />
        </f7-list>
    </div>


  <f7-toolbar bottom>
    <div style="display: flex; width: 100%; align-items: center;">
    <div style="margin-left: auto;">
        <f7-button @click="changeDevice()" popup-close >
          Pick
        </f7-button>
        </div>
        </div>
    </f7-toolbar>





  </f7-page>
</template>


<script>
export default {
  name: 'MediaBrowser',
    props: ['title',  'multiple' , 'name', 'value', 'required'], 
  data () {
      this.item = this.$f7route.query.item;
      console.log("MediaDeviceSelector item: " + this.item);


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
          item: this.item,
          ready:true,
          selectedOption: this.selectedOption
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
      console.log("Selected option: " + this.selectedOption);
    },
    changeDevice () { 
      console.log("Selected option: " + this.selectedOption);
      console.log("Selected option: " + this.selectedOption.id);
      this.$store.dispatch('sendCommand', { itemName: this.item, cmd: "DEVICE,," + this.selectedOption.id});
    },
    select (e) {
      console.log("Selected option: " + this.selectedOption);
      /*
      this.$f7.input.validateInputs(this.$refs.smartSelect.$el)
      const value = this.$refs.smartSelect.f7SmartSelect.getValue()
      this.$emit('input', value)
      if (!this.multiple) this.$emit('itemSelected', this.preparedItems.find((i) => i.name === value))
      */
    }, 
  },
  created () {
  },
  mounted () {
  }
  
}
</script>
