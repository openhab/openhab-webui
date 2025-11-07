<template>
  <f7-page class="media-content">
    <f7-navbar title="MediaDeviceSelector">
      <f7-nav-right>
        <f7-button popup-close>
          Close
        </f7-button>
      </f7-nav-right>
    </f7-navbar>

    <!--
    currentPlayerItem: {{  currentPlayerItem }}
    -->    

    <div v-if="node">
      <f7-list form>
        <f7-list-item v-for="item in node.childs" 
                    :title="item.binding + ` : ` + item.name + ` (` + item.type + `) `" 
                    :key="item.id"  radio :checked="(currentPlayerItem!=null) ? (currentPlayerItem === item.playerItemName)?true:false:false"
                    @change="selectedOption = item" :name="'options-group'" />
      </f7-list>
    </div>

    <f7-toolbar bottom>
      <div style="display: flex; width: 100%; align-items: center;">
        <div style="margin-left: auto;">
          <f7-button @click="changeDevice()" popup-close>
            Pick
          </f7-button>
        </div>
      </div>
    </f7-toolbar>
  </f7-page>
</template>

<script>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useMediaStore } from '@/js/stores/useMediaStore'
import { use } from 'marked'


export default {
  name: 'MediaDeviceSelector',
  props: 
  {
    f7route: Object,
    f7router: Object,
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
  data () {
    let currentPlayerItem = this.playerItem
    console.log("p0:" + currentPlayerItem);

    
    if (currentPlayerItem === undefined || currentPlayerItem === null || currentPlayerItem === '') {
      console.log("p1");
      currentPlayerItem = useMediaStore().playerItem
    }
    console.log("p2");
    if (currentPlayerItem === undefined || currentPlayerItem === null || currentPlayerItem === '') {
      console.log("p3");
      currentPlayerItem =  useMediaStore().currentGlobalPlayerItem
    }
    

    useMediaStore().setCurrentGlobalPlayerItem(currentPlayerItem)
    
    this.path = '/Root'

    console.log('MediaBrowser path: ' + this.path)
    let selectedOption= ""
    
    this.$oh.api.get('/rest/media/sinks').then((data) => {
      data.childs = data.childs.sort((a, b) => {
        if (a.binding < b.binding) return -1
        if (a.binding > b.binding) return 1

        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
      data.childs = data.childs.filter((device) => {
        return device.playerItemName !== ''
      })
      //data.childs = data.childs.filter((item) => {
      //  return item.binding === this.$f7route.query.binding
      //})

      console.log('item:' + this.item)
      selectedOption = data.childs.find((device) => {
        return device.id === this.currentDevice
      })

      this.node = data
    })
    
    return {
      currentPlayerItem: currentPlayerItem,
      node: this.node,
      controlsOpened: true,
      item: this.item,
      ready: true,
      selectedOption: selectedOption
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
  },
  methods: {
    onClose () {
      console.log('Selected option: ' + this.selectedOption)
    },
    createMediaType(command, id) {
      var mediaType = {};
      mediaType.state = 'NONE'
      mediaType.command = command
      mediaType.param = id
      return JSON.stringify(mediaType)
    },
    changeDevice () {
      console.log('this.currentPlayerItem:', this.currentPlayerItem)
      this.currentPlayerItem = this.selectedOption.playerItemName
      console.log('p2')

      console.log('this.selectedOption:', this.selectedOption)
      console.log('this.currentPlayerItem:', this.currentPlayerItem)

      useMediaStore().setMapping('Root', 'Racine')
      useMediaStore().setCurrentGlobalPlayerItem(this.currentPlayerItem)
      useMediaStore().sendCommand(this.currentPlayerItem, this.createMediaType('DEVICE', this.selectedOption.id))
    },
    select (e) {
      console.log('Selected option: ' + this.selectedOption)
      /*
      this.$f7.input.validateInputs(this.$refs.smartSelect.$el)
      const value = this.$refs.smartSelect.f7SmartSelect.getValue()
      this.$emit('input', value)
      if (!this.multiple) this.$emit('itemSelected', this.preparedItems.find((i) => i.name === value))
      */
    }
  },
  created () {
  },
  mounted () {
  }
}
</script>
