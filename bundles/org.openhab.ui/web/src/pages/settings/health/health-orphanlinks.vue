<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar>
      <oh-nav-content title="Orphan Links"
                      back-link="Health Checks"
                      back-link-url="/settings/health"
                      :f7router />
    </f7-navbar>

    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-footer class="padding-horizontal">
          Orphan links are items pointing to non-existent thing channels or vice versa.
          <br>
          <br>
          Note that only the links of managed Items can be purged, not links defined in
          <code>.items</code> files - these must be fixed manually in the corresponding file. The
          latter are marked with <f7-icon f7="lock_fill" size="1rem" color="gray" />.
        </f7-block-footer>
      </f7-col>
    </f7-block>

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col">
          <f7-list-group>
            <f7-list-item v-for="n in 10"
                          media-item
                          :key="n"
                          :class="`skeleton-text skeleton-effect-blink`"
                          title="Type of problem"
                          subtitle="Item name"
                          footer="Channel link" />
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-else>
        <f7-block-title> {{ orphanLinks.length }} orphan links found </f7-block-title>
        <f7-list class="col" contacts-list>
          <f7-list-item v-for="orphanLink in orphanLinks"
                        :key="orphanLink.itemChannelLink.channelUID"
                        media-item
                        :link="getLinkForProblem(orphanLink)"
                        :title="'Problem: ' + orphanLinkProblemExplanation[orphanLink.problem]"
                        :subtitle="'Item name: ' + orphanLink.itemChannelLink.itemName"
                        :footer="'Channel UID: ' + orphanLink.itemChannelLink.channelUID">
            <template #after-title>
              <f7-icon v-if="!orphanLink.itemChannelLink.editable"
                       f7="lock_fill"
                       size="1rem"
                       color="gray" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block class="block-narrow">
      <f7-col>
        <f7-list>
          <f7-list-button color="red" @click="purgeAllManaged()">
            Purge all managed links (will purge {{ purgeableLinksCount }} managed links)
          </f7-list-button>
        </f7-list>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
  props: {
    f7router: Object
  },
  data () {
    return {
      ready: false,
      loading: false,
      orphanLinks: [],

      orphanLinkProblemExplanation: {
        THING_CHANNEL_MISSING: 'The item is linked to a thing channel that does not exist',
        ITEM_MISSING: 'The item does not exist',
        ITEM_AND_THING_CHANNEL_MISSING: 'Neither the item nor thing channel exists'
      }
    }
  },
  computed: {
    purgeableLinksCount () {
      return this.orphanLinks.filter((l) => l.itemChannelLink.editable).length
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    load () {
      this.loading = true
      this.$oh.api.get('/rest/links/orphans').then((data) => {
        this.orphanLinks = data
        this.loading = false
        this.ready = true
      })
    },
    getLinkForProblem (orphanLink) {
      if (orphanLink.problem === 'THING_CHANNEL_MISSING') {
        return '/settings/items/' + orphanLink.itemChannelLink.itemName
      }
      return null
    },
    purgeAllManaged () {
      this.loading = true
      this.$oh.api.post('/rest/links/purge').catch((e) => {
        // ignore parseerror due to empty response
        if (e === 'parseerror') return
        console.error(e)
      }).finally(() => {
        this.load()
      })
    }
  }
}
</script>

