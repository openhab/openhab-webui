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
        <f7-list-item v-for="item in node.childs" :title="item.binding + ` : ` + item.name + ` (` + item.type + `) `" :key="item.id"  radio :checked="(selectedOption!=null) ? (selectedOption.id === item.id)?true:false:false"
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
  props: ['title', 'multiple', 'name', 'value', 'required'],
  data () {
    this.currentDevice = this.$f7route.query.device
    if (this.currentDevice === undefined || this.currentDevice === null || this.currentDevice === '') {
      this.currentDevice = this.$store.state.media.currentGlobalPlayerName
    }
    console.log('MediaDeviceSelector currentDevice Name: ' + this.currentDevice)

    this.item = this.$f7route.query.item
    if (this.item === undefined || this.item === null || this.item === '') {
      this.item = this.$store.state.media.currentGlobalPlayerItem
    }

    console.log('MediaDeviceSelector currentDevice Item: ' + this.item)

    this.$f7.toast.create({
      text: this.$t('media.page.updated'),
      destroyOnClose: true,
      closeTimeout: 2000
    }).open()

    this.path = '/Root'

    if (this.$f7route.query.path && !this.$f7route.query.path.startsWith('/page/')) {
      this.path = this.$f7route.query.path
    }

    console.log('MediaBrowser path: ' + this.path)

    this.$oh.api.get('/rest/media/sinks').then((data) => {
      data.childs = data.childs.sort((a, b) => {
        if (a.binding < b.binding) return -1
        if (a.binding > b.binding) return 1

        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
      console.log('Data:' + JSON.stringify(data))
      data.childs = data.childs.filter((device) => {
        return device.playerItemName !== ''
      })
      //data.childs = data.childs.filter((item) => {
      //  return item.binding === this.$f7route.query.binding
      //})

      console.log('item:' + this.item)
      this.selectedOption = data.childs.find((device) => {
        return device.id === this.currentDevice
      })
      // "8bf6830ca7a00068f294ca8016421b3678b7568b";

      this.node = data
    })

    return {
      node: this.node,
      controlsOpened: true,
      item: this.item,
      ready: true,
      selectedOption: this.selectedOption
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
    }

  },
  methods: {
    onClose () {
      console.log('Selected option: ' + this.selectedOption)
    },
    changeDevice () {
      console.log('Selected option: ' + this.selectedOption)
      console.log('Selected option: ' + this.selectedOption.id)
      console.log('Selected option: ' + this.selectedOption.playerItemName)
      console.log('MediaDeviceSelector item(a): ' + this.item)
      if (this.item === undefined || this.item === null || this.item === '') {
        this.item = this.selectedOption.playerItemName
      }
      
      console.log('MediaDeviceSelector item(b): ' + this.item)
      console.log('pa') 
      this.$store.commit('setMapping', { key: 'Root', value: 'Racine' })
      console.log('pb')
      this.$store.commit('setCurrentGlobalPlayerName',  this.selectedOption.id)
      this.$store.commit('setCurrentGlobalPlayerItem',  this.selectedOption.playerItemName)
      console.log('pc')
      this.$store.dispatch('sendCommand', { itemName: this.item, cmd: 'NONE,DEVICE,,' + this.selectedOption.id + ',NONE' })
      console.log('pd')
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
