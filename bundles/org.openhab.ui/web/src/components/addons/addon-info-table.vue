<template>
  <f7-list v-if="addon && information && information.length > 0" class="information-table">
    <f7-list-item v-for="line in information" :key="line.id"
                  :title="line.title" :after="line.value"
                  :link="line.linkUrl" external no-chevron target="_blank">
      <f7-icon slot="after" v-if="line.afterIcon" :f7="line.afterIcon" />
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

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

import { ContentTypes, Formats } from '@/assets/addon-store'

export default {
  props: ['addon'],
  computed: {
    information () {
      let info = []
      if (!this.addon || !this.addon.uid) return info
      const source = this.addon.uid.indexOf(':') > 0 ? this.addon.uid.substring(0, this.addon.uid.indexOf(':')) : 'karaf'
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

      if (this.addon.author) {
        info.push({
          id: 'author',
          title: 'Provided By',
          value: this.addon.author,
          afterIcon: (this.addon.verifiedAuthor) ? 'checkmark_seal_fill' : ''
        })
      }

      if (this.addon.version) {
        info.push({
          id: 'version',
          title: 'Version',
          value: this.addon.version
        })
      }

      info.push({
        id: 'type',
        title: 'Type',
        value: this.addon.type
      })

      info.push({
        id: 'contentType',
        title: 'Content Type',
        value: ContentTypes[this.addon.contentType] || this.addon.contentType
      })

      let format
      if (source === 'eclipse') {
        format = Formats.eclipse
      } else if (source === 'karaf' || source === 'jar') {
        format = Formats.karaf
      } else if (Object.keys(this.addon.properties).length > 0) {
        for (const property in this.addon.properties) {
          if (Formats[property]) format = Formats[property]
        }
      }

      info.push({
        id: 'format',
        title: 'Provisioned With',
        value: format
      })

      if (this.addon.properties && this.addon.properties.created_at) {
        info.push({
          id: 'createdAt',
          title: 'Created At',
          value: dayjs(this.addon.properties.created_at).utc('z').local().format('LLL')
        })
      }

      if (this.addon.properties && this.addon.properties.updated_at) {
        info.push({
          id: 'updated',
          title: 'Updated At',
          value: dayjs(this.addon.properties.updated_at).utc('z').local().format('LLL')
        })
      }

      if (source === 'marketplace') {
        info.push({
          id: 'communityTopicLink',
          title: 'Community Topic',
          afterIcon: 'chat_bubble_2_fill',
          linkUrl: this.addon.link
        })
      } else if (source === 'eclipse' || source === 'karaf') {
        info.push({
          id: 'documentationLink',
          title: 'Documentation',
          afterIcon: 'question_circle_fill',
          linkUrl: `https://${this.$store.state.runtimeInfo.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org/addons/${this.addon.type.replace('misc', 'integrations').replace('binding', 'bindings').replace('transformation', 'transformations')}/${this.addon.id}` // this.addon.link
        })

        let repository
        let issueFilter = 'q=is%3Aopen'
        if (this.addon.id === 'binding-zigbee') {
          repository = 'org.openhab.binding.zigbee'
        } else if (this.addon.id === 'binding-zwave') {
          repository = 'org.openhab.binding.zwave'
        } else {
          if (this.addon.type === 'ui') {
            repository = 'openhab-webui'
          } else {
            repository = 'openhab-addons'
          }
          issueFilter += `+${this.addon.id}`
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
          linkUrl: 'https://community.openhab.org/search?q=' + this.addon.id
        })
      } else if (this.addon.link) {
        info.push({
          id: 'documentationLink',
          title: 'Documentation',
          afterIcon: 'question_circle_fill',
          linkUrl: this.addon.link
        })
      }

      return info
    }
  }
}
</script>
