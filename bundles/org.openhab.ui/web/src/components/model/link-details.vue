<template>
  <f7-card v-if="item.type !== 'Group' && item.created !== false">
    <f7-card-content v-if="enrichedLinks.length > 0">
      <f7-list media-list>
        <ul>
          <f7-list-item v-for="l in enrichedLinks"
                        :key="l.itemName"
                        media-item
                        :title="l.thing.label"
                        :subtitle="l.channel.label || '?'"
                        :footer="l.link.channelUID"
                        :badge="thingStatusBadgeText(l.thing.statusInfo)"
                        :badge-color="thingStatusBadgeColor(l.thing.statusInfo)"
                        :link="!l.link.editable && l._invalid ? undefined : '#'"
                        @click="!l.link.editable && l._invalid ? undefined : editLink(l)">
            <template #media>
              <span class="item-initial">{{ !l._invalid && l.channel.label ? l.channel.label[0] : '?' }}</span>
            </template>
            <template #title>
              <f7-icon v-if="!l.link.editable"
                       f7="lock_fill"
                       size="1rem"
                       color="gray" />
            </template>
          </f7-list-item>
        </ul>
      </f7-list>
    </f7-card-content>
    <f7-card-footer>
      <f7-button color="blue" @click="addLink">
        Add Link
      </f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<script>
import AddLinkPage from '@/pages/settings/things/link/link-add.vue'
import EditLinkPage from '@/pages/settings/things/link/link-edit.vue'
import ThingStatus from '@/components/thing/thing-status-mixin'
import { f7 } from 'framework7-vue'

export default {
  mixins: [ThingStatus],
  props: {
    item: Object,
    links: Array,
    f7router: Object
  },
  data () {
    return {
      currentItemName: null,
      enrichedLinks: [],
      ready: true
    }
  },
  mounted () {
    this.f7router.allowPageChange = true
    this.load()
  },
  methods: {
    load () {
      if (!this.ready) return
      // this.enrichedLinks = []
      this.currentItemName = this.item.name
      const itemLinks = this.links.filter((l) => l.itemName === this.item.name)
      const thingNames = itemLinks.map((l) => l.channelUID.substring(0, l.channelUID.lastIndexOf(':')))
      const promises = thingNames.map((t) => {
        return new Promise((resolve, reject) => {
          this.$oh.api.get('/rest/things/' + t)
            .then((thing) => resolve(thing))
            .catch((thing) => resolve({ UID: t, label: '(unknown)', channels: [], _invalid: true }))
        })
      })
      this.ready = false
      Promise.all(promises).then((things) => {
        this.enrichedLinks = [
          ...itemLinks.map((l) => {
            const thing = things.find((t) => t.channels.some((c) => c.uid === l.channelUID))
            if (thing) {
              const channel = thing.channels.find((c) => c.uid === l.channelUID)
              return {
                link: l,
                thing,
                channel
              }
            } else {
              return {
                link: l,
                thing: { label: '(unknown)', channels: [], statusInfo: { status: 'UNKNOWN' }, _invalid: true },
                channel: { UID: l.channelUID, label: 'Invalid Link', _invalid: true },
                _invalid: true
              }
            }
          })
        ]
        this.ready = true
      })
    },
    addLink () {
      this.f7router.navigate({
        url: 'links/new',
        route: {
          component: AddLinkPage,
          path: 'links/new'
        }
      }, {
        props: {
          item: this.item
        }
      })
    },
    editLink (link) {
      if (link._invalid) {
        f7.dialog.confirm('This link is invalid, remove it?', 'Invalid Link',
          () => {
            this.$oh.api.delete('/rest/links/' + link.link.itemName + '/' + encodeURIComponent(link.link.channelUID)).then(() => {
              f7.toast.create({
                text: 'Link deleted',
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
              delete this.enrichedLinks[this.enrichedLinks.indexOf(link)]
            }).catch((err) => {
              f7.toast.create({
                text: 'Link not deleted (links defined in a .items file are not editable from this screen): ' + err,
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
            })
          })
        return
      }

      this.f7router.navigate({
        url: 'links/edit/' + link.channel.uid,
        route: {
          component: EditLinkPage,
          path: 'links/edit/' + link.channel.uid
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
      this.load()
    }
  }
}
</script>
