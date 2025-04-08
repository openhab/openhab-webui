<template>
  <f7-page class="media-content">
    <f7-navbar :title="$t('media.title')" :back-link="$t('media.back')">
      <f7-nav-right>
      </f7-nav-right>
    </f7-navbar>



    
    <a href="/mediabrowser/?path=/Root">Registry</a><br/><br/>
    
    <div v-for="r1 in array1" style="width:200px;height:200px;float:left;margin:20px;background-color:#ffffff;color:#000000;border:solid 1px;border-radius:10px;padding:10px;" :class="{ 'sheet-opened': controlsOpened }">
        <f7-link :href="`/mediabrowser/?path=` + r1.path" :text="r1.label" :data-reload="true" :reload-current="true" :reload-detail="true">
            <img width=160 :src="r1.artUri">
        </f7-link>
        <br/>
    </div>
    
    <f7-toolbar bottom>
      <span />
    </f7-toolbar>

  </f7-page>
</template>

<style lang="stylus">
.analyzer-controls
  --f7-theme-color var(--f7-color-blue)
  --f7-theme-color-rgb var(--f7-color-blue-rgb)
  --f7-theme-color-tint var(--f7-color-blue-tint)
  z-index 11000
.md .analyzer-controls .toolbar .link
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
      api.get(`/rest/items/MediaTest1`).then((data) => {
          this.dataTest = data.label;          
      });
      
      
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
          this.array1=data;
      });
      
    
      
      
      
      
      return {
          array1: this. array1,
          dataTest: this.dataTest,
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
    },
    doIt (type) {
        alert(type);  
      },
  },
  created () {
  },
  mounted () {
  }
}
</script>
