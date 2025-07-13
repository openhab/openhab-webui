import Framework7 from 'framework7'

let wksr = null

export default {
  isRecognitionSupported () {
    return 'webkitSpeechRecognition' in window
  },
  startRecognition (lang, startCallback, errorCallback, activityCallback, resultCallback, endCallback) {
    let interimResult = ''

    wksr = new window.webkitSpeechRecognition()
    wksr.continous = false
    wksr.interimResults = true
    wksr.maxAlternatives = 1
    wksr.lang = lang

    wksr.onstart = startCallback
    wksr.onerror = errorCallback
    wksr.onend = () => {
      if (Framework7.device.android && interimResult) {
        resultCallback({ final: true, text: interimResult })
      }
      endCallback()
    }
    wksr.onresult = (event) => {
      if (Framework7.device.android) {
        let bestConfidence = 0
        for (let result of event.results) {
          for (let alternative of result) {
            if (alternative.confidence > bestConfidence) {
              bestConfidence = alternative.confidence
              interimResult = alternative.transcript
            }
          }
        }
        resultCallback({ final: false, text: interimResult })
      } else {
        interimResult = ''
        for (let result of event.results) {
          if (result.isFinal) {
            resultCallback({ final: true, text: result[0].transcript })
            wksr.stop()
            return
          } else {
            interimResult += result[0].transcript
          }
        }
        resultCallback({ final: false, text: interimResult })
      }
    }
    wksr.onsoundstart = activityCallback
    wksr.onsoundend = activityCallback
    wksr.speechstart = activityCallback
    wksr.speechend = activityCallback

    wksr.start()
  },
  stopRecognition () {
    if (wksr) {
      wksr.stop()
      wksr = null
    }
  }
}
