<template>
  <f7-page>
    <f7-navbar title="Orphan links" back-link="Health checks" back-link-url="/settings/health/" back-link-force />
    <f7-block class="block-narrow">
      <!-- TODO how to make content in this block algin left? -->
      <f7-block-title medium>
        Orphan links
      </f7-block-title>
      <f7-block-footer>
        Orphan links are items pointing to non-existent thing channels or vica
        versa.
      </f7-block-footer>
      <f7-block-footer>
        Note that only managed item links can be purged, not item links defined
        in item files - these must be fixed manually in the corresponding file.
        The latter are marked with
        <f7-icon f7="lock_fill" size="1rem" color="gray" />
      </f7-block-footer>
    </f7-block>
    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-title>
          {{ orphanLinks.length }} orphan links found
        </f7-block-title>
      </f7-col>
      <f7-list v-if="loading" contacts-list class="col">
        <f7-list-group>
          <f7-list-item media-item v-for="n in 10" :key="n" :class="`skeleton-text skeleton-effect-blink`"
                        title="Type of problem" subtitle="Item name" footer="Channel link" />
        </f7-list-group>
      </f7-list>
      <f7-list v-else class="col" contacts-list>
        <f7-list-item v-for="orphanLink in orphanLinks" :key="orphanLink.itemChannelLink.channelUID.uid" media-item
                      :link="getLinkForProblem(orphanLink)" :title="'Problem: ' + getOrphanLinkProblemExplanation(orphanLink.problem)
                      " :subtitle="'Item name: ' + orphanLink.itemChannelLink.itemName"
                      :footer="'Channel UID: ' + orphanLink.itemChannelLink.channelUID.uid">
          <f7-icon v-if="!orphanLink.isEditable" slot="after-title" f7="lock_fill" size="1rem" color="gray" />
        </f7-list-item>
      </f7-list>
    </f7-block>
    <f7-block class="block-narrow">
      <f7-col>
        <f7-list>
          <f7-list-button color="red" @click="purgeAllManaged()">
            Purge all managed links (will purge {{ countPurgableLinks() }} managed links)
          </f7-list-button>
        </f7-list>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      loading: false,
      orphanLinks: []
    }
  },
  mounted () {
    // this.$f7.preloader.show()
    this.loading = true
    this.$oh.api.get('/rest/links/orphans').then((data) => {
      this.orphanLinks = data
      this.loading = false
      // this.$f7.preloader.hide()
      setTimeout(() => {
        this.$refs.listIndex.update()
      })
    })
  },
  methods: {
    countPurgableLinks () {
      let count = 0
      for (let i = 0; i < this.orphanLinks.length; i += 1) {
        if (this.orphanLinks[i].isEditable) {
          count += 1
        }
      }
      return count
    },

    getOrphanLinkProblemExplanation (problem) {
      if (problem === 'THING_CHANNEL_MISSING') {
        return 'The item is linked to a thing channel that does not exist'
      } else if (problem === 'ITEM_MISSING') {
        return 'The item does not exist'
      } else if (problem === 'ITEM_AND_THING_CHANNEL_MISSING') {
        return 'Neither the item nor thing channel exists'
      }
      return 'Missing description for problem ' + problem
    },
    getLinkForProblem (orphanLink) {
      if (orphanLink.problem === 'THING_CHANNEL_MISSING') {
        return '/settings/items/' + orphanLink.itemChannelLink.itemName
      } else if (orphanLink.problem === 'ITEM_MISSING') {
        const thingUID = orphanLink.itemChannelLink.channelUID.segments.pop().join(':')
        return (
          '/settings/things/' +
          thingUID +
          '/links/' +
          orphanLink.itemChannelLink.itemName +
          '/' +
          orphanLink.itemChannelLink.channelUID.uid.segments[orphanLink.itemChannelLink.channelUID.uid.segments.length - 1]
        )
      } else if (orphanLink.problem === 'ITEM_AND_THING_CHANNEL_MISSING') {
        return ''
      }
      return ''
    },
    purgeAllManaged () {
      this.loading = true
      this.$oh.api
        .post('/rest/links/purge')
        .then((data) => {
          // Ignore result (number of purged links), instead relaod
        })
        .finally(() => {
          this.$oh.api.get('/rest/links/orphans').then((data) => {
            this.orphanLinks = data
            this.loading = false
          })
        })
    }
  }
}
</script>

<style></style>
