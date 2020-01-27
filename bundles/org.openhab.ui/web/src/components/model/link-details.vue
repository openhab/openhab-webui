<template>
  <f7-card v-if="item.type !== 'Group' && item.created !== false">
    <f7-card-content v-if="!$theme.md || enrichedLinks.length > 0">
      <f7-list media-list>
        <ul>
          <f7-list-item v-for="l in enrichedLinks" :key="l.itemName" media-item
            :title="l.thing.label" :subtitle="l.channel.label || '?'" :footer="l.link.channelUID"
            :badge="l.thing.statusInfo.status"
            :badge-color="l.thing.statusInfo.status === 'ONLINE' ? 'green' : 'red'"
            link="#" @click="editLink(l)">
            <span slot="media" class="item-initial">{{l.channel.label ? l.channel.label[0] : '?'}}</span>
          </f7-list-item>
          <f7-list-button v-if="!$theme.md" color="blue" title="Add Link" @click="addLink"></f7-list-button>
        </ul>
      </f7-list>
    </f7-card-content>
    <f7-card-footer v-if="$theme.md">
      <f7-button color="blue" @click="addLink">Add Link</f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<script>
import AddLinkPage from '@/pages/settings/things/link/link-add.vue'
import EditLinkPage from '@/pages/settings/things/link/link-edit.vue'

export default {
  props: ['item', 'links'],
  data () {
    return {
      currentItemName: null,
      enrichedLinks: [],
      ready: true
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    load () {
      if (!this.ready) return
      // this.enrichedLinks = []
      this.currentItemName = this.item.name
      const itemLinks = this.links.filter((l) => l.itemName === this.item.name)
      const thingNames = itemLinks.map((l) => l.channelUID.substring(0, l.channelUID.lastIndexOf(':')))
      const promises = thingNames.map((t) => this.$oh.api.get('/rest/things/' + t))
      this.ready = false
      Promise.all(promises).then((things) => {
        this.enrichedLinks = [
          ...itemLinks.map((l) => {
            const thing = things.find((t) => t.channels.some((c) => c.uid === l.channelUID))
            if (thing) {
              const channel = thing.channels.find((c) => c.uid === l.channelUID)
              return {
                link: l,
                thing: thing,
                channel: channel
              }
            }
          })
        ]
        this.ready = true
      })
    },
    addLink () {
      const self = this
      this.$f7router.navigate({
        url: 'links/new',
        route: {
          component: AddLinkPage,
          path: 'links/new',
          props: {
          },
          on: {
            pageAfterOut (event, page) {
              console.log('page closed')
            }
          }
        }
      }, {
        props: {
          item: this.item
        }
      })
    },
    editLink (link) {
      const self = this
      this.$f7router.navigate({
        url: 'links/edit/' + link.channel.uid,
        route: {
          component: EditLinkPage,
          path: 'links/edit/' + link.channel.uid,
          props: {
          },
          on: {
            pageAfterOut (event, page) {
              console.log('page closed')
            }
          }
        }
      }, {
        props: {
          item: this.item,
          channel: link.channel,
          thing: link.thing
        }
      })
    }
  },
  watch: {
    item (value) {
      if (value !== this.currentItemName) {
        this.load()
      }
    },
    links () {
      console.log('LinkDetails: links changed')
      this.load()
    }
  }
}
</script>
