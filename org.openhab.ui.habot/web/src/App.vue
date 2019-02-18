<template>
  <div id="q-app">
    <!-- <transition
      leave-active-class="animated fadeOut"
      mode="out-in"
      :duration="100"
    >
      <router-view />
    </transition> -->
    <router-view />
  </div>
</template>

<style lang="stylus">

</style>

<script>
export default {
  name: 'HABot',
  data () {
    return {
      dismissReconnectNotify: null,
      reconnectIntervalId: null
    }
  },
  watch: {
    '$store.state.items.connectionBroken' (val) {
      if (val) {
        this.$q.loading.show({
          message: 'Connection broken, reconnecting...',
          delay: 400
        })
        console.log('Trying to reconnect every 5 seconds')
        this.reconnectIntervalId = setInterval(() => {
          if (this.$store.state.items.connectionBroken) {
            this.reconnect()
          }
        }, 5000)
      } else {
        clearInterval(this.reconnectIntervalId)
        this.reconnectIntervalId = null
        console.log('%cConnection restored!', 'color: green')
        this.$q.loading.hide()
      }
    }
  },
  methods: {
    reconnect () {
      this.$store.dispatch('items/initialLoad').then(() => {
        this.$store.dispatch('items/watchEvents')
      })
    }
  }
}
</script>
