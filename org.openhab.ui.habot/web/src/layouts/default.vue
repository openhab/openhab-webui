<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar color="primary">
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          {{$route.meta.title}}
        </q-toolbar-title>
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
      content-class="bg-grey-2"
    >
      <div class="logo">
        <img src="~assets/logo.png" alt="HABot">
      </div>
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-item ripple to="/" exact>
          <q-item-side icon="chat" />
          <q-item-main label="Chat with HABot" />
        </q-item>

        <q-item-separator></q-item-separator>
        <q-list-header>My Cards</q-list-header>
        <q-item to="/cards/bookmarks">
          <q-item-side icon="bookmark" />
          <q-item-main label="Bookmarks"></q-item-main>
        </q-item>
        <q-item to="/cards/suggestions">
          <q-item-side icon="star" />
          <q-item-main label="Suggestions"></q-item-main>
        </q-item>
        <q-item to="/cards/recent">
          <q-item-side icon="history" />
          <q-item-main label="Recent"></q-item-main>
        </q-item>
        <q-item to="/cards/deck">
          <q-item-side icon="dashboard" />
          <q-item-main label="Card deck"></q-item-main>
        </q-item>

        <q-item-separator></q-item-separator>
        <!-- <q-list-header>Settings</q-list-header> -->
        <q-item to="/settings">
          <q-item-side icon="settings" />
          <q-item-main label="Settings" />
        </q-item>
        <q-item to="/help">
          <q-item-side icon="help" />
          <q-item-main label="Help" />
        </q-item>

      </q-list>
      <div class="q-ma-md" v-if="deferredPWAPrompt">
        <q-btn icon="get_app" color="secondary" @click="installPWA()">Install App</q-btn>
      </div>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'LayoutDefault',
  data () {
    return {
      leftDrawerOpen: true,
      deferredPWAPrompt: null
    }
  },
  methods: {
    openURL,
    installPWA () {
      if (!this.deferredPWAPrompt) return
      this.deferredPWAPrompt.prompt()
      this.deferredPWAPrompt = null
    }
  },
  created () {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      // e.preventDefault()
      // Stash the event so it can be triggered later.
      this.deferredPWAPrompt = e
    })
  }
}
</script>

<style lang="stylus">

.logo
  padding 3px 12px
  height 80px
  text-align center
  background white
  img
    padding-top 16px

</style>
