<template>
  <f7-page @page:init="onPageInit">
    <f7-navbar title="MediaBrowser" back-link="Back" style="min-height:50px;">
      <f7-nav-right>
        <f7-button popup-close>
          Close
        </f7-button>
      </f7-nav-right>
    </f7-navbar>

    <div class="page-content infinite-scroll-content" infinite :infinite-distance="50" :infinite-preloader="showPreloader" @infinite="loadMore" style="margin-top:10px;padding:0px;height:calc(100vh - 50px - 150px);">
      <div v-if="node">
        
        <!--
        Display a navigation bar to navigate media hierarchy.
        -->
        <div style="display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: space-between; align-items: center;">
          <div style="display: flex; flex-direction: row; flex-wrap: nowrap;">
            <div v-for="componentPath in currentPathSegments" style="padding:5px;" :key="componentPath.path">
              <f7-link :href="`/mediabrowser/?path=` + componentPath.path" :route-props="{ mediaBrowserMode }">
                {{ componentPath.name }}
              </f7-link> >
            </div>
          </div>


          <div style="padding:5px; border:0px;">
            <f7-searchbar
              :customSearch="true"
              placeholder="Rechercher..."
              :clear-button="true"
              :disable-button="false"
              @searchbar:search="onSearch"
              @searchbar:clear="onClear"
              style="width:400px;border:solid 1px #000000;border-radius:10px;" />
          </div>
        </div>
    <br/>

    <table style="border:solid 1px #000000;background-color:#ffffff;color:#303030;display:inline-block;margin:20px;padding:0px;">
      <tbody>
      <tr style="font-weight: bold;background-color: #c0c0c0;">
        <td>mediaBrowserMode</td>
        <td>globalPlayerItem</td>
        <td>playerItem</td>
        <td>volume</td>
        <td>artistName</td>
        <td>trackName</td>
        <td>trackPosition</td>
        <td>trackDuration</td>
        <td>trackPosition%</td>
        <td>artUri</td>
      </tr>
      <tr>
        
        <td nowrap>{{ currentMediaBrowserMode }}</td>
        <td nowrap>{{ currentGlobalPlayerItem }}</td>
        <td nowrap>{{ currentPlayerItem }}</td>
        <td nowrap>{{ volume }}</td>
        <td nowrap>{{ artistName }}</td>
        <td nowrap>{{ trackName }}</td>
        <td nowrap>{{ formatTime(trackPosition) }}</td>
        <td nowrap>{{ formatTime(trackDuration) }}</td>
        <td nowrap>{{ trackPositionPourcent }}</td>
        <td nowrap>{{ artUri }}</td>
        
      </tr>
      </tbody>
    </table>

        
        

        
        <!--
        Flat presentation for Album, Playlist:
        Display a header with the cover, title, Play and enqueue buttons
        and then a list of tracks or items in the collection.
        -->
        <div v-if="node.pres==='flat'">
          <!-- Headers -->
          <div style=" display: grid;grid-template-columns: 220px 1fr;width:50%;">
            <div style="grid-column: 1;">
              <img :src="node.artUri" width="200">
            </div>
            <div style="grid-column: 2;text-align:left;">
              <p style="font-size:20pt; font-weight:bold;">
                {{ node.label }}
              </p>
              <f7-button small outline :fill="true" style="background-color:#9090c0;width: 120px;height:32px;font-weight:bold;padding:2px;padding-left:10px;text-align:left;border:none 0px;" @click="doPlay(currentPlayerItem, node.path)" icon-material="play_arrow" large icon-size="24">
                Play
              </f7-button>
              <br>
              <f7-button small outline :fill="true" style="background-color:#9090c0;width: 120px;height:32px;font-weight:bold;padding:2px;padding-left:10px;text-align:left;border:none 0px;" @click="doEnqueue(currentPlayerItem, node.path)"
                         icon-material="playlist_add" large icon-size="24">
                Enqueue
              </f7-button>
            </div>
            <br>
            <hr>
            <br>
          </div>
          <hr>
        </div>
        <div v-if="node.pres==='flat'">
          <!-- Track list -->
          <div v-for="child in items" style="display: inline;clear:both;" :class="{ 'sheet-opened': controlsOpened }" :key="child.path">
              <f7-link :href="`/mediabrowser/?path=` + child.path + `&item=` + item + `&device=` + device" :data-reload="true" :reload-current="true" :reload-detail="true">
                <f7-button outline style="height:30px;font-weight:bold;padding:2px;padding-left:30px;text-align:left;border:none 0px;" @click="doPlay(currentPlayerItem, child.path)" icon-material="play_arrow" small icon-size="24">
                  Play
                </f7-button>
                <f7-button outline style="height:30px;font-weight:bold;padding:2px;padding-left:30px;text-align:left;border:none 0px;" @click="doEnqueue(currentPlayerItem, child.path)" icon-material="playlist_add" small icon-size="24">
                  Enqueue
                </f7-button>
                <div style="padding-left:30px;color:black">
                  {{ child.label }}
                </div>
              </f7-link>
            <br>
          </div>
          <br>
        </div>
        <div v-else-if="node.pres==='queue'">
          <!-- Track list -->
          <div v-for="(child,index) in items" style="display: inline;clear:both;" :class="{ 'sheet-opened': controlsOpened }" :key="child.path">
              <f7-link :href="`/mediabrowser/?path=` + child.path + `&item=` + item + `&device=` + device" :data-reload="true" :reload-current="true" :reload-detail="true">
                <div style="padding-left:30px;width:20px;color:black;font-weight:bold;font-size:14pt;">
                  {{ index + 1  }}
                </div>

                <div v-if="index==1" style="width:50px;padding-left:20px;">
                    <img src="@/images/hp.gif" style="padding-left:15px;width:24px;"/>
                </div>
                <div v-else-if="index!=1" style="width:50px;padding-left:20px;">
                  <f7-button outline style="height:30px;font-weight:bold;text-align:left;border:none 0px;" @click="doPlay(currentPlayerItem, child.path)" icon-material="play_arrow" small icon-size="24"/>
                </div>

                <div style="padding-left:30px;width:120px;color:black">
                  <img :src="child.artUri" width="50px"></img>
                </div>
                <div style="padding-left:30px;width:400px;color:black">
                  {{ child.label }}
                </div>
                <div style="padding-left:30px;width:300px;color:black">
                  {{ child.complement }}
                </div>
              </f7-link>
            <br>
          </div>
          <br>
        </div>
        <!-- Search Handling -->
        <div v-else-if="node.pres==='search'" style="display: flex; flex-direction: column; flex-wrap: nowrap; justify-content: space-between; align-items: center; justify-content:left;padding:0px;margin:0px;">
          <MediaBrowserThumbGrid title="Album" :items="node.childs[0].childs" :playerItem="this.currentPlayerItem" type="Albums" />
          <MediaBrowserThumbGrid title="Artist" :items="node.childs[1].childs" :playerItem="this.currentPlayerItem" type="Artists" />
          <MediaBrowserThumbGrid title="Playlist" :items="node.childs[2].childs" :playerItem="this.currentPlayerItem" type="Playlists" />
          <MediaBrowserThumbGrid title="Track" :items="node.childs[3].childs" :playerItem="this.currentPlayerItem" type="Tracks" />
          <MediaBrowserThumbGrid title="Episodes" :items="node.childs[4].childs" :playerItem="this.currentPlayerItem"  type="Episodes" />
          <MediaBrowserThumbGrid title="Audiobooks" :items="node.childs[5].childs" :playerItem="this.currentPlayerItem" type="Audiobooks" />
          <MediaBrowserThumbGrid title="Podcasts" :items="node.childs[6].childs" :playerItem="this.currentPlayerItem" type="Podcasts" />
        </div>
        <!--
        Thumb presentation for Collection (Albums, Artists lists)
        Display a thumbnail for each entry with the coverArt and title,
        -->
        <div v-else>
          <div v-for="child in items" style="width:200px;height:200px;position:relative;float:left;margin:20px;background-color:#ffffff;color:#000000;border:solid 1px;border-radius:10px;padding:10px;" :key="child.path">
            <f7-link :href="`/mediabrowser/?path=` + child.path" :route-props="{ mediaBrowserMode }">
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
      </div>
    </div>

    <f7-toolbar v-if="displayPlayer" bottom style="min-height: 150px;padding:0px;margin:0px;">
      <div v-if="true" style="display: flex; align-items: center; justify-content:left;padding:0px;margin:0px;">
        <div style="margin:0px;padding:0px;">
          <img :src="artUri" style="width: 150px; height: 150px; margin:0px;padding:0px;">
        </div>
        <div />
        <div style="width:300px;padding:50px;">
          <b> {{ trackName }} </b><br>
           {{ artistName  }} <br>
        </div>
        <div>
          <!--
          =============================================
          Player controls
          =============================================
          -->
          <div>
            <div style="width:300px;padding:20px;padding-left: 140px;">
              <oh-simple-player-controls :f7route="f7route" :f7router="f7router"/>
            </div>
          </div>
          <!--
          =============================================
          Tack position slider
          =============================================
          -->
          <div style="display: flex; padding:20px;">
            <div style="padding-right:20px;">
               {{ formatTime(trackPosition)  }}
            </div>
            <div style="width:500px;">
              <f7-range ref="rangeslider" class="oh-slider" :min="0" :max="100" :step="1" :value="trackPositionPourcent" :key="trackPositionPourcent"  />
            </div>
            <div style="padding-left:20px;">
               {{ formatTime(trackDuration) }}
            </div>
          </div>
        </div>
        <div style="width:200px;" />
        <!--
          =============================================
          Volume slider
          =============================================
        -->
        <div style="width:400px;height:150px;padding:0px;display: flex; align-items: center; justify-content:left;">
          <f7-button icon-material="speaker" outline style="height:40px;font-weight:bold;padding:2px;padding-right:30px;text-align:left;border:none 0px;" large icon-size="36" />
          <f7-range ref="volumesSlider" class="oh-slider" :min="0" :max="100" :step="1"  :value="volume" @range:changed="onVolumeChange" />
          <br/>
          <div style="padding-left:30px;width:50px">
            {{ volume }}  %
          </div>
        </div>
      </div>
    </f7-toolbar>
  </f7-page>
</template>

<script>
import OhSimplePlayerControls from '../../components/widgets/system/oh-simple-player-controls.vue'

import MediaBrowserThumbGrid from './media-browser-thumb-grid.vue'
import mixin from '@/components/widgets/widget-mixin' 
import { useStore } from 'vuex'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useMediaStore } from '@/js/stores/useMediaStore'
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { p } from '@/assets/definitions/widgets/helpers'
import { loadLocaleMessages } from '@/js/i18n'


export default {
  props: {
    f7route: Object,
    f7router: Object,
    mediaBrowserMode: {
      type: String,
      required: false
    },
    playerItem: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const path = ref('');
    const query = ref('');

    const { proxy } = getCurrentInstance(); // pour accéder à this.$f7route, this.$f7, etc.

    onMounted(() => {
      const route = props.f7route;
      console.log('f7route1:', route);
      console.log('f7route2:', route.query);
      console.log('f7route3:', route.query?.path);

      if (route.query?.path && !route.query.path.startsWith('/page/')) {
        path.value = route.query.path;
      }

      if (route.query?.query) {
        query.value = route.query.query;
      }
    });

    return { path, query };
  },
  i18n: {
    //messages: loadLocaleMessages(require.context('@/assets/i18n/media'))
  },
  components: {
    OhSimplePlayerControls,
    MediaBrowserThumbGrid
  },
  watch: {
    'playerItemState'(newVal) {
      console.log("playerItemState(newVal):" + newVal)
      this.decodeState()
    },
    'useMediaStore().currentGlobalPlayerItem'(newVal) {
      this.currentPlayerItem = useMediaStore().currentGlobalPlayerItem
    }
  },
  data () {
    useMediaStore().setMapping('Root', 'Racine')
    useMediaStore().setMapping('g', 'Genres')
    useMediaStore().setMapping('l', 'Albums')
    useMediaStore().setMapping('a', 'Artistes')
    useMediaStore().setMapping('m', 'Dossiers')
    useMediaStore().setMapping('n', 'New')
    useMediaStore().setMapping('y', 'Année')
    useMediaStore().setMapping('t', 'Titres')
    useMediaStore().setMapping('Root', 'Racine')

    this.path = '/Root'

    let currentPlayerItem = this.playerItem
    if (currentPlayerItem === undefined || currentPlayerItem === null || currentPlayerItem === '') {
      currentPlayerItem = useMediaStore().playerItem
    }

    if (currentPlayerItem === undefined || currentPlayerItem === null || currentPlayerItem === '') {
      currentPlayerItem = useMediaStore().currentGlobalPlayerItem
    }

    useMediaStore().setCurrentGlobalPlayerItem(currentPlayerItem)
    
    return {
      currentPlayerItem: currentPlayerItem,
      node: null,
      controlsOpened: true,
      items: [],
      device: this.device,
      allowInfinite: true,
      showPreloader: true,
      lastItemIndex: 0,
      size: 30,
      searchQuery: '',
      item: this.item,
      results: [],
      loading: false,
      searchTimeout: null,
      state: '',
      binding:'',
      artistName: '',
      trackName: '',
      artUri: '',
      trackPosition: 0,
      trackDuration: 0,
      volume: 0

    }
  },
  computed: {
    currentMediaBrowserMode() {
      if (!this.mediaBrowserMode) {
        return useMediaStore().mediaBrowserMode
      }

      useMediaStore().setMediaBrowserMode(this.mediaBrowserMode)
      return this.mediaBrowserMode
    },
    currentGlobalPlayerItem() {
      return useMediaStore().currentGlobalPlayerItem
    },
    playerItemState() {
      if (this.currentPlayerItem!== undefined && this.currentPlayerItem !== null && this.currentPlayerItem !== '') {
        if (!useStatesStore().isItemTracked(this.currentPlayerItem)) 
        {
          useStatesStore().addToTrackingList(this.currentPlayerItem)
          useStatesStore().startTrackingStates()
        }
      }
      
      if (useStatesStore().trackedItems[this.currentPlayerItem]!== undefined) {
        console.log('item tracked:', this.currentPlayerItem);
      }
      else  {
        console.log('item not tracked:', this.currentPlayerItem);
      }
      
      this.decodeState()
      return useStatesStore().trackedItems[this.currentPlayerItem]?.state ?? '';
    },
    displayPlayer() {
      return this.currentMediaBrowserMode === 'Global'
    },
    trackPositionPourcent() {
      return this.trackPosition/this.trackDuration*100.00
    },

    
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
      return this.path;
    },
    currentPathSegments () {
      const path = this.path || '/Root'

      const segments = path.split('/')
      let segName = ''
      const result = segments.map((segment, index) => {

      if (useMediaStore().mappings[segment]) {
        segName = useMediaStore().mappings[segment]
      } else {
        segName = segment
      }

        return {
          path: segments.slice(0, index + 1).join('/'),
          name: segName
        }
      })

      return result
    }

  },
  methods: {
     decodeState () {

      
      const value = useStatesStore().trackedItems[this.currentPlayerItem].state
      if (!(value === undefined || value === null || value === '' || value==='-')) {
        if (value.indexOf('{') === 0) {
          let json = JSON.parse(value);
          this.state = json.state;
          this.binding = json.binding.value;
          this.artistName = json.currentPlayingArtistName.value;
          this.trackName = json.currentPlayingTrackName.value;
          this.artUri = json.currentPlayingArtUri.value;
          this.trackPosition = json.currentPlayingTrackPosition.value;
          this.trackDuration = json.currentPlayingTrackDuration.value;
          this.volume = json.currentPlayingVolume.value;
        } else {
          let components = value.split(',')
          let state = components[0]
        }
      }
    },
    onPageInit(e) {
    },
    formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      // Ajoute un zéro devant si nécessaire
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');

      return `${formattedMinutes}:${formattedSeconds}`;
    },
    onVolumeChange(event) {
      const itemName = this.item ?? useMediaStore().currentGlobalPlayerItem
      useStatesStore().sendCommand(itemName, this.createMediaType('VOLUME', event));
    },
    onClose () {
    },
    createMediaType(command, id) {
      var mediaType = {};
      mediaType.state = 'NONE'
      mediaType.command = command
      mediaType.param = id
      mediaType.device = {}
      if (this.device !== null) {
        mediaType.device.value = this.device
      } 
      
      return JSON.stringify(mediaType)
    },
    doPlay (item, id) {
      console.log('Playing item: ' + item + ' with id: ' + id)
      
      useStatesStore().sendCommand(item, this.createMediaType('PLAY', id))
    },
    doEnqueue (item, id) {
      useStatesStore().sendCommand(item, this.createMediaType('ENQUEUE', id))
    },
    containsTrack (items) {
      return items.every((child) => {
        return child.type === 'org.openhab.core.media.model.MediaTrack'
      })
    },
    async loadItems (start = 0) {
      console.log('path:', this.path)
      console.log('query:', this.query)
     
     
      return this.$oh.api.get('/rest/media/sources?path=' + this.path + '&query=' + this.query + '&start=' + start + '&size=' + this.size).then((data) => {
        this.node = data
        this.node.pres = 'thumb'

        let idForMap = data.id
        if (idForMap.endsWith('/t') ||
            idForMap.endsWith('/a') ||
            idForMap.endsWith('/l') ||
            idForMap.endsWith('/g') ||
            idForMap.endsWith('/m') ||
            idForMap.endsWith('/n')) {
          idForMap = idForMap.substring(0, idForMap.length - 2)
        }

        useMediaStore().setMapping(idForMap, data.label)

        if (data.child != null && data.childs.length === 0) {
          console.log('No more items to load, stopping infinite scroll :')
          this.allowInfinite = false
          this.showPreloader = false
        } else {
          this.showPreloader = true
        }

        if (data.childs != null) {
          for (let i = 0; i < data.childs.length; i++) {
            const child = data.childs[i]
            this.items.push(child)
          }
        }
        this.lastItemIndex = this.items.length

        if (this.node.type === 'org.openhab.core.media.model.MediaSearchResult') { this.node.pres = 'search' }
        if (this.node.type === 'org.openhab.core.media.model.MediaQueue') { this.node.pres = 'queue' }
        if (this.node.type === 'org.openhab.core.media.model.MediaAlbum') { this.node.pres = 'flat' }
        if (this.node.type === 'org.openhab.core.media.model.MediaPlayList') { this.node.pres = 'flat' }
        if (this.node.type === 'org.openhab.core.media.model.MediaCollection' && this.containsTrack(this.items)) { this.node.pres = 'flat' }
        if (this.node.label === 'TopTracks') { this.node.pres = 'flat' }
      })
    },
    loadInitialItems () {
      this.loadItems(0)
    },
    loadMore () {
        this.$f7.toast.create({
          text: this.$t("media.loading"),
          destroyOnClose: true,
          closeTimeout: 1000
        }).open()

      if (this.loading || !this.allowInfinite) {
        console.log('==> returning because loading or no infinite :' + this.loading + ' / ' + this.allowInfinite)
        return
      }

      this.loading = true
      this.loadItems(this.lastItemIndex).then(() => {
        this.loading = false
      })
    },
    onSearch (query) {
      // Nettoyage du précédent timeout
      if (this.searchTimeout) clearTimeout(this.searchTimeout)

      // Si la requête est vide, on ne cherche pas
      if (!query) {
        this.results = []
        return
      }

      // On ajoute un délai pour éviter les appels API à chaque frappe
      this.searchTimeout = setTimeout(() => {
        this.fetchResults(query)
      }, 1000) // délai de 300ms, ajustable
    },
    onClear () {
      this.results = []
      this.searchQuery = ''
    },
    async fetchResults (query) {
      this.loading = true
      try {
        useStatesStore().sendCommand(this.item, this.createMediaType('SEARCH', encodeURIComponent(query.query)))
        this.$f7router.navigate('/mediabrowser/?path=/Root/Search&query=' + query.query, { reloadCurrent: true, reloadDetail: true })

        // Ici, adapte selon la structure de la réponse de ton API
        this.results = [{ 'name': 'name1', 'val': 'val1' }, { 'name': 'name2', 'val': 'val2' }]
      } catch (error) {
        console.error('Erreur API:', error)
        this.results = []
      } finally {
        this.loading = false
      }
    }
  },
  created () {
  },
  mounted () {
      this.loadInitialItems()
      
  }                                                              

}
</script>
