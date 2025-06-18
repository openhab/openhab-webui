<template>
  <f7-page class="media-content">
    <f7-navbar :title="MediaBrowser" :back-link="Back">
      <f7-nav-right>
        <f7-button popup-close>
          Close
        </f7-button>
      </f7-nav-right>
      
    </f7-navbar>
    CurrnetPath : {{ currentPath }}
    <br/>
    CurrnetParam : {{ currentParam }}
    <br/>
    <br/>
    <br/>


    <a href="/mediabrowser/?path=/Folder1">Folder1</a><br/><br/>
    <a href="/mediabrowser/?path=/Folder2">Folder2</a><br/><br/>

    <div v-if="currentPath==='/Folder1'">
        Content Folder1
    </div>
    <div v-if="currentPath==='/Folder2'">
        Content Folder2
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
     baseUrl: { 
      type: String,
      default: "/mediabrowser"
    }
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
