import { ref } from "vue";
import { defineStore } from "pinia";
export const useSettingsStore = defineStore("settings", () => {
  const storagePrefix = "habassistant.ui:";
  const idLocalStorageKey = `${storagePrefix}id`;
  const labelLocalStorageKey = `${storagePrefix}label`;
  const storedAudioComponentId = localStorage.getItem(idLocalStorageKey);
  const storedAudioComponentLabel = localStorage.getItem(labelLocalStorageKey);
  const audioComponentId = ref(storedAudioComponentId ?? generateUUID());
  const audioComponentLabel = ref(
    storedAudioComponentLabel ?? getDefaultLabel(audioComponentId.value)
  );
  if (storedAudioComponentId == null || storedAudioComponentLabel == null) {
    commit();
  }
  function commit() {
    localStorage.setItem(idLocalStorageKey, audioComponentId.value);
    localStorage.setItem(labelLocalStorageKey, audioComponentLabel.value);
  }
  return {
    audioComponentId,
    audioComponentLabel,
    commit,
  };
});
function getDefaultLabel(id) {
  return `HAB Assistant Client (${id})`;
}
function generateUUID() {
  let d = new Date().getTime(),
    d2 = (performance && performance.now && performance.now() * 1000) || 0;
  return "xxxx-xxxx-xxxx".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c == "x" ? r : (r & 0x7) | 0x8).toString(16);
  });
}
