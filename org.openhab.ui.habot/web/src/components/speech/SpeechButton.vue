<template>
  <q-page-sticky v-if="speechSupported" position="bottom-right" class="speech-sticky" :offset="[18, 84]">
    <q-btn v-show="!speaking" size="lg" round color="primary" @click="startSpeaking" icon="mic" />
    <q-btn v-show="speaking" :loading="processing" size="lg" round loader color="red" @click="stopSpeaking" icon="mic off">
      <q-spinner-audio slot="loading" />
    </q-btn>
  </q-page-sticky>
</template>

<script>

import Recorder from 'components/speech/recorder.js'
// import FileSaver from 'file-saver'

export default {
  name: 'SpeechButton',
  data () {
    return {
      speechSupported: false,
      speaking: false,
      processing: false,
      speechApi: null,
      audioContext: null,
      recorder: null,
      audio: null,
      googleSpeechData: {
        audio: {
          content: null
        },
        config: {
          encoding: 'LINEAR16',
          // sampleRateHertz: 16000,
          languageCode: null
        }
      },
      googleApiKey: null,
      bingApiKey: null,
      webkitSpeechRecognition: null,
      interimResult: ''
    }
  },
  created () {
    this.speechApi = this.$q.localStorage.get.item('habot.speechApi')
    this.speechSupported = ((window.location.protocol === 'https:' || window.location.hostname === 'localhost') &&
                            (this.speechApi || 'webkitSpeechRecognition' in window))
  },
  methods: {
    startSpeaking () {
      const vm = this

      if (((!vm.speechApi && vm.$q.platform.is.chrome) || vm.speechApi === 'webkitSpeechRecognition') &&
          'webkitSpeechRecognition' in window) {
        // eslint-disable-next-line new-cap
        vm.webkitSpeechRecognition = new window.webkitSpeechRecognition()
        vm.webkitSpeechRecognition.onstart = vm.webkitSpeechRecognitionStart
        vm.webkitSpeechRecognition.onerror = vm.webkitSpeechRecognitionError
        vm.webkitSpeechRecognition.onend = vm.webkitSpeechRecognitionEnd
        vm.webkitSpeechRecognition.onresult = vm.webkitSpeechRecognitionResult
        vm.webkitSpeechRecognition.continuous = false
        vm.webkitSpeechRecognition.interimResults = true
        vm.webkitSpeechRecognition.maxAlternatives = 1
        vm.webkitSpeechRecognition.lang = vm.$store.state.lang
        vm.webkitSpeechRecognition.start()
      } else {
        try {
          if ('AudioContext' in window) {
            vm.audioContext = new AudioContext()
          } else if ('webkitAudioContext' in window) {
            // eslint-disable-next-line new-cap
            vm.audioContext = new window.webkitAudioContext()
          }
          console.log('Audio context set up')

          switch (vm.speechApi) {
            case 'google':
              vm.googleApiKey = vm.$q.localStorage.get.item('habot.googleApiKey')
              if (!vm.googleApiKey) {
                vm.$q.notify({
                  message: 'The Google API Key is not set.',
                  icon: 'mic off'
                })
                return
              }
              break
            case 'bing':
              vm.bingApiKey = vm.$q.localStorage.get.item('habot.bingApiKey')
              if (!vm.bingApiKey) {
                vm.$q.notify({
                  message: 'The Bing API Key is not set.',
                  icon: 'mic off'
                })
                return
              }
              break
            default:
              vm.$q.notify({
                message: 'Invalid Speech API',
                icon: 'mic off'
              })
              return
          }

          navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
            const input = vm.audioContext.createMediaStreamSource(stream)
            // eslint-disable-next-line no-undef
            vm.stream = stream
            vm.recorder = new Recorder(input, { sampleRate: 16000, numChannels: 1 })
            vm.speaking = true
            vm.recorder && vm.recorder.record()
            setTimeout(() => { vm.stopSpeaking() }, 10000)
          }).catch(function (e) {
            vm.$q.notify({
              message: 'No live audio input: ' + e,
              icon: 'mic off'
            })
          })
        } catch (e) {
          vm.$q.notify({
            message: 'This browser has no support for web audio',
            icon: 'mic off'
          })
          throw e
        }
      }
    },
    stopSpeaking (event) {
      if (this.webkitSpeechRecognition) {
        this.webkitSpeechRecognition.stop()
        this.speaking = false
        this.$emit('end')
      } else {
        this.recorder.stop()
        this.stream.getTracks().forEach(track => track.stop())
        this.processRecording()
        this.recorder.clear()
      }
    },
    processRecording () {
      const vm = this
      vm.processing = true

      vm.recorder.exportWAV(function (blob) {
        let reader = new window.FileReader()
        if (vm.speechApi === 'google') {
          reader.readAsDataURL(blob)
        } else {
          reader.readAsArrayBuffer(blob)
        }
        reader.onloadend = () => {
          const data = reader.result
          let apiRequest = null
          switch (vm.speechApi) {
            case 'google':
              const base64Data = data.replace('data:audio/wav;base64,', '')
              vm.googleSpeechData.audio.content = base64Data
              vm.googleSpeechData.config.languageCode = vm.$store.state.lang
              apiRequest = vm.$http.post(`https://speech.googleapis.com/v1/speech:recognize?key=${vm.googleApiKey}`, vm.googleSpeechData)
              break
            case 'bing':
              let lang = vm.$store.state.lang

              // TODO improve this perhaps :)
              if (lang === 'en') {
                lang = navigator.languages.find(l => l.indexOf('-') >= 0 && l.indexOf(lang) === 0)
                if (!lang) lang = 'en-US'
              } else {
                lang = lang + '-' + lang.toUpperCase()
              }

              apiRequest = vm.$http.post(`https://speech.platform.bing.com/speech/recognition/interactive/cognitiveservices/v1?language=${lang}&format=detailed`, data,
                { headers: { 'Authorization': null, 'Ocp-Apim-Subscription-Key': vm.bingApiKey, 'Content-type': 'audio/wav; codec=audio/pcm; samplerate=16000' } })
          }
          apiRequest.then(response => {
            // google
            if (response.data.results) {
              const result = response.data.results[0].alternatives[0]
              vm.$emit('result', result.transcript)
            }
            // bing
            if (response.data.RecognitionStatus && response.data.RecognitionStatus === 'Success') {
              vm.$emit('result', response.data.NBest[0].Lexical)
            }
            vm.processing = false
            vm.speaking = false
            vm.$emit('end')
          }).catch(error => {
            vm.processing = false
            vm.speaking = false
            vm.$q.notify({
              message: JSON.stringify(error),
              icon: 'mic off'
            })
            vm.$emit('error', error)
          })
        }
      })
    },

    webkitSpeechRecognitionStart (event) {
      console.info('webkitSpeechRecognition started')
      this.speaking = true
      this.interimResult = ''
      this.$emit('start')
    },
    webkitSpeechRecognitionError (event) {
      this.speaking = false
      this.$q.notify(event.error)
      this.$emit('error')
    },
    webkitSpeechRecognitionEnd (event) {
      console.info('webkitSpeechRecognition ended')
      this.speaking = false
      if (this.$q.platform.is.android && this.interimResult) {
        this.$emit('result', this.interimResult)
      }
    },
    webkitSpeechRecognitionResult (event) {
      if (typeof (event.results) === 'undefined') {
        this.speaking = false
        this.webkitSpeechRecognition.stop()
        return
      }

      console.log(event.results)
      this.interimResult = ''

      // Desktop Chrome and Android behave quite significantly...
      if (this.$q.platform.is.android) {
        console.log(event.results)
        let bestConfidence = 0
        for (let result of event.results) {
          for (let alternative of result) {
            if (alternative.confidence > bestConfidence) {
              bestConfidence = alternative.confidence
              this.interimResult = alternative.transcript
            }
          }
        }
        this.$emit('interimresult', this.interimResult)
      } else {
        for (let result of event.results) {
          if (result.isFinal) {
            this.$emit('result', result[0].transcript)
            this.speaking = false
            this.webkitSpeechRecognition.stop()
            return
          } else {
            this.interimResult += result[0].transcript
          }
        }
        this.$emit('interimresult', this.interimResult)
      }
    }
  }
}
</script>
