<template>
  <f7-page>
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
        Display a naviation bar to navigate media hierarchy.
        -->
        <div style="display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: space-between; align-items: center;">
          <div style="display: flex; flex-direction: row; flex-wrap: nowrap;">
            <div v-for="componentPath in currentPathSegments" style="padding:5px;" :key="componentPath.path">
              <f7-link :href="`/mediabrowser/?path=` + componentPath.path + `&item=` + item + `&device=` + device">
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

        <br>

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
          <!-- Track list -->
          <div v-for="child in items" style="display: inline;clear:both;" :class="{ 'sheet-opened': controlsOpened }" :key="child.path">
            <f7-link :href="`/mediabrowser/?path=` + child.path + `&item=` + item + `&device=` + device" :data-reload="true" :reload-current="true" :reload-detail="true">
              <f7-button outline style="height:30px;font-weight:bold;padding:2px;padding-left:30px;text-align:left;border:none 0px;" @click="doPlay(item, child.path)" icon-material="play_arrow" small icon-size="24">
                Play
              </f7-button>
              <f7-button outline style="height:30px;font-weight:bold;padding:2px;padding-left:30px;text-align:left;border:none 0px;" @click="doEnqueue(item, child.path)" icon-material="playlist_add" small icon-size="24">
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
        <!-- Search Handling -->
        <div v-if="node.pres==='search'" style="display: flex; flex-direction: column; flex-wrap: nowrap; justify-content: space-between; align-items: center; justify-content:left;padding:0px;margin:0px;">
          <MediaBrowserThumbGrid title="Album" :items="node.childs[0].childs" :item="this.item" :device="this.device" type="Albums" />
          <MediaBrowserThumbGrid title="Artist" :items="node.childs[1].childs" :item="this.item" :device="this.device" type="Artists" />
          <MediaBrowserThumbGrid title="Playlist" :items="node.childs[2].childs" :item="this.item" :device="this.device" type="Playlists" />
          <MediaBrowserThumbGrid title="Track" :items="node.childs[3].childs" :item="this.item" :device="this.device" type="Tracks" />
          <MediaBrowserThumbGrid title="Episodes" :items="node.childs[4].childs" :item="this.item" :device="this.device" type="Episodes" />
          <MediaBrowserThumbGrid title="Audiobooks" :items="node.childs[5].childs" :item="this.item" :device="this.device" type="Audiobooks" />
          <MediaBrowserThumbGrid title="Podcasts" :items="node.childs[6].childs" :item="this.item" :device="this.device" type="Podcasts" />
        </div>
        <!--
        Thumb presentation for Collection (Albums, Artists lists)
        Display a thumbnail for each entry with the coverArt and title,
        -->
        <div v-else>
          <div v-for="child in items" style="width:200px;height:200px;position:relative;float:left;margin:20px;background-color:#ffffff;color:#000000;border:solid 1px;border-radius:10px;padding:10px;" :key="child.path">
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
      </div>
    </div>

    <f7-toolbar v-if="true" bottom style="min-height: 150px;padding:0px;margin:0px;">
      <div v-if="true" style="display: flex; align-items: center; justify-content:left;padding:0px;margin:0px;">
        <div style="margin:0px;padding:0px;">
          <img src="/static/Heos.png" style="width: 150px; height: 150px; margin:0px;padding:0px;">
        </div>
        <div />
        <div style="width:300px;padding:50px;">
          <b>Title</b><br>
          Artists<br>
        </div>
        <div>
          <div>
            <div style="width:300px;height:30px;padding:20px;padding-left: 140px;">
              <oh-simple-player-controls />
            </div>
          </div>
          <div style="display: flex; padding:20px;">
            <div style="padding-right:20px;">
              3.50
            </div>
            <div style="width:500px;">
              <f7-range ref="rangeslider" class="oh-slider" :min="0" :max="100" :step="1" :value="10" />
            </div>
            <div style="padding-left:20px;">
              4.42
            </div>
          </div>
        </div>
        <div style="width:200px;" />
        <div style="width:400px;height:150px;padding:0px;display: flex; align-items: center; justify-content:left;">
          <f7-button icon-material="speaker" outline style="height:40px;font-weight:bold;padding:2px;padding-right:30px;text-align:left;border:none 0px;" large icon-size="36" />
          <f7-range ref="rangeslider" class="oh-slider" :min="0" :max="100" :step="1" :value="10" />
        </div>
      </div>
    </f7-toolbar>
  </f7-page>
</template>

<script>
import OhSimplePlayerControls from '../../components/widgets/system/oh-simple-player-controls.vue'
import MediaBrowserThumbGrid from './media-browser-thumb-grid.vue'

export default {
  name: 'MediaBrowser',
  props: {
  },
  components: {
    OhSimplePlayerControls,
    MediaBrowserThumbGrid
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

    this.$store.commit('setMapping', { key: 'Root', value: 'Racine' })
    this.$store.commit('setMapping', { key: 'g', value: 'Genres' })
    this.$store.commit('setMapping', { key: 'l', value: 'Albums' })
    this.$store.commit('setMapping', { key: 'a', value: 'Artistes' })
    this.$store.commit('setMapping', { key: 'm', value: 'Dossiers' })
    this.$store.commit('setMapping', { key: 'n', value: 'New' })
    this.$store.commit('setMapping', { key: 'y', value: 'Année' })
    this.$store.commit('setMapping', { key: 't', value: 'Titres' })
    this.$store.commit('setMapping', { key: 'Root', value: 'Racine' })

    this.path = '/Root'
    //        this.path='/Root/Spotify/Playlists/spotify:playlist:5Z4AD0u9fwnvtsj7ce5ZLS';

    // this.loadInitialItems()

    return {
      node: null,
      controlsOpened: true,
      items: [],
      device: this.device,
      allowInfinite: true,
      showPreloader: true,
      lastItemIndex: 0,
      size: 30,
      searchQuery: '',
      results: [],
      loading: false,
      searchTimeout: null
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
      let segName = ''
      const result = segments.map((segment, index) => {
        if (this.$store.state.media.mappings[segment]) {
          segName = this.$store.state.media.mappings[segment]
        } else {
          segName = segment
        }

        return {
          path: segments.slice(0, index + 1).join('/'),
          name: segName
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
    containsTrack (items) {
      return items.every((child) => {
        return child.type === 'org.openhab.core.media.model.MediaTrack'
      })
    },
    async loadItems (start = 0) {
      if (this.$f7route.query.path && !this.$f7route.query.path.startsWith('/page/')) {
        this.path = this.$f7route.query.path
      }

      console.log('MediaBrowser path: ' + this.path)

      return this.$oh.api.get('/rest/media/sources?path=' + this.path + '&start=' + start + '&size=' + this.size).then((data) => {
        console.log('Data:' + data)
        console.log('Data:' + data)
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
        this.$store.commit('setMapping', { key: idForMap, value: data.label })

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

        console.log('items:' + this.items)

        if (this.node.type === 'org.openhab.core.media.model.MediaSearchResult') { this.node.pres = 'search' }
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
        console.log('query:', query.query)
        // Remplace cette URL par ton endpoint réel
        // const response = await fetch(`https://api.example.com/search?q=${encodeURIComponent(query)}`);
        // const data = await response.json();

        this.$store.dispatch('sendCommand', { itemName: this.item, cmd: 'NONE,SEARCH,' + encodeURIComponent(query.query) + ',' + this.device + ',NONE' })
        this.$f7router.navigate('/mediabrowser/?path=/Root/Spotify/Search&item=' + this.item + '&device=' + this.device, { reloadCurrent: true, reloadDetail: true })

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
