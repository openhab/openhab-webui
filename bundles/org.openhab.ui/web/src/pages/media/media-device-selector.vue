<template>
  <f7-page class="media-content">
    <f7-navbar title="MediaDeviceSelector">
      <f7-nav-right>
        <f7-button popup-close>
          Close
        </f7-button>
      </f7-nav-right>
    </f7-navbar>

    currentPlayerItem: {{  currentPlayerItem }}
    <div v-if="node">
      <f7-list form>
        <f7-list-item v-for="item in node.childs" 
                    :title="item.playerItemName + ` ` + item.id + ` : ` + item.binding + ` : ` + item.name + ` (` + item.type + `) `" 
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
export default {
  name: 'MediaBrowser',
  props: 
  {
    playerItem: {
      type: String,
      required: false
    }
  },
  data () {
    let currentPlayerItem = this.playerItem
    console.log("p0:" + this.currentPlayerItem);

    
    if (currentPlayerItem === undefined || currentPlayerItem === null || currentPlayerItem === '') {
      console.log("p1");
      currentPlayerItem = this.$store.state.media.playerItem
    }
    console.log("p2");
    if (currentPlayerItem === undefined || currentPlayerItem === null || currentPlayerItem === '') {
      console.log("p3");
      currentPlayerItem = this.$store.state.media.currentGlobalPlayerItem
    }

    this.$store.commit('setPlayerItem', currentPlayerItem)

    this.path = '/Root'

    if (this.$f7route.query.path && !this.$f7route.query.path.startsWith('/page/')) {
      this.path = this.$f7route.query.path
    }

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
      // "8bf6830ca7a00068f294ca8016421b3678b7568b";

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

      this.$store.commit('setMapping', { key: 'Root', value: 'Racine' })
      this.$store.commit('setCurrentGlobalPlayerItem',  this.currentPlayerItem)
      this.$store.dispatch('sendCommand', { itemName: this.currentPlayerItem, cmd: this.createMediaType('DEVICE', this.selectedOption.id)})
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
