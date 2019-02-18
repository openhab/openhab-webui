<template>
<q-carousel color="white" arrows quick-nav class="full-height">
  <q-carousel-slide class="flex flex-center bg-cyan text-white text-center">
    <div class="q-display-3 full-width"><q-icon class="q-display-3 full-width" name="mdi-rocket" /><br />Get the full experience</div>
    <div class="q-display-1 full-width">Unleash the web app's functionality</div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-red-5 text-white text-center">
    <div class="q-display-1 text-center full-width">Browsers only allow advanced features on <strong>secure origins</strong>, or else you will not get:</div>
    <ul class="q-title full-width" style="list-style: none; margin-left: 0; padding-left: 0">
      <li class="q-ma-sm"><q-icon name="not_interested" /> "progressive web app" features like caching and Add to Homescreen on Android</li>
      <li class="q-ma-sm"><q-icon name="not_interested" /> audio capture (for speech recognition)</li>
      <li class="q-ma-sm"><q-icon name="not_interested" /> push notifications</li>
    </ul>
    <div class="q-title full-width">Secure origins are marked <q-btn dense outline no-caps class="bg-white" icon="lock" color="positive" :label="($q.platform.is.desktop && $q.platform.is.chrome) ? 'Secure' : ''" /> and require HTTPS addresses and valid certificates</div>
    <div class="q-title full-width q-mb-xl">If you're accessing your openHAB server on your local network over HTTP, you don't meet these requirements!</div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-blue-2 text-center">
    <div class="q-headline text-center full-width">The easiest way to have a secure origin is to access openHAB through <a href="https://www.myopenhab.org" target="_blank">myopenhab.org</a></div>
    <div class="full-width">Follow the <a href="https://docs.openhab.org/addons/ios/openhabcloud/readme.html">instructions</a> to set up the openHAB Cloud add-on and create your account on myopenhab.org</div>
    <br /><br >
    <div class="full-width">Then navigate to:<br />
      <a class="text-weight-bold" target="_blank" href="https://home.myopenhab.org/habot/index.html">https://home.myopenhab.org/habot/index.html</a><br />
      and enter your myopenhab.org credentials
    </div>
    <div class="q-caption">Advanced users can also set up their own secure origin, for example with a reverse proxy and a Let's Encrypt certificate, read the <a target="_blank" href="https://docs.openhab.org/installation/security.html">documentation</a> for more details.</div>
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-orange text-white text-center">
    <div class="q-headline text-center full-width">Check your browser compatibility</div>
    <div class="text-center full-width">Some browsers offer more features than others. Here's how your current browser supports the various APIs used by this app!</div>
    <div class="q-caption text-center full-width q-mb-md">Buttons are green if your browser is compatible, red otherwise.</div>
    <div class="full-width text-center">
      <q-btn class="q-ma-sm" :color="isFeatureAvailable('audio-api') ? 'positive' : 'negative'" icon="keyboard_voice" @click="canIUse('audio-api')" label="Audio capture" />
      <br />
      <q-btn class="q-ma-sm" :color="isFeatureAvailable('serviceworkers') ? 'positive' : 'negative'" icon="cached" @click="canIUse('serviceworkers')" label="Browser caching" />
      <br />
      <q-btn class="q-ma-sm" :color="isFeatureAvailable('speech-recognition') ? 'positive' : 'negative'" icon="mdi-text-to-speech" @click="canIUse('speech-recognition')" label="Built-in speech recognition" />
      <br />
      <q-btn class="q-ma-sm" :color="isFeatureAvailable('credential-management') ? 'positive' : 'negative'" icon="mdi-account-key" @click="canIUse('credential-management')" label="Credential management" />
      <br />
      <q-btn class="q-ma-sm" :color="isFeatureAvailable('push-api') ? 'positive' : 'negative'" icon="notifications" @click="canIUse('push-api')" label="Push notifications" />
      <br />
    </div>
    <div class="text-center full-width q-mb-xl">Click the buttons to view the full compatibility table on caniuse.com.</div>
    <!-- <q-btn flat size="md" color="white" class="full-width q-mb-xl" @click="$emit('done')">Close</q-btn> -->
  </q-carousel-slide>

  <q-carousel-slide class="flex flex-center bg-tertiary text-white text-center">
    <div class="q-display-1 text-center full-width">Add me on your home screen</div>
    <div class="text-center full-width"><q-icon name="mdi-android" /> <strong>On a secure origin</strong>, Android phones and tablets should display an install banner like below.
    If you don't see it (or closed it), look for the option in the browser's menu.
    </div>
    <div class="full-width flex flex-center q-pb-md">
      <q-card style="width: 400px" class="bg-white text-black text-left">
        <img style="float:left; margin-left: 18px; margin-top: 18px; width: 48px; height: 48px" src="statics/icons/icon-192x192.png">
        <q-card-title>
          <span class="text-weight-bold">HABot</span>
          <span slot="subtitle">home.myopenhab.org</span>
          <span slot="right"><q-icon name="close" class="q-mb-lg" /></span>
        </q-card-title>
        <q-card-main class="text-right">
          <q-btn color="blue" readonly @click="$q.notify('This is only an example :)')">Add to home screen</q-btn>
        </q-card-main>
      </q-card>
    </div>
    <div class="text-center full-width q-mb-md"><q-icon name="mdi-apple" /> iOS users can add to the home screen from Safari but without the enhancements</div>
    <div class="text-center full-width q-mb-xl"><q-icon name="mdi-windows" /> Chrome on Windows has an option to create a desktop icon under "More tools > Add to desktop..."; you can then pin me to the start menu or the task bar</div>
  </q-carousel-slide>

  <q-carousel-control
    slot="control-full"
    slot-scope="carousel"
    position="bottom-left"
    :offset="[18, 22]"
  >
    <q-btn
      round push
      color="amber"
      icon="undo"
      @click="$emit('close')"
    />
  </q-carousel-control>
</q-carousel>
</template>

<style lang="stylus">
.item-subtitle
  font-size 14px !important
  // color rgba(0,0,0,0.4) !important
.tutorial-code
  text-align left
  color white
  font-family monospace
  .code-line
    display block
    margin-top 16px
</style>

<script>
export default {
  data () {
    return {
      colors: [
        'primary',
        'secondary',
        'yellow',
        'red',
        'orange',
        'grey-2'
      ]
    }
  },
  methods: {
    isFeatureAvailable (feature) {
      switch (feature) {
        case 'audio-api': return ('AudioContext' in window) || ('webkitAudioContext' in window)
        case 'speech-recognition': return 'webkitSpeechRecognition' in window
        case 'push-api': return 'PushManager' in window
        case 'credential-management': return 'credentials' in navigator
        case 'serviceworkers': return 'serviceWorker' in navigator
      }
    },
    canIUse (feature) {
      window.open('https://caniuse.com/#feat=' + feature, '_blank')
    }
  }
}
</script>
