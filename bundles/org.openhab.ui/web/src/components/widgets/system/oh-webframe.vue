<template>
  <iframe
    v-if="!useOpenhabSession || frameUrl"
    class="oh-webframe"
    v-bind="frameAttributes"
    :style="{ height: config.height || '300px' }" />
  <p v-else class="oh-webframe-status" role="status">{{ $t(statusKey) }}</p>
</template>

<style lang="stylus">
.oh-webframe
  width 100%
  border none
.oh-webframe-status
  margin 1rem
</style>

<script>
import { computed, ref, watch } from 'vue'
import { client } from '@/api/client.gen'
import { OhWebFrameDefinition } from '@/assets/definitions/widgets/system'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { isUnauthorized } from '@/js/hey-api'
import { useUserStore } from '@/js/stores/useUserStore'

export default {
  widget: OhWebFrameDefinition,
  props: {
    context: Object
  },
  setup(props) {
    const { config } = useWidgetContext(computed(() => props.context))
    const userStore = useUserStore()
    const frameUrl = ref(null)
    const statusKey = ref('webframe.session.loading')
    const useOpenhabSession = computed(() => config.value.openhabSession === true)
    const frameAttributes = computed(() => {
      const { openhabSession, ...attributes } = config.value
      if (useOpenhabSession.value) {
        delete attributes.srcdoc
        attributes.src = frameUrl.value
      }
      return attributes
    })

    watch(
      [useOpenhabSession, () => config.value.src, () => userStore.user?.name],
      async ([useSession, src], _previous, onCleanup) => {
        frameUrl.value = null
        if (!useSession) return

        statusKey.value = 'webframe.session.loading'
        const controller = new AbortController()
        onCleanup(() => controller.abort())
        try {
          if (typeof src !== 'string' || !src.trim()) throw new Error('Missing frame URL')
          const target = new URL(src, window.location.href)
          if (target.protocol !== 'https:' || target.origin !== window.location.origin || target.username || target.password) {
            throw new Error('The frame must use the same HTTPS origin as Main UI')
          }

          // A participating servlet exposes this endpoint next to the document it protects.
          const sessionPath = target.pathname.replace(/\/+$/, '') + '/_openhab_session'
          const { response } = await client.post({
            baseUrl: target.origin,
            url: sessionPath,
            mode: 'same-origin',
            credentials: 'same-origin',
            redirect: 'error',
            cache: 'no-store',
            signal: controller.signal,
            parseAs: 'text'
          })
          if (response?.status !== 204) throw new Error('The servlet did not acknowledge the frame session')
          if (!controller.signal.aborted) frameUrl.value = target.href
        } catch (err) {
          if (!controller.signal.aborted) {
            statusKey.value = isUnauthorized(err) ? 'webframe.session.signIn' : 'webframe.session.unavailable'
          }
        }
      },
      { immediate: true }
    )

    return { config, frameAttributes, frameUrl, statusKey, useOpenhabSession }
  }
}
</script>
