<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="stopEventSource">
    <f7-navbar :title="type" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <f7-link v-if="$store.state.developerDock && $f7.width >= 1280" icon-f7="question_circle_fill" @click="$f7.emit('toggleDeveloperDock')" />
        <f7-link v-else-if="$f7.width >= 1280" icon-f7="question_circle" @click="$f7.emit('selectDeveloperDock',{'dock':'help','helpTab':'current'})" />
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
                 :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-rules"
          :init="initSearchbar"
          search-container=".rules-list"
          search-item=".rulelist-item"
          search-in=".item-title, .item-text, .item-after, .item-subtitle, .item-header, .item-footer"
          :placeholder="searchPlaceholder"
          :disable-button="!$theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" :class="{ 'navbar': $theme.md }" v-if="showCheckboxes" bottom-ios bottom-aurora>
      <f7-link color="red" v-show="selectedItems.length" v-if="!$theme.md" class="delete" icon-ios="f7:trash" icon-aurora="f7:trash" @click="removeSelected">
        Remove {{ selectedItems.length }}
      </f7-link>
      <f7-link color="orange" v-show="selectedItems.length" v-if="!$theme.md && !showScenes" class="disable" @click="doDisableEnableSelected(false)" icon-ios="f7:pause_circle" icon-aurora="f7:pause_circle">
        &nbsp;Disable {{ selectedItems.length }}
      </f7-link>
      <f7-link color="green" v-show="selectedItems.length" v-if="!$theme.md && !showScenes" class="enable" @click="doDisableEnableSelected(true)" icon-ios="f7:play_circle" icon-aurora="f7:play_circle">
        &nbsp;Enable {{ selectedItems.length }}
      </f7-link>
      <f7-link v-if="$theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div class="title" v-if="$theme.md">
        {{ selectedItems.length }} selected
      </div>
      <div class="right" v-if="$theme.md">
        <f7-link v-if="!showScenes" v-show="selectedItems.length" tooltip="Disable selected" icon-md="material:pause_circle_outline" icon-color="white" @click="doDisableEnableSelected(false)" />
        <f7-link v-if="!showScenes" v-show="selectedItems.length" tooltip="Enable selected" icon-md="material:play_circle_outline" icon-color="white" @click="doDisableEnableSelected(true)" />
        <f7-link v-show="selectedItems.length" icon-md="material:delete" icon-color="white" @click="removeSelected" />
      </div>
    </f7-toolbar>

    <f7-list-index
      ref="listIndex"
      v-if="$refs.rulesList"
      v-show="!$device.desktop"
      :listEl="$refs.rulesList ? $$($refs.rulesList.$el) : undefined"
      :scroll-list="true"
      :label="true" />

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found" />
    </f7-list>

    <empty-state-placeholder v-if="noRuleEngine" icon="exclamationmark_triangle" title="rules.missingengine.title" text="rules.missingengine.text" />

    <f7-block class="block-narrow" v-show="!noRuleEngine">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col rules-list">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 20"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Title of the rule"
              subtitle="Tags, Schedule, Scene..."
              after="status badge"
              footer="Description of the rule" />
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-else-if="rules.length > 0">
        <f7-block-title class="searchbar-hide-on-search">
          {{ filteredRules.length }} {{ type.toLowerCase() }} {{ selectedTags.length > 0 ? ' - ' : '' }}
          <f7-link v-if="selectedTags.length > 0" @click="selectedTags = []">
            Reset filter(s)
          </f7-link>
        </f7-block-title>

        <f7-list v-if="uniqueTags.length > 0">
          <f7-list-item accordion-item title="Filter by tags">
            <f7-accordion-content>
              <div class="block block-strong-ios block-outline-ios padding-bottom" ref="filterTags">
                <f7-chip v-for="tag in uniqueTags" :key="tag" :text="tag" media-bg-color="blue"
                         :color="isTagSelected(tag) ? 'blue' : ''"
                         style="margin-right: 6px; cursor: pointer;"
                         @click="(e) => toggleSearchTag(e, tag)">
                  <f7-icon v-if="isTagSelected(tag)" slot="media" ios="f7:checkmark_circle_fill" md="material:check_circle" aurora="f7:checkmark_circle_fill" />
                </f7-chip>
              </div>
            </f7-accordion-content>
          </f7-list-item>
        </f7-list>
        <f7-list
          v-show="rules.length > 0"
          class="searchbar-found col rules-list"
          ref="rulesList"
          media-list contacts-list>
          <f7-list-group v-for="(rulesWithInitial, initial) in indexedRules" :key="initial">
            <f7-list-item v-if="rulesWithInitial.length" :title="initial" group-title />
            <f7-list-item
              v-for="rule in rulesWithInitial"
              :key="rule.uid"
              media-item
              class="rulelist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(rule.uid)"
              @click.ctrl="(e) => ctrlClick(e, rule)"
              @click.meta="(e) => ctrlClick(e, rule)"
              @click.exact="(e) => click(e, rule)"
              link=""
              :title="rule.name"
              :text="rule.uid"
              :footer="rule.description"
              :badge="showScenes ? '' : ruleStatusBadgeText(rule.status)"
              :badge-color="ruleStatusBadgeColor(rule.status)">
              <div slot="footer">
                <f7-chip v-for="tag in rule.tags.filter((t) => t !== 'Script' && t !== 'Scene')" :key="tag" :text="tag" media-bg-color="blue" style="margin-right: 6px">
                  <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                </f7-chip>
              </div>
              <!-- <span slot="media" class="item-initial">{{initial}}</span> -->
              <f7-icon v-if="rule.editable === false" slot="after-title" f7="lock_fill" size="1rem" color="gray" />
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !noRuleEngine && !rules.length" class="service-config block-narrow">
      <empty-state-placeholder v-if="showScripts" icon="doc_plaintext" title="scripts.title" text="scripts.text" />
      <empty-state-placeholder v-else-if="showScenes" icon="film" title="scenes.title" text="scenes.text" />
      <empty-state-placeholder v-else icon="wand_stars" title="rules.title" text="rules.text" />
      <f7-row v-if="$f7.width < 1280" class="display-flex justify-content-center">
        <f7-button large fill color="blue" external :href="documentationLink" target="_blank" v-t="'home.overview.button.documentation'" />
      </f7-row>
    </f7-block>

    <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" slot="fixed" color="blue" href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      <f7-icon ios="f7:close" md="material:close" aurora="f7:close" />
    </f7-fab>
  </f7-page>
</template>

<script>
import RuleStatus from '@/components/rule/rule-status-mixin'

export default {
  mixins: [RuleStatus],
  props: ['showScripts', 'showScenes'],
  components: {
    'empty-state-placeholder': () => import('@/components/empty-state-placeholder.vue')
  },
  data () {
    return {
      ready: false,
      loading: false,
      noRuleEngine: false,
      rules: [],
      uniqueTags: [],
      selectedTags: [],
      initSearchbar: false,
      selectedItems: [],
      showCheckboxes: false,
      eventSource: null
    }
  },
  computed: {
    type () {
      return this.showScripts ? 'Scripts' : (this.showScenes ? 'Scenes' : 'Rules')
    },
    documentationLink () {
      return `https://${this.$store.state.runtimeInfo.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org/link/${this.type.toLowerCase()}`
    },
    filteredRules () {
      if (this.selectedTags.length === 0) return this.rules
      return this.rules.filter((r) => {
        for (const t of this.selectedTags) {
          if (r.tags.includes(t)) return true
        }
        return false
      })
    },
    indexedRules () {
      return this.filteredRules.reduce((prev, rule, i, rules) => {
        const initial = rule.name.substring(0, 1).toUpperCase()
        if (!prev[initial]) {
          prev[initial] = []
        }
        prev[initial].push(rule)

        return prev
      }, {})
    },
    searchPlaceholder () {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    load () {
      if (this.loading) return
      this.loading = true
      this.$set(this, 'selectedItems', [])
      this.showCheckboxes = false
      let filter = ''
      if (this.showScripts) {
        filter = '&tags=Script'
      }
      if (this.showScenes) {
        filter = '&tags=Scene'
      }
      this.$oh.api.get('/rest/rules?summary=true' + filter).then(data => {
        this.rules = data.sort((a, b) => {
          return a.name.localeCompare(b.name)
        })

        if (!this.showScripts) {
          this.rules = this.rules.filter((r) => !r.tags || r.tags.indexOf('Script') < 0)
        }

        if (!this.showScenes) {
          this.rules = this.rules.filter((r) => !r.tags || r.tags.indexOf('Scene') < 0)
        }

        this.rules.forEach(rule => {
          rule.tags.forEach(t => {
            if (t === 'Scene' || t === 'Script') return
            if (t.startsWith('marketplace:')) t = 'Marketplace'
            if (!this.uniqueTags.includes(t)) this.uniqueTags.push(t)
          })
        })

        this.uniqueTags.sort()

        this.loading = false
        this.ready = true
        setTimeout(() => {
          this.initSearchbar = true
          if (this.$refs.listIndex) this.$refs.listIndex.update()
          this.$nextTick(() => {
            if (this.$device.desktop && this.$refs.searchbar) {
              this.$refs.searchbar.f7Searchbar.$inputEl[0].focus()
            }
          })
        })

        if (!this.eventSource) this.startEventSource()
      }).catch((err, status) => {
        if (err === 'Not Found' || status === 404) {
          this.noRuleEngine = true
        }
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/rules/*/*', null, (event) => {
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'added':
          case 'removed':
          case 'updated':
            this.load()
            break
          case 'state':
            const rule = this.rules.find((r) => r.uid === topicParts[2])
            const newStatus = JSON.parse(event.payload)
            if (!rule) break
            if (rule.status.status !== newStatus.status) rule.status.status = newStatus.status
            if (rule.status.statusDetail !== newStatus.statusDetail) rule.status.statusDetail = newStatus.statusDetail
            if (rule.status.description !== newStatus.description) rule.status.description = newStatus.description
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    click (event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.uid, item)
      } else {
        this.$f7router.navigate((item.editable) ? item.uid : '/settings/scripts/' + item.uid)
      }
    },
    ctrlClick (event, item) {
      this.toggleItemCheck(event, item.uid, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    toggleItemCheck (event, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    removeSelected () {
      const vm = this

      this.$f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected rules?`,
        'Remove Rules',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      if (this.selectedItems.some((i) => this.rules.find((rule) => rule.uid === i).editable === false)) {
        this.$f7.dialog.alert('Some of the selected rules are not modifiable because they have been provisioned by files')
        return
      }

      let dialog = this.$f7.dialog.progress('Deleting Rules...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/rules/' + i))
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: 'Rules removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while deleting: ' + err)
      })
    },
    doDisableEnableSelected (enable) {
      let dialog = this.$f7.dialog.progress('Please Wait...')

      const promises = this.selectedItems.map((i) => this.$oh.api.postPlain('/rest/rules/' + i + '/enable', enable.toString()))
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: (enable) ? 'Rules enabled' : 'Rules disabled',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while enabling/disabling: ' + err)
      })
    },
    toggleSearchTag (e, item) {
      const idx = this.selectedTags.indexOf(item)
      if (idx !== -1) {
        this.selectedTags.splice(idx, 1)
      } else {
        this.selectedTags.push(item)
      }
      // update rules list
      this.$refs.listIndex.update()
    },
    isTagSelected (tag) {
      return this.selectedTags.includes(tag)
    }
  }
}
</script>
