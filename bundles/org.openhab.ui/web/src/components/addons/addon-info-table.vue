<template>
  <f7-list v-if="addon && information && information.length > 0" class="information-table">
    <f7-list-item
      v-for="line in information"
      :key="line.id"
      :title="line.title"
      :after="line.value"
      :link="line.linkUrl"
      external
      no-chevron
      target="_blank">
      <template #after>
        <f7-icon v-if="line.afterIcon" :f7="line.afterIcon" />
      </template>
    </f7-list-item>
  </f7-list>
</template>

<style lang="stylus">
.information-table
  --f7-list-bg-color transparent
  --f7-theme-color var(--f7-color-blue)
  .item-title
    --f7-list-item-title-text-color var(--f7-list-item-footer-text-color)
  .item-after
    --f7-list-item-after-text-color var(--f7-list-item-title-text-color)
    align-items center
    i
      margin-left 3px
      font-size var(--f7-list-item-subtitle-font-size)
      &:first-child
        font-size x-large
  .item-link
    .item-title
      --f7-list-item-title-text-color var(--f7-theme-color) !important
    .item-after
      --f7-list-item-after-text-color: var(--f7-theme-color) !important
</style>

<script setup lang="ts">
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

import { ContentTypes, Formats } from '@/assets/addon-store.ts'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import * as api from '@/api'
import { computed } from 'vue'

// props
const props = defineProps<{ addon: api.Addon }>()

// computed
interface InformationLine {
  id: string
  title: string
  value?: string
  afterIcon?: string
  linkUrl?: string
}

const information = computed(() => {
  let info: InformationLine[] = []
  if (!props.addon || !props.addon.uid) return info
  const source = props.addon.uid.indexOf(':') > 0 ? props.addon.uid.substring(0, props.addon.uid.indexOf(':')) : 'karaf'
  let sourceName = 'openHAB Distribution'
  if (source === 'marketplace') {
    sourceName = 'Community Marketplace'
  } else if (source !== 'eclipse' && source !== 'karaf') {
    sourceName = '3rd Party (' + source + ')'
  }
  info.push({
    id: 'service',
    title: 'Source',
    value: sourceName
  })

  if (props.addon.author) {
    info.push({
      id: 'author',
      title: 'Provided By',
      value: props.addon.author,
      afterIcon: (props.addon.verifiedAuthor) ? 'checkmark_seal_fill' : ''
    })
  }

  if (props.addon.version) {
    info.push({
      id: 'version',
      title: 'Version',
      value: props.addon.version
    })
  }

  info.push({
    id: 'type',
    title: 'Type',
    value: props.addon.type
  })

  if (props.addon.connection) {
    info.push({
      id: 'connection',
      title: 'Connection Type',
      value: props.addon.connection
    })
  }

  if (props.addon.countries && props.addon.countries.length > 0) {
    info.push({
      id: 'countries',
      title: 'Regions/Countries',
      value: props.addon.countries.join(', ').toUpperCase()
    })
  }

  info.push({
    id: 'contentType',
    title: 'Content Type',
    value: ContentTypes[props.addon.contentType] || props.addon.contentType
  })

  let format
  if (source === 'eclipse') {
    format = Formats.eclipse
  } else if (source === 'karaf' || source === 'jar') {
    format = Formats.karaf
  } else if (Object.keys(props.addon.properties).length > 0) {
    for (const property in props.addon.properties) {
      if (Formats[property]) format = Formats[property]
    }
  }

  info.push({
    id: 'format',
    title: 'Provisioned With',
    value: format
  })

  if (props.addon.properties && props.addon.properties.created_at) {
    info.push({
      id: 'createdAt',
      title: 'Created At',
      // @ts-expect-error: created_at is not typed
      value: dayjs(props.addon.properties.created_at).utc('z').local().format('LLL')
    })
  }

  if (props.addon.properties && props.addon.properties.updated_at) {
    const updatedAt = props.addon.properties.updated_at as unknown as string
    info.push({
      id: 'updated',
      title: 'Updated At',
      value: dayjs(updatedAt).utc(false).local().format('LLL')
    })
  }

  if (source === 'marketplace') {
    info.push({
      id: 'communityTopicLink',
      title: 'Community Topic',
      afterIcon: 'chat_bubble_2_fill',
      linkUrl: props.addon.link
    })
  } else if (source === 'eclipse' || source === 'karaf') {
    info.push({
      id: 'documentationLink',
      title: 'Documentation',
      afterIcon: 'question_circle_fill',
      linkUrl: `${useRuntimeStore().websiteUrl}/addons/${props.addon.type.replace('misc', 'integrations').replace('binding', 'bindings').replace('transformation', 'transformations')}/${props.addon.id}` // this.addon.link
    })

    let repository
    let issueFilter = 'q=is%3Aopen'
    if (props.addon.id === 'binding-zigbee') {
      repository = 'org.openhab.binding.zigbee'
    } else if (props.addon.id === 'binding-zwave') {
      repository = 'org.openhab.binding.zwave'
    } else {
      if (props.addon.type === 'ui') {
        repository = 'openhab-webui'
      } else {
        repository = 'openhab-addons'
      }
      issueFilter += `+${props.addon.id}`
    }

    info.push({
      id: 'issuesLink',
      title: 'Issues',
      afterIcon: 'exclamationmark_bubble_fill',
      linkUrl: `https://github.com/openhab/${repository}/issues?${issueFilter}`
    })
    info.push({
      id: 'discussionsLink',
      title: 'Community Discussions',
      afterIcon: 'chat_bubble_2_fill',
      linkUrl: 'https://community.openhab.org/search?q=' + props.addon.id
    })
  } else if (props.addon.link) {
    info.push({
      id: 'documentationLink',
      title: 'Documentation',
      afterIcon: 'question_circle_fill',
      linkUrl: props.addon.link
    })
  }

  return info
})
</script>
