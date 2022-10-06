<script setup>
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";
import { useAssistantStore } from "../stores/assistant";
import { useSettingsStore } from "../stores/settings";
import router from "../router";
const store = useAssistantStore();
const settingsStore = useSettingsStore();
const { getAccessToken } = useAuthStore();
const { startListening, stopListening, startWorker, isAudioSupported } = store;
const { listening, speaking, online, userInteractionDone } = storeToRefs(store);
const { audioComponentId, audioComponentLabel } = storeToRefs(settingsStore);
function toggleListening() {
  if (!listening.value) {
    startListening();
  } else {
    stopListening();
  }
}
function onPanelClick() {
  if (!userInteractionDone.value) {
    startWorker(
      audioComponentId.value,
      audioComponentLabel.value,
      getAccessToken()
    ).catch(() => {
      router.replace("/error");
    });
    userInteractionDone.value = true;
  }
}
// Check browser audio support
if (!isAudioSupported()) {
  router.replace("/audio-error");
}
</script>
<template>
  <div
    @click="onPanelClick()"
    class="container"
    :class="{
      clickable: !userInteractionDone,
      loading: userInteractionDone && !online,
    }"
  >
    <div>
      <button
        id="speech"
        :disabled="!online"
        @click="toggleListening"
        :class="{ listening }"
        class="mic-btn"
      >
        <div v-if="online" class="pulse-ring"></div>
        <div v-if="userInteractionDone && !online" class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="microphone-container">
          <span class="led"></span>
          <span class="microphone"></span>
          <span class="leg"></span>
          <span class="support"></span>
        </div>
      </button>
      <div v-if="online" class="sound-container sound-container-animated">
        <div class="sound" :class="{ 'sound-animated': speaking }">
          <div class="sound-bar"></div>
          <div class="sound-bar"></div>
          <div class="sound-bar"></div>
          <div class="sound-bar"></div>
          <div class="sound-bar"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$size: 100px;

.clickable {
  cursor: pointer;
}

.mic-btn {
  border: none;
  padding: 0;
  border-radius: 100%;
  width: $size;
  height: $size;
  font-size: 3em;
  color: var(--color-microphone);
  padding: 0;
  margin: 0;
  background: var(--color-assistant);
  position: relative;
  z-index: 999;
  display: inline-block;
  line-height: $size;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-image: none;
}

.pulse-ring {
  content: "";
  width: $size;
  height: $size;
  background: transparent;
  border: 5px solid var(--color-assistant);
  border-radius: 50%;
  position: absolute;
  top: 0px;
  left: 0px;
  -webkit-transform: scale(1.9, 1.9);
}

@-webkit-keyframes pulsate {
  0% {
    -webkit-transform: scale(1, 1);
    opacity: 1;
  }

  100% {
    -webkit-transform: scale(1.9, 1.9);
    opacity: 0;
  }
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 86vh;
  background-color: var(--color-internal-background);
}

.listening .pulse-ring {
  animation: pulsate infinite 1.5s;
}

.microphone-container {
  background-color: transparent;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 86px;
}

.microphone-container .microphone {
  background-color: var(--color-microphone);
  border-radius: 100px;
  width: 30px;
  height: 70px;
}

.microphone-container .leg {
  background-color: var(--color-microphone);
  width: 5px;
  height: 20px;
}

.microphone-container .support {
  background-color: var(--color-microphone);
  width: 30px;
  height: 5px;
}

.microphone-container .led {
  z-index: 1;
  background-color: var(--color-assistant);
  border-radius: 50px;
  position: relative;
  top: 30px;
  width: 5px;
  height: 15px;
}

.loading .microphone-container .led {
  background: var(--color-assistant);
}

// speaker

@keyframes bodyanimation {
  0% {
    height: 4px;
  }

  100% {
    height: 20px;
  }
}

.sound-container {
  position: relative;
}

.sound {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  width: 100%;
  border-radius: 50px;
}

.sound-animated .sound-bar {
  animation: bodyanimation 0.6s infinite alternate ease-in-out;
}

.sound-bar {
  height: 4px;
  background-color: var(--color-assistant);
  width: 4px;
  margin-right: 4px;
  border-radius: 20px;
}

.sound-bar:nth-child(1) {
  animation-delay: 0s;
}

.sound-bar:nth-child(2) {
  animation-delay: 0.3s;
}

.sound-bar:nth-child(3) {
  animation-delay: 0.6s;
}

.sound-bar:nth-child(4) {
  animation-delay: 0.3s;
}

.sound-bar:nth-child(5) {
  animation-delay: 0s;
}

// loading ring
.lds-ring {
  display: inline-block;
  position: absolute;
  width: 136px;
  height: 136px;
  top: -18px;
  left: -18px;
}

.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 120px;
  height: 120px;
  margin: 8px;
  border: 8px solid var(--color-assistant);
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: var(--color-assistant) transparent transparent transparent;
}

.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}

.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}

.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
