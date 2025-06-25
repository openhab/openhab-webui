<template>
  <f7-page class="media-content" >
    <f7-navbar title="MediaBrowser" back-link="Back">
      <f7-nav-right>
        <f7-button popup-close>
          Close
        </f7-button>
      </f7-nav-right>
    </f7-navbar>

    <div style="display: flex; flex-direction: row; flex-wrap: nowrap; ">
      <div v-for="componentPath in currentPathSegments" style="padding:5px;" v-bind:key="componentPath.path">
        <f7-link :href="`/mediabrowser/?path=` + componentPath.path + `&item=` + item + `&device=` + device">
          {{ componentPath.name }}
        </f7-link> >
      </div>
    </div>
    <br>

    <div v-if="node">
      <div v-if="node.pres==='flat'">
        <div style=" display: grid;grid-template-columns: 220px 1fr;width:50%;">
          <div style="grid-column: 1;">
            <img :src="node.artUri" width="200">
          </div>
          <div style="grid-column: 2;text-align:left;">
            <p style="font-size:20pt; font-weight:bold;">
              {{ node.label }}
            </p>
            <f7-button small outline :fill="true" style="background-color:#9090c0;width: 120px;height:32px;font-weight:bold;padding:2px;padding-left:10px;text-align:left;border:none 0px;" @click="doPlay(item, node.path)" icon-material="play_arrow" large icon-size="24">
              Play
            </f7-button>
            <br>
            <f7-button small outline :fill="true" style="background-color:#9090c0;width: 120px;height:32px;font-weight:bold;padding:2px;padding-left:10px;text-align:left;border:none 0px;" @click="doEnqueue(item, node.path)"
                       icon-material="playlist_add" large icon-size="24">
              Enqueue
            </f7-button>
          </div>
          <br>
          <hr>
          <br>
        </div>
        <hr>
        <div v-for="r1 in node.childs" style="display: inline;clear:both;" :class="{ 'sheet-opened': controlsOpened }" v-bind:key="r1.path">
          <f7-link :href="`/mediabrowser/?path=` + r1.path + `&item=` + item + `&device=` + device" :data-reload="true" :reload-current="true" :reload-detail="true">
            <f7-button outline style="height:30px;font-weight:bold;padding:2px;padding-left:30px;text-align:left;border:none 0px;" @click="doPlay(item, r1.path)" icon-material="play_arrow" small icon-size="24">
              Play
            </f7-button>
            <f7-button outline style="height:30px;font-weight:bold;padding:2px;padding-left:30px;text-align:left;border:none 0px;" @click="doEnqueue(item, r1.path)" icon-material="playlist_add" small icon-size="24">
              Enqueue
            </f7-button>
            <div style="padding-left:30px;color:black">
              {{ r1.label }}
            </div>
          </f7-link>
          <br>
        </div>
        <br>
      </div>
      <div v-else>
        <div v-for="r1 in node.childs" style="width:200px;height:200px;position:relative;float:left;margin:20px;background-color:#ffffff;color:#000000;border:solid 1px;border-radius:10px;padding:10px;" v-bind:key="r1.path">
          <f7-link :href="`/mediabrowser/?path=` + r1.path + `&item=` + item + `&device=` + device">
            <div id="container" style="position:relative">
              <div style="text-align:center;position:absolute;top:-10px;width:200px;">
                {{ r1.label }}
              </div>
              <div style="text-align:center;width:200px;position:absolute;top:10px;">
                <img width="160" height="160" :src="r1.artUri">
              </div>
            </div>
          </f7-link>
        </div>
      </div>
    </div>

    <f7-toolbar bottom style="min-height: 150px;padding:0px;margin:0px;">
      <div v-if="false" style="display: flex; align-items: center; justify-content:left;padding:0px;margin:0px;">
          <div style="margin:0px;padding:0px;">
            <img src="/static/Heos.png" style="width: 150px; height: 150px; margin:0px;padding:0px;" />
          </div>
          <div></div>
          <div style="width:300px;padding:50px;">
            <b>Title</b><br/>
            Artists<br/>
          </div>
          <div>
            <div>
              <div style="width:300px;height:30px;padding:20px;padding-left: 140px;">
                <oh-simple-player-controls />
              </div>
            </div>
            <div style="display: flex; padding:20px;">
              <div style="padding-right:20px;">3.50</div>
              <div style="width:500px;"><f7-range ref="rangeslider" class="oh-slider" v-bind="config" :min="0" :max="100" :step="1" :value="10" /> </div>
              <div style="padding-left:20px;">4.42</div>
            </div>
          </div>
          <div style="width:200px;">
          </div>
          <div style="width:400px;height:150px;padding:0px;display: flex; align-items: center; justify-content:left;">
            <f7-button icon-material="speaker" outline style="height:40px;font-weight:bold;padding:2px;padding-right:30px;text-align:left;border:none 0px;" large icon-size="36"/>
            <f7-range ref="rangeslider" class="oh-slider" v-bind="config" :min="0" :max="100" :step="1" :value="10" /> 
          </div>
      </div>
    </f7-toolbar>
  </f7-page>
</template>

<script>
import OhSimplePlayerControls from '../../components/widgets/system/oh-simple-player-controls.vue'

export default {
  name: 'MediaBrowser',
  props: {
  },
  components: {
    OhSimplePlayerControls,
  }, 
  data () {
    this.item = this.$f7route.query.item
    this.device = this.$f7route.query.device
    console.log('MediaBrowser item: ' + this.item)

    this.$f7.toast.create({
      text: this.$t('media.page.updated'),
      destroyOnClose: true,
      closeTimeout: 2000
    }).open()

   
    this.$store.commit('setMapping', { key: 'Root', value: 'Racine'} );
    this.$store.commit('setMapping', { key: 'g', value: 'Genres'} );
    this.$store.commit('setMapping', { key: 'l', value: 'Albums'} );
    this.$store.commit('setMapping', { key: 'a', value: 'Artistes'} );
    this.$store.commit('setMapping', { key: 'm', value: 'Dossiers'} );
    this.$store.commit('setMapping', { key: 'n', value: 'New'} );
    this.$store.commit('setMapping', { key: 'y', value: 'Année'} );
    this.$store.commit('setMapping', { key: 't', value: 'Titres'} );
    this.$store.commit('setMapping', { key: 'Root', value: 'Racine'} );
    
    this.path = '/Root'
    //        this.path='/Root/Spotify/Playlists/spotify:playlist:5Z4AD0u9fwnvtsj7ce5ZLS';

    if (this.$f7route.query.path && !this.$f7route.query.path.startsWith('/page/')) {
      this.path = this.$f7route.query.path
    }

    console.log('MediaBrowser path: ' + this.path)

    this.$oh.api.get('/rest/media/sources?path=' + this.path).then((data) => {
      console.log('Data')
      this.node = data 
      this.node.pres = 'thumb'

      var idForMap = data.id;
      if (idForMap.endsWith('/t') ||
      idForMap.endsWith('/a') || idForMap.endsWith('/l') || idForMap.endsWith('/g') || idForMap.endsWith('/m') || idForMap.endsWith('/n')) {
        idForMap = idForMap.substring(0, idForMap.length - 2)
      }
      this.$store.commit('setMapping', { key: idForMap, value: data.label } );
    
      for (let i = 0; i < data.childs.length; i++) {
        const child = data.childs[i]
        //console.log('Child: ' + child.path + ' - ' + child.id + ' - ' + child.label)
        //this.mapping[child.id] = child.label
      }
      if (this.node.type === 'org.openhab.core.media.model.MediaAlbum') { this.node.pres = 'flat' }
      if (this.node.type === 'org.openhab.core.media.model.MediaPlayList') { this.node.pres = 'flat' }
      if (this.node.type === 'org.openhab.core.media.model.MediaCollection' && this.containsTrack(data)) { this.node.pres = 'flat' }
      if (this.node.label === 'TopTracks') { this.node.pres = 'flat' }

      console.log("========================================")
      Object.entries(this.$store.state.media.mappings).forEach(([key, value]) => {
        console.log(`Key: ${key}, Value: ${value}`);
      });
      console.log("========================================")
    
    })
 
    

    return {
      node: this.node,
      controlsOpened: true,
      item: this.item,
      device: this.device
    }
  },
  computed: {
    
    currentRoute () {
      let res = ''
      if (this.$f7router && this.$f7router.currentRoute) {
        res = this.$f7router.currentRoute.path
      }
      if (res === undefined) {
        res = ''
      }
      return res
    },
    currentPath () {
      return this.$f7route.query.path || ''
    },
    currentPathSegments () {
      const path = this.$f7route.query.path || '/Root'

      const segments = path.split('/')
      console.log('path:' + path)
      console.log('segs:' + segments)

      const result = segments.map((segment, index) => {
      if (this.$store.state.media.mappings[segment]) {
        name = this.$store.state.media.mappings[segment]
      } else {
        name = segment
      }
        
        return {
          path: segments.slice(0, index + 1).join('/'),
          name: name
        }
      })

      console.log('result:' + result)
      return result
    }

  },
  methods: {
    onClose () {
    },
    doPlay (item, id) {
      console.log('Playing item: ' + item + ' with id: ' + id)
      this.$store.dispatch('sendCommand', { itemName: item, cmd: 'NONE,PLAY,' + id + ',' + this.device + ',NONE' })
    },
    doEnqueue (item, id) {
      this.$store.dispatch('sendCommand', { itemName: item, cmd: 'NONE,ENQUEUE,' + id + ',' + this.device + ',NONE' })
    },
    containsTrack (data) {
      return data.childs.every((child) => {
        console.log('child:' + child.type);
        return child.type === 'org.openhab.core.media.model.MediaTrack'
      })
    }
  },
  created () {
  },
  mounted () {
  }

}
</script>
